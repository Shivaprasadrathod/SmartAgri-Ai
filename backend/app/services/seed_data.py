"""
Idempotent reference dataset seeder for SmartAgri AI.
Populates CropInfo, MarketPrice, MarketPriceHistory, and Product tables
only when those tables are empty, and clearly tags market records with
data_source='reference_dataset' so demo/baseline data is never confused
with live external API feeds.
"""

from datetime import date, timedelta
import logging
from sqlalchemy.orm import Session

from app.models.market import CropInfo, MarketPrice, MarketPriceHistory
from app.models.product import Product

logger = logging.getLogger(__name__)

REFERENCE_CROPS = [
    {
        "name": "Tomato",
        "scientific_name": "Solanum lycopersicum",
        "category": "Vegetables",
        "kannada_name": "ಟೊಮೆಟೊ",
        "english_sub": "Tomato",
        "season": "Kharif / Rabi",
        "duration": "90-120 days",
        "water": "Medium",
        "difficulty": "Moderate",
        "temperature": "20-30°C",
        "soil": "Loamy, well-drained soil",
        "ph": "6.0-7.0",
        "sunlight": "6-8 hours",
        "spacing": "45-60 cm",
        "overview": "High-value vegetable crop suited to warm climates with balanced irrigation.",
        "image": "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=900&q=80",
    },
    {
        "name": "Onion",
        "scientific_name": "Allium cepa",
        "category": "Vegetables",
        "kannada_name": "ಈರುಳ್ಳಿ",
        "english_sub": "Onion",
        "season": "Rabi / Kharif",
        "duration": "100-120 days",
        "water": "Medium",
        "difficulty": "Moderate",
        "temperature": "15-25°C",
        "soil": "Sandy loam to clay loam",
        "ph": "6.0-7.5",
        "sunlight": "6+ hours",
        "spacing": "15x10 cm",
        "overview": "Major commercial bulb crop widely traded across Maharashtra and Karnataka APMCs.",
        "image": "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=900&q=80",
    },
    {
        "name": "Potato",
        "scientific_name": "Solanum tuberosum",
        "category": "Vegetables",
        "kannada_name": "ಆಲೂಗಡ್ಡೆ",
        "english_sub": "Potato",
        "season": "Rabi",
        "duration": "90-110 days",
        "water": "Medium",
        "difficulty": "Moderate",
        "temperature": "15-22°C",
        "soil": "Well-drained sandy loam",
        "ph": "5.5-6.5",
        "sunlight": "6 hours",
        "spacing": "60x20 cm",
        "overview": "Cool-season tuber crop with strong storage and processing demand.",
        "image": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=900&q=80",
    },
    {
        "name": "Wheat",
        "scientific_name": "Triticum aestivum",
        "category": "Cereals",
        "kannada_name": "ಗೋಧಿ",
        "english_sub": "Wheat (Godhi)",
        "season": "Rabi",
        "duration": "110-130 days",
        "water": "Medium",
        "difficulty": "Easy",
        "temperature": "12-25°C",
        "soil": "Clay loam / Black soil",
        "ph": "6.0-7.5",
        "sunlight": "Full sun",
        "spacing": "20-22 cm rows",
        "overview": "Staple winter cereal crop requiring timely crown-root irrigation.",
        "image": "/crops/godhi.jpg",
    },
    {
        "name": "Rice (Paddy)",
        "scientific_name": "Oryza sativa",
        "category": "Cereals",
        "kannada_name": "ಭತ್ತ / ಅಕ್ಕಿ",
        "english_sub": "Rice / Paddy (Akki)",
        "season": "Kharif",
        "duration": "120-140 days",
        "water": "High",
        "difficulty": "Moderate",
        "temperature": "22-32°C",
        "soil": "Clayey loam",
        "ph": "5.5-7.0",
        "sunlight": "Full sun",
        "spacing": "20x15 cm",
        "overview": "Primary Kharif grain crop grown in irrigated and high-rainfall belts.",
        "image": "/crops/akki.jpg",
    },
    {
        "name": "Maize (Corn)",
        "scientific_name": "Zea mays",
        "category": "Cereals",
        "kannada_name": "ಮೆಕ್ಕೆಜೋಳ",
        "english_sub": "Maize / Corn",
        "season": "Kharif / Rabi",
        "duration": "95-110 days",
        "water": "Medium",
        "difficulty": "Easy",
        "temperature": "20-30°C",
        "soil": "Well-drained loamy soil",
        "ph": "5.8-7.0",
        "sunlight": "Full sun",
        "spacing": "60x20 cm",
        "overview": "Versatile cereal crop used for food, feed, and starch industries.",
        "image": "/crops/jola.jpg",
    },
    {
        "name": "Togari Bele",
        "scientific_name": "Cajanus cajan",
        "category": "Pulses",
        "kannada_name": "ತೊಗರಿ ಬೆಳೆ",
        "english_sub": "Toor / Pigeon Pea (Arhar)",
        "season": "Kharif",
        "duration": "150-180 days",
        "water": "Low-Medium",
        "difficulty": "Easy",
        "temperature": "22-34°C",
        "soil": "Black cotton & red loam",
        "ph": "6.0-7.5",
        "sunlight": "Full sun",
        "spacing": "90x20 cm",
        "overview": "Flagship pulse crop of Kalaburagi and North Karnataka.",
        "image": "/crops/togari.jpg",
    },
    {
        "name": "Ragi",
        "scientific_name": "Eleusine coracana",
        "category": "Millets",
        "kannada_name": "ರಾಗಿ",
        "english_sub": "Finger Millet",
        "season": "Kharif",
        "duration": "105-120 days",
        "water": "Low",
        "difficulty": "Easy",
        "temperature": "20-30°C",
        "soil": "Red sandy loam",
        "ph": "5.5-7.5",
        "sunlight": "Full sun",
        "spacing": "22.5x10 cm",
        "overview": "Drought-resilient staple millet of Southern Karnataka.",
        "image": "/crops/ragi.jpg",
    },
    {
        "name": "Kadale Bele",
        "scientific_name": "Cicer arietinum",
        "category": "Pulses",
        "kannada_name": "ಕಡಲೆ ಬೆಳೆ",
        "english_sub": "Bengal Gram / Chickpea",
        "season": "Rabi",
        "duration": "95-110 days",
        "water": "Low",
        "difficulty": "Easy",
        "temperature": "15-28°C",
        "soil": "Deep black / loamy soil",
        "ph": "6.0-7.5",
        "sunlight": "Full sun",
        "spacing": "30x10 cm",
        "overview": "Major Rabi pulse crop grown across Vijayapura, Gadag, and Bidar.",
        "image": "/crops/kadale.jpg",
    },
    {
        "name": "Soybean",
        "scientific_name": "Glycine max",
        "category": "Oilseeds",
        "kannada_name": "ಸೋಯಾಬೀನ್",
        "english_sub": "Soybean",
        "season": "Kharif",
        "duration": "95-110 days",
        "water": "Medium",
        "difficulty": "Easy",
        "temperature": "20-30°C",
        "soil": "Well-drained black / loamy",
        "ph": "6.0-7.0",
        "sunlight": "Full sun",
        "spacing": "45x5 cm",
        "overview": "Key oilseed and protein crop across Bidar, Belagavi, and Maharashtra.",
        "image": "/crops/soya.jpg",
    },
    {
        "name": "Jola",
        "scientific_name": "Sorghum bicolor",
        "category": "Millets",
        "kannada_name": "ಜೋಳ",
        "english_sub": "Jowar / Sorghum",
        "season": "Kharif / Rabi",
        "duration": "100-120 days",
        "water": "Low",
        "difficulty": "Easy",
        "temperature": "22-32°C",
        "soil": "Medium to deep black soil",
        "ph": "6.0-7.5",
        "sunlight": "Full sun",
        "spacing": "45x15 cm",
        "overview": "Resilient dryland millet widely cultivated in North Karnataka.",
        "image": "/crops/jola.jpg",
    },
    {
        "name": "Hasiru Hesaru",
        "scientific_name": "Vigna radiata",
        "category": "Pulses",
        "kannada_name": "ಹಸಿರು ಹೆಸರು",
        "english_sub": "Green Gram / Moong",
        "season": "Kharif / Summer",
        "duration": "65-75 days",
        "water": "Low",
        "difficulty": "Easy",
        "temperature": "25-35°C",
        "soil": "Sandy loam to black soil",
        "ph": "6.2-7.5",
        "sunlight": "Full sun",
        "spacing": "30x10 cm",
        "overview": "Short-duration pulse crop that enriches soil nitrogen.",
        "image": "/crops/hasiru.jpg",
    },
    {
        "name": "Uddina Bele",
        "scientific_name": "Vigna mungo",
        "category": "Pulses",
        "kannada_name": "ಉದ್ದಿನ ಬೆಳೆ",
        "english_sub": "Black Gram / Urad",
        "season": "Kharif",
        "duration": "75-85 days",
        "water": "Low",
        "difficulty": "Easy",
        "temperature": "24-34°C",
        "soil": "Loamy to clay loam",
        "ph": "6.0-7.5",
        "sunlight": "Full sun",
        "spacing": "30x10 cm",
        "overview": "High-demand pulse crop grown across Bidar and Kalaburagi.",
        "image": "/crops/uddina.jpg",
    },
]

