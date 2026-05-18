import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.responses import HTMLResponse
import numpy as np
import os
from ml_predictor import ApartmentPricePredictor

app = FastAPI()

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене указать конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------
# Загрузка данных проекта
# ------------------------------
REGION_STATS = pd.read_csv("data/region_stats.csv")
ROOM_STATS = pd.read_csv("data/room_stats.csv")
LISTINGS = pd.read_csv("data/krisha_clean.csv")

# ------------------------------
# Загрузка ML модели
# ------------------------------
ML_PREDICTOR = None
USE_ML = os.path.exists("model.pkl")

if USE_ML:
    try:
        ML_PREDICTOR = ApartmentPricePredictor("model.pkl")
        print("✅ ML модель загружена и готова к работе")
    except Exception as e:
        print(f"⚠️  Ошибка загрузки ML модели: {e}")
        print("   Используется простой расчет")
        USE_ML = False
else:
    print("⚠️  ML модель не найдена (model.pkl)")
    print("   Запустите: python train_model.py")
    print("   Используется простой расчет")

# ------------------------------
# Модель запроса
# ------------------------------
class CalcRequest(BaseModel):
    rooms: int
    area: float
    floor: int | None = None
    floorsTotal: int | None = None
    region: str
    year: int | None = None
    balcony: bool = False
    glazedBalcony: bool = False
    parking: bool = False
    furnished: bool = False

# ------------------------------
# 1. API — список регионов
# ------------------------------
@app.get("/api/stats/regions")
def get_regions():
    return REGION_STATS.to_dict(orient="records")

# ------------------------------
# 2. API — калькулятор цены
# ------------------------------
@app.post("/api/calc")
def calc_price(req: CalcRequest):

    region_row = REGION_STATS[REGION_STATS["region_text"] == req.region]

    if region_row.empty:
        raise HTTPException(status_code=400, detail="Region not found")

    # Используем ML модель, если она доступна
    if USE_ML and ML_PREDICTOR:
        data = {
            "rooms": req.rooms,
            "area": req.area,
            "floor": req.floor,
            "floorsTotal": req.floorsTotal,
            "region": req.region,
            "year": req.year,
            "balcony": req.balcony,
            "glazedBalcony": req.glazedBalcony,
            "parking": req.parking,
            "furnished": req.furnished
        }

        prediction = ML_PREDICTOR.predict(data)
        estimate = prediction["estimate"]
        low, high = prediction["price_range"]
        confidence = prediction["confidence"]

    else:
        # Простой расчет (fallback)
        base_ppm = float(region_row.iloc[0]["avg_price_per_m2"])
        estimate = base_ppm * req.area

        if req.balcony:
            estimate *= 1.02
        if req.glazedBalcony:
            estimate *= 1.03
        if req.parking:
            estimate *= 1.05
        if req.furnished:
            estimate *= 1.06

        if req.floor and req.floorsTotal:
            if req.floor == 1:
                estimate *= 0.97
            if req.floor == req.floorsTotal:
                estimate *= 0.98

        low = estimate * 0.9
        high = estimate * 1.1
        confidence = None

    # Попытка подобрать реальные ссылки из готового датасета krisha_clean.csv
    try:
        df = LISTINGS
        # Базовые фильтры по региону, числу комнат и диапазону цен
        filt = (
            (df["region_text"] == req.region)
            & (df["room_count"] == req.rooms)
            & (df["price"].between(int(low), int(high)))
        )

        # Дополнительный мягкий фильтр по площади (если указана)
        # допускаем отклонение +/- 20%
        if req.area is not None:
            area_low = req.area * 0.8
            area_high = req.area * 1.2
            if "quadrature" in df.columns:
                filt = filt & df["quadrature"].between(area_low, area_high)

        matches = df.loc[filt].copy()

        # Сортируем по близости цены к оценке
        if not matches.empty:
            matches["price_delta"] = (matches["price"] - estimate).abs()
            matches = matches.sort_values("price_delta")

        # Берем до 10 ссылок
        krisha_links = []
        if "url" in matches.columns:
            krisha_links = (
                matches["url"].dropna().astype(str).head(10).tolist()
            )
    except Exception:
        # В случае любых ошибок подбора — вернемся к генерации поисковой ссылки
        krisha_links = []

    # Фоллбэк: если не нашли подходящих ссылок — отдаем поисковую ссылку krisha.kz
    if not krisha_links:
        krisha_url = (
            f"https://krisha.kz/prodazha/kvartiry/?region={req.region}"
            f"&rooms={req.rooms}&price[from]={int(low)}&price[to]={int(high)}"
        )
        krisha_links = [krisha_url]

    response = {
        "estimate": int(estimate),
        "price_range": [int(low), int(high)],
        "krisha_links": krisha_links,
        "market_report_url": "/api/market-analysis",
    }

    if confidence is not None:
        response["ml_confidence"] = confidence
        response["using_ml"] = True

    return response

# ------------------------------
# 3. API — Анализ рынка (HTML)
# ------------------------------
@app.get("/api/market-analysis", response_class=HTMLResponse)
def market_analysis():
    try:
        with open("reports/market_analysis.html", "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        return f"<h2>Ошибка открытия отчёта: {e}</h2>"
