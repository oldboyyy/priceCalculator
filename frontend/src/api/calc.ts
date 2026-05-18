export async function calculatePrice(payload: any) {
  const res = await fetch("/api/calc", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error("Ошибка API /api/calc");
  }

  return await res.json();
}
