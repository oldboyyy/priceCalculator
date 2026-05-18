import React, { useEffect, useState } from "react";

export function MarketAnalysis() {
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAnalysis() {
      try {
        const response = await fetch("/api/market-analysis");

        if (!response.ok) {
          throw new Error("Не удалось загрузить анализ");
        }

        const html = await response.text();
        setHtmlContent(html);
      } catch (err) {
        console.error("Ошибка загрузки анализа:", err);
        setError(
          err instanceof Error ? err.message : "Ошибка загрузки анализа"
        );
      } finally {
        setLoading(false);
      }
    }

    loadAnalysis();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Загрузка анализа рынка...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          ⚠️ Ошибка загрузки
        </h3>
        <p className="text-red-600 mb-4">{error}</p>
        <p className="text-sm text-gray-600">
          Возможные причины:
          <ul className="list-disc ml-6 mt-2">
            <li>Отчет еще не сгенерирован</li>
            <li>Backend не запущен</li>
            <li>Файл market_analysis.html отсутствует</li>
          </ul>
        </p>
        <div className="mt-4 p-4 bg-blue-50 rounded border border-blue-200">
          <p className="text-sm font-medium text-blue-800 mb-2">
            💡 Как сгенерировать отчет:
          </p>
          <code className="block bg-white p-2 rounded text-sm">
            cd backend
            <br />
            python generate_report.py
          </code>
        </div>
      </div>
    );
  }

  return (
    <div className="market-analysis-container">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          📊 Анализ рынка недвижимости
        </h2>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          🔄 Обновить
        </button>
      </div>

      {/* Встроенный HTML отчет */}
      <div
        className="analysis-content"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
        style={{
          maxWidth: "100%",
          overflow: "auto",
        }}
      />

      <style>{`
        .market-analysis-container {
          font-family: sans-serif;
        }

        .analysis-content img {
          max-width: 100%;
          height: auto;
          margin: 20px 0;
        }

        .analysis-content table {
          border-collapse: collapse;
          width: 100%;
          margin: 20px 0;
        }

        .analysis-content th,
        .analysis-content td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }

        .analysis-content th {
          background-color: #f3f4f6;
          font-weight: 600;
        }

        .analysis-content pre {
          background-color: #f9fafb;
          padding: 12px;
          border-radius: 4px;
          overflow-x: auto;
        }

        .analysis-content code {
          background-color: #f3f4f6;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 0.9em;
        }
      `}</style>
    </div>
  );
}