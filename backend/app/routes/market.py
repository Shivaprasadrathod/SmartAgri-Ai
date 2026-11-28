import math
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.models.market import CropInfo, MarketPrice, MarketPriceHistory

router = APIRouter(prefix="/api/market", tags=["Market Intelligence"])


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    crop: Optional[str] = None
    market: Optional[str] = None
    language: str = Field(default="en", pattern="^(en|kn)$")


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return round(2 * r * math.atan2(math.sqrt(a), math.sqrt(1 - a)), 2)


def _compute_advisory_from_history(crop: str, history: list[MarketPriceHistory]) -> dict:
    if not history:
        return {
            "crop": crop,
            "recommendation": "MONITOR",
            "signal": "MONITOR",
            "reason": f"Insufficient historical price records for {crop} in database.",
            "avg_price": 0,
            "latest_price": 0,
            "change_pct": 0.0,
            "methodology": "7-day moving average & momentum baseline",
            "is_statistical_baseline": True,
        }

    prices = [float(h.modal_price) for h in history]
    latest = prices[-1]
    recent_window = prices[-7:] if len(prices) >= 7 else prices
    avg_7d = round(sum(recent_window) / len(recent_window), 2)
    prev = prices[-2] if len(prices) >= 2 else latest
    change_pct = round(((latest - prev) / prev) * 100, 2) if prev else 0.0

    if latest >= avg_7d * 1.02:
        rec = "SELL"
        reason = (
            f"Current modal price (₹{latest:.0f}/Qtl) is above the 7-day average "
            f"(₹{avg_7d:.0f}/Qtl) by {((latest - avg_7d) / avg_7d * 100):.1f}%."
        )
    elif latest <= avg_7d * 0.98:
        rec = "HOLD"
        reason = (
            f"Current modal price (₹{latest:.0f}/Qtl) is below the 7-day average "
            f"(₹{avg_7d:.0f}/Qtl); consider holding if storage is available."
        )
    else:
        rec = "HOLD"
        reason = (
            f"Current modal price (₹{latest:.0f}/Qtl) is tracking near the 7-day average "
            f"(₹{avg_7d:.0f}/Qtl)."
        )

    return {
        "crop": crop,
        "recommendation": rec,
        "signal": rec,
        "reason": reason,
        "avg_price": avg_7d,
        "latest_price": latest,
        "change_pct": change_pct,
        "methodology": "7-day moving average & momentum baseline",
        "is_statistical_baseline": True,
        "data_source": history[-1].data_source,
    }


@router.get("/crops")
def get_crops(db: Session = Depends(get_db)):
    crops = db.query(CropInfo).order_by(CropInfo.name.asc()).all()
    return {
        "crops": [
            {
                "id": c.id,
                "name": c.name,
                "scientific_name": c.scientific_name,
                "category": c.category,
                "kannada_name": c.kannada_name,
                "english_sub": c.english_sub,
                "season": c.season,
                "duration": c.duration,
                "water": c.water,
                "difficulty": c.difficulty,
                "temperature": c.temperature,
                "soil": c.soil,
                "ph": c.ph,
                "sunlight": c.sunlight,
                "spacing": c.spacing,
                "overview": c.overview,
                "image": c.image,
            }
            for c in crops
        ]
    }


