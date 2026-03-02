FROM python:3.12-slim

WORKDIR /weather-backend

COPY ./requirements.txt /weather-backend/requirements.txt

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["fastapi", "run", "app/main.py", "--port", "8000"]