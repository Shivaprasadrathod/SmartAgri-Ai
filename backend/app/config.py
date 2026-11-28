import os
import secrets
from functools import lru_cache
from dotenv import load_dotenv

load_dotenv()


def _parse_cors_origins(raw: str | None) -> list[str]:
    if not raw:
        
        return [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ]
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


class Settings:
    """Application configuration loaded from environment variables."""

    def __init__(self) -> None:
        self.APP_NAME: str = os.getenv("APP_NAME", "SmartAgri-Ai API")
        self.ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
        self.DATABASE_URL: str | None = os.getenv("DATABASE_URL")

        # JWT Authentication
        env_secret = os.getenv("JWT_SECRET_KEY")
        if not env_secret:
            # Ephemeral fallback for local development only; set JWT_SECRET_KEY in production.
            env_secret = os.getenv("DEV_JWT_FALLBACK") or secrets.token_urlsafe(32)
        self.JWT_SECRET_KEY: str = env_secret
        self.JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
        self.ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
            os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")
        )

        # CORS
        self.CORS_ORIGINS: list[str] = _parse_cors_origins(os.getenv("CORS_ORIGINS"))

        # Optional external API keys (never fabricated)
        self.DATA_GOV_IN_API_KEY: str | None = os.getenv("DATA_GOV_IN_API_KEY")
        self.OPENAI_API_KEY: str | None = os.getenv("OPENAI_API_KEY")
        self.GROQ_API_KEY: str | None = os.getenv("GROQ_API_KEY")


@lru_cache
def get_settings() -> Settings:
    return Settings()
