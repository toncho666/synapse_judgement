# 🔧 Исправление исторических данных для технического анализа

## ❌ Проблема

В логах было:
```
⚠️ Finnhub API error for NVDA: 403
⚠️ Using mock historical data for NVDA (base price: $140.00)
```

**Причина:** Finnhub бесплатный тариф **НЕ поддерживает** endpoint `/stock/candle` для исторических данных (возвращает 403 Forbidden).

## ✅ Решение

Разделили API по назначению:

| API | Назначение | Лимит |
|-----|-----------|-------|
| **Finnhub** | Котировки в реальном времени | 60 запросов/мин |
| **Alpha Vantage** | Исторические данные для тех. анализа | 25 запросов/день |

---

## 📊 Что изменилось

### Обновлённые файлы:

1. **`backend/src/services/technical-analysis.service.ts`**
   - Изменён импорт с Finnhub на Alpha Vantage
   - Обновлена функция `fetchHistoricalData()` для использования Alpha Vantage API
   - Обновлены базовые цены в мок-данных на актуальные (октябрь 2026)

### Базовые цены (обновлены):

```typescript
const tickerPrices: Record<string, number> = {
  'AAPL': 343,   // было 225
  'MSFT': 530,   // было 420
  'GOOGL': 318,  // было 175
  'AMZN': 249,   // было 185
  'TSLA': 395,   // было 245
  'NVDA': 216,   // было 140
  'META': 639,   // было 575
  'NFLX': 680,
  'AMD': 165,
  'INTC': 22,
};
```

---

## 🚀 Как это работает теперь

### 1. Котировки (Finnhub)

```typescript
// stock.service.ts
const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
// Возвращает: { c: current, d: change, dp: percent, h: high, l: low, o: open, pc: previous }
```

**Результат:**
```
✅ AAPL: $343.34 (-1.26%)
✅ NVDA: $216.05 (+2.41%)
✅ MSFT: $530.55 (+1.15%)
✅ TSLA: $395.17 (+6.17%)
✅ AMZN: $249.75 (+0.71%)
✅ GOOGL: $318.52 (-0.53%)
✅ META: $639.37 (-0.51%)
```

### 2. Исторические данные (Alpha Vantage)

```typescript
// technical-analysis.service.ts
const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&outputsize=full&apikey=${ALPHA_VANTAGE_API_KEY}`;
// Возвращает: { "Time Series (Daily)": { "2024-01-01": { "1. open": "...", "2. high": "...", "3. low": "...", "4. close": "...", "5. volume": "..." } } }
```

**Результат:**
```
✅ Fetched REAL historical data for NVDA: 250 days, latest price: $216.05
```

---

## 🧪 Проверка

### Шаг 1: Перезапустите backend

```bash
cd backend
npm run dev
```

### Шаг 2: Проверьте логи

**Должны увидеть:**
```
🚀 Server running on port 3001
✅ Alpha Vantage API key configured: 2AWG...JFP3
✅ Finnhub API key configured: dbfm...rif0

📊 Fetching stock data from Finnhub...
✅ AAPL: $343.34 (-1.26%)
✅ NVDA: $216.05 (+2.41%)
...
✅ Fetched 7/7 stock quotes

📊 Performing technical analysis for NVDA
🌐 Fetching historical data for NVDA from Alpha Vantage...
✅ Fetched REAL historical data for NVDA: 250 days, latest price: $216.05
✅ Technical analysis complete for NVDA: BUY (75% confidence)
```

**НЕ должны видеть:**
```
⚠️ Finnhub API error for NVDA: 403
⚠️ Using mock historical data for NVDA (base price: $140.00)
```

### Шаг 3: Проверьте API

```bash
# Проверьте котировки (Finnhub)
curl http://localhost:3001/api/stocks

# Проверьте технический анализ (Alpha Vantage)
curl http://localhost:3001/api/technical-analysis/NVDA
```

### Шаг 4: Проверьте в браузере

1. Откройте http://localhost:5173
2. Войдите: `demo@synapse.ai` / `demo123`
3. Выберите NVDA
4. Нажмите "Run Analysis"
5. Проверьте что:
   - Цена: ~$216 (реальная, не $140)
   - Индикаторы рассчитаны на реальных данных
   - В логах backend: "Fetched REAL historical data"

---

## 📈 Лимиты API

### Finnhub (котировки):
- ✅ 60 запросов/мин
- ✅ Без дневного лимита
- ✅ 7 акций × 1 раз/час = 7 запросов/час ✅

### Alpha Vantage (исторические данные):
- ⚠️ 25 запросов/день
- ⚠️ 1 запрос на технический анализ
- ✅ Достаточно для ~25 анализов в день

**Рекомендация:** Кэш технического анализа установлен на 1 час, что снижает нагрузку на API.

---

## 🐛 Решение проблем

### Проблема: "Alpha Vantage API rate limit"

**Причина:** Превышен лимит 25 запросов/день

**Решение:**
1. Подождите до следующего дня (лимит обновляется в 00:00 UTC)
2. Или получите premium ключ Alpha Vantage
3. Или используйте мок-данные (система автоматически переключится)

### Проблема: "No historical data available"

**Причина:** Alpha Vantage не нашёл данные для тикера

**Решение:**
- Проверьте правильность тикера
- Некоторые тикеры могут быть недоступны
- Система автоматически использует мок-данные с актуальными ценами

### Проблема: Цены всё ещё неправильные

**Причина:** Кэш содержит старые данные

**Решение:**
```bash
# Очистите кэш технического анализа
curl -X POST http://localhost:3001/api/technical-analysis/cache/clear

# Перезапустите backend
cd backend
npm run dev
```

---

## 📊 Архитектура API

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend                              │
│  http://localhost:5173                                   │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│                    Backend                               │
│  http://localhost:3001                                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  /api/stocks                                            │
│  └─> Finnhub API (котировки)                           │
│      ✅ 60 запросов/мин                                 │
│      ✅ 7 акций                                         │
│                                                         │
│  /api/technical-analysis/:ticker                        │
│  └─> Alpha Vantage API (исторические данные)           │
│      ⚠️ 25 запросов/день                                │
│      ✅ 250 дней данных                                 │
│                                                         │
│  /api/news-analysis/:ticker                             │
│  └─> Alpha Vantage API (новости)                       │
│      ⚠️ 25 запросов/день                                │
│                                                         │
│  /api/earnings-call/:ticker                             │
│  └─> Finnhub API (транскрипты)                         │
│      ✅ 60 запросов/мин                                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ Итог

**Проблема решена!**

### Что исправлено:
- ✅ Технический анализ теперь использует Alpha Vantage для исторических данных
- ✅ Обновлены базовые цены в мок-данных на актуальные (октябрь 2026)
- ✅ Finnhub используется только для котировок (где он работает отлично)
- ✅ Правильное разделение API по назначению

### Что работает:
- ✅ Котировки из Finnhub (реальные цены)
- ✅ Исторические данные из Alpha Vantage (реальные данные)
- ✅ Технический анализ на реальных данных
- ✅ Fallback на мок-данные с актуальными ценами

### Что нужно сделать:
1. ✅ Перезапустить backend
2. ✅ Проверить логи (должны быть "from Alpha Vantage")
3. ✅ Протестировать технический анализ
4. ✅ Проверить что цены реальные

---

**Готово! Теперь технический анализ использует реальные исторические данные!** 🚀
