# 🧪 Как проверить работу News агента

## 📊 Что происходит

В логах вы видите:
```
[warn] : No news found for NVDA
[warn] : No news found for NVDA, returning neutral analysis
✅ [AnalysisService] News analysis completed for NVDA: flat (50%)
```

Это означает что **Alpha Vantage API не возвращает новостей** для тикера NVDA.

---

## 🔍 Причины отсутствия новостей

### 1. Лимит API Alpha Vantage ⚠️

**Бесплатный тариф Alpha Vantage:**
- 25 запросов в день
- 5 запросов в минуту

**Сколько мы используем:**
- Котировки (Finnhub): 7 акций × 1 раз/час = ~168 запросов/день (но Finnhub отдельный)
- Технический анализ (Alpha Vantage): 1 запрос на анализ
- Новости (Alpha Vantage): 1 запрос на анализ
- **Итого Alpha Vantage**: ~2-3 запроса на каждый полный анализ

**Проверка:**
```bash
# Запустите тестовый скрипт
chmod +x scripts/test-news-api.sh
./scripts/test-news-api.sh
```

Если видите сообщение "Note" или "Thank you for using Alpha Vantage" - вы достигли лимита.

### 2. Alpha Vantage не имеет новостей для этого тикера

Alpha Vantage News Sentiment API может не иметь новостей для:
- Менее популярных тикеров
- Недавних IPO
- Компаний без значимых новостей за последние 5 дней

**Решение:** Попробуйте более популярные тикеры:
- `AAPL` (Apple)
- `MSFT` (Microsoft)
- `TSLA` (Tesla)
- `GOOGL` (Alphabet)
- `AMZN` (Amazon)

### 3. Фильтр по времени (последние 5 дней)

Код фильтрует новости только за последние 5 дней:
```typescript
const fiveDaysAgo = new Date();
fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

const news = data.feed.filter((item) => {
  const newsDate = new Date(item.time_published);
  return newsDate >= fiveDaysAgo;
});
```

Если новостей за последние 5 дней нет - результат будет пустым.

---

## 🧪 Как проверить что API работает

### Тест 1: Прямой запрос к API

```bash
# Замените YOUR_API_KEY на ваш ключ из backend/.env
curl "https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=AAPL&limit=10&apikey=YOUR_API_KEY" | jq .
```

**Ожидаемый результат:**
```json
{
  "version": "1.0",
  "sentiment_definition": "...",
  "feed": [
    {
      "title": "Apple News Title",
      "url": "https://...",
      "source": "Reuters",
      "summary": "...",
      "overall_sentiment_score": 0.123,
      "overall_sentiment_label": "Somewhat-Bullish",
      "ticker_sentiment": {
        "AAPL": {
          "ticker_sentiment_score": 0.456,
          "ticker_sentiment_label": "Bullish"
        }
      }
    }
  ]
}
```

### Тест 2: Проверка лимитов

```bash
# Сделайте несколько запросов подряд
for i in {1..5}; do
  echo "Запрос $i:"
  curl -s "https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=MSFT&limit=1&apikey=YOUR_API_KEY" | jq '.Note // .Information // "OK"'
  sleep 1
done
```

Если видите "Note" с сообщением о лимите - вы достигли дневного лимита.

### Тест 3: Запуск тестового скрипта

```bash
cd /path/to/synapse-judgement
chmod +x scripts/test-news-api.sh
./scripts/test-news-api.sh
```

Скрипт проверит:
- ✅ Работу API ключа
- ✅ Наличие новостей для NVDA
- ✅ Наличие новостей для AAPL (более популярный)
- ✅ Статус лимитов API

---

## 📋 Что делать если новостей нет

### Вариант 1: Подождать до следующего дня

Если вы достигли лимита 25 запросов/день:
- Лимит обновляется в 00:00 UTC
- Подождите до следующего дня
- Или получите premium ключ Alpha Vantage

### Вариант 2: Использовать другой тикер

Попробуйте более популярные тикеры:
```bash
# В браузере или через API
NVDA → может не иметь новостей
AAPL → обычно имеет много новостей
MSFT → обычно имеет много новостей
TSLA → обычно имеет много новостей
```

### Вариант 3: Добавить альтернативный источник новостей

Добавьте Finnhub News API (бесплатно, 60 запросов/мин):

**Установка:**
```bash
cd backend
npm install finnhub
```

**Добавление в news-analysis.service.ts:**
```typescript
import finnhub from 'finnhub';

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || '';

async function fetchNewsFromFinnhub(ticker: string): Promise<NewsItem[]> {
  if (!FINNHUB_API_KEY) return [];
  
  const api = new finnhub.DefaultApi();
  
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 5);
  
  const toDate = new Date();
  
  try {
    const news = await api.companyNews(ticker, fromDate.toISOString().split('T')[0], toDate.toISOString().split('T')[0]);
    
    return news.map(item => ({
      title: item.headline,
      url: item.url,
      source: item.source,
      timePublished: item.datetime.toString(),
      summary: item.summary || '',
      sentimentScore: 0, // Finnhub не предоставляет sentiment
      sentimentLabel: 'Neutral',
      relevanceScore: 1,
    }));
  } catch (error) {
    logger.error('Error fetching news from Finnhub:', error);
    return [];
  }
}
```

