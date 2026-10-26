# 🔍 Диагностика проблемы с мок-данными

## 🐛 Проблема

После добавления API ключей в `backend/.env` система продолжает использовать мок-данные:
- Цена NVDA показывается как $355.01 (должна быть ~$480)
- Данные приходят из `generateMockData` в `technical-analysis.service.ts`

---

## ✅ Что исправлено

### 1. Добавлена диагностика API ключей

**Файл:** `backend/src/index.ts`

При старте сервера теперь логируется:
```
✅ Alpha Vantage API key configured: ABCD...WXYZ
✅ Finnhub API key configured: EFGH...1234
```

Или если ключи не настроены:
```
⚠️  Alpha Vantage API key NOT configured - using mock data
⚠️  Finnhub API key NOT configured - using mock data
```

### 2. Добавлен endpoint для проверки ключей

```bash
curl http://localhost:3001/api/status/keys
```

**Ожидаемый ответ:**
```json
{
  "success": true,
  "data": {
    "alphaVantage": {
      "configured": true,
      "keyPreview": "ABCD...WXYZ",
      "status": "✅ Ready"
    },
    "finnhub": {
      "configured": true,
      "keyPreview": "EFGH...1234",
      "status": "✅ Ready"
    }
  }
}
```

### 3. Добавлена диагностика в technical-analysis.service.ts

Теперь в логах видно:
```
🔑 Using API key: ABCD...WXYZ
🌐 Fetching historical data for NVDA from Alpha Vantage...
✅ Fetched REAL historical data for NVDA: 250 days, latest price: $480.50
```

Или если используется мок:
```
⚠️  No valid API key configured for NVDA, using mock data
⚠️  Using MOCK data for NVDA
```

### 4. Добавлена диагностика в analysis.service.ts

Теперь в логах видно:
```
AnalysisService: Stock price obtained {
  ticker: 'NVDA',
  price: 480.50,
  change: 2.63,
  source: 'REAL',
  timestamp: '2026-10-26T18:30:00.000Z'
}
```

Или если используется мок:
```
AnalysisService: Stock price obtained {
  ticker: 'NVDA',
  price: 355.01,
  change: 1.25,
  source: 'MOCK',
  timestamp: '2026-10-26T18:30:00.000Z'
}
```

### 5. Добавлены endpoints для управления кэшем

```bash
# Проверить статус кэша
curl http://localhost:3001/api/stocks/status

# Очистить кэш
curl -X POST http://localhost:3001/api/stocks/clear-cache

# Принудительно обновить данные
curl -X POST http://localhost:3001/api/stocks/refresh
```

---

## 🔧 Пошаговая диагностика

### Шаг 1: Проверьте что API ключи настроены

```bash
# Проверьте статус ключей
curl http://localhost:3001/api/status/keys
```

**Ожидаемый результат:**
```json
{
  "alphaVantage": { "configured": true, "status": "✅ Ready" },
  "finnhub": { "configured": true, "status": "✅ Ready" }
}
```

**Если `configured: false`:**
1. Откройте `backend/.env`
2. Убедитесь что ключи добавлены правильно:
   ```env
   ALPHA_VANTAGE_API_KEY="ваш_реальный_ключ"
   FINNHUB_API_KEY="ваш_реальный_ключ"
   ```
3. **НЕ** используйте placeholder'ы вроде `"your_alpha_vantage_api_key_here"`
4. Перезапустите backend

### Шаг 2: Проверьте логи backend

Перезапустите backend и посмотрите на логи:

```bash
cd backend
npm run dev
```

**Должны увидеть:**
```
✅ Alpha Vantage API key configured: ABCD...WXYZ
✅ Finnhub API key configured: EFGH...1234
🚀 Server running on port 3001
```

**Если видите:**
```
⚠️  Alpha Vantage API key NOT configured - using mock data
```

Значит ключи не загружаются. Проверьте:
- Файл `.env` существует в папке `backend/`
- Ключи написаны правильно (без пробелов, кавычек)
- Backend перезапущен после добавления ключей

### Шаг 3: Очистите кэш

```bash
# Очистите кэш котировок
curl -X POST http://localhost:3001/api/stocks/clear-cache

# Принудительно обновите данные
curl -X POST http://localhost:3001/api/stocks/refresh
```

### Шаг 4: Проверьте API напрямую

```bash
# Проверьте котировки
curl http://localhost:3001/api/stocks | jq .

# Должны увидеть реальные цены:
# NVDA: ~$480 (не $355)
# AAPL: ~$175 (не случайная цена)
```

