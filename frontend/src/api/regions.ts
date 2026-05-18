export async function getRegions() {
  const res = await fetch("/api/stats/regions");
  if (!res.ok) {
    throw new Error("Ошибка загрузки /api/stats/regions");
  }
  return await res.json();
}
