import subprocess
import os

# Определяем абсолютный путь к файлу относительно расположения скрипта
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
NOTEBOOK = os.path.join(SCRIPT_DIR, "data/krisha_spark_analysis.ipynb")
OUTPUT = os.path.join(SCRIPT_DIR, "reports/market_analysis.html")

if not os.path.exists(NOTEBOOK):
    print(f"Ищем файл по пути: {NOTEBOOK}")
    raise FileNotFoundError(f"Файл не найден: {NOTEBOOK}")

cmd = [
    "jupyter", "nbconvert",
    "--to", "html",
    "--no-input",              # скрыть все ячейки с кодом
    # "--execute",             # раскомментируй, если нужно пересчитывать ноутбук каждый раз
    "--output", OUTPUT,
    NOTEBOOK,
]


print("Конвертация ноутбука в HTML...")
print(f"Исходный файл: {NOTEBOOK}")
print(f"Выходной файл: {OUTPUT}")
subprocess.run(cmd, check=True)
print("Готово: отчет сохранён в", OUTPUT)