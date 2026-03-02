from typing import Annotated
from fastapi import Query, APIRouter
from app.models.coordinate_params import CoordinateParams
from app.services.weather_service import get_weather_data

router = APIRouter()


@router.get("/weather")
async def get_weather(coordinates: Annotated[CoordinateParams, Query()]):
    return await get_weather_data(coordinates)
