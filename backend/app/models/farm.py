from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import relationship
from app.database import Base


class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    name = Column(String(120), nullable=False)
    farm_name = Column(String(150), nullable=False, default="Green Valley Farm")
    location = Column(String(150), nullable=False, default="Nashik, Maharashtra")
    farm_size = Column(String(60), nullable=False, default="10 acres")
    email = Column(String(150), nullable=False)
    phone = Column(String(30), nullable=False, default="")
    irrigation_mode = Column(String(60), nullable=False, default="Drip")
    notifications = Column(Boolean, nullable=False, default=True)
    ai_insights = Column(Boolean, nullable=False, default=True)
    auto_scheduling = Column(Boolean, nullable=False, default=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", back_populates="settings")


class IrrigationSchedule(Base):
    __tablename__ = "irrigation_schedules"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    crop_name = Column(String(80), nullable=False, default="Tomato")
    name = Column(String(100), nullable=False)
    time_label = Column(String(40), nullable=False)
    duration = Column(String(40), nullable=False)
    enabled = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="irrigation_schedules")


class FertilizerLog(Base):
    __tablename__ = "fertilizer_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    soil_type = Column(String(60), nullable=False, default="Loamy")
    ph = Column(String(20), nullable=True)
    nitrogen = Column(String(30), nullable=True)
    phosphorus = Column(String(30), nullable=True)
    potassium = Column(String(30), nullable=True)
    organic_carbon = Column(String(30), nullable=True)
    name = Column(String(120), nullable=False)
    log_type = Column(String(40), nullable=False, default="Applied")
    date_label = Column(String(40), nullable=False)
    recommendation = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="fertilizer_logs")


class CropPlan(Base):
    __tablename__ = "crop_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    crop_name = Column(String(100), nullable=False, index=True)
    status = Column(String(40), nullable=False, default="Started")
    notes = Column(Text, nullable=True)
    started_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="crop_plans")


class DiseaseScan(Base):
    __tablename__ = "disease_scans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    filename = Column(String(200), nullable=False)
    crop_name = Column(String(80), nullable=True)
    disease_name = Column(String(150), nullable=False)
    confidence = Column(String(20), nullable=False)
    severity = Column(String(40), nullable=False)
    treatment = Column(Text, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="disease_scans")
