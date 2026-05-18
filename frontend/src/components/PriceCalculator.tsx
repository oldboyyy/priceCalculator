import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Home, DollarSign, ExternalLink } from 'lucide-react';

interface FormData {
  roomCount: string;
  area: string;
  floor: string;
  totalFloors: string;
  region: string;
  year: string;
  hasBalcony: boolean;
  hasGlazedBalcony: boolean;
  hasParking: boolean;
  hasFurniture: boolean;
}

interface PredictionResult {
  predictedPrice: number;
  pricePerSqm: number;
  districtAverage: number;
  confidenceInterval: { min: number; max: number };
  comparison: number;
}

export function PriceCalculator() {
  const [formData, setFormData] = useState<FormData>({
    roomCount: '2',
    area: '65',
    floor: '5',
    totalFloors: '12',
    region: 'center',
    year: '2015',
    hasBalcony: true,
    hasGlazedBalcony: false,
    hasParking: false,
    hasFurniture: false,
  });

  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const regions = [
    { value: 'center', label: 'Центральный район' },
    { value: 'north', label: 'Северный район' },
    { value: 'south', label: 'Южный район' },
    { value: 'east', label: 'Восточный район' },
    { value: 'west', label: 'Западный район' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);

    // Имитация ML-модели с задержкой
    setTimeout(() => {
      // Простая формула для оценки (имитация ML модели)
      const basePrice = 80000; // базовая цена за кв.м
      const areaNum = parseFloat(formData.area);
      const roomNum = parseInt(formData.roomCount);
      const yearNum = parseInt(formData.year);

      // Коэффициенты
      let pricePerSqm = basePrice;
      
      // Район
      const regionCoef: Record<string, number> = {
        center: 1.5,
        north: 1.1,
        south: 0.9,
        east: 1.0,
        west: 1.2,
      };
      pricePerSqm *= regionCoef[formData.region] || 1;

      // Год постройки
      if (yearNum >= 2020) pricePerSqm *= 1.2;
      else if (yearNum >= 2010) pricePerSqm *= 1.1;
      else if (yearNum >= 2000) pricePerSqm *= 1.0;
      else pricePerSqm *= 0.85;

      // Этаж
      const floorNum = parseInt(formData.floor);
      const totalFloorsNum = parseInt(formData.totalFloors);
      if (floorNum === 1 || floorNum === totalFloorsNum) {
        pricePerSqm *= 0.95;
      }

      // Дополнительные опции
      if (formData.hasBalcony) pricePerSqm *= 1.05;
      if (formData.hasGlazedBalcony) pricePerSqm *= 1.08;
      if (formData.hasParking) pricePerSqm *= 1.1;
      if (formData.hasFurniture) pricePerSqm *= 1.07;

      const predictedPrice = pricePerSqm * areaNum;
      const districtAverage = basePrice * regionCoef[formData.region] * areaNum;
      const comparison = ((predictedPrice - districtAverage) / districtAverage) * 100;

      setResult({
        predictedPrice: Math.round(predictedPrice),
        pricePerSqm: Math.round(pricePerSqm),
        districtAverage: Math.round(districtAverage),
        confidenceInterval: {
          min: Math.round(predictedPrice * 0.9),
          max: Math.round(predictedPrice * 1.1),
        },
        comparison,
      });

      setIsCalculating(false);
    }, 1500);
  };

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Form */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-indigo-600 mb-6">Параметры квартиры</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Основные параметры */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Количество комнат</label>
              <select
                value={formData.roomCount}
                onChange={(e) => handleChange('roomCount', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="1">1 комната</option>
                <option value="2">2 комнаты</option>
                <option value="3">3 комнаты</option>
                <option value="4">4 комнаты</option>
                <option value="5">5+ комнат</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Площадь (кв.м)</label>
              <input
                type="number"
                value={formData.area}
                onChange={(e) => handleChange('area', e.target.value)}
                min="10"
                max="500"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Этаж</label>
              <input
                type="number"
                value={formData.floor}
                onChange={(e) => handleChange('floor', e.target.value)}
                min="1"
                max="50"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Всего этажей</label>
              <input
                type="number"
                value={formData.totalFloors}
                onChange={(e) => handleChange('totalFloors', e.target.value)}
                min="1"
                max="50"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Район</label>
            <select
              value={formData.region}
              onChange={(e) => handleChange('region', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {regions.map((region) => (
                <option key={region.value} value={region.value}>
                  {region.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Год постройки</label>
            <input
              type="number"
              value={formData.year}
              onChange={(e) => handleChange('year', e.target.value)}
              min="1950"
              max="2025"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Дополнительные опции */}
          <div className="space-y-3">
            <label className="block text-gray-700 mb-2">Дополнительно</label>
            
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.hasBalcony}
                onChange={(e) => handleChange('hasBalcony', e.target.checked)}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-gray-700">Балкон</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.hasGlazedBalcony}
                onChange={(e) => handleChange('hasGlazedBalcony', e.target.checked)}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-gray-700">Застекленный балкон</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.hasParking}
                onChange={(e) => handleChange('hasParking', e.target.checked)}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-gray-700">Парковка</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.hasFurniture}
                onChange={(e) => handleChange('hasFurniture', e.target.checked)}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-gray-700">С мебелью</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isCalculating}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isCalculating ? 'Рассчитываем...' : 'Рассчитать стоимость'}
          </button>
        </form>
      </div>

      {/* Results */}
      <div className="space-y-6">
        {result ? (
          <>
            {/* Основной результат */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center space-x-3 mb-4">
                <DollarSign className="w-8 h-8" />
                <h2>Прогнозируемая стоимость</h2>
              </div>
              <p className="text-5xl mb-2">
                {result.predictedPrice.toLocaleString('ru-RU')} ₽
              </p>
              <p className="text-indigo-200">
                {result.pricePerSqm.toLocaleString('ru-RU')} ₽/кв.м
              </p>
            </div>

            {/* Доверительный интервал */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-gray-700 mb-4">Доверительный интервал</h3>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500">Минимум</p>
                  <p className="text-green-600">
                    {result.confidenceInterval.min.toLocaleString('ru-RU')} ₽
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-32 h-2 bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 rounded-full"></div>
                </div>
                <div className="text-right">
                  <p className="text-gray-500">Максимум</p>
                  <p className="text-red-600">
                    {result.confidenceInterval.max.toLocaleString('ru-RU')} ₽
                  </p>
                </div>
              </div>
            </div>

            {/* Сравнение с районом */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-gray-700 mb-4">Сравнение со средней ценой по району</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Средняя цена по району</p>
                  <p className="text-gray-900">
                    {result.districtAverage.toLocaleString('ru-RU')} ₽
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {result.comparison > 0 ? (
                    <>
                      <TrendingUp className="w-6 h-6 text-green-600" />
                      <span className="text-green-600">
                        +{result.comparison.toFixed(1)}%
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-6 h-6 text-red-600" />
                      <span className="text-red-600">
                        {result.comparison.toFixed(1)}%
                      </span>
                    </>
                  )}
                </div>
              </div>
              <p className="text-gray-600 mt-4">
                {result.comparison > 0
                  ? 'Квартира дороже средней цены по району'
                  : 'Квартира дешевле средней цены по району'}
              </p>
            </div>

            {/* Факторы влияния */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-gray-700 mb-4">Похожие объявления</h3>
              <div className="space-y-3">
                {[
                  {
                    id: 1,
                    title: `${formData.roomCount}-комнатная квартира, ${formData.area} м²`,
                    address: `${regions.find(r => r.value === formData.region)?.label}, ул. Примерная, 12`,
                    price: Math.round(result.predictedPrice * 0.95),
                    floor: formData.floor,
                    url: 'https://www.cian.ru/',
                  },
                  {
                    id: 2,
                    title: `${formData.roomCount}-комнатная квартира, ${parseInt(formData.area) + 5} м²`,
                    address: `${regions.find(r => r.value === formData.region)?.label}, ул. Центральная, 45`,
                    price: Math.round(result.predictedPrice * 1.05),
                    floor: parseInt(formData.floor) + 1,
                    url: 'https://www.avito.ru/nedvizhimost',
                  },
                  {
                    id: 3,
                    title: `${formData.roomCount}-комнатная квартира, ${parseInt(formData.area) - 3} м²`,
                    address: `${regions.find(r => r.value === formData.region)?.label}, пр-т Ленина, 78`,
                    price: Math.round(result.predictedPrice * 0.92),
                    floor: parseInt(formData.floor) - 1,
                    url: 'https://www.domclick.ru/',
                  },
                  {
                    id: 4,
                    title: `${formData.roomCount}-комнатная квартира, ${formData.area} м²`,
                    address: `${regions.find(r => r.value === formData.region)?.label}, ул. Советская, 23`,
                    price: Math.round(result.predictedPrice * 1.02),
                    floor: formData.floor,
                    url: 'https://www.yandex.ru/realty',
                  },
                ].map((listing) => (
                  <a
                    key={listing.id}
                    href={listing.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-gray-50 rounded-lg hover:bg-indigo-50 transition-colors border border-gray-200 hover:border-indigo-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Home className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                          <p className="text-gray-900">{listing.title}</p>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{listing.address}</p>
                        <p className="text-gray-500 text-sm">Этаж: {listing.floor}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-indigo-600 mb-1">
                          {listing.price.toLocaleString('ru-RU')} ₽
                        </p>
                        <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                      </div>
                    </div>
                  </a>
                ))}
              </div>
              <p className="text-gray-500 text-sm mt-4">
                * Ссылки ведут на популярные площадки для поиска недвижимости
              </p>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              Заполните форму и нажмите «Рассчитать стоимость» для получения оценки
            </p>
          </div>
        )}
      </div>
    </div>
  );
}