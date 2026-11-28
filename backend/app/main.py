from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.database import Base, SessionLocal, check_database_health, engine
import app.models  # noqa: F401 - ensure all models are registered
from app.routes.auth import router as auth_router
from app.routes.farm import router as farm_router
from app.routes.market import router as market_router
from app.routes.prediction import router as prediction_router
from app.services.seed_data import seed_reference_data

logger = logging.getLogger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Ensure tables exist if migrations weren't run separately, and seed reference data idempotently.
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_reference_data(db)
    except Exception as exc:
        logger.warning("Reference data seeding skipped/failed: %s", exc.__class__.__name__)
    finally:
        db.close()
    yield


app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(_request: Request, exc: Exception):
    logger.error("Unhandled server error: %s", exc.__class__.__name__)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred."},
    )


app.include_router(auth_router)
app.include_router(market_router)
app.include_router(prediction_router)
app.include_router(farm_router)


@app.get("/")
def root():
    return {"message": "SmartAgri-Ai Backend is running!"}


@app.get("/health")
def health_check():
    db_ok, db_status = check_database_health()
    if not db_ok:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "degraded", "database": db_status},
        )
    return {"status": "ok", "database": db_status}