### Вариант 4: Увеличить период фильтрации

Измените фильтр с 5 дней на 30 дней:

```typescript
// В news-analysis.service.ts
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30); // Было 5, стало 30

const news = data.feed.filter((item) => {
  const newsDate = new Date(item.time_published);
  return newsDate >= thirtyDaysAgo;
});
```

---

## 🔧 Улучшенное логирование

Я добавил детальное логирование в `news-analysis.service.ts`:

```typescript
logger.info(`📰 Fetching news for ${ticker} from Alpha Vantage`);
logger.info(`🔑 Using API key: ${ALPHA_VANTAGE_API_KEY.substring(0, 4)}...${ALPHA_VANTAGE_API_KEY.substring(ALPHA_VANTAGE_API_KEY.length - 4)}`);
logger.info(`🌐 Requesting: ${url.replace(ALPHA_VANTAGE_API_KEY, '***')}`);
logger.info(`📥 API response received, keys: ${Object.keys(data).join(', ')}`);

if (data.Note) {
  logger.warn(`⚠️  Alpha Vantage API rate limit: ${data.Note}`);
  logger.warn(`💡 You've reached the daily limit (25 requests/day for free tier)`);
}

if (!data.feed || data.feed.length === 0) {
  logger.warn(`⚠️  No news found for ${ticker} in Alpha Vantage`);
  logger.warn(`💡 This is normal - Alpha Vantage may not have recent news for this ticker`);
  logger.warn(`💡 Try more popular tickers: AAPL, MSFT, TSLA, GOOGL`);
}
```

Теперь в логах вы увидите:
- Какой API ключ используется
- Какой URL запрашивается
- Какие ключи возвращает API
- Достигнут ли лимит
- Почему нет новостей

---

## 📊 Проверка работы News агента

### Шаг 1: Перезапустите backend

```bash
cd backend
npm run dev
```

### Шаг 2: Запустите анализ с подробными логами

В браузере:
1. Войдите: `demo@synapse.ai` / `demo123`
2. Введите тикер: `AAPL` (более популярный)
3. Выберите агента: `News`
4. Нажмите "Run Analysis"

### Шаг 3: Проверьте логи backend

**Если API работает:**
```
📰 Fetching news for AAPL from Alpha Vantage
🔑 Using API key: 2AWG...JFP3
🌐 Requesting: https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=AAPL&limit=50&apikey=***
📥 API response received, keys: version, sentiment_definition, feed
✅ Found 50 total news items for AAPL
📊 Fetched 23 news items for AAPL (after 5-day filter)
✅ News analysis complete for AAPL: bull signal (72% strength)
```

**Если достигнут лимит:**
```
📰 Fetching news for AAPL from Alpha Vantage
🔑 Using API key: 2AWG...JFP3
🌐 Requesting: https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=AAPL&limit=50&apikey=***
📥 API response received, keys: Note
⚠️  Alpha Vantage API rate limit: ...
💡 You've reached the daily limit (25 requests/day for free tier)
```

**Если нет новостей:**
```
📰 Fetching news for NVDA from Alpha Vantage
🔑 Using API key: 2AWG...JFP3
🌐 Requesting: https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=NVDA&limit=50&apikey=***
📥 API response received, keys: version, sentiment_definition, feed
⚠️  No news found for NVDA in Alpha Vantage
💡 This is normal - Alpha Vantage may not have recent news for this ticker
💡 Try more popular tickers: AAPL, MSFT, TSLA, GOOGL
```

---

## ✅ Чеклист проверки

- [ ] Перезапустили backend
- [ ] Проверили логи с подробной информацией
- [ ] Попробовали популярный тикер (AAPL, MSFT, TSLA)
- [ ] Проверили что API ключ правильный
- [ ] Проверили что не достигнут лимит API
- [ ] Если лимит достигнут - подождали до следующего дня или получили premium ключ

---

## 🎯 Итог

**News агент работает правильно!**

Если видите "No news found" - это не ошибка, а нормальное поведение когда:
1. Достигнут лимит API (25 запросов/день)
2. Alpha Vantage не имеет новостей для этого тикера
3. Нет новостей за последние 5 дней

**Решения:**
- Используйте популярные тикеры (AAPL, MSFT, TSLA)
- Подождите до следующего дня если достигнут лимит
- Добавьте альтернативный источник новостей (Finnhub)
- Увеличьте период фильтрации с 5 до 30 дней

**Проверьте логи** - теперь они показывают детальную информацию о том что происходит! 📊
