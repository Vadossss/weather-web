from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import router

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://localhost:8000",
    "http://localhost:8080",
    "http://localhost:4173",
    "http://client:80",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

