"""
Скрипт для обучения ML модели предсказания цен на квартиры
"""
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import joblib
import warnings
warnings.filterwarnings('ignore')

print("=" * 60)
print("ОБУЧЕНИЕ ML МОДЕЛИ ДЛЯ ПРЕДСКАЗАНИЯ ЦЕН НА КВАРТИРЫ")
print("=" * 60)

# 1. Загрузка данных
print("\n[1/6] Загрузка данных...")
df = pd.read_csv('data/krisha_clean.csv')
print(f"Загружено записей: {len(df)}")

# 2. Очистка данных
print("\n[2/6] Очистка данных...")
df = df[
    (df['price'] > 0) &
    (df['price'] < 1_000_000_000) &
    (df['quadrature'] > 0) &
    (df['quadrature'] < 1000) &
    (df['room_count'] > 0) &
    (df['room_count'] <= 10)
].copy()

# Преобразование типов
df['price'] = pd.to_numeric(df['price'], errors='coerce')
df['quadrature'] = pd.to_numeric(df['quadrature'], errors='coerce')
df['room_count'] = pd.to_numeric(df['room_count'], errors='coerce').astype(int)
df['floor'] = pd.to_numeric(df['floor'], errors='coerce').fillna(0).astype(int)
df['year'] = pd.to_numeric(df['year'], errors='coerce').fillna(1990).astype(int)
df['ceiling'] = pd.to_numeric(df['ceiling'], errors='coerce').fillna(2.7)

print(f"После очистки: {len(df)} записей")

# 3. Feature Engineering
print("\n[3/6] Feature Engineering...")

# Базовые признаки
df['price_per_m2'] = df['price'] / df['quadrature']
df['age'] = 2024 - df['year']
df['rooms_per_m2'] = df['room_count'] / df['quadrature']

# Бинарные признаки
df['has_parking'] = (df['flat_parking'].notna() & (df['flat_parking'] != 'NULL')).astype(int)
df['has_furniture'] = (df['live_furniture'].notna() & (df['live_furniture'] != 'NULL')).astype(int)
df['has_balcony'] = (df['flat_balcony'].notna() & (df['flat_balcony'] != 'NULL')).astype(int)
df['has_glazed_balcony'] = (df['flat_balcony_g'].notna() & (df['flat_balcony_g'] == 'да')).astype(int)
df['has_internet'] = (df['inet_type'].notna() & (df['inet_type'] != 'NULL')).astype(int)

# Этажность
df['is_first_floor'] = (df['floor'] == 1).astype(int)
df['is_last_floor'] = 0  # Не можем определить без данных о max этаже

# Средняя цена по району
region_avg = df.groupby('region_text')['price_per_m2'].mean().to_dict()
df['region_avg_price_m2'] = df['region_text'].map(region_avg)

# Кодирование района
le_region = LabelEncoder()
df['region_encoded'] = le_region.fit_transform(df['region_text'])

print(f"Создано признаков: {df.shape[1]}")

# 4. Подготовка данных для обучения
print("\n[4/6] Подготовка данных для обучения...")

features = [
    'room_count', 'quadrature', 'floor', 'year', 'ceiling', 'age',
    'has_parking', 'has_furniture', 'has_balcony', 'has_glazed_balcony',
    'has_internet', 'is_first_floor', 'region_avg_price_m2', 'region_encoded',
    'rooms_per_m2'
]

X = df[features].fillna(0)
y = df['price']

# Разделение на train/test
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Нормализация
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

print(f"Train size: {len(X_train)}, Test size: {len(X_test)}")

# 5. Обучение моделей
print("\n[5/6] Обучение моделей...")

models = {
    'Ridge Regression': Ridge(alpha=100),
    'Random Forest': RandomForestRegressor(
        n_estimators=100,
        max_depth=20,
        min_samples_split=10,
        random_state=42,
        n_jobs=-1
    ),
    'Gradient Boosting': GradientBoostingRegressor(
        n_estimators=100,
        max_depth=10,
        learning_rate=0.1,
        random_state=42
    )
}

results = {}
best_model = None
best_score = float('inf')

for name, model in models.items():
    print(f"\n  Обучение {name}...")

    if name == 'Ridge Regression':
        model.fit(X_train_scaled, y_train)
        y_pred = model.predict(X_test_scaled)
    else:
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)

    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    results[name] = {'RMSE': rmse, 'MAE': mae, 'R2': r2}

    print(f"    RMSE: {rmse:,.0f} тенге")
    print(f"    MAE:  {mae:,.0f} тенге")
    print(f"    R²:   {r2:.4f}")

    if rmse < best_score:
        best_score = rmse
        best_model = (name, model)

# 6. Сохранение лучшей модели
print(f"\n[6/6] Сохранение модели...")
print(f"Лучшая модель: {best_model[0]} (RMSE: {best_score:,.0f})")

model_data = {
    'model': best_model[1],
    'scaler': scaler if best_model[0] == 'Ridge Regression' else None,
    'features': features,
    'label_encoder_region': le_region,
    'region_avg_prices': region_avg,
    'model_type': best_model[0],
    'metrics': results[best_model[0]]
}

joblib.dump(model_data, 'model.pkl')
print("✅ Модель сохранена в 'model.pkl'")

# Сохранение метаданных
print("\n" + "=" * 60)
print("РЕЗУЛЬТАТЫ ОБУЧЕНИЯ")
print("=" * 60)
for name, metrics in results.items():
    print(f"\n{name}:")
    print(f"  RMSE: {metrics['RMSE']:,.0f} тенге")
    print(f"  MAE:  {metrics['MAE']:,.0f} тенге")
    print(f"  R²:   {metrics['R2']:.4f}")

print("\n✅ Обучение завершено!")
