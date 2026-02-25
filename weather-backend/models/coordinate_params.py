from pydantic import BaseModel


class CoordinateParams(BaseModel):
    latitude: float
    longitude: float