@router.get("/prices")
def get_market_prices(
    commodity: Optional[str] = None,
    state: Optional[str] = None,
    district: Optional[str] = None,
    market: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(MarketPrice)
    if commodity:
        query = query.filter(MarketPrice.commodity.ilike(f"%{commodity.strip()}%"))
    if state:
        query = query.filter(MarketPrice.state.ilike(f"%{state.strip()}%"))
    if district:
        query = query.filter(MarketPrice.district.ilike(f"%{district.strip()}%"))
    if market:
        query = query.filter(MarketPrice.market.ilike(f"%{market.strip()}%"))

    rows = query.order_by(MarketPrice.commodity.asc(), MarketPrice.modal_price.desc()).all()
    return [
        {
            "id": r.id,
            "commodity": r.commodity,
            "state": r.state,
            "district": r.district,
            "market": r.market,
            "variety": r.variety,
            "min_price": r.min_price,
            "max_price": r.max_price,
            "modal_price": r.modal_price,
            "unit": r.unit,
            "latitude": r.latitude,
            "longitude": r.longitude,
            "arrival_date": r.arrival_date,
            "data_source": r.data_source,
        }
        for r in rows
    ]


@router.get("/karnataka-locations")
def get_karnataka_locations(db: Session = Depends(get_db)):
    rows = (
        db.query(MarketPrice.district, MarketPrice.market)
        .filter(MarketPrice.state.ilike("Karnataka"))
        .distinct()
        .order_by(MarketPrice.district.asc(), MarketPrice.market.asc())
        .all()
    )
    districts = sorted({r.district for r in rows})
    markets = [{"name": r.market, "district": r.district} for r in rows]
    return {
        "districts": districts,
        "markets": markets,
        "data_source": "reference_dataset",
    }


@router.get("/karnataka-crops")
def get_karnataka_crops(
    district: Optional[str] = None,
    market: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(MarketPrice).filter(MarketPrice.state.ilike("Karnataka"))
    if district:
        query = query.filter(MarketPrice.district.ilike(f"%{district.strip()}%"))
    if market:
        query = query.filter(MarketPrice.market.ilike(f"%{market.strip()}%"))

    prices = query.order_by(MarketPrice.commodity.asc()).all()
    crop_meta = {c.name.lower(): c for c in db.query(CropInfo).all()}

    result = []
    for p in prices:
        meta = crop_meta.get(p.commodity.lower())
        history = (
            db.query(MarketPriceHistory)
            .filter(MarketPriceHistory.crop_name.ilike(p.commodity))
            .order_by(MarketPriceHistory.price_date.asc())
            .all()
        )
        advisory = _compute_advisory_from_history(p.commodity, history)
        prev_price = history[-2].modal_price if len(history) >= 2 else p.modal_price
        expected_change = round(p.modal_price - prev_price, 2)
        change_pct = round((expected_change / prev_price) * 100, 2) if prev_price else 0.0
        trend_direction = "UPWARD" if expected_change > 0 else ("DOWNWARD" if expected_change < 0 else "STABLE")

        result.append(
            {
                "id": p.commodity.lower().replace(" ", "_"),
                "name": p.commodity,
                "kannada_name": meta.kannada_name if meta else p.commodity,
                "english_sub": meta.english_sub if meta else p.commodity,
                "category": meta.category if meta else "Crops",
                "image": meta.image if meta else "/crops/togari.jpg",
                "market": p.market,
                "district": p.district,
                "state": p.state,
                "unit": p.unit,
                "today_modal_price": p.modal_price,
                "today_min_price": p.min_price,
                "today_max_price": p.max_price,
                "tomorrow_predicted_price": round(p.modal_price + expected_change, 2),
                "expected_change": expected_change,
                "change_percentage": change_pct,
                "trend_direction": trend_direction,
                "action_signal": advisory["recommendation"],
                "ai_analysis_en": advisory["reason"],
                "ai_analysis_kn": f"ಪ್ರಸ್ತುತ ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ₹{p.modal_price:.0f}/ಕ್ವಿಂಟಾಲ್ ({advisory['recommendation']}).",
                "price_date": p.arrival_date or "Reference",
                "arrival_date": p.arrival_date,
                "last_updated": "Reference Dataset",
                "data_source": p.data_source,
                "is_demo_data": p.data_source == "reference_dataset",
            }
        )

    return {
        "selected_market": market or district or "Karnataka APMC (Reference Dataset)",
        "data_source": "reference_dataset",
        "is_demo_data": True,
        "crops": result,
    }


@router.get("/nearest")
def get_nearest_markets(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    commodity: Optional[str] = None,
    max_distance_km: float = Query(default=500.0, gt=0, le=5000),
    db: Session = Depends(get_db),
):
    query = db.query(MarketPrice).filter(
        MarketPrice.latitude.isnot(None),
        MarketPrice.longitude.isnot(None),
    )
    if commodity:
        query = query.filter(MarketPrice.commodity.ilike(f"%{commodity.strip()}%"))

    rows = query.all()
    nearest = []
    for r in rows:
        dist = _haversine_km(latitude, longitude, r.latitude, r.longitude)
        if dist <= max_distance_km:
            nearest.append(
                {
                    "id": r.id,
                    "commodity": r.commodity,
                    "market": r.market,
                    "district": r.district,
                    "state": r.state,
                    "modal_price": r.modal_price,
                    "min_price": r.min_price,
                    "max_price": r.max_price,
                    "latitude": r.latitude,
                    "longitude": r.longitude,
                    "distance_km": dist,
                    "data_source": r.data_source,
                }
            )

    nearest.sort(key=lambda x: x["distance_km"])
    return nearest


@router.get("/historical-trends")
def get_historical_trends(
    crop: str = Query(..., min_length=1),
    days: int = Query(default=14, ge=1, le=90),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(MarketPriceHistory)
        .filter(MarketPriceHistory.crop_name.ilike(f"%{crop.strip()}%"))
        .order_by(MarketPriceHistory.price_date.desc())
        .limit(days)
        .all()
    )
    rows.reverse()
    return {
        "crop": crop,
        "days": days,
        "data_source": rows[-1].data_source if rows else "reference_dataset",
        "history": [
            {
                "date": r.price_date.isoformat(),
                "modal_price": r.modal_price,
                "min_price": r.min_price,
                "max_price": r.max_price,
            }
            for r in rows
        ],
    }


@router.get("/ai-recommendation")
def get_ai_recommendation(
    crop: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(MarketPriceHistory)
        .filter(MarketPriceHistory.crop_name.ilike(f"%{crop.strip()}%"))
        .order_by(MarketPriceHistory.price_date.asc())
        .all()
    )
    return _compute_advisory_from_history(crop, rows)


@router.post("/chat")
def chat_assistant(payload: ChatRequest, db: Session = Depends(get_db)):
    settings = get_settings()
    msg = payload.message.strip()
    msg_lower = msg.lower()

    # Match crop in DB if mentioned
    crops = db.query(CropInfo).all()
    matched_crop = payload.crop
    if not matched_crop:
        for c in crops:
            if c.name.lower() in msg_lower or (c.kannada_name and c.kannada_name in msg):
                matched_crop = c.name
                break

    price_rows = []
    crop_info = None
    if matched_crop:
        price_rows = (
            db.query(MarketPrice)
            .filter(MarketPrice.commodity.ilike(f"%{matched_crop}%"))
            .all()
        )
        crop_info = db.query(CropInfo).filter(CropInfo.name.ilike(f"%{matched_crop}%")).first()

    # Optional real LLM integration when API key is configured
    if settings.GROQ_API_KEY:
        try:
            from groq import Groq

            client = Groq(api_key=settings.GROQ_API_KEY)
            context_lines = [
                f"Matched crop: {matched_crop}" if matched_crop else "No specific crop matched.",
            ]
            for pr in price_rows[:3]:
                context_lines.append(
                    f"Reference price ({pr.data_source}): {pr.commodity} at {pr.market} ({pr.state}) = ₹{pr.modal_price}/Qtl"
                )
            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are SmartAgri AI, a helpful agricultural advisor. "
                            f"Respond in {'Kannada' if payload.language == 'kn' else 'English'}. "
                            "Use the provided database context and clearly note when prices are from the reference dataset.\n"
                            + "\n".join(context_lines)
                        ),
                    },
                    {"role": "user", "content": msg},
                ],
                max_tokens=350,
            )
            reply = completion.choices[0].message.content
            return {
                "reply": reply,
                "mode": "groq_llm",
                "sources_used": ["PostgreSQL MarketPrice", "Groq LLM"],
            }
        except Exception:
            pass  # Fall through cleanly to database-backed rule response

    # Deterministic database-backed advisory (no fabricated LLM claims)
    sources = ["PostgreSQL Crop & Market Reference Database"]
    if matched_crop and price_rows:
        top = max(price_rows, key=lambda r: r.modal_price)
        if payload.language == "kn":
            reply = (
                f"{matched_crop} ({crop_info.kannada_name if crop_info else matched_crop}) "
                f"ಉಲ್ಲೇಖ ಮಾರುಕಟ್ಟೆ ದರ: {top.market} ನಲ್ಲಿ ₹{top.modal_price:.0f}/ಕ್ವಿಂಟಾಲ್ "
                f"(ಕನಿಷ್ಠ ₹{top.min_price:.0f}, ಗರಿಷ್ಠ ₹{top.max_price:.0f}). "
                f"ಗಮನಿಸಿ: ಇದು ಉಲ್ಲೇಖ ದತ್ತಾಂಶವಾಗಿದೆ (Reference Dataset)."
            )
        else:
            reply = (
                f"Based on our reference market dataset, {matched_crop} is trading at "
                f"₹{top.modal_price:.0f}/Quintal in {top.market}, {top.state} "
                f"(range ₹{top.min_price:.0f}–₹{top.max_price:.0f}). "
            )
            if crop_info and crop_info.overview:
                reply += f"Agronomy note: {crop_info.overview}"
        return {
            "reply": reply,
            "mode": "database_rule_based",
            "sources_used": sources,
        }

    if "fertilizer" in msg_lower or "npk" in msg_lower:
        reply = (
            "For balanced crop nutrition, test soil pH (ideal 6.0–7.0 for most crops) "
            "and apply NPK based on crop stage. You can log soil readings in the Soil & Fertilizer page."
        )
    elif "blight" in msg_lower or "disease" in msg_lower:
        reply = (
            "Remove infected leaves early, ensure proper plant spacing for airflow, "
            "avoid overhead evening watering, and consult your local agronomy extension for targeted fungicides."
        )
    else:
        reply = (
            "Ask me about any crop in our database (e.g., Tomato, Onion, Potato, Wheat, Ragi, Togari Bele) "
            "for reference APMC rates, growing conditions, or fertilizer guidance."
        )

    return {
        "reply": reply,
        "mode": "database_rule_based",
        "sources_used": sources,
    }