REFERENCE_MARKET_PRICES = [
    # Maharashtra & National reference mandis
    {"commodity": "Tomato", "state": "Maharashtra", "district": "Nashik", "market": "Lasalgaon APMC", "variety": "Hybrid", "min_price": 1400, "max_price": 2100, "modal_price": 1820, "latitude": 20.1419, "longitude": 74.2392},
    {"commodity": "Tomato", "state": "Maharashtra", "district": "Pune", "market": "Pune APMC (Gultekdi)", "variety": "Local", "min_price": 1500, "max_price": 2250, "modal_price": 1950, "latitude": 18.4976, "longitude": 73.8698},
    {"commodity": "Tomato", "state": "Karnataka", "district": "Bengaluru", "market": "Yeshwanthpur APMC (Bengaluru)", "variety": "Hybrid", "min_price": 1600, "max_price": 2300, "modal_price": 2020, "latitude": 13.0285, "longitude": 77.5409},
    {"commodity": "Tomato", "state": "Gujarat", "district": "Ahmedabad", "market": "Ahmedabad APMC", "variety": "Hybrid", "min_price": 1350, "max_price": 1950, "modal_price": 1700, "latitude": 23.0225, "longitude": 72.5714},
    {"commodity": "Tomato", "state": "NCT of Delhi", "district": "New Delhi", "market": "Azadpur Mandi", "variety": "Desi", "min_price": 1700, "max_price": 2400, "modal_price": 2100, "latitude": 28.7076, "longitude": 77.1755},

    {"commodity": "Onion", "state": "Maharashtra", "district": "Nashik", "market": "Lasalgaon APMC", "variety": "Red", "min_price": 1800, "max_price": 2650, "modal_price": 2320, "latitude": 20.1419, "longitude": 74.2392},
    {"commodity": "Onion", "state": "Maharashtra", "district": "Pune", "market": "Pune APMC (Gultekdi)", "variety": "Red", "min_price": 1900, "max_price": 2700, "modal_price": 2400, "latitude": 18.4976, "longitude": 73.8698},
    {"commodity": "Onion", "state": "Karnataka", "district": "Bengaluru", "market": "Yeshwanthpur APMC (Bengaluru)", "variety": "Bellary Red", "min_price": 2050, "max_price": 2850, "modal_price": 2520, "latitude": 13.0285, "longitude": 77.5409},
    {"commodity": "Onion", "state": "Karnataka", "district": "Vijayapura", "market": "Vijayapura APMC", "variety": "Red", "min_price": 1850, "max_price": 2550, "modal_price": 2260, "latitude": 16.8302, "longitude": 75.7100},

    {"commodity": "Potato", "state": "Maharashtra", "district": "Pune", "market": "Pune APMC (Gultekdi)", "variety": "Jyoti", "min_price": 1450, "max_price": 1950, "modal_price": 1720, "latitude": 18.4976, "longitude": 73.8698},
    {"commodity": "Potato", "state": "NCT of Delhi", "district": "New Delhi", "market": "Azadpur Mandi", "variety": "3797", "min_price": 1300, "max_price": 1800, "modal_price": 1580, "latitude": 28.7076, "longitude": 77.1755},
    {"commodity": "Potato", "state": "Karnataka", "district": "Belagavi", "market": "Belagavi APMC", "variety": "Local", "min_price": 1500, "max_price": 2050, "modal_price": 1810, "latitude": 15.8497, "longitude": 74.4977},

    {"commodity": "Wheat", "state": "Maharashtra", "district": "Nashik", "market": "Nashik APMC", "variety": "Lokwan", "min_price": 2450, "max_price": 2850, "modal_price": 2660, "latitude": 19.9975, "longitude": 73.7898},
    {"commodity": "Wheat", "state": "Karnataka", "district": "Bagalkot", "market": "Bagalkot APMC", "variety": "Sharbati", "min_price": 2550, "max_price": 2980, "modal_price": 2780, "latitude": 16.1850, "longitude": 75.6961},

    {"commodity": "Rice (Paddy)", "state": "Karnataka", "district": "Raichur", "market": "Raichur APMC", "variety": "Sona Masuri", "min_price": 2800, "max_price": 3450, "modal_price": 3180, "latitude": 16.2120, "longitude": 77.3439},
    {"commodity": "Maize (Corn)", "state": "Karnataka", "district": "Belagavi", "market": "Belagavi APMC", "variety": "Hybrid Yellow", "min_price": 1950, "max_price": 2350, "modal_price": 2180, "latitude": 15.8497, "longitude": 74.4977},

    # Karnataka APMC reference crops
    {"commodity": "Togari Bele", "state": "Karnataka", "district": "Kalaburagi", "market": "Kalaburagi APMC (Sedam Road)", "variety": "Red Gram", "min_price": 7850, "max_price": 8450, "modal_price": 8160, "latitude": 17.3297, "longitude": 76.8343},
    {"commodity": "Ragi", "state": "Karnataka", "district": "Bengaluru", "market": "Yeshwanthpur APMC (Bengaluru)", "variety": "Indaf-9", "min_price": 3300, "max_price": 3850, "modal_price": 3620, "latitude": 13.0285, "longitude": 77.5409},
    {"commodity": "Kadale Bele", "state": "Karnataka", "district": "Vijayapura", "market": "Vijayapura APMC", "variety": "Annigeri-1", "min_price": 5600, "max_price": 6250, "modal_price": 5940, "latitude": 16.8302, "longitude": 75.7100},
    {"commodity": "Soybean", "state": "Karnataka", "district": "Bidar", "market": "Bidar APMC", "variety": "JS-335", "min_price": 4350, "max_price": 4850, "modal_price": 4620, "latitude": 17.9104, "longitude": 77.5199},
    {"commodity": "Jola", "state": "Karnataka", "district": "Raichur", "market": "Raichur APMC", "variety": "Maldandi", "min_price": 3100, "max_price": 3650, "modal_price": 3420, "latitude": 16.2120, "longitude": 77.3439},
    {"commodity": "Hasiru Hesaru", "state": "Karnataka", "district": "Yadgir", "market": "Yadgir APMC", "variety": "Green Gram", "min_price": 7400, "max_price": 8150, "modal_price": 7820, "latitude": 16.7702, "longitude": 77.1376},
    {"commodity": "Uddina Bele", "state": "Karnataka", "district": "Bidar", "market": "Bidar APMC", "variety": "TAU-1", "min_price": 7600, "max_price": 8300, "modal_price": 7980, "latitude": 17.9104, "longitude": 77.5199},
]

