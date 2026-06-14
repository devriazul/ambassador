import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "BHE Uni Ambassador Portal Backend"
    
    # Database configuration
    # Defaulting to an SQLite database for ease of local development if PostgreSQL URL is not set
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:postgres@localhost:5432/affiliate"
    )
    
    # Security configuration
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY", 
        "super_secret_cryptographic_key_for_bhe_uni_ambassador_programme_2026"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    # Google OAuth Configuration
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    
    # SMTP Configuration
    MAIL_MAILER: str = os.getenv("MAIL_MAILER", "smtp")
    MAIL_HOST: str = os.getenv("MAIL_HOST", "smtp.office365.com")
    MAIL_PORT: int = int(os.getenv("MAIL_PORT", "587"))
    MAIL_USERNAME: str = os.getenv("MAIL_USERNAME", "no-reply@bheuni.io")
    MAIL_PASSWORD: str = os.getenv("MAIL_PASSWORD", "noreply12!@.")
    MAIL_ENCRYPTION: str = os.getenv("MAIL_ENCRYPTION", "tls")
    MAIL_FROM_ADDRESS: str = os.getenv("MAIL_FROM_ADDRESS", "no-reply@bheuni.io")
    MAIL_FROM_NAME: str = os.getenv("MAIL_FROM_NAME", "BHE Uni Ambassador Portal")

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

settings = Settings()
