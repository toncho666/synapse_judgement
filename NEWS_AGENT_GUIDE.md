# 📰 Агент News - Полное руководство

## 🎯 Что делает агент News

Агент **News** специализируется на **анализе новостного сентимента** для акций. Он собирает новости из множества источников за последние 5 дней, анализирует их тональность и генерирует торговые сигналы на основе общего настроения рынка.

---

## 🔄 Как работает анализ

### Шаг 1: Пользователь указывает тикер

На странице агента News (http://localhost:5173/#/agent/news):

1. Введите тикер акции в поле "Enter ticker"
   - Примеры: `AAPL`, `MSFT`, `GOOGL`, `TSLA`, `NVDA`
   - Формат: только заглавные буквы (1-5 символов)

2. Нажмите кнопку **"Analyze News"**

### Шаг 2: Frontend отправляет запрос

```typescript
// frontend/src/hooks/useNewsAnalysis.ts
const response = await fetch(`/api/news-analysis/${ticker}`);
```

**Важно:** Используется относительный путь `/api/...` который проксируется через Vite на backend (http://localhost:3001).

### Шаг 3: Backend получает новости

```typescript
// backend/src/services/news-analysis.service.ts
const news = await fetchNewsFromAlphaVantage(ticker);
```

**Источник данных:** Alpha Vantage News Sentiment API
- Получает до 50 последних новостей
- Фильтрует новости за последние 5 дней
- Каждая новость уже имеет сентимент-оценку от API

### Шаг 4: Анализ и взвешивание

Backend выполняет сложный анализ:

#### 1. **Взвешивание по источнику**
Разные источники имеют разную достоверность:
```typescript
const SOURCE_WEIGHTS = {
  'Bloomberg': 1.0,
  'Reuters': 1.0,
  'Wall Street Journal': 0.95,
  'CNBC': 0.9,
  'MarketWatch': 0.85,
  'Yahoo Finance': 0.7,
  // ...
};
```

#### 2. **Взвешивание по времени**
Свежие новости важнее старых:
```typescript
const timeDecay = Math.exp(-hoursAgo / 24);
// Новости 24-часовой давности имеют вес ~0.6
// Новости 5-дневной давности имеют вес ~0.2
```

#### 3. **Взвешивание по релевантности**
Новости с высокой релевантностью к тикеру важнее:
```typescript
const weight = sourceWeight * timeDecay * relevanceScore;
```

### Шаг 5: Расчёт метрик

#### **Общий сентимент (sentiment.score)**
- Диапазон: от -1 (очень негативный) до +1 (очень позитивный)
- Расчёт: средневзвешенное всех новостей

#### **Тренд (sentiment.trend)**
- `improving` - сентимент улучшается со временем
- `declining` - сентимент ухудшается
- `stable` - сентимент стабилен

Определяется сравнением сентимента за последние 24 часа vs 3 дня.

#### **Статистика**
```typescript
{
  totalNews: 47,              // всего новостей
  positive: 28,               // позитивных (score > 0.15)
  negative: 12,               // негативных (score < -0.15)
  neutral: 7,                 // нейтральных
  positivityRatio: 2.33       // positive / negative
}
```

#### **Временной анализ**
```typescript
{
  last24h: { score: 0.55, count: 12 },   // за последние 24 часа
  last3d: { score: 0.48, count: 29 },    // за последние 3 дня
  last5d: { score: 0.42, count: 47 }     // за последние 5 дней
}
```

#### **Ключевые события**
Топ-5 новостей с наибольшим влиянием:
- Высокий сентимент (|score| > 0.5)
- Высокая релевантность (> 0.7)
- Сортировка по абсолютному значению сентимента

#### **Топ источники**
Топ-5 источников по количеству новостей с их средним сентиментом.

### Шаг 6: Генерация сигнала

На основе анализа генерируется торговый сигнал:

```typescript
if (sentiment.score > 0.2 && positivityRatio > 1.5) {
  signal = 'bull';
  strength = Math.min(100, 50 + sentiment.score * 100);
} else if (sentiment.score < -0.2 && positivityRatio < 0.67) {
  signal = 'bear';
  strength = Math.min(100, 50 + Math.abs(sentiment.score) * 100);
} else {
  signal = 'flat';
  strength = 50;
}
```

**Дополнительные факторы:**
- Тренд (improving/declining) добавляет +10 к силе
- Большой объём новостей (>30) добавляет +5
- Высокая уверенность (>70%) добавляет +5

### Шаг 7: Возврат результата

Backend возвращает JSON:

```json
{
  "success": true,
  "data": {
    "ticker": "AAPL",
    "period": "5d",
    "timestamp": "2026-10-25T20:00:00.000Z",
    
    "sentiment": {
      "score": 0.42,
      "label": "positive",
      "trend": "improving",
      "confidence": 78
    },
    
    "statistics": {
      "totalNews": 47,
      "positive": 28,
      "negative": 12,
      "neutral": 7,
      "positivityRatio": 2.33
    },
    
    "timeAnalysis": {
      "last24h": { "score": 0.55, "count": 12 },
      "last3d": { "score": 0.48, "count": 29 },
      "last5d": { "score": 0.42, "count": 47 }
    },
    
    "keyEvents": [
      {
        "title": "Apple announces record Q4 earnings",
        "sentiment": 0.85,
        "source": "Bloomberg",
        "time": "2026-10-24T15:30:00Z",
        "impact": "high",
        "url": "https://..."
      }
    ],
    
    "topSources": [
      { "name": "Bloomberg", "count": 12, "avgSentiment": 0.45 },
      { "name": "Reuters", "count": 8, "avgSentiment": 0.38 }
    ],
    
    "signal": "bull",
    "strength": 72,
    "reasons": [
      "Strong positive sentiment (0.42)",
      "Improving trend over time",
      "High news volume (47 articles)",
      "High confidence (78%)"
    ]
  }
}
```

### Шаг 8: Frontend отображает результат

Компонент `NewsAnalysisPanel.tsx` отображает:
- ✅ Общий сентимент (score + trend)
- ✅ Статистику (positive/negative/neutral)
- ✅ Временной анализ (24h/3d/5d)
- ✅ Ключевые события (список)
- ✅ Топ источники
- ✅ Сигнал (bull/bear/flat) с объяснением

---

## 📝 Что нужно указать пользователю

### Обязательные данные:

1. **Тикер акции** (обязательно)
   - Формат: заглавные буквы
   - Длина: 1-5 символов
   - Примеры: `AAPL`, `MSFT`, `GOOGL`, `TSLA`, `NVDA`, `META`, `AMZN`

### Что получает пользователь:

1. **Общий сентимент**
   - Score: от -1 до +1
   - Label: positive/negative/neutral
   - Trend: improving/declining/stable
   - Confidence: 0-100%

2. **Статистика новостей**
   - Total News: общее количество
   - Positive: количество позитивных
   - Negative: количество негативных
   - Neutral: количество нейтральных
   - Positivity Ratio: positive / negative

3. **Временной анализ**
   - Last 24h: сентимент за последние 24 часа
   - Last 3d: сентимент за последние 3 дня
   - Last 5d: сентимент за последние 5 дней

4. **Ключевые события**
   - Топ-5 самых важных новостей
   - Заголовок, источник, время
   - Сентимент и влияние (high/medium/low)
   - Ссылка на полную статью

5. **Топ источники**
   - Топ-5 источников по количеству новостей
   - Средний сентимент каждого источника

6. **Торговый сигнал**
   - Signal: bull/bear/flat
   - Strength: 0-100%
   - Reasons: объяснение почему такой сигнал

---

## 🧪 Как протестировать

### Тест 1: Позитивный сентимент

```bash
# Введите тикер с позитивными новостями
# Например: NVDA (NVIDIA) в период роста

# Ожидаемый результат:
# - Sentiment score: > 0.2
# - Signal: BULL
# - Positivity ratio: > 1.5
# - Trend: improving (возможно)
```

### Тест 2: Негативный сентимент

```bash
# Введите тикер с негативными новостями
# Например: акции в период скандала

# Ожидаемый результат:
# - Sentiment score: < -0.2
# - Signal: BEAR
# - Positivity ratio: < 0.67
# - Trend: declining (возможно)
```

### Тест 3: Нейтральный сентимент

```bash
# Введите тикер без значимых новостей
# Например: малоизвестная компания

# Ожидаемый результат:
# - Sentiment score: между -0.2 и 0.2
# - Signal: FLAT
# - Low news volume
```

### Тест 4: API напрямую

```bash
curl http://localhost:3001/api/news-analysis/AAPL
```

**Ожидаемый ответ:** JSON с полным анализом

---

## 📊 Интерпретация результатов

### Sentiment Score

- **+0.5 до +1.0**: Очень позитивный сентимент
- **+0.2 до +0.5**: Позитивный сентимент
- **-0.2 до +0.2**: Нейтральный сентимент
- **-0.5 до -0.2**: Негативный сентимент
- **-1.0 до -0.5**: Очень негативный сентимент

### Positivity Ratio

- **> 2.0**: Сильно позитивный (в 2 раза больше позитивных новостей)
- **1.5 - 2.0**: Умеренно позитивный
- **0.67 - 1.5**: Нейтральный
- **0.5 - 0.67**: Умеренно негативный
- **< 0.5**: Сильно негативный

### Signal Strength

- **80-100%**: Очень сильный сигнал
- **60-80%**: Сильный сигнал
- **40-60%**: Умеренный сигнал
- **20-40%**: Слабый сигнал
- **0-20%**: Очень слабый сигнал

### Trend

- **Improving**: Сентимент улучшается (хорошо для бычьего сигнала)
- **Declining**: Сентимент ухудшается (хорошо для медвежьего сигнала)
- **Stable**: Сентимент стабилен

---

## 🎯 Примеры использования

### Пример 1: Apple (AAPL) - Позитивный сентимент

**Ввод:**
- Тикер: `AAPL`
- Нажать "Analyze News"

**Ожидаемый результат:**
```
Sentiment: +0.42 (positive, improving)
Statistics: 28 positive / 12 negative / 7 neutral
Positivity Ratio: 2.33

Time Analysis:
- Last 24h: +0.55 (12 articles)
- Last 3d: +0.48 (29 articles)
- Last 5d: +0.42 (47 articles)

Key Events:
- "Apple announces record Q4 earnings" (Bloomberg, +0.85, high impact)
- "iPhone sales exceed expectations" (Reuters, +0.72, high impact)

Signal: BULL (strength: 72%)
Reasons:
- Strong positive sentiment (0.42)
- Improving trend over time
- High news volume (47 articles)
- High confidence (78%)
```

### Пример 2: Tesla (TSLA) - Негативный сентимент

**Ввод:**
- Тикер: `TSLA`
- Нажать "Analyze News"

**Ожидаемый результат:**
```
Sentiment: -0.35 (negative, declining)
Statistics: 15 positive / 32 negative / 8 neutral
Positivity Ratio: 0.47

Time Analysis:
- Last 24h: -0.42 (15 articles)
- Last 3d: -0.38 (35 articles)
- Last 5d: -0.35 (55 articles)

Key Events:
- "Tesla faces production delays" (Bloomberg, -0.78, high impact)
- "Regulatory concerns grow" (Reuters, -0.65, high impact)

Signal: BEAR (strength: 85%)
Reasons:
- Strong negative sentiment (-0.35)
- Declining trend over time
- High news volume (55 articles)
- High confidence (82%)
```

---

## 🔧 Технические детали

### API Endpoints

**Backend:**
```
GET /api/news-analysis/:ticker
GET /api/news-analysis/cache/status
POST /api/news-analysis/cache/clear
```

**Frontend:**
- Хук: `useNewsAnalysis(ticker)`
- Компонент: `NewsAnalysisPanel`

### Кэширование

- Длительность: 30 минут
- Причина: новости меняются часто, но не каждую секунду
- Очистка: `POST /api/news-analysis/cache/clear`

### Источники данных

**Alpha Vantage News Sentiment API:**
- Бесплатно: 5 запросов/мин, 500 запросов/день
- Endpoint: `NEWS_SENTIMENT`
- Возвращает: до 50 новостей с сентиментом
- Период: последние 5 дней

### Алгоритм взвешивания

```typescript
finalScore = Σ(sentimentScore × sourceWeight × timeDecay × relevanceScore) / Σ(sourceWeight × timeDecay × relevanceScore)
```

Где:
- `sentimentScore`: сентимент новости от API (-1 до +1)
- `sourceWeight`: вес источника (0.5 до 1.0)
- `timeDecay`: затухание по времени (0 до 1)
- `relevanceScore`: релевантность к тикеру (0 до 1)

---

## 🚀 Следующие улучшения

### 1. Больше источников
- [ ] NewsAPI.org (100 запросов/день бесплатно)
- [ ] Finnhub News (60 запросов/мин)
- [ ] Reddit API (социальные сети)
- [ ] Twitter API (социальные сети)

### 2. Улучшенный сентимент-анализ
- [ ] Использование GPT-4 для анализа заголовков
- [ ] Анализ тональности комментариев
- [ ] Определение сарказма и иронии

### 3. Расширенная аналитика
- [ ] Сравнение с конкурентами
- [ ] Анализ по категориям (продукт, финансы, регуляция)
- [ ] Выявление паттернов (цикличность новостей)

### 4. Визуализация
- [ ] График сентимента по времени
- [ ] Тепловая карта источников
- [ ] Word cloud ключевых слов

### 5. Уведомления
- [ ] Push-уведомления о важных новостях
- [ ] Email дайджест
- [ ] Telegram бот

---

## ✅ Итог

**Агент News полностью реализован!**

### Что делает:
- ✅ Получает новости из Alpha Vantage API
- ✅ Анализирует сентимент за последние 5 дней
- ✅ Взвешивает по источнику, времени и релевантности
- ✅ Рассчитывает общий сентимент и тренд
- ✅ Выделяет ключевые события
- ✅ Генерирует торговый сигнал (bull/bear/flat)

### Что получает пользователь:
- ✅ Полный анализ новостного фона
- ✅ Статистику по позитивным/негативным новостям
- ✅ Временной анализ (24h/3d/5d)
- ✅ Ключевые события с ссылками
- ✅ Топ источники
- ✅ Торговый сигнал с объяснением

### Технические детали:
- ✅ Backend: news-analysis.service.ts
- ✅ Frontend: useNewsAnalysis.ts + NewsAnalysisPanel.tsx
- ✅ API: GET /api/news-analysis/:ticker
- ✅ Кэширование: 30 минут
- ✅ Источник: Alpha Vantage API

**Готово к использованию!** 🚀
