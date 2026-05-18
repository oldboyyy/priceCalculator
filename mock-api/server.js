import express from "express";
import cors from "cors";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());

// MOCK: загрузка регионов
app.get("/api/stats/regions", (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync("mock-api/regions.json", "utf8"));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Не удалось загрузить mock regions.json" });
  }
});

// MOCK калькулятор
app.post("/api/calc", (req, res) => {
  const body = req.body;

  const ppm = 500000; // MOCK цена за м2

  const base = ppm * body.area;
  let estimate = base;

  if (body.balcony) estimate *= 1.02;
  if (body.glazedBalcony) estimate *= 1.03;
  if (body.parking) estimate *= 1.05;
  if (body.furnished) estimate *= 1.06;

  const low = estimate * 0.9;
  const high = estimate * 1.1;

  const searchUrl = `https://krisha.kz/prodazha/kvartiry/?region=${encodeURIComponent(
    body.region
  )}&rooms=${body.rooms}&price[from]=${Math.round(
    low
  )}&price[to]=${Math.round(high)}`;

  res.json({
    estimate: Math.round(estimate),
    price_range: [Math.round(low), Math.round(high)],
    krisha_links: [searchUrl],
    market_report_url: "/api/market-analysis",
  });
});

// MOCK анализ рынка
app.get("/api/market-analysis", (req, res) => {
  res.json({
    message: "Это MOCK анализ рынка. Настоящий отчёт будет подгружаться из ноутбука.",
  });
});

const port = 7777;
app.listen(port, () => {
  console.log("MOCK API запущен на http://localhost:" + port);
});
