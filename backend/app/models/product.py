from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, JSON, String, Text, func
from sqlalchemy.orm import relationship
from app.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(160), nullable=False, index=True)
    category = Column(String(80), nullable=False, index=True)
    crop = Column(String(80), nullable=True, index=True)
    variety = Column(String(120), nullable=True)
    unit = Column(String(40), nullable=False, default="1 unit")
    price = Column(Float, nullable=False)
    rating = Column(Float, nullable=False, default=4.5)
    stock = Column(Integer, nullable=False, default=10)
    seller = Column(String(120), nullable=False)
    location = Column(String(120), nullable=False)
    image = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class DeliveryOrder(Base):
    __tablename__ = "delivery_orders"

    id = Column(Integer, primary_key=True, index=True)
    order_code = Column(String(40), unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    product = Column(String(200), nullable=False)
    quantity = Column(String(60), nullable=False)
    price = Column(String(40), nullable=False)
    status = Column(String(60), nullable=False, default="Order Confirmed", index=True)
    order_type = Column(String(30), nullable=False, default="Buying")
    date_label = Column(String(40), nullable=False, default="Today")
    address = Column(String(255), nullable=False)
    driver = Column(String(100), nullable=False, default="Assigned Soon")
    eta = Column(String(80), nullable=False, default="Within 24-48 hours")
    items = Column(JSON, nullable=False, default=list)
    timeline = Column(JSON, nullable=False, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="orders")
