from datetime import date
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.farm import (
    CropPlan,
    DiseaseScan,
    FertilizerLog,
    IrrigationSchedule,
    UserSettings,
)
from app.models.product import DeliveryOrder, Product
from app.models.user import User
from app.security import get_current_user

router = APIRouter(prefix="/api", tags=["Farm & Marketplace Operations"])


# ── Schemas ──────────────────────────────────────────────────────────────────

class OrderCreate(BaseModel):
    product: str = Field(..., min_length=1, max_length=200)
    quantity: str = Field(..., min_length=1, max_length=60)
    price: str = Field(..., min_length=1, max_length=40)
    order_type: str = Field(default="Buying", max_length=30)
    address: str = Field(..., min_length=3, max_length=255)
    items: list[str] = Field(default_factory=list)


class SettingsUpdate(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    farm_name: str = Field(default="Green Valley Farm", max_length=150)
    location: str = Field(default="Nashik, Maharashtra", max_length=150)
    farm_size: str = Field(default="10 acres", max_length=60)
    email: str = Field(..., min_length=3, max_length=150)
    phone: str = Field(default="", max_length=30)
    irrigation_mode: str = Field(default="Drip", max_length=60)
    notifications: bool = True
    ai_insights: bool = True
    auto_scheduling: bool = True


class IrrigationScheduleCreate(BaseModel):
    crop_name: str = Field(default="Tomato", max_length=80)
    name: str = Field(..., min_length=1, max_length=100)
    time_label: str = Field(..., min_length=1, max_length=40)
    duration: str = Field(..., min_length=1, max_length=40)
    enabled: bool = True


class FertilizerLogCreate(BaseModel):
    soil_type: str = Field(default="Loamy", max_length=60)
    ph: Optional[str] = None
    nitrogen: Optional[str] = None
    phosphorus: Optional[str] = None
    potassium: Optional[str] = None
    organic_carbon: Optional[str] = None
    name: str = Field(..., min_length=1, max_length=120)
    log_type: str = Field(default="Applied", max_length=40)
    date_label: Optional[str] = None


class CropPlanCreate(BaseModel):
    crop_name: str = Field(..., min_length=1, max_length=100)
    status: str = Field(default="Started", max_length=40)
    notes: Optional[str] = None


class DiseaseScanCreate(BaseModel):
    filename: str = Field(..., min_length=1, max_length=200)
    crop_name: Optional[str] = None
    notes: Optional[str] = None


# ── Products (Public Catalog) ────────────────────────────────────────────────

@router.get("/products")
def list_products(
    category: Optional[str] = None,
    q: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Product)
    if category and category != "All supplies":
        query = query.filter(Product.category == category)
    if q:
        term = f"%{q.strip()}%"
        query = query.filter(
            Product.name.ilike(term)
            | Product.category.ilike(term)
            | Product.crop.ilike(term)
            | Product.seller.ilike(term)
        )
    items = query.order_by(Product.id.asc()).all()
    return [
        {
            "id": p.id,
            "name": p.name,
            "category": p.category,
            "crop": p.crop,
            "variety": p.variety,
            "unit": p.unit,
            "price": p.price,
            "rating": p.rating,
            "stock": p.stock,
            "seller": p.seller,
            "location": p.location,
            "image": p.image,
            "description": p.description,
        }
        for p in items
    ]


# ── Delivery Orders (Protected) ──────────────────────────────────────────────

@router.get("/orders")
def list_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    orders = (
        db.query(DeliveryOrder)
        .filter(DeliveryOrder.user_id == current_user.id)
        .order_by(DeliveryOrder.created_at.desc())
        .all()
    )
    return [
        {
            "id": o.order_code,
            "product": o.product,
            "quantity": o.quantity,
            "price": o.price,
            "status": o.status,
            "type": o.order_type,
            "date": o.date_label,
            "address": o.address,
            "driver": o.driver,
            "eta": o.eta,
            "items": o.items,
            "timeline": o.timeline,
        }
        for o in orders
    ]


@router.post("/orders", status_code=status.HTTP_201_CREATED)
def create_order(
    payload: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order_code = f"AG{uuid.uuid4().hex[:6].upper()}"
    order = DeliveryOrder(
        order_code=order_code,
        user_id=current_user.id,
        product=payload.product,
        quantity=payload.quantity,
        price=payload.price,
        status="Order Confirmed",
        order_type=payload.order_type,
        date_label=date.today().isoformat(),
        address=payload.address,
        driver="Assigned Soon",
        eta="Within 24-48 hours",
        items=payload.items or [payload.product],
        timeline=["Order Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered"],
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return {
        "id": order.order_code,
        "product": order.product,
        "quantity": order.quantity,
        "price": order.price,
        "status": order.status,
        "type": order.order_type,
        "date": order.date_label,
        "address": order.address,
        "driver": order.driver,
        "eta": order.eta,
        "items": order.items,
        "timeline": order.timeline,
    }


# ── User Settings (Protected) ────────────────────────────────────────────────

@router.get("/settings")
def get_user_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    s = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    if not s:
        s = UserSettings(
            user_id=current_user.id,
            name=current_user.name,
            email=current_user.email,
        )
        db.add(s)
        db.commit()
        db.refresh(s)
    return {
        "name": s.name,
        "farmName": s.farm_name,
        "location": s.location,
        "farmSize": s.farm_size,
        "email": s.email,
        "phone": s.phone,
        "irrigationMode": s.irrigation_mode,
        "notifications": s.notifications,
        "aiInsights": s.ai_insights,
        "autoScheduling": s.auto_scheduling,
    }


@router.put("/settings")
def update_user_settings(
    payload: SettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    s = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    if not s:
        s = UserSettings(user_id=current_user.id, name=payload.name, email=payload.email)
        db.add(s)

    s.name = payload.name
    s.farm_name = payload.farm_name
    s.location = payload.location
    s.farm_size = payload.farm_size
    s.email = payload.email
    s.phone = payload.phone
    s.irrigation_mode = payload.irrigation_mode
    s.notifications = payload.notifications
    s.ai_insights = payload.ai_insights
    s.auto_scheduling = payload.auto_scheduling
    db.commit()
    db.refresh(s)
    return {
        "message": "Profile settings saved successfully.",
        "settings": {
            "name": s.name,
            "farmName": s.farm_name,
            "location": s.location,
            "farmSize": s.farm_size,
            "email": s.email,
            "phone": s.phone,
            "irrigationMode": s.irrigation_mode,
            "notifications": s.notifications,
            "aiInsights": s.ai_insights,
            "autoScheduling": s.auto_scheduling,
        },
    }


# ── Irrigation Schedules (Protected) ─────────────────────────────────────────

@router.get("/irrigation/schedules")
def list_irrigation_schedules(
    crop_name: Optional[str] = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(IrrigationSchedule).filter(IrrigationSchedule.user_id == current_user.id)
    if crop_name:
        query = query.filter(IrrigationSchedule.crop_name == crop_name)
    rows = query.order_by(IrrigationSchedule.id.asc()).all()
    return [
        {
            "id": r.id,
            "crop_name": r.crop_name,
            "name": r.name,
            "time": r.time_label,
            "duration": r.duration,
            "enabled": r.enabled,
        }
        for r in rows
    ]


@router.post("/irrigation/schedules", status_code=status.HTTP_201_CREATED)
def create_irrigation_schedule(
    payload: IrrigationScheduleCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = IrrigationSchedule(
        user_id=current_user.id,
        crop_name=payload.crop_name,
        name=payload.name,
        time_label=payload.time_label,
        duration=payload.duration,
        enabled=payload.enabled,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return {
        "id": row.id,
        "crop_name": row.crop_name,
        "name": row.name,
        "time": row.time_label,
        "duration": row.duration,
        "enabled": row.enabled,
    }


@router.delete("/irrigation/schedules/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_irrigation_schedule(
    schedule_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = (
        db.query(IrrigationSchedule)
        .filter(
            IrrigationSchedule.id == schedule_id,
            IrrigationSchedule.user_id == current_user.id,
        )
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Schedule not found")
    db.delete(row)
    db.commit()


# ── Fertilizer Logs (Protected) ──────────────────────────────────────────────

@router.get("/fertilizer/logs")
def list_fertilizer_logs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(FertilizerLog)
        .filter(FertilizerLog.user_id == current_user.id)
        .order_by(FertilizerLog.created_at.desc())
        .all()
    )
    return [
        {
            "id": r.id,
            "soil_type": r.soil_type,
            "ph": r.ph,
            "nitrogen": r.nitrogen,
            "phosphorus": r.phosphorus,
            "potassium": r.potassium,
            "organic_carbon": r.organic_carbon,
            "name": r.name,
            "type": r.log_type,
            "date": r.date_label,
            "recommendation": r.recommendation,
        }
        for r in rows
    ]


@router.post("/fertilizer/logs", status_code=status.HTTP_201_CREATED)
def create_fertilizer_log(
    payload: FertilizerLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ph_val = None
    try:
        ph_val = float(payload.ph) if payload.ph is not None else None
    except ValueError:
        ph_val = None

    condition = "Good" if (ph_val is not None and 6.0 <= ph_val <= 7.0) else "Needs attention"
    rec = (
        f"Soil Condition: {condition} ({payload.soil_type}). "
        "Apply balanced nutrients based on soil test results and crop stage."
    )
    row = FertilizerLog(
        user_id=current_user.id,
        soil_type=payload.soil_type,
        ph=payload.ph,
        nitrogen=payload.nitrogen,
        phosphorus=payload.phosphorus,
        potassium=payload.potassium,
        organic_carbon=payload.organic_carbon,
        name=payload.name,
        log_type=payload.log_type,
        date_label=payload.date_label or date.today().strftime("%d %b"),
        recommendation=rec,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return {
        "id": row.id,
        "soil_type": row.soil_type,
        "name": row.name,
        "type": row.log_type,
        "date": row.date_label,
        "recommendation": row.recommendation,
    }


# ── Crop Plans (Protected) ───────────────────────────────────────────────────

@router.get("/crop-plans")
def list_crop_plans(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(CropPlan)
        .filter(CropPlan.user_id == current_user.id)
        .order_by(CropPlan.started_at.desc())
        .all()
    )
    return [
        {
            "id": r.id,
            "crop_name": r.crop_name,
            "status": r.status,
            "notes": r.notes,
            "started_at": r.started_at.isoformat(),
        }
        for r in rows
    ]


@router.post("/crop-plans", status_code=status.HTTP_201_CREATED)
def create_crop_plan(
    payload: CropPlanCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = CropPlan(
        user_id=current_user.id,
        crop_name=payload.crop_name,
        status=payload.status,
        notes=payload.notes,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return {
        "id": row.id,
        "crop_name": row.crop_name,
        "status": row.status,
        "notes": row.notes,
        "started_at": row.started_at.isoformat(),
    }


# ── Disease Scans (Protected) ────────────────────────────────────────────────

@router.get("/disease-scans")
def list_disease_scans(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(DiseaseScan)
        .filter(DiseaseScan.user_id == current_user.id)
        .order_by(DiseaseScan.created_at.desc())
        .all()
    )
    return [
        {
            "id": r.id,
            "filename": r.filename,
            "crop_name": r.crop_name,
            "disease": r.disease_name,
            "confidence": r.confidence,
            "severity": r.severity,
            "treatment": r.treatment,
            "notes": r.notes,
            "created_at": r.created_at.isoformat(),
        }
        for r in rows
    ]


@router.post("/disease-scans", status_code=status.HTTP_201_CREATED)
def record_disease_scan(
    payload: DiseaseScanCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Note: No vision ML model is deployed yet; log scan metadata transparently.
    row = DiseaseScan(
        user_id=current_user.id,
        filename=payload.filename,
        crop_name=payload.crop_name or "Crop Leaf",
        disease_name="Pending Agronomist / Vision Model Verification",
        confidence="N/A",
        severity="Review Required",
        treatment=(
            "Automated leaf-image classification requires a trained vision model. "
            "Inspect for spots/lesions, isolate affected foliage, and consult local extension support."
        ),
        notes=payload.notes,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return {
        "id": row.id,
        "filename": row.filename,
        "crop_name": row.crop_name,
        "disease": row.disease_name,
        "confidence": row.confidence,
        "severity": row.severity,
        "treatment": row.treatment,
        "is_vision_model_active": False,
        "created_at": row.created_at.isoformat(),
    }
