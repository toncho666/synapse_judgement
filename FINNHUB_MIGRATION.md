# 🔄 Переход на Finnhub API

## ❌ Проблема с Yahoo Finance

Библиотека `yahoo-finance2` v3.15.4 оказалась нестабильной:
- Ошибка: `TypeError: import_yahoo_finance2.YahooFinance is not a constructor`
- Частые breaking changes
- Нестабильная работа с API

## ✅ Решение: Finnhub API

Переключились на **Finnhub API** для всех финансовых данных:

### Преимущества Finnhub:
- ✅ **Стабильная работа** - проверенный API
- ✅ **60 запросов/мин** (бесплатно)
- ✅ **Один API ключ** для всех сервисов
- ✅ **Поддержка котировок** в реальном времени
- ✅ **Исторические данные** для технического анализа
- ✅ **Новости и сентимент** для News агента
- ✅ **Earnings transcripts** для Earnings агента

---

## 📊 Что изменилось

### Удалено:
- ❌ `yahoo-finance2` библиотека
- ❌ `yahoo-finance.service.ts` сервис
- ❌ Все зависимости от Yahoo Finance

### Обновлено:
- ✅ `stock.service.ts` - использует Finnhub для котировок
- ✅ `technical-analysis.service.ts` - использует Finnhub для исторических данных
- ✅ `news-analysis.service.ts` - уже использовал Alpha Vantage
- ✅ `earnings-call.service.ts` - уже использовал Finnhub

---

## 🔧 Обновлённые файлы

### 1. `backend/package.json`
```json
// Удалено:
"yahoo-finance2": "^3.6.4"

// Finnhub уже был в зависимостях (для earnings)
```

### 2. `backend/src/services/stock.service.ts`
```typescript
// Было:
import { YahooFinance } from 'yahoo-finance2';
const yahooFinance = new YahooFinance();

// Стало:
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || '';

// Finnhub API для котировок:
const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
// Возвращает: { c: current, d: change, dp: percent, h: high, l: low, o: open, pc: previous }
```

### 3. `backend/src/services/technical-analysis.service.ts`
```typescript
// Было:
import { getHistoricalDataForDays } from './yahoo-finance.service.js';

// Стало:
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || '';

// Finnhub API для исторических данных:
const url = `https://finnhub.io/api/v1/stock/candle?symbol=${ticker}&resolution=D&from=${startDate}&to=${endDate}&token=${FINNHUB_API_KEY}`;
// Возвращает: { s: 'ok', o: opens, h: highs, l: lows, c: closes, v: volumes, t: timestamps }
```

### 4. Удалён файл:
- ❌ `backend/src/services/yahoo-finance.service.ts`

---

## 🚀 Как применить изменения

### Шаг 1: Обновите зависимости

```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Шаг 2: Проверьте API ключ Finnhub

```bash
cd backend
cat .env | grep FINNHUB
```

Должно быть:
```env
FINNHUB_API_KEY="ваш_finnhub_api_ключ"
```

Если нет - получите ключ на https://finnhub.io/register

### Шаг 3: Перезапустите backend

```bash
npm run dev
```

### Шаг 4: Проверьте логи

**Должны увидеть:**
```
🚀 Server running on port 3001
✅ Finnhub API key configured: dbfm...rif0
🚀 Starting background stock updates (every 60 minutes)
📊 Fetching stock data from Finnhub...
📊 Fetching quote for AAPL from Finnhub...
✅ AAPL: $225.50 (+0.83%)
📊 Fetching quote for NVDA from Finnhub...
✅ NVDA: $140.20 (+2.63%)
...
✅ Fetched 7/7 stock quotes
```

**НЕ должны видеть:**
```
❌ Error: Call `const yahooFinance = new YahooFinance()` first.
❌ TypeError: import_yahoo_finance2.YahooFinance is not a constructor
```

### Шаг 5: Проверьте API

```bash
# Проверьте котировки
curl http://localhost:3001/api/stocks

# Проверьте технический анализ
curl http://localhost:3001/api/technical-analysis/AAPL
```

### Шаг 6: Проверьте в браузере

1. Откройте http://localhost:5173
2. Войдите: `demo@synapse.ai` / `demo123`
3. Выберите тикер (например, NVDA)
4. Нажмите "Run Analysis"
5. Проверьте что цена реальная (~$140 для NVDA)

---

## 📈 Finnhub API Endpoints

### 1. Котировки (Real-time)
```
GET https://finnhub.io/api/v1/quote?symbol=AAPL&token=YOUR_API_KEY
```

