import logging
import ssl
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config import get_settings

logger = logging.getLogger(__name__)


def _can_use_psycopg() -> bool:
    """Return True if psycopg3 and its libpq wrapper can be loaded."""
    try:
        import psycopg  # noqa: F401
        return True
    except Exception:
        return False


def _normalize_postgres_url(raw_url: str | None) -> tuple[str, dict]:
    """
    Normalize PostgreSQL URLs for SQLAlchemy.
    Uses psycopg3 when available, falling back to pure-Python pg8000
    (for environments where libpq DLLs are blocked by OS policy).
    """
    if not raw_url:
        raise RuntimeError(
            "DATABASE_URL environment variable is not set. "
            "Configure your Neon PostgreSQL connection string in backend/.env."
        )

    url = raw_url.strip()
    use_psycopg = _can_use_psycopg()
    driver = "postgresql+psycopg://" if use_psycopg else "postgresql+pg8000://"

    for prefix in (
        "postgres://",
        "postgresql://",
        "postgresql+psycopg://",
        "postgresql+psycopg2://",
        "postgresql+pg8000://",
    ):
        if url.startswith(prefix):
            url = url.replace(prefix, driver, 1)
            break

    parsed = urlparse(url)
    host = parsed.hostname or ""
    query_params = dict(parse_qsl(parsed.query, keep_blank_values=True))
    is_remote = host not in ("localhost", "127.0.0.1", "::1")

    connect_args: dict = {}
    if use_psycopg:
        if is_remote and "sslmode" not in query_params:
            query_params["sslmode"] = "require"
    else:
        # pg8000 does not accept libpq query params like sslmode or channel_binding
        ssl_requested = query_params.pop("sslmode", None)
        query_params.pop("channel_binding", None)
        if is_remote or (ssl_requested and ssl_requested != "disable"):
            connect_args["ssl_context"] = ssl.create_default_context()

    new_query = urlencode(query_params)
    return urlunparse(parsed._replace(query=new_query)), connect_args


settings = get_settings()
DATABASE_URL, ENGINE_CONNECT_ARGS = _normalize_postgres_url(settings.DATABASE_URL)

engine = create_engine(
    DATABASE_URL,
    connect_args=ENGINE_CONNECT_ARGS,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    pool_recycle=300,
    pool_timeout=30,
    echo=False,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def get_db():
    """FastAPI dependency providing a scoped SQLAlchemy session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_database_health() -> tuple[bool, str]:
    """Verify PostgreSQL connectivity without exposing credentials."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True, "connected"
    except SQLAlchemyError as exc:
        logger.error("Database health check failed: %s", exc.__class__.__name__)
        return False, "unavailable"
