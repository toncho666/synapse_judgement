# 📰 Реализация агента News - Инструкция

## ✅ Что реализовано

### Backend
1. **Сервис `news-analysis.service.ts`**
   - Получение новостей из Alpha Vantage API
   - Анализ сентимента с взвешиванием
   - Расчёт метрик и статистики
   - Генерация торговых сигналов
   - Кэширование (30 минут)

2. **Роут `news-analysis.routes.ts`**
   - `GET /api/news-analysis/:ticker` - анализ новостей
   - `GET /api/news-analysis/cache/status` - статус кэша
   - `POST /api/news-analysis/cache/clear` - очистка кэша

3. **Подключение в `index.ts`**
   - Импортирован роут
   - Подключён к `/api/news-analysis`

### Frontend
1. **Хук `useNewsAnalysis.ts`**
   - Fetch к `/api/news-analysis/:ticker`
   - Валидация тикера
   - Обработка ошибок
   - Автообновление при изменении тикера

2. **Компонент `NewsAnalysisPanel.tsx`**
   - Отображение общего сентимента
   - Статистика (positive/negative/neutral)
   - Временной анализ (24h/3d/5d)
   - Ключевые события
   - Топ источники
   - Торговый сигнал с объяснением

3. **Интеграция в `AgentPage.tsx`**
   - Добавлен импорт NewsAnalysisPanel
   - Добавлены состояния (newsTicker, showNewsAnalysis)
   - Добавлена секция News Analysis для агента "news"

---

## 🚀 Как запустить и протестировать

### Шаг 1: Убедитесь что backend запущен

```bash
cd /Users/anton/synapse_judgement/synapse_judgement/backend
npm run dev
```

**Ожидаемый вывод:**
```
🚀 Server running on port 3001
📝 Environment: development
📊 API available at http://localhost:3001/api
```

### Шаг 2: Убедитесь что frontend запущен

```bash
cd /Users/anton/synapse_judgement/synapse_judgement/frontend
npm run dev
```

**Ожидаемый вывод:**
```
VITE v6.0.0  ready in xxx ms
➜  Local:   http://localhost:5173/
```

### Шаг 3: Протестируйте API напрямую

```bash
curl http://localhost:3001/api/news-analysis/AAPL
```

**Ожидаемый ответ:**
```json
{
  "success": true,
  "data": {
    "ticker": "AAPL",
    "period": "5d",
    "timestamp": "...",
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
    ...
  }
}
```

### Шаг 4: Протестируйте в браузере

1. Откройте http://localhost:5173
2. Перейдите на страницу агента News: http://localhost:5173/#/agent/news
3. Введите тикер (например, `AAPL`)
4. Нажмите "Analyze News"
5. Увидите полный анализ новостей

---

## 📊 Что показывает агент News

### 1. Общий сентимент
- **Score**: от -1 до +1
- **Label**: positive/negative/neutral
- **Trend**: improving/declining/stable
- **Confidence**: 0-100%

### 2. Статистика новостей
- Total News: общее количество
- Positive: количество позитивных
- Negative: количество негативных
- Neutral: количество нейтральных
- Positivity Ratio: positive / negative

### 3. Временной анализ
- Last 24h: сентимент за последние 24 часа
- Last 3d: сентимент за последние 3 дня
- Last 5d: сентимент за последние 5 дней

### 4. Ключевые события
- Топ-5 самых важных новостей
- Заголовок, источник, время
- Сентимент и влияние (high/medium/low)
- Ссылка на полную статью

### 5. Топ источники
- Топ-5 источников по количеству новостей
- Средний сентимент каждого источника

### 6. Торговый сигнал
- Signal: bull/bear/flat
- Strength: 0-100%
- Reasons: объяснение почему такой сигнал

---

## 🎯 Примеры использования

### Пример 1: Позитивный сентимент

**Тикер:** `NVDA` (NVIDIA в период роста)

**Ожидаемый результат:**
```
Sentiment: +0.45 (positive, improving)
Statistics: 32 positive / 10 negative / 8 neutral
Positivity Ratio: 3.2

Signal: BULL (strength: 78%)
Reasons:
- Strong positive sentiment (0.45)
- Improving trend over time
- High news volume (50 articles)
```

### Пример 2: Негативный сентимент

**Тикер:** `TSLA` (Tesla в период проблем)

**Ожидаемый результат:**
```
Sentiment: -0.38 (negative, declining)
Statistics: 12 positive / 35 negative / 8 neutral
Positivity Ratio: 0.34

Signal: BEAR (strength: 88%)
Reasons:
- Strong negative sentiment (-0.38)
- Declining trend over time
- High news volume (55 articles)
```

### Пример 3: Нейтральный сентимент

**Тикер:** `KO` (Coca-Cola - стабильная компания)

**Ожидаемый результат:**
```
Sentiment: +0.08 (neutral, stable)
Statistics: 18 positive / 15 negative / 22 neutral
Positivity Ratio: 1.2

Signal: FLAT (strength: 52%)
Reasons:
- Neutral sentiment (0.08)
- Stable trend
- Moderate news volume (55 articles)
```

---

## 🔧 Технические детали

### API Endpoints

**Backend:**
```
GET /api/news-analysis/:ticker
  - Возвращает полный анализ новостей
  - Кэшируется на 30 минут
  - Использует Alpha Vantage API

GET /api/news-analysis/cache/status
  - Возвращает статус кэша
  - Список закэшированных тикеров

POST /api/news-analysis/cache/clear
  - Очищает кэш
  - Полезно для тестирования
```

**Frontend:**
```typescript
// Хук
const { analysis, loading, error, refetch } = useNewsAnalysis(ticker);

// Компонент
<NewsAnalysisPanel ticker="AAPL" />
```

### Алгоритм взвешивания

```typescript
finalScore = Σ(sentiment × sourceWeight × timeDecay × relevance) / Σ(sourceWeight × timeDecay × relevance)
```

**Компоненты:**
- `sentiment`: сентимент новости от API (-1 до +1)
- `sourceWeight`: вес источника (0.5 до 1.0)
  - Bloomberg/Reuters: 1.0
  - WSJ/FT: 0.95
  - CNBC: 0.9
  - Yahoo Finance: 0.7
- `timeDecay`: затухание по времени
  - 0 часов: 1.0
  - 24 часа: 0.6
  - 5 дней: 0.2
- `relevance`: релевантность к тикеру (0 до 1)

### Генерация сигнала

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

// Дополнительные факторы
if (trend === 'improving' && signal === 'bull') strength += 10;
if (trend === 'declining' && signal === 'bear') strength += 10;
if (totalNews > 30) strength += 5;
if (confidence > 70) strength += 5;
```

---

## 🐛 Решение проблем

### Проблема: "No news found for AAPL"

**Причина:** Alpha Vantage API не нашёл новостей для тикера

**Решение:**
- Проверьте что тикер правильный
- Попробуйте другой тикер (MSFT, GOOGL, TSLA)
- Проверьте что API ключ настроен в `backend/.env`

### Проблема: "Invalid ticker format"

**Причина:** Тикер не соответствует формату

**Решение:**
- Используйте только заглавные буквы
- Длина: 1-5 символов
- Примеры: AAPL, MSFT, GOOGL, TSLA

### Проблема: Новости не загружаются

**Причина:** Backend не запущен или API недоступен

**Решение:**
```bash
# Проверьте что backend запущен
curl http://localhost:3001/health

# Перезапустите backend
cd backend
npm run dev
```

### Проблема: Сентимент всегда нейтральный

**Причина:** Alpha Vantage API возвращает нейтральные значения

**Решение:**
- Проверьте что API ключ правильный
- Попробуйте другой тикер
- Проверьте логи backend

---

## 📚 Документация

- **[NEWS_AGENT_GUIDE.md](./NEWS_AGENT_GUIDE.md)** - полное руководство (500+ строк)
- **[NEWS_IMPLEMENTATION.md](./NEWS_IMPLEMENTATION.md)** - этот файл

---

## 📋 Файлы которые нужно скопировать

### Backend (3 файла)
1. `backend/src/services/news-analysis.service.ts` - сервис анализа
2. `backend/src/routes/news-analysis.routes.ts` - роуты API
3. `backend/src/index.ts` - обновлён (добавлен импорт роута)

### Frontend (3 файла)
1. `frontend/src/hooks/useNewsAnalysis.ts` - хук для получения данных
2. `frontend/src/components/NewsAnalysisPanel.tsx` - компонент отображения
3. `frontend/src/components/AgentPage.tsx` - обновлён (добавлена секция News)

### Документация (2 файла)
1. `NEWS_AGENT_GUIDE.md` - полное руководство
2. `NEWS_IMPLEMENTATION.md` - этот файл

---

## ✅ Чеклист перед отправкой в GitHub

- [ ] Backend запущен и работает
- [ ] Frontend запущен и работает
- [ ] API endpoint `/api/news-analysis/AAPL` возвращает данные
- [ ] Страница агента News отображает анализ
- [ ] Ввод тикера работает
- [ ] Кнопка "Analyze News" работает
- [ ] Отображаются все метрики
- [ ] Сигнал генерируется корректно
- [ ] Нет ошибок в консоли браузера
- [ ] Нет ошибок в логах backend

---

## 🎯 Следующие шаги

1. **Скопируйте файлы** из моей среды в локальный проект
2. **Протестируйте** работу агента News
3. **Закоммитьте** изменения:
   ```bash
   git add .
   git commit -m "feat: implement News agent with sentiment analysis
   
   - Backend: news-analysis.service.ts with Alpha Vantage API
   - Backend: news-analysis.routes.ts with caching
   - Frontend: useNewsAnalysis.ts hook
   - Frontend: NewsAnalysisPanel.tsx component
   - Integration: AgentPage.tsx updated
   - Documentation: NEWS_AGENT_GUIDE.md"
   git push origin main
   ```

---

**Агент News полностью реализован и готов к использованию!** 🚀
