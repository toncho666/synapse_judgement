# 🔧 Настройка API ключей и проверка потока данных

## ❌ Проблема

В `backend/.env` отсутствовали API ключи, поэтому все сервисы использовали мок-данные:
- ❌ `ALPHA_VANTAGE_API_KEY` - для котировок, тех. анализа, новостей
- ❌ `FINNHUB_API_KEY` - для earnings calls

---

## ✅ Решение

### Шаг 1: Получите API ключи

#### Alpha Vantage (для котировок, тех. анализа, новостей)

1. Перейдите на https://www.alphavantage.co/support/#api-key
2. Заполните форму:
   - Name: ваше имя
   - Email: ваш email
   - Organization: (опционально)
3. Нажмите "GET FREE API KEY"
4. Скопируйте ключ (формат: `XXXXXXXXXXXXXXXX`)

**Лимиты бесплатного тарифа:**
- 5 запросов/мин
- 500 запросов/день
- Данные с задержкой 15 минут

#### Finnhub (для earnings calls)

1. Перейдите на https://finnhub.io/register
2. Зарегистрируйтесь (бесплатно)
3. После входа перейдите в Dashboard
4. Скопируйте API ключ

**Лимиты бесплатного тарифа:**
- 60 запросов/мин
- Без дневного лимита

---

### Шаг 2: Добавьте ключи в backend/.env

Откройте `backend/.env` и замените placeholder'ы на ваши ключи:

```env
# Stock Data API (Alpha Vantage)
ALPHA_VANTAGE_API_KEY="ваш_alpha_vantage_ключ"

# Earnings Call Transcripts API (Finnhub)
FINNHUB_API_KEY="ваш_finnhub_ключ"
```

**Пример:**
```env
ALPHA_VANTAGE_API_KEY="ABC123XYZ456DEF789"
FINNHUB_API_KEY="finnhub_key_1234567890abcdef"
```

---

### Шаг 3: Перезапустите backend

```bash
cd backend

# Остановите текущий процесс (Ctrl+C)

# Запустите снова
npm run dev
```

**Ожидаемый вывод:**
```
🚀 Server running on port 3001
📝 Environment: development
📊 API available at http://localhost:3001/api
🚀 Starting background stock updates (every 60 minutes)
📊 Fetching stock data...
✅ Fetched 11 stock quotes
```

---

### Шаг 4: Проверьте что API ключи работают

#### Тест 1: Котировки акций

```bash
curl http://localhost:3001/api/stocks
```

**Ожидаемый ответ (с реальными данными):**
```json
{
  "success": true,
  "data": {
    "quotes": [
      {
        "symbol": "AAPL",
        "price": 175.23,
        "change": 1.45,
        "changePercent": 0.83,
        "timestamp": "2026-10-25T20:00:00.000Z"
      },
      {
        "symbol": "NVDA",
        "price": 480.50,
        "change": 12.30,
        "changePercent": 2.63,
        "timestamp": "2026-10-25T20:00:00.000Z"
      }
    ],
    "lastUpdated": "2026-10-25T20:00:00.000Z"
  }
}
```

**Если видите мок-данные** (цены типа 100-1000 для всех акций) - API ключ не работает.

#### Тест 2: Технический анализ

```bash
curl http://localhost:3001/api/technical-analysis/AAPL
```

**Ожидаемый ответ (с реальными данными):**
```json
{
  "success": true,
  "data": {
    "ticker": "AAPL",
    "currentPrice": 175.23,
    "indicators": {
      "sma20": 173.45,
      "sma50": 170.12,
      "sma200": 165.80,
      "rsi14": 62.5,
      "macd": {
        "macd": 2.1,
        "signal": 1.8,
        "histogram": 0.3
      }
    },
    "recommendation": "BUY",
    "confidence": 72
  }
}
```

**Если видите мок-данные** (случайные индикаторы) - API ключ не работает.

#### Тест 3: Анализ новостей

```bash
curl http://localhost:3001/api/news-analysis/AAPL
```

**Ожидаемый ответ (с реальными данными):**
```json
{
  "success": true,
  "data": {
    "ticker": "AAPL",
    "sentiment": {
      "score": 0.42,
      "label": "positive",
      "trend": "improving"
    },
    "statistics": {
      "totalNews": 47,
      "positive": 28,
      "negative": 12,
      "neutral": 7
    },
    "signal": "bull",
    "strength": 72
  }
}
```

**Если видите мок-данные** (случайные новости) - API ключ не работает.

#### Тест 4: Earnings Calls

```bash
curl http://localhost:3001/api/earnings-call/AAPL
```

**Ожидаемый ответ (с реальными данными):**
```json
{
  "success": true,
  "data": {
    "ticker": "AAPL",
    "tone": {
      "evasivenessIndex": 18,
      "confidenceScore": 82,
      "sentimentShift": 15,
      "overallTone": "confident"
    },
    "guidance": {
      "companyGuidance": {
        "eps": 1.52,
        "revenue": 94.8
      },
      "consensusEstimate": {
        "eps": 1.48,
        "revenue": 93.5
      },
      "beat": true,
      "delta": 2.7
    },
    "signal": "bull",
    "strength": 78
  }
}
```

**Если видите мок-данные** (случайные транскрипты) - API ключ не работает.

---

### Шаг 5: Проверьте логи backend

В терминале где запущен backend должны быть сообщения:

