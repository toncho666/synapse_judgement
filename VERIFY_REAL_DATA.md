# 🚀 Быстрая проверка реальных данных в SESSION PROTOCOL

## ✅ Что изменилось

Теперь в блоке результатов анализа (SESSION PROTOCOL) для **Technical**, **News** и **Earnings Calls** агентов подтягиваются **реальные данные** через API:

- ✅ **Technical** - реальные цены, индикаторы (RSI, MACD, SMA) из Alpha Vantage
- ✅ **News** - реальные новости и сентимент из Alpha Vantage News API
- ✅ **Earnings Calls** - реальные транскрипты из Finnhub API
- ⏸️ **Fundamental** - мок-данные (как было)
- ⏸️ **Portfolio** - мок-данные (как было)

---

## 🧪 Как проверить что данные реальные

### Шаг 1: Перезапустите backend

```bash
cd backend
# Остановите (Ctrl+C) и запустите снова
npm run dev
```

**В логах должны увидеть:**
```
✅ Alpha Vantage API key configured: ABCD...WXYZ
✅ Finnhub API key configured: EFGH...1234
🚀 Server running on port 3001
```

### Шаг 2: Запустите анализ

1. Откройте http://localhost:5173
2. Войдите: `demo@synapse.ai` / `demo123`
3. Выберите тикер (например, NVDA)
4. Выберите агентов: **Technical + News + Earnings Calls**
5. Нажмите "Run Analysis"

### Шаг 3: Проверьте логи backend

В терминале backend должны увидеть:

```
Fetching REAL technical analysis for NVDA
🔑 Using API key: ABCD...WXYZ
🌐 Fetching historical data for NVDA from Alpha Vantage...
✅ Fetched REAL historical data for NVDA: 250 days, latest price: $480.50
✅ Technical analysis complete for NVDA: BUY (78% confidence)

Fetching REAL news analysis for NVDA
📰 Fetching news for NVDA from Alpha Vantage...
✅ Fetched 47 news items for NVDA
✅ News analysis complete for NVDA: bull signal (72% strength)

Fetching REAL earnings call analysis for NVDA
📞 Fetching transcripts for NVDA from Finnhub...
✅ Fetched 4 transcripts for NVDA
✅ Earnings call analysis complete for NVDA: bull signal (82% strength)

AnalysisService: Analysis completed {
  realDataAgents: 3,
  mockDataAgents: 0
}
```

### Шаг 4: Проверьте SESSION PROTOCOL

В результатах анализа должны увидеть:

**✅ Правильно (реальные данные):**
```
NVDA
last price: $480.50 (REAL - из Alpha Vantage API)

Technical
confidence 78%
Bullish signal
Price: $480.50
Recommendation: BUY (78% confidence)
Support: $450.20, Resistance: $510.30
RSI: 62.5
MACD: 2.15
SMA 200: $420.80

News
confidence 72%
Bullish signal
Sentiment: positive (0.42)
Trend: improving
Total news: 47 (Positive: 28, Negative: 12)

Earnings Calls
confidence 82%
Bullish signal
Tone: confident (Confidence: 82/100)
Evasiveness: 18/100
Guidance: Beat consensus by 4.5%

The Judge
BUY
confidence 77%
Real data from: tech, news, earn
All agents using real data.
```

**❌ Неправильно (мок-данные):**
```
NVDA
last price: $355.01 (случайная цена из диапазона 100-500)

Technical
confidence 84%
Bullish signal
Price action shows bullish momentum at $355.01
Technical indicators suggest strong buying pressure
RSI: 61.0
MACD: 1.68
```

### Шаг 5: Проверьте rationale

В блоке "The Judge" должно быть указано:

**✅ Правильно:**
```
Real data from: tech, news, earn
All agents using real data.
```

**Или если выбраны все 5 агентов:**
```
Real data from: tech, news, earn
Mock data for: fund, port
```

---

## 🐛 Если данные всё ещё мок-данные

### Проблема 1: API ключи не настроены

**Симптомы:**
- В логах: `⚠️  Alpha Vantage API key NOT configured`
- Цена NVDA: ~$355 (случайная)

**Решение:**
```bash
cd backend
nano .env
```

Добавьте реальные ключи:
```env
ALPHA_VANTAGE_API_KEY="ваш_реальный_ключ"
FINNHUB_API_KEY="ваш_реальный_ключ"
```

Перезапустите backend.

### Проблема 2: API лимиты превышены

**Симптомы:**
- В логах: `⚠️  Alpha Vantage API rate limit`
- Данные не обновляются

**Решение:**
- Подождите 1 минуту (лимит 5 запросов/мин для Alpha Vantage)
- Или получите premium ключ

### Проблема 3: Кэш содержит старые данные

**Симптомы:**
- Данные не обновляются после изменения ключей

**Решение:**
```bash
# Очистите кэш
curl -X POST http://localhost:3001/api/stocks/clear-cache
curl -X POST http://localhost:3001/api/technical-analysis/cache/clear
curl -X POST http://localhost:3001/api/news-analysis/cache/clear
curl -X POST http://localhost:3001/api/earnings-call/cache/clear

# Перезапустите backend
cd backend
npm run dev
```

---

## 📊 Сравнение: до и после

### До исправления (мок-данные)

| Агент | Цена | RSI | MACD | Новости | Earnings |
|-------|------|-----|------|---------|----------|
| Technical | $355 (случайная) | 61 (случайный) | 1.68 (случайный) | - | - |
| News | - | - | - | 542 (случайное) | - |
| Earnings | - | - | - | - | 82/100 (случайное) |

### После исправления (реальные данные)

| Агент | Цена | RSI | MACD | Новости | Earnings |
|-------|------|-----|------|---------|----------|
| Technical | $480.50 (реальная) | 62.5 (реальный) | 2.15 (реальный) | - | - |
| News | - | - | - | 47 (реальное) | - |
| Earnings | - | - | - | - | 82/100 (реальное) |

---

## ✅ Чеклист успешной проверки

- [ ] API ключи добавлены в `backend/.env`
- [ ] Backend перезапущен
- [ ] В логах видны сообщения `✅ API key configured`
- [ ] Запущен анализ с Technical + News + Earnings агентами
- [ ] В логах видны сообщения `Fetching REAL...`
- [ ] Цена в SESSION PROTOCOL реальная (~$480 для NVDA)
- [ ] Метрики Technical реалистичные (RSI, MACD, SMA)
- [ ] Метрики News реалистичные (Sentiment, Total news)
- [ ] Метрики Earnings реалистичные (Confidence, Evasiveness)
- [ ] В rationale указано `Real data from: tech, news, earn`

---

## 📚 Документация

- **[REAL_DATA_INTEGRATION.md](./REAL_DATA_INTEGRATION.md)** - полное описание изменений
- **[DIAGNOSTICS_GUIDE.md](./DIAGNOSTICS_GUIDE.md)** - диагностика проблем с API ключами
- **[API_KEYS_SETUP.md](./API_KEYS_SETUP.md)** - настройка API ключей

---

**Перезапустите backend и проверьте что в SESSION PROTOCOL отображаются реальные данные!** 🚀
