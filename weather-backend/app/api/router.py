from fastapi import APIRouter

from app.api.v1 import weather

router = APIRouter(prefix="/api/v1")

router.include_router(weather.router, tags=["Weather"])
    