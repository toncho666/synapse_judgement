# 📊 Настройка автоматического обновления котировок

## 🎯 Что реализовано

Автоматическое получение данных о ценах акций каждые 60 минут через бесплатное API Alpha Vantage.

### Возможности:
- ✅ Получение котировок акций (AAPL, NVDA, MSFT, TSLA, AMZN, GOOGL, META)
- ✅ Получение данных о криптовалютах (BTC, ETH) через CoinGecko API
- ✅ Получение данных об индексах (S&P 500, NASDAQ) - мок-данные
- ✅ Фоновое обновление каждые 60 минут
- ✅ Кэширование в памяти (без БД)
- ✅ Fallback на мок-данные при ошибке API
- ✅ Автоматическое обновление на frontend каждые 5 минут

---

## 🔑 Получение API ключа Alpha Vantage

### Шаг 1: Регистрация

1. Перейдите на https://www.alphavantage.co/support/#api-key
2. Заполните форму:
   - **Name**: Ваше имя
   - **Email**: Ваш email
   - **Organization**: (опционально)
3. Нажмите "GET FREE API KEY"

### Шаг 2: Получение ключа

Вы получите API ключ вида: `XXXXXXXXXXXXXXXX`

**Важно**: Сохраните ключ в надежном месте!

### Шаг 3: Настройка backend

Откройте файл `backend/.env` и добавьте:

```env
# Stock Data API
ALPHA_VANTAGE_API_KEY="ваш_api_ключ_здесь"
```

**Пример**:
```env
ALPHA_VANTAGE_API_KEY="ABC123XYZ456"
```

### Шаг 4: Перезапуск backend

```bash
cd backend
npm run dev
```

Вы должны увидеть в логах:
```
🚀 Starting background stock updates (every 60 minutes)
📊 Fetching stock data...
✅ Fetched 11 stock quotes
```

---

## 🧪 Тестирование API

### Проверка статуса кэша

```bash
curl http://localhost:3001/api/stocks/status
```

**Ожидаемый ответ**:
```json
{
  "success": true,
  "data": {
    "hasCache": true,
    "lastUpdated": "2026-02-20T12:00:00.000Z",
    "quotesCount": 11,
    "cacheAge": 3600000
  }
}
```

### Получение данных о ценах

```bash
curl http://localhost:3001/api/stocks
```

**Ожидаемый ответ**:
```json
{
  "success": true,
  "data": {
    "quotes": [
      {
        "symbol": "AAPL",
        "price": 232.41,
        "change": 1.94,
        "changePercent": 0.84,
        "timestamp": "2026-02-20T12:00:00.000Z"
      },
      ...
    ],
    "lastUpdated": "2026-02-20T12:00:00.000Z"
  },
  "cached": true
}
```

### Принудительное обновление

```bash
curl -X POST http://localhost:3001/api/stocks/refresh
```

---

## 📈 Лимиты бесплатного API

### Alpha Vantage (Free Tier)
- **5 запросов в минуту**
- **500 запросов в день**
- **Данные с задержкой 15 минут**

### CoinGecko (Free Tier)
- **10-30 запросов в минуту**
- **Без лимитов на день**
- **Данные в реальном времени**

### Наши настройки
- Обновление каждые **60 минут**
- **11 символов** (7 акций + 2 крипты + 2 индекса)
- **24 запроса в день** (в пределах лимита)

---

## 🔄 Как работает автоматизация

### Backend

1. **При старте сервера**:
   - Запускается фоновое обновление
   - Получаются данные для всех 11 символов
   - Данные кэшируются в памяти

2. **Каждые 60 минут**:
   - Автоматическое обновление данных
   - Обновление кэша

3. **При запросе `/api/stocks`**:
   - Возвращаются данные из кэша
   - Если кэш устарел (>60 мин), происходит обновление

### Frontend

1. **При загрузке страницы**:
   - Запрос к `/api/stocks`
   - Отображение данных

2. **Каждые 5 минут**:
   - Автоматическое обновление данных
   - Плавное обновление UI

3. **При ошибке API**:
   - Fallback на мок-данные
   - Пользователь видит данные (хоть и не актуальные)

---

## 🛠️ Настройка списка отслеживаемых акций

Откройте файл `backend/src/services/stock.service.ts`:

```typescript
const TRACKED_SYMBOLS = [
  'AAPL', 'NVDA', 'MSFT', 'TSLA', 'AMZN', 
  'GOOGL', 'META', 'S&P 500', 'NASDAQ', 'BTC', 'ETH'
];
```

Добавьте или удалите символы по необходимости.

**Важно**: 
- Акции должны быть в формате тикера (AAPL, GOOGL)
- Криптовалюты: BTC, ETH
- Индексы: S&P 500, NASDAQ (мок-данные)

---

## 🐛 Решение проблем

### Проблема: "Failed to fetch stock data"

**Причина**: Не настроен API ключ или превышен лимит

**Решение**:
1. Проверьте `backend/.env` - должен быть `ALPHA_VANTAGE_API_KEY`
2. Проверьте лимиты на https://www.alphavantage.co/premium/
3. Подождите 1 минуту перед следующим запросом

### Проблема: Данные не обновляются

**Причина**: Кэш ещё актуален (< 60 минут)

**Решение**:
```bash
# Принудительное обновление
curl -X POST http://localhost:3001/api/stocks/refresh
```

### Проблема: Frontend показывает мок-данные

**Причина**: Backend недоступен или API ключ не настроен

**Решение**:
1. Убедитесь что backend запущен: `cd backend && npm run dev`
2. Проверьте логи backend на наличие ошибок
3. Проверьте `backend/.env` на наличие `ALPHA_VANTAGE_API_KEY`

---

## 📊 Альтернативные API

Если Alpha Vantage не подходит, можно использовать:

### Finnhub
- **Лимит**: 60 запросов/мин
- **Регистрация**: https://finnhub.io/register
- **Документация**: https://finnhub.io/docs/api

### Twelve Data
- **Лимит**: 800 запросов/день
- **Регистрация**: https://twelvedata.com/register
- **Документация**: https://twelvedata.com/docs

### Yahoo Finance (неофициальный)
- **Лимит**: Без ограничений
- **Библиотека**: `yahoo-finance2`
- **Документация**: https://github.com/gadicc/node-yahoo-finance2

---

## 🎯 Следующие шаги

1. ✅ Получить API ключ Alpha Vantage
2. ✅ Добавить ключ в `backend/.env`
3. ✅ Перезапустить backend
4. ✅ Проверить работу API: `curl http://localhost:3001/api/stocks`
5. ✅ Открыть frontend: http://localhost:5173
6. ✅ Убедиться что данные обновляются

---

## 📚 Полезные ссылки

- **Alpha Vantage**: https://www.alphavantage.co/
- **CoinGecko API**: https://www.coingecko.com/en/api
- **Документация API**: `backend/src/services/stock.service.ts`
- **Frontend хук**: `frontend/src/hooks/useStocks.ts`

---

**Готово! Теперь котировки обновляются автоматически каждые 60 минут!** 🚀