**При успешном получении данных:**
```
✅ Fetched real historical data for AAPL: 250 days
✅ Technical analysis complete for AAPL: BUY (72% confidence)
📰 Fetched 47 news items for AAPL
📞 Fetched 4 transcripts for AAPL
```

**При использовании мок-данных:**
```
⚠️  Using mock historical data for AAPL (base price: $175.00)
⚠️  No news found for AAPL, using mock data
⚠️  No transcripts found for AAPL, using mock data
```

---

### Шаг 6: Проверьте фронтенд

1. Откройте http://localhost:5173
2. Войдите: `demo@synapse.ai` / `demo123`
3. Выберите тикер (например, NVDA)
4. Выберите агентов (Technical + News + Earning Calls)
5. Нажмите "Run Analysis"

**Ожидаемое поведение:**
- ✅ Цены соответствуют реальным (NVDA ~$480, не $565)
- ✅ Индикаторы реалистичные (RSI, MACD, SMA)
- ✅ Новости реальные (с датами и источниками)
- ✅ Earnings calls реальные (с цитатами CEO/CFO)

**Если видите мок-данные:**
- ❌ Случайные цены (500-600 для всех тикеров)
- ❌ Случайные индикаторы
- ❌ Случайные новости
- ❌ Случайные транскрипты

---

## 🔍 Проверка потока данных

### Backend → Frontend

```
1. Frontend запрашивает: GET /api/analysis/run
   ↓
2. Backend получает тикер и агентов
   ↓
3. Backend вызывает stock.service.ts для получения реальной цены
   ↓
4. stock.service.ts вызывает Alpha Vantage API
   ↓
5. Alpha Vantage возвращает реальную цену
   ↓
6. Backend использует реальную цену для анализа
   ↓
7. Backend возвращает результат с реальной ценой
   ↓
8. Frontend отображает реальную цену
```

### Проверка в коде

**stock.service.ts:**
```typescript
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo';

// Если ключ 'demo' - API не работает, возвращает null
// Если ключ правильный - API работает, возвращает реальные данные
```

**technical-analysis.service.ts:**
```typescript
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo';

// Если API не работает - использует generateMockData()
// Если API работает - использует реальные исторические данные
```

**news-analysis.service.ts:**
```typescript
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo';

// Если API не работает - возвращает пустой массив
// Если API работает - возвращает реальные новости
```

**earnings-call.service.ts:**
```typescript
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || '';

// Если ключ пустой - использует generateMockData()
// Если ключ правильный - использует реальные транскрипты
```

---

## 🐛 Решение проблем

### Проблема: API ключ не работает

**Симптомы:**
- В логах: "Using mock data"
- Цены случайные
- Индикаторы случайные

**Решение:**
1. Проверьте что ключ правильный (без пробелов, кавычек)
2. Проверьте что ключ не превысил лимиты
3. Подождите 1 минуту (лимит 5 запросов/мин для Alpha Vantage)
4. Перезапустите backend

### Проблема: "Invalid API key"

**Симптомы:**
- В логах: "Invalid API key"
- API возвращает ошибку

**Решение:**
1. Проверьте что ключ скопирован полностью
2. Проверьте что ключ активен (не отозван)
3. Получите новый ключ если нужно

### Проблема: "Rate limit exceeded"

**Симптомы:**
- В логах: "Rate limit exceeded"
- API возвращает ошибку

**Решение:**
1. Подождите 1 минуту (Alpha Vantage: 5 запросов/мин)
2. Подождите 1 час (Finnhub: 60 запросов/мин)
3. Уменьшите частоту запросов в коде

### Проблема: Данные не обновляются

**Симптомы:**
- Цены старые
- Новости старые

**Решение:**
```bash
# Очистите кэш
curl -X POST http://localhost:3001/api/stocks/refresh
curl -X POST http://localhost:3001/api/technical-analysis/cache/clear
curl -X POST http://localhost:3001/api/news-analysis/cache/clear
curl -X POST http://localhost:3001/api/earnings-call/cache/clear
```

---

## ✅ Чеклист успешной настройки

- [ ] Получен Alpha Vantage API ключ
- [ ] Получен Finnhub API ключ
- [ ] Ключи добавлены в `backend/.env`
- [ ] Backend перезапущен
- [ ] В логах видны сообщения "✅ Fetched real..."
- [ ] API тесты возвращают реальные данные
- [ ] Frontend отображает реальные цены
- [ ] Frontend отображает реальные индикаторы
- [ ] Frontend отображает реальные новости
- [ ] Frontend отображает реальные earnings calls

---

## 📊 Сравнение мок-данных vs реальных данных

### Мок-данные (без API ключей)

```
NVDA:
- Цена: $565.62 (случайная)
- RSI: 35 (случайный)
- Новости: случайные заголовки
- Earnings: случайные транскрипты
```

### Реальные данные (с API ключами)

```
NVDA:
- Цена: $480.50 (реальная)
- RSI: 62.5 (реальный)
- Новости: реальные заголовки с датами
- Earnings: реальные транскрипты с цитатами CEO
```

---

## 🎯 Итог

**Проблема:** API ключи не настроены → используются мок-данные

**Решение:**
1. Получить API ключи (Alpha Vantage + Finnhub)
2. Добавить в `backend/.env`
3. Перезапустить backend
4. Проверить что данные реальные

**Результат:** Frontend будет отображать реальные данные с рынка!

---

**Настройте API ключи и проверьте что данные реальные!** 🚀
