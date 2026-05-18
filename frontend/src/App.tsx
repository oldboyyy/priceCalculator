import React, { useEffect, useState } from "react";
import { CalculatorForm } from "./components/CalculatorForm";
import { ResultCard } from "./components/ResultCard";
import { MarketAnalysis } from "./components/MarketAnalysis";
import { getRegions } from "./api/regions";
import { calculatePrice } from "./api/calc";

export interface Region {
  region_text: string;
  avg_price: number;
  avg_price_per_m2: number;
  count: number;
}

export interface CalcResult {
  estimate: number;
  price_range: [number, number];
  krisha_links: string[];
  market_report_url: string;
  ml_confidence?: number;
  using_ml?: boolean;
}

type Tab = "calculator" | "analysis";

function App() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loadingRegions, setLoadingRegions] = useState(true);
  const [calcResult, setCalcResult] = useState<CalcResult | null>(null);
  const [loadingCalc, setLoadingCalc] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("calculator");

  useEffect(() => {
    async function load() {
      try {
        const data = await getRegions();
        setRegions(data);
      } catch (e) {
        console.error("Ошибка загрузки регионов", e);
      } finally {
        setLoadingRegions(false);
      }
    }
    load();
  }, []);

  async function handleCalculate(payload: any) {
    // Сброс предыдущего результата
    setCalcResult(null);
    setLoadingCalc(true);

    try {
      const result = await calculatePrice(payload);
      setCalcResult(result);
    } catch (err) {
      console.error("Ошибка запроса /api/calc", err);
      alert("Ошибка при расчете стоимости. Проверьте, что backend запущен.");
    } finally {
      setLoadingCalc(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
          Калькулятор стоимости квартиры
        </h1>

        {/* Вкладки */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("calculator")}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === "calculator"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            🧮 Калькулятор
          </button>
          <button
            onClick={() => setActiveTab("analysis")}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === "analysis"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            📊 Анализ рынка
          </button>
        </div>

        {/* Контент вкладок */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {activeTab === "calculator" ? (
            <>
              <CalculatorForm
                regions={regions}
                loadingRegions={loadingRegions}
                onSubmit={handleCalculate}
              />

              {/* Результаты показываются только после нажатия кнопки */}
              {(loadingCalc || calcResult) && (
                <div className="mt-6">
                  {loadingCalc && (
                    <div className="flex flex-col items-center justify-center p-8 border-2 border-blue-200 rounded-lg bg-blue-50">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                      <p className="text-blue-700 font-medium">
                        ⏳ Выполняется расчёт стоимости…
                      </p>
                    </div>
                  )}

                  {!loadingCalc && calcResult && <ResultCard result={calcResult} />}
                </div>
              )}
            </>
          ) : (
            <MarketAnalysis />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