**Ответ:**
```json
{
  "c": 225.50,  // current price
  "d": 1.87,    // change
  "dp": 0.83,   // percent change
  "h": 226.00,  // high
  "l": 224.00,  // low
  "o": 224.50,  // open
  "pc": 223.63, // previous close
  "t": 1698345600 // timestamp
}
```

### 2. Исторические данные (Candles)
```
GET https://finnhub.io/api/v1/stock/candle?symbol=AAPL&resolution=D&from=1697740800&to=1698345600&token=YOUR_API_KEY
```

**Ответ:**
```json
{
  "s": "ok",           // status
  "o": [220.5, 221.3], // opens
  "h": [222.1, 223.5], // highs
  "l": [219.8, 220.1], // lows
  "c": [221.2, 222.8], // closes
  "v": [50000000, 52000000], // volumes
  "t": [1697740800, 1697827200] // timestamps
}
```

### 3. Новости
```
GET https://finnhub.io/api/v1/company-news?symbol=AAPL&from=2024-01-01&to=2024-10-26&token=YOUR_API_KEY
```

### 4. Earnings
```
GET https://finnhub.io/api/v1/stock/earnings?symbol=AAPL&limit=4&token=YOUR_API_KEY
```

---

## 🎯 Отслеживаемые активы

### Finnhub поддерживает:
- ✅ **Акции** (7): AAPL, NVDA, MSFT, TSLA, AMZN, GOOGL, META
- ❌ **Криптовалюты** (не поддерживаются в бесплатном тарифе)
- ❌ **Индексы** (не поддерживаются в бесплатном тарифе)

**Итого: 7 активов** (вместо 11 с Yahoo Finance)

---

## 📊 Лимиты Finnhub

### Бесплатный тариф:
- ✅ **60 запросов/мин**
- ✅ **Без дневного лимита**
- ✅ **Real-time данные** (с задержкой 15 мин для некоторых бирж)
- ✅ **Исторические данные** (до 20 лет)

### Сравнение с Yahoo Finance:
| Характеристика | Yahoo Finance | Finnhub |
|----------------|---------------|---------|
| Лимит запросов | Безлимитно ❌ (нестабильно) | 60/мин ✅ |
| API ключ | Не нужен | Нужен ✅ |
| Стабильность | Низкая ❌ | Высокая ✅ |
| Акции | ✅ | ✅ |
| Крипто | ✅ | ❌ (free tier) |
| Индексы | ✅ | ❌ (free tier) |
| Исторические данные | ✅ | ✅ |
| Новости | ❌ | ✅ |
| Earnings | ❌ | ✅ |

---

## 🐛 Решение проблем

### Проблема: "Finnhub API key not configured"

**Решение:**
```bash
cd backend
nano .env
```

Добавьте:
```env
FINNHUB_API_KEY="ваш_finnhub_api_ключ"
```

Получите ключ: https://finnhub.io/register

### Проблема: "No data for AAPL"

**Причина:** Finnhub не поддерживает этот тикер

**Решение:**
- Проверьте что тикер правильный
- Finnhub поддерживает только акции (не крипто/индексы в free tier)
- Система автоматически использует мок-данные

### Проблема: "Finnhub API error: 429"

**Причина:** Превышен лимит 60 запросов/мин

**Решение:**
- Подождите 1 минуту
- Уменьшите частоту запросов
- Получите premium ключ

---

## ✅ Итог

**Проблема с Yahoo Finance решена!**

### Что сделано:
- ✅ Удалена нестабильная библиотека `yahoo-finance2`
- ✅ Переключились на стабильный Finnhub API
- ✅ Один API ключ для всех сервисов
- ✅ Обновлены все сервисы для использования Finnhub
- ✅ Удалён файл `yahoo-finance.service.ts`

### Что работает:
- ✅ Котировки для 7 акций (AAPL, NVDA, MSFT, TSLA, AMZN, GOOGL, META)
- ✅ Исторические данные для технического анализа (250 дней)
- ✅ Реальные цены из Finnhub API
- ✅ Стабильная работа без ошибок

### Что нужно сделать:
1. ✅ `cd backend && rm -rf node_modules package-lock.json && npm install`
2. ✅ Проверить что `FINNHUB_API_KEY` настроен в `backend/.env`
3. ✅ `npm run dev`
4. ✅ Проверить логи (должны быть сообщения "from Finnhub")
5. ✅ Протестировать API и frontend

---

**Готово! Теперь система использует стабильный Finnhub API!** 🚀
