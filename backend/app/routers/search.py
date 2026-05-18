from fastapi import APIRouter
import pandas as pd

router = APIRouter()

df = pd.read_csv("data/krisha_clean.csv")

@router.post("/search_listings")
def search_listings(payload: dict):
    rooms = payload.get("rooms")
    area = payload.get("area")
    floor = payload.get("floor")
    total_floors = payload.get("total_floors")
    district = payload.get("district")
    year_built = payload.get("year_built")
    extras = payload.get("extras", [])
    price_min = payload.get("price_min")
    price_max = payload.get("price_max")

    result = df.copy()

    if rooms:
        result = result[result["room_count"] == rooms]

    if district:
        result = result[result["region_text"] == district]

    if price_min is not None and price_max is not None:
        result = result[(result["price"] >= price_min) & (result["price"] <= price_max)]

    if "Балкон" in extras:
        result = result[result["flat_balcony"].isin(["балкон", "лоджия", "балкон и лоджия"])]

    if "Застекленный балкон" in extras:
        result = result[result["flat_balcony_g"] == "да"]

    if "Парковка" in extras:
        result = result[result["flat_parking"].notna()]

    if "С мебелью" in extras:
        result = result[result["live_furniture"].isin(["полностью", "частично"])]

    result = result[["price", "quadrature", "region_text", "url"]].head(10)

    return result.to_dict(orient="records")