REFERENCE_PRODUCTS = [
    {
        "name": "Hybrid Tomato Seeds",
        "category": "Seeds & Planting",
        "crop": "Tomato",
        "variety": "Arka Rakshak F1",
        "unit": "100 g",
        "price": 249.0,
        "rating": 4.7,
        "stock": 22,
        "seller": "ABC Seeds",
        "location": "Nashik, Maharashtra",
        "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80",
        "description": "High-yielding triple-disease-resistant hybrid tomato seeds.",
    },
    {
        "name": "NPK 19:19:19 Water Soluble Fertilizer",
        "category": "Fertilizers",
        "crop": "All Crops",
        "variety": "Balanced NPK",
        "unit": "1 kg",
        "price": 185.0,
        "rating": 4.6,
        "stock": 45,
        "seller": "Krishi Agro Inputs",
        "location": "Pune, Maharashtra",
        "image": "https://images.unsplash.com/photo-1464226184884-fa52ac9fcf5a?auto=format&fit=crop&w=900&q=80",
        "description": "Balanced foliar and drip-compatible NPK nutrition for vegetative & flowering stages.",
    },
    {
        "name": "Drip Irrigation Starter Kit (1 Acre)",
        "category": "Irrigation",
        "crop": "Vegetables",
        "variety": "Inline 16mm",
        "unit": "1 kit",
        "price": 1499.0,
        "rating": 4.8,
        "stock": 12,
        "seller": "JalDhara Agro",
        "location": "Bengaluru, Karnataka",
        "image": "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=900&q=80",
        "description": "Complete 1-acre drip lateral & emitter starter kit for water-efficient farming.",
    },
    {
        "name": "Cold-Pressed Neem Oil Bio-Pesticide",
        "category": "Crop Protection",
        "crop": "All Crops",
        "variety": "1500 PPM",
        "unit": "1 L",
        "price": 390.0,
        "rating": 4.5,
        "stock": 30,
        "seller": "GreenShield Organics",
        "location": "Kalaburagi, Karnataka",
        "image": "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=900&q=80",
        "description": "Organic broad-spectrum pest control against aphids, whiteflies, and thrips.",
    },
]


