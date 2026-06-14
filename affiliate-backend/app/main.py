from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api import auth, ambassador, admin

import os

# Auto-create tables on startup (skip during testing or if DB connection fails)
if "pytest" not in os.environ.get("PYTEST_CURRENT_TEST", ""):
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"Database connection not available at startup, skipping table auto-creation: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url="/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Policy configuration
# Allows access from local development frontend servers and standard ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production to specific frontend domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(ambassador.router)
app.include_router(admin.router)

from fastapi.staticfiles import StaticFiles
import os

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "BHE Uni Ambassador & Rewards Programme API is running.",
        "documentation": "/docs"
    }
