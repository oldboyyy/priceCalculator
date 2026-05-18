"""
ML Predictor - класс для предсказания цен на квартиры
"""
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any


class ApartmentPricePredictor:
    """Класс для предсказания цен на квартиры с использованием ML"""

    def __init__(self, model_path: str = "model.pkl"):
        """Загрузка обученной модели"""
        try:
            model_data = joblib.load(model_path)
            self.model = model_data['model']
            self.scaler = model_data.get('scaler')
            self.features = model_data['features']
            self.label_encoder_region = model_data['label_encoder_region']
            self.region_avg_prices = model_data['region_avg_prices']
            self.model_type = model_data['model_type']
            self.metrics = model_data['metrics']
            print(f"✅ Модель загружена: {self.model_type}")
            print(f"   R²: {self.metrics['R2']:.4f}")
            print(f"   RMSE: {self.metrics['RMSE']:,.0f} тенге")
        except FileNotFoundError:
            raise Exception(
                "Модель не найдена. Запустите 'python train_model.py' для обучения модели."
            )

    def preprocess_input(self, data: Dict[str, Any]) -> pd.DataFrame:
        """
        Преобразование входных данных в формат для модели

        Args:
            data: Словарь с параметрами квартиры
                {
                    "rooms": int,
                    "area": float,
                    "floor": int | None,
                    "floorsTotal": int | None,
                    "region": str,
                    "year": int | None,
                    "balcony": bool,
                    "glazedBalcony": bool,
                    "parking": bool,
                    "furnished": bool
                }

        Returns:
            DataFrame с признаками для модели
        """
        # Базовые значения
        room_count = data['rooms']
        quadrature = data['area']
        floor = data.get('floor', 0) or 0
        year = data.get('year', 1990) or 1990
        ceiling = 2.7  # Средняя высота потолков
        region = data['region']

        # Feature engineering
        age = 2024 - year
        rooms_per_m2 = room_count / quadrature

        # Бинарные признаки
        has_parking = 1 if data.get('parking', False) else 0
        has_furniture = 1 if data.get('furnished', False) else 0
        has_balcony = 1 if data.get('balcony', False) else 0
        has_glazed_balcony = 1 if data.get('glazedBalcony', False) else 0
        has_internet = 1  # Предполагаем, что интернет есть по умолчанию

        # Этажность
        is_first_floor = 1 if floor == 1 else 0

        # Средняя цена по району
        region_avg_price_m2 = self.region_avg_prices.get(region, 700000)

        # Кодирование района
        try:
            region_encoded = self.label_encoder_region.transform([region])[0]
        except ValueError:
            # Если район не известен, используем средний
            region_encoded = 0

        # Создание DataFrame с признаками
        features_dict = {
            'room_count': room_count,
            'quadrature': quadrature,
            'floor': floor,
            'year': year,
            'ceiling': ceiling,
            'age': age,
            'has_parking': has_parking,
            'has_furniture': has_furniture,
            'has_balcony': has_balcony,
            'has_glazed_balcony': has_glazed_balcony,
            'has_internet': has_internet,
            'is_first_floor': is_first_floor,
            'region_avg_price_m2': region_avg_price_m2,
            'region_encoded': region_encoded,
            'rooms_per_m2': rooms_per_m2
        }

        # Возвращаем только нужные признаки в правильном порядке
        return pd.DataFrame([{feat: features_dict[feat] for feat in self.features}])

    def predict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Предсказание цены квартиры

        Args:
            data: Параметры квартиры

        Returns:
            {
                "estimate": int,  # Предсказанная цена
                "price_range": [int, int],  # Диапазон цен
                "confidence": float,  # Уверенность модели (R²)
                "price_per_m2": float  # Цена за м²
            }
        """
        # Подготовка данных
        X = self.preprocess_input(data)

        # Предсказание
        if self.scaler is not None:
            X_scaled = self.scaler.transform(X)
            price = self.model.predict(X_scaled)[0]
        else:
            price = self.model.predict(X)[0]

        # Обеспечиваем положительное значение
        price = max(price, 1_000_000)

        # Диапазон цен (± RMSE)
        rmse = self.metrics['RMSE']
        low = max(price - rmse, price * 0.8)
        high = price + rmse

        # Цена за м²
        price_per_m2 = price / data['area']

        return {
            "estimate": int(price),
            "price_range": [int(low), int(high)],
            "confidence": round(self.metrics['R2'], 3),
            "price_per_m2": int(price_per_m2)
        }


# Пример использования
if __name__ == "__main__":
    predictor = ApartmentPricePredictor()

    # Тестовый пример
    test_data = {
        "rooms": 2,
        "area": 60.0,
        "floor": 5,
        "floorsTotal": 12,
        "region": "Бостандыкский р-н",
        "year": 2015,
        "balcony": True,
        "glazedBalcony": True,
        "parking": True,
        "furnished": False
    }

    result = predictor.predict(test_data)
    print(f"\n🏠 Предсказание цены:")
    print(f"   Оценка: {result['estimate']:,} тенге")
    print(f"   Диапазон: {result['price_range'][0]:,} - {result['price_range'][1]:,} тенге")
    print(f"   Цена за м²: {result['price_per_m2']:,} тенге")
    print(f"   Уверенность: {result['confidence']}")
