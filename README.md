# Weather Web Application

[![Python](https://img.shields.io/badge/Python-3.11-blue)](https://www.python.org/)  
[![FastAPI](https://img.shields.io/badge/FastAPI-0.128-green)](https://fastapi.tiangolo.com/)  
[![React](https://img.shields.io/badge/React-18-green?logo=react)](https://react.dev/)  
[![Docker](https://img.shields.io/badge/Docker-24.0-blue?logo=docker)](https://www.docker.com/)  

Проект представляет собой веб-приложение для получения актуальной информации о погоде и краткосрочного прогноза на ближайшие дни. Поддерживается адаптивный интерфейс, асинхронное взаимодействие с внешними API и контейнеризация через Docker + Nginx.

---

## Функциональность

- Просмотр текущей погоды и прогноза на несколько дней  
- Почасовой прогноз температуры, влажности, ветра и осадков  
- Поиск города по названию и выбор вручную  
- Автоматическое определение местоположения (при разрешении браузера)  
- Сохранение последнего выбранного города и списка избранных  
- Адаптивный интерфейс

---

## Установка и запуск

1. Клонируем репозиторий:
```bash
git clone https://github.com/yourusername/weather-app.git
cd weather-app
```
2. Настройка переменных окружения:
  - Скопируйте .env.example в .env
```bash
cp .env.example .env
```
 - Отредактируйте .env и добавьте свои значения
```bash
VITE_YANDEX_API_KEY=ваш_api_ключ
```

3. Запуск через Docker Compose:
```bash
docker-compose up --build
```
