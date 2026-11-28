from sqlalchemy import Column, DateTime, Integer, String, func
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    settings = relationship("UserSettings", back_populates="user", uselist=False, cascade="all, delete-orphan")
    orders = relationship("DeliveryOrder", back_populates="user", cascade="all, delete-orphan")
    irrigation_schedules = relationship("IrrigationSchedule", back_populates="user", cascade="all, delete-orphan")
    fertilizer_logs = relationship("FertilizerLog", back_populates="user", cascade="all, delete-orphan")
    crop_plans = relationship("CropPlan", back_populates="user", cascade="all, delete-orphan")
    disease_scans = relationship("DiseaseScan", back_populates="user", cascade="all, delete-orphan")