```bash
# Проверьте технический анализ
curl http://localhost:3001/api/technical-analysis/NVDA | jq .

# В логах backend должны увидеть:
# 🔑 Using API key: ABCD...WXYZ
# 🌐 Fetching historical data for NVDA from Alpha Vantage...
# ✅ Fetched REAL historical data for NVDA: 250 days, latest price: $480.50
```

### Шаг 5: Проверьте frontend

1. Откройте http://localhost:5173
2. Войдите: `demo@synapse.ai` / `demo123`
3. Выберите NVDA
4. Нажмите "Run Analysis"
5. Проверьте логи backend

**Должны увидеть:**
```
AnalysisService: Stock price obtained {
  ticker: 'NVDA',
  price: 480.50,
  source: 'REAL'
}
```

**Если видите:**
```
AnalysisService: Stock price obtained {
  ticker: 'NVDA',
  price: 355.01,
  source: 'MOCK'
}
```

Значит API ключи не работают, и система использует мок-данные.

---

## 🐛 Решение типичных проблем

### Проблема 1: "API key NOT configured"

**Причина:** Ключи не загружаются из `.env`

**Решение:**
```bash
# 1. Проверьте что .env существует
ls -la backend/.env

# 2. Проверьте содержимое
cat backend/.env

# 3. Убедитесь что ключи правильные
# Должно быть:
# ALPHA_VANTAGE_API_KEY="реальный_ключ_без_пробелов"
# FINNHUB_API_KEY="реальный_ключ_без_пробелов"

# 4. Перезапустите backend
cd backend
npm run dev
```

### Проблема 2: "Alpha Vantage API error: Invalid API call"

**Причина:** API ключ невалидный или превышен лимит

**Решение:**
1. Проверьте ключ на https://www.alphavantage.co/support/#api-key
2. Убедитесь что ключ активен
3. Проверьте лимиты (5 запросов/мин для бесплатного тарифа)
4. Подождите 1 минуту и попробуйте снова

### Проблема 3: "Timeout fetching historical data"

**Причина:** Alpha Vantage API медленный или недоступен

**Решение:**
1. Подождите 1-2 минуты
2. Проверьте интернет-соединение
3. Проверьте статус Alpha Vantage: https://www.alphavantage.co/status/
4. Если проблема постоянная, получите новый API ключ

### Проблема 4: Данные всё ещё мок-данные

**Причина:** Кэш содержит старые мок-данные

**Решение:**
```bash
# 1. Очистите кэш
curl -X POST http://localhost:3001/api/stocks/clear-cache

# 2. Принудительно обновите
curl -X POST http://localhost:3001/api/stocks/refresh

# 3. Перезапустите backend
cd backend
# Ctrl+C
npm run dev

# 4. Проверьте логи
# Должны увидеть: ✅ Fetched REAL historical data
```

---

## 📊 Сравнение мок-данных vs реальных данных

### Мок-данные (без API ключей)

```
NVDA:
- Цена: $355.01 (случайная из диапазона 100-500)
- RSI: 35 (случайный)
- Новости: случайные заголовки
- Earnings: случайные транскрипты
```

### Реальные данные (с API ключами)

```
NVDA:
- Цена: $480.50 (реальная с Alpha Vantage)
- RSI: 62.5 (реальный расчёт на основе 250 дней данных)
- Новости: реальные заголовки с датами
- Earnings: реальные транскрипты с цитатами CEO
```

---

## ✅ Чеклист успешной настройки

- [ ] API ключи добавлены в `backend/.env`
- [ ] Ключи не содержат placeholder'ы
- [ ] Backend перезапущен после добавления ключей
- [ ] В логах видны сообщения `✅ API key configured`
- [ ] Endpoint `/api/status/keys` показывает `configured: true`
- [ ] Кэш очищен (`POST /api/stocks/clear-cache`)
- [ ] API возвращает реальные цены (`curl /api/stocks`)
- [ ] В логах видны сообщения `✅ Fetched REAL historical data`
- [ ] Frontend отображает реальные цены

---

## 🎯 Итог

**Если вы видите мок-данные после добавления API ключей:**

1. ✅ Проверьте что ключи настроены: `curl /api/status/keys`
2. ✅ Проверьте логи backend при старте
3. ✅ Очистите кэш: `curl -X POST /api/stocks/clear-cache`
4. ✅ Перезапустите backend
5. ✅ Проверьте API напрямую: `curl /api/stocks`
6. ✅ Проверьте frontend и логи backend

**Если проблема сохраняется:**
- Проверьте что API ключи валидны
- Проверьте лимиты API (5 запросов/мин для Alpha Vantage)
- Проверьте интернет-соединение
- Получите новые API ключи если нужно

---

**Диагностика добавлена! Теперь видно откуда приходят данные!** 🔍
