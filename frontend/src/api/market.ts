export async function getMarketReport(region: string) {
  const res = await fetch(\`/api/market-analysis?region=\${region}\`);
  if (!res.ok) {
    throw new Error("Ошибка загрузки анализа рынка");
  }
  return await res.json();
}
