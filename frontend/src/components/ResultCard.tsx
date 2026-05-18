import React from "react";
import { Card } from "../components/ui/card";
import { CalcResult } from "../App";

interface Props {
  result: CalcResult;
}

export function ResultCard({ result }: Props) {
  return (
    <Card className="space-y-4 border-2 border-blue-100">
      {/* ML Badge */}
      {result.using_ml && (
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full text-sm">
          <span className="text-purple-600 font-medium">🤖 ML Предсказание</span>
          {result.ml_confidence && (
            <span className="text-blue-600 font-semibold">
              R² = {(result.ml_confidence * 100).toFixed(1)}%
            </span>
          )}
        </div>
      )}

      {/* Основная цена */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
        <div className="text-sm text-gray-600 mb-1">Оценочная стоимость</div>
        <div className="text-4xl font-bold text-gray-900">
          {new Intl.NumberFormat("ru-RU").format(result.estimate)} ₸
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {result.using_ml ? "На основе машинного обучения" : "Базовый расчет"}
        </div>
      </div>

      {/* Диапазон цен */}
      {result.price_range && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-2">📊 Диапазон цен:</div>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-xs text-gray-500">Минимум</div>
              <div className="text-lg font-semibold text-gray-800">
                {new Intl.NumberFormat("ru-RU").format(result.price_range[0])} ₸
              </div>
            </div>
            <div className="text-gray-400">━━━</div>
            <div className="text-center">
              <div className="text-xs text-gray-500">Максимум</div>
              <div className="text-lg font-semibold text-gray-800">
                {new Intl.NumberFormat("ru-RU").format(result.price_range[1])} ₸
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ссылки на похожие объявления - ОСНОВНОЙ БЛОК */}
      {result.krisha_links && result.krisha_links.length > 0 && (
        <div className="border-t-2 border-green-100 pt-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🏠</span>
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                Похожие объявления на krisha.kz
              </h3>
              <p className="text-sm text-gray-600">
                Найдено {result.krisha_links.length} подходящих вариантов в выбранном ценовом диапазоне
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {result.krisha_links.map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 bg-gradient-to-r from-green-50 to-blue-50 hover:from-green-100 hover:to-blue-100 rounded-lg border border-green-200 hover:border-green-300 transition-all shadow-sm hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-full">
                      <span className="text-xl">🔍</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">
                        Поиск объявлений #{i + 1}
                      </div>
                      <div className="text-sm text-gray-600">
                        Квартиры в диапазоне {new Intl.NumberFormat("ru-RU").format(result.price_range[0])} - {new Intl.NumberFormat("ru-RU").format(result.price_range[1])} ₸
                      </div>
                    </div>
                  </div>
                  <div className="text-blue-600 font-bold text-lg">→</div>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              💡 <strong>Совет:</strong> Эти ссылки откроют поиск на krisha.kz с параметрами, соответствующими вашей квартире.
              Вы сможете увидеть реальные объявления и сравнить цены.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