def seed_reference_data(db: Session) -> None:
    """Seed reference crops, market prices, 30-day history, and products if empty."""
    today = date.today()
    today_str = today.isoformat()

    if db.query(CropInfo).count() == 0:
        for item in REFERENCE_CROPS:
            db.add(CropInfo(**item))
        db.flush()
        logger.info("Seeded %d reference CropInfo records.", len(REFERENCE_CROPS))

    if db.query(MarketPrice).count() == 0:
        for item in REFERENCE_MARKET_PRICES:
            db.add(
                MarketPrice(
                    **item,
                    unit="INR / Quintal",
                    arrival_date=today_str,
                    data_source="reference_dataset",
                )
            )
        db.flush()
        logger.info("Seeded %d reference MarketPrice records.", len(REFERENCE_MARKET_PRICES))

    if db.query(MarketPriceHistory).count() == 0:
        # Generate deterministic 30-day historical baseline per commodity
        seen_crops: dict[str, dict] = {}
        for row in REFERENCE_MARKET_PRICES:
            seen_crops.setdefault(row["commodity"], row)

        history_rows = 0
        for idx, (crop_name, base_row) in enumerate(seen_crops.items()):
            base_modal = float(base_row["modal_price"])
            spread = max(120.0, round(base_modal * 0.08, 2))
            for day_offset in range(29, -1, -1):
                d = today - timedelta(days=day_offset)
                # Deterministic gentle wave + mild trend (no random fabrication)
                wave = ((29 - day_offset + idx * 3) % 7 - 3) * (base_modal * 0.006)
                trend = (29 - day_offset) * (base_modal * 0.0012)
                modal = round(base_modal - (base_modal * 0.03) + trend + wave, 2)
                db.add(
                    MarketPriceHistory(
                        crop_name=crop_name,
                        market=base_row["market"],
                        price_date=d,
                        min_price=round(modal - spread, 2),
                        max_price=round(modal + spread, 2),
                        modal_price=modal,
                        data_source="reference_dataset",
                    )
                )
                history_rows += 1
        db.flush()
        logger.info("Seeded %d reference MarketPriceHistory records.", history_rows)

    if db.query(Product).count() == 0:
        for prod in REFERENCE_PRODUCTS:
            db.add(Product(**prod))
        db.flush()
        logger.info("Seeded %d reference Product records.", len(REFERENCE_PRODUCTS))

    db.commit()
