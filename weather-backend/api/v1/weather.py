import asyncio
from typing import Annotated
from fastapi import Query, APIRouter
from models.coordinate_params import CoordinateParams
from services.weather_service import get_weather_data
import httpx

router = APIRouter()


@router.get("/weather")
async def get_weather(coordinates: Annotated[CoordinateParams, Query()]):
    return await get_weather_data(coordinates)
