from fastapi import FastAPI

app = FastAPI()

# Подключаем наш новый роутер
from .routers import search
app.include_router(search.router)

# Подключение остальных эндпоинтов проекта
from .routers import calc, stats, market_analysis
app.include_router(calc.router)
app.include_router(stats.router)
app.include_router(market_analysis.router)
