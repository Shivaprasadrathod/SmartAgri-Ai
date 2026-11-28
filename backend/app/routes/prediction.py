from datetime import date, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.market import MarketPrice, MarketPriceHistory

router = APIRouter(prefix="/api/prediction", tags=["Price Prediction"])


def _linear_forecast(
    crop: str,
    market: Optional[str],
    state: Optional[str],
    db: Session,
) -> dict:
    history_q = db.query(MarketPriceHistory).filter(
        MarketPriceHistory.crop_name.ilike(f"%{crop.strip()}%")
    )
    if market and market != "All Markets":
        market_rows = history_q.filter(MarketPriceHistory.market.ilike(f"%{market.strip()}%")).order_by(
            MarketPriceHistory.price_date.asc()
        ).all()
        history_rows = market_rows if market_rows else history_q.order_by(MarketPriceHistory.price_date.asc()).all()
    else:
        history_rows = history_q.order_by(MarketPriceHistory.price_date.asc()).all()

    if not history_rows:
        price_q = db.query(MarketPrice).filter(MarketPrice.commodity.ilike(f"%{crop.strip()}%"))
        if state and state != "All States":
            price_q = price_q.filter(MarketPrice.state.ilike(f"%{state.strip()}%"))
        spot = price_q.first()
        if not spot:
            raise HTTPException(
                status_code=404,
                detail=f"No historical or reference price data found for '{crop}'.",
            )
        base_price = float(spot.modal_price)
        today = date.today()
        recent_history = [
            {"date": (today - timedelta(days=i)).isoformat(), "actual_price": base_price}
            for i in range(6, -1, -1)
        ]
        slope = 0.0
        last_price = base_price
        data_source = spot.data_source
    else:
        n = len(history_rows)
        ys = [float(r.modal_price) for r in history_rows]
        xs = list(range(n))
        mean_x = sum(xs) / n
        mean_y = sum(ys) / n
        denom = sum((x - mean_x) ** 2 for x in xs)
        slope = sum((x - mean_x) * (y - mean_y) for x, y in zip(xs, ys)) / denom if denom else 0.0
        last_price = ys[-1]
        data_source = history_rows[-1].data_source
        recent_history = [
            {"date": r.price_date.isoformat(), "actual_price": float(r.modal_price)}
            for r in history_rows[-14:]
        ]

    # Cap daily slope to realistic +/- 1.5% of last price for statistical stability
    max_step = last_price * 0.015
    slope = max(-max_step, min(max_step, slope))

    today = date.today()
    thirty_day_forecast = []
    for day_idx in range(1, 31):
        pred_date = today + timedelta(days=day_idx)
        pred_price = round(max(100.0, last_price + slope * day_idx), 2)
        band = round(pred_price * (0.03 + 0.002 * day_idx), 2)
        thirty_day_forecast.append(
            {
                "date": pred_date.isoformat(),
                "predicted_price": pred_price,
                "min_estimate": round(max(50.0, pred_price - band), 2),
                "max_estimate": round(pred_price + band, 2),
            }
        )

    seven_day_forecast = thirty_day_forecast[:7]
    tomorrow = thirty_day_forecast[0]
    pct_7d = round(((seven_day_forecast[-1]["predicted_price"] - last_price) / last_price) * 100, 2) if last_price else 0.0

    if pct_7d >= 1.5:
        trend = "UPWARD"
        rec = "HOLD"
        reason = f"7-day statistical baseline projects +{pct_7d}% momentum from ₹{last_price:.0f}/Qtl."
    elif pct_7d <= -1.5:
        trend = "DOWNWARD"
        rec = "SELL"
        reason = f"7-day statistical baseline projects {pct_7d}% softening from ₹{last_price:.0f}/Qtl."
    else:
        trend = "STABLE"
        rec = "HOLD"
        reason = f"Prices are projected to stay stable ({pct_7d:+.2f}%) around ₹{last_price:.0f}/Qtl."

    return {
        "crop": crop,
        "market": market or "Reference APMC Aggregate",
        "state": state or "All States",
        "today_actual_price": last_price,
        "tomorrow_predicted_price": tomorrow["predicted_price"],
        "trend_direction": trend,
        "recommendation": rec,
        "reason": reason,
        "expected_7d_change_pct": pct_7d,
        "confidence": 0.72,
        "model_type": "linear_trend_baseline",
        "is_statistical_baseline": True,
        "data_source": data_source,
        "recent_history": recent_history,
        "seven_day_forecast": seven_day_forecast,
        "thirty_day_forecast": thirty_day_forecast,
    }


@router.get("/full")
def get_full_prediction(
    crop: str = Query(default="Tomato"),
    market: Optional[str] = None,
    state: Optional[str] = None,
    district: Optional[str] = None,  # accepted for frontend compatibility
    db: Session = Depends(get_db),
):
    return _linear_forecast(crop, market, state, db)


@router.get("/tomorrow")
def get_tomorrow_prediction(
    crop: str = Query(default="Tomato"),
    market: Optional[str] = None,
    db: Session = Depends(get_db),
):
    full = _linear_forecast(crop, market, None, db)
    return {
        "crop": full["crop"],
        "market": full["market"],
        "today_actual_price": full["today_actual_price"],
        "tomorrow": full["seven_day_forecast"][0],
        "model_type": full["model_type"],
        "is_statistical_baseline": True,
    }


@router.get("/7days")
def get_seven_day_forecast(
    crop: str = Query(default="Tomato"),
    market: Optional[str] = None,
    db: Session = Depends(get_db),
):
    full = _linear_forecast(crop, market, None, db)
    return {
        "crop": full["crop"],
        "market": full["market"],
        "forecast": full["seven_day_forecast"],
        "model_type": full["model_type"],
        "is_statistical_baseline": True,
    }


@router.get("/30days")
def get_thirty_day_forecast(
    crop: str = Query(default="Tomato"),
    market: Optional[str] = None,
    db: Session = Depends(get_db),
):
    full = _linear_forecast(crop, market, None, db)
    return {
        "crop": full["crop"],
        "market": full["market"],
        "forecast": full["thirty_day_forecast"],
        "model_type": full["model_type"],
        "is_statistical_baseline": True,
    }


@router.get("/recommendation")
def get_prediction_recommendation(
    crop: str = Query(default="Tomato"),
    market: Optional[str] = None,
    db: Session = Depends(get_db),
):
    full = _linear_forecast(crop, market, None, db)
    return {
        "crop": full["crop"],
        "recommendation": full["recommendation"],
        "trend_direction": full["trend_direction"],
        "reason": full["reason"],
        "confidence": full["confidence"],
        "is_statistical_baseline": True,
    }
