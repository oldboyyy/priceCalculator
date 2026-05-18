import React, { useState } from "react";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";

interface Props {
  regions: any[];
  loadingRegions: boolean;
  onSubmit: (data: any) => void;
}

export function CalculatorForm({ regions, loadingRegions, onSubmit }: Props) {
  const [form, setForm] = useState({
    rooms: "",
    area: "",
    floor: "",
    floorsTotal: "",
    region: "",
    year: "",
    balcony: false,
    glazedBalcony: false,
    parking: false,
    furnished: false,
  });

  function updateField(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.area || !form.rooms || !form.region) {
      alert("Заполните обязательные поля: комнаты, площадь, район");
      return;
    }

    onSubmit({
      rooms: Number(form.rooms),
      area: Number(form.area),
      floor: form.floor ? Number(form.floor) : null,
      floorsTotal: form.floorsTotal ? Number(form.floorsTotal) : null,
      region: form.region,
      year: form.year ? Number(form.year) : null,
      balcony: form.balcony,
      glazedBalcony: form.glazedBalcony,
      parking: form.parking,
      furnished: form.furnished,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Количество комнат</Label>
          <Input
            type="number"
            min={1}
            value={form.rooms}
            onChange={(e) => updateField("rooms", e.target.value)}
          />
        </div>

        <div>
          <Label>Площадь (кв.м)</Label>
          <Input
            type="number"
            min={1}
            step="0.1"
            value={form.area}
            onChange={(e) => updateField("area", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Этаж</Label>
          <Input
            type="number"
            value={form.floor}
            onChange={(e) => updateField("floor", e.target.value)}
          />
        </div>

        <div>
          <Label>Всего этажей</Label>
          <Input
            type="number"
            value={form.floorsTotal}
            onChange={(e) => updateField("floorsTotal", e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label>Район</Label>
        {loadingRegions ? (
          <div className="p-2 border rounded bg-gray-100 text-gray-600">
            Загрузка регионов…
          </div>
        ) : (
          <select
            className="p-2 border rounded w-full"
            value={form.region}
            onChange={(e) => updateField("region", e.target.value)}
          >
            <option value="">Выберите район</option>
            {regions.map((r, i) => (
              <option key={i} value={r.region_text}>
                {r.region_text} — {r.count} объявл.
              </option>
            ))}
          </select>
        )}
      </div>

      <div>
        <Label>Год постройки</Label>
        <Input
          type="number"
          value={form.year}
          onChange={(e) => updateField("year", e.target.value)}
        />
      </div>

      <div>
        <Label className="mb-2 block">Дополнительно</Label>

        <div className="space-y-1">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={form.balcony}
              onChange={(e) => updateField("balcony", e.target.checked)}
            />
            <span>Балкон</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={form.glazedBalcony}
              onChange={(e) => updateField("glazedBalcony", e.target.checked)}
            />
            <span>Застекленный балкон</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={form.parking}
              onChange={(e) => updateField("parking", e.target.checked)}
            />
            <span>Парковка</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={form.furnished}
              onChange={(e) => updateField("furnished", e.target.checked)}
            />
            <span>С мебелью</span>
          </label>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
      >
        🚀 Рассчитать стоимость
      </Button>
    </form>
  );
}
