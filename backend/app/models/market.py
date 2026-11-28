from sqlalchemy import Column, Date, DateTime, Float, Integer, String, Text, func
from app.database import Base


class CropInfo(Base):
    __tablename__ = "crop_info"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    scientific_name = Column(String(150), nullable=True)
    category = Column(String(80), nullable=True, index=True)
    kannada_name = Column(String(120), nullable=True)
    english_sub = Column(String(150), nullable=True)
    season = Column(String(120), nullable=True)
    duration = Column(String(80), nullable=True)
    water = Column(String(60), nullable=True)
    difficulty = Column(String(60), nullable=True)
    temperature = Column(String(60), nullable=True)
    soil = Column(String(160), nullable=True)
    ph = Column(String(40), nullable=True)
    sunlight = Column(String(60), nullable=True)
    spacing = Column(String(60), nullable=True)
    overview = Column(Text, nullable=True)
    image = Column(Text, nullable=True)


class MarketPrice(Base):
    __tablename__ = "market_prices"

    id = Column(Integer, primary_key=True, index=True)
    commodity = Column(String(100), nullable=False, index=True)
    state = Column(String(80), nullable=False, index=True)
    district = Column(String(80), nullable=False, index=True)
    market = Column(String(150), nullable=False, index=True)
    variety = Column(String(100), nullable=True, default="Local")
    min_price = Column(Float, nullable=False)
    max_price = Column(Float, nullable=False)
    modal_price = Column(Float, nullable=False)
    unit = Column(String(40), nullable=False, default="INR / Quintal")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    arrival_date = Column(String(40), nullable=True)
    data_source = Column(String(60), nullable=False, default="reference_dataset")
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class MarketPriceHistory(Base):
    __tablename__ = "market_price_history"

    id = Column(Integer, primary_key=True, index=True)
    crop_name = Column(String(100), nullable=False, index=True)
    market = Column(String(150), nullable=True, index=True)
    price_date = Column(Date, nullable=False, index=True)
    min_price = Column(Float, nullable=False)
    max_price = Column(Float, nullable=False)
    modal_price = Column(Float, nullable=False)
    data_source = Column(String(60), nullable=False, default="reference_dataset")


class PricePrediction(Base):
    __tablename__ = "price_predictions"

    id = Column(Integer, primary_key=True, index=True)
    crop_name = Column(String(100), nullable=False, index=True)
    market = Column(String(150), nullable=True, index=True)
    state = Column(String(80), nullable=True, index=True)
    predicted_date = Column(Date, nullable=False, index=True)
    predicted_price = Column(Float, nullable=False)
    lower_bound = Column(Float, nullable=False)
    upper_bound = Column(Float, nullable=False)
    trend_direction = Column(String(20), nullable=False, default="STABLE")
    recommendation = Column(String(20), nullable=False, default="HOLD")
    confidence = Column(Float, nullable=False, default=0.75)
    model_type = Column(String(80), nullable=False, default="linear_trend_baseline")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
