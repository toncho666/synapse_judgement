# 🚀 Установка Yahoo Finance - Быстрый старт

## ⚡ В 3 шага

### Шаг 1: Установите зависимости

```bash
cd backend
npm install
```

Это установит `yahoo-finance2` библиотеку.

### Шаг 2: Перезапустите backend

```bash
# Остановите текущий процесс (Ctrl+C)
npm run dev
```

### Шаг 3: Проверьте что всё работает

**В логах backend должны увидеть:**
```
🚀 Server running on port 3001
🚀 Starting background stock updates (every 60 minutes)
📊 Fetching stock data from Yahoo Finance...
📊 Fetching quote for AAPL (AAPL) from Yahoo Finance...
✅ AAPL: $225.50 (+0.83%)
📊 Fetching quote for NVDA (NVDA) from Yahoo Finance...
✅ NVDA: $140.20 (+2.63%)
...
✅ Fetched 11/11 stock quotes
```

**Проверьте API:**
```bash
curl http://localhost:3001/api/stocks
```

Должны увидеть реальные цены для всех 11 активов.

---

## ✅ Что изменилось

### До (Alpha Vantage):
- ❌ 25 запросов/день лимит
- ❌ Только 5 акций
- ❌ Нужен API ключ
- ❌ Устаревшие цены (NVDA $480)

### После (Yahoo Finance):
- ✅ Безлимитные запросы
- ✅ 11 активов (акции + крипто + индексы)
- ✅ Не нужен API ключ
- ✅ Реальные цены (NVDA ~$140)

---

## 🎯 Отслеживаемые активы

**Акции (7):**
- AAPL, NVDA, MSFT, TSLA, AMZN, GOOGL, META

**Криптовалюты (2):**
- BTC, ETH

**Индексы (2):**
- S&P 500, NASDAQ

---

## 🧪 Тестирование

### Тест 1: Котировки
```bash
curl http://localhost:3001/api/stocks | jq .
```

### Тест 2: Технический анализ
```bash
curl http://localhost:3001/api/technical-analysis/AAPL | jq .
```

### Тест 3: В браузере
1. Откройте http://localhost:5173
2. Войдите: `demo@synapse.ai` / `demo123`
3. Выберите тикер (например, NVDA)
4. Нажмите "Run Analysis"
5. Проверьте что цена реальная (~$140 для NVDA)

---

## 🐛 Если что-то не работает

### Проблема: "Cannot find module 'yahoo-finance2'"
```bash
cd backend
npm install
npm run dev
```

### Проблема: Ошибки в логах
```bash
# Очистите кэш
curl -X POST http://localhost:3001/api/stocks/clear-cache

# Перезапустите backend
cd backend
npm run dev
```

### Проблема: Старые цены
```bash
# Очистите кэш котировок
curl -X POST http://localhost:3001/api/stocks/clear-cache

# Очистите кэш технического анализа
curl -X POST http://localhost:3001/api/technical-analysis/cache/clear
```

---

## 📚 Документация

- **[YAHOO_FINANCE_INTEGRATION.md](./YAHOO_FINANCE_INTEGRATION.md)** - полная документация
- **[FIX_LOG_ERRORS.md](./FIX_LOG_ERRORS.md)** - исправление ошибок из логов

---

**Готово! Теперь все данные реальные и безлимитные!** 🚀
