# 📞 Агент Earnings Calls - Полное руководство

## 🎯 Что делает агент Earnings Calls

Агент **Earnings Calls** анализирует транскрипты квартальных звонков компаний с инвесторами и выявляет:

1. **Тональность руководства** - уверенность, уклончивость, оптимизм/пессимизм
2. **Ключевые темы** - что обсуждалось больше всего
3. **Изменения в лексике** - как менялся тон от квартала к кварталу
4. **Guidance vs Consensus** - совпадение прогнозов компании с ожиданиями рынка
5. **Сигналы de-risking** - скрытые предупреждения в речи CEO/CFO

---

## 🔄 Как работает анализ

### Шаг 1: Пользователь указывает тикер

На странице агента Earnings Calls (http://localhost:5173/#/agent/earn):

1. Введите тикер акции в поле "Enter ticker"
   - Примеры: `AAPL`, `MSFT`, `GOOGL`, `TSLA`, `NVDA`
   - Формат: только заглавные буквы (1-5 символов)

2. Нажмите кнопку **"Analyze Calls"**

### Шаг 2: Frontend отправляет запрос

```typescript
// frontend/src/hooks/useEarningsCall.ts
const response = await fetch(`/api/earnings-call/${ticker}`);
```

**Важно:** Используется относительный путь `/api/...` который проксируется через Vite на backend (http://localhost:3001).

### Шаг 3: Backend получает транскрипты

```typescript
// backend/src/services/earnings-call.service.ts
const transcriptsList = await fetchTranscriptsList(ticker);
const transcripts = await Promise.all(
  transcriptsList.map(item => fetchTranscript(item.id))
);
```

**Источник данных:** Finnhub API
- Бесплатно: 60 запросов/мин
- Получает транскрипты последних 4 кварталов
- Каждая транскрипта содержит полный текст звонка

### Шаг 4: Анализ тональности

Backend выполняет комплексный анализ:

#### 1. **Evasiveness Index** (Индекс уклончивости)
```typescript
// Подсчитываем уклончивые фразы в транскрипте
const evasivePhrases = [
  "we might", "could potentially", "uncertain", "challenging environment",
  "headwinds", "cautious", "monitor closely", "difficult to predict"
];

evasivenessIndex = (evasiveCount / totalWords) * 10000;
// 0-20: уверенный тон
// 20-40: умеренно уклончивый
// 40+: сильно уклончивый
```

#### 2. **Confidence Score** (Оценка уверенности)
```typescript
// Подсчитываем уверенные фразы
const confidentPhrases = [
  "we expect", "we are confident", "strong performance", "exceeded expectations",
  "record quarter", "momentum", "optimistic", "well-positioned"
];

confidenceScore = (confidentCount / totalWords) * 10000;
```

#### 3. **Sentiment Shift** (Изменение настроения)
```typescript
// Сравниваем последний квартал с предыдущим
sentimentShift = currentQuarterSentiment - previousQuarterSentiment;
// > 0: улучшение настроения
// < 0: ухудшение настроения
// = 0: стабильно
```

#### 4. **Key Topics** (Ключевые темы)
```typescript
// Анализируем частоту упоминания тем
topics = {
  "AI": countOccurrences("AI", "artificial intelligence", "machine learning"),
  "Cloud": countOccurrences("cloud", "SaaS", "subscription"),
  "Margins": countOccurrences("margin", "profitability", "cost"),
  "Growth": countOccurrences("growth", "expansion", "revenue"),
  // ...
};
```

#### 5. **Guidance vs Consensus**
```typescript
// Сравниваем guidance компании с consensus estimates
guidanceBeat = companyGuidance > consensusEstimate;
guidanceDelta = ((companyGuidance - consensusEstimate) / consensusEstimate) * 100;
```

### Шаг 5: Извлечение ключевых цитат

```typescript
// Ищем уверенные заявления от CEO/CFO
const keyQuotes = transcript.content
  .filter(section => section.speaker === 'CEO' || section.speaker === 'CFO')
  .filter(section => containsConfidentPhrases(section.text))
  .slice(0, 5);
```

### Шаг 6: Генерация сигнала

```typescript
let score = 0;

if (confidenceScore > 70) score += 30;
if (evasivenessIndex < 20) score += 25;
if (guidance.beat && guidance.delta > 3) score += 25;
if (sentimentShift > 10) score += 20;

const signal = score >= 70 ? 'bull' : score <= 30 ? 'bear' : 'flat';
const strength = score;
```

### Шаг 7: Возврат результата

Backend возвращает JSON:

```json
{
  "success": true,
  "data": {
    "ticker": "TSLA",
    "timestamp": "2026-10-25T20:00:00.000Z",
    "period": "Last 4 quarters",
    
    "tone": {
      "evasivenessIndex": 18,
      "confidenceScore": 82,
      "sentimentShift": 15,
      "overallTone": "confident"
    },
    
    "guidance": {
      "companyGuidance": {
        "eps": 0.92,
        "revenue": 43.0
      },
      "consensusEstimate": {
        "eps": 0.88,
        "revenue": 41.6
      },
      "beat": true,
      "delta": 4.5
    },
    
    "keyTopics": [
      { "topic": "AI", "count": 42, "sentiment": 0.6 },
      { "topic": "Growth", "count": 31, "sentiment": 0.4 },
      { "topic": "Margins", "count": 28, "sentiment": 0.3 }
    ],
    
    "keyQuotes": [
      {
        "speaker": "CEO",
        "title": "Chief Executive Officer",
        "text": "We are exceptionally well-positioned for continued growth.",
        "confidence": "high",
        "quarter": "Q4 2026"
      }
    ],
    
    "quarterlyTrend": [
      { "quarter": "Q1 2026", "confidence": 65, "evasiveness": 25, "sentiment": 10 },
      { "quarter": "Q2 2026", "confidence": 70, "evasiveness": 22, "sentiment": 15 },
      { "quarter": "Q3 2026", "confidence": 75, "evasiveness": 18, "sentiment": 20 },
      { "quarter": "Q4 2026", "confidence": 82, "evasiveness": 18, "sentiment": 18 }
    ],
    
    "signal": "bull",
    "strength": 78,
    "reasons": [
      "High confidence score (82/100)",
      "Low evasiveness (18/100)",
      "Positive sentiment shift (+15%)",
      "Guidance beat consensus (+4.5%)"
    ]
  }
}
```

### Шаг 8: Frontend отображает результат

Компонент `EarningsCallPanel.tsx` отображает:
- ✅ Тональность руководства (evasiveness, confidence, sentiment shift)
- ✅ Guidance vs Consensus
- ✅ Квартальный тренд (визуализация)
- ✅ Ключевые темы (список)
- ✅ Ключевые цитаты (список)
- ✅ Торговый сигнал с объяснением

---

## 📝 Что нужно указать пользователю

### Обязательные данные:

1. **Тикер акции** (обязательно)
   - Формат: заглавные буквы
   - Длина: 1-5 символов
   - Примеры: `AAPL`, `MSFT`, `TSLA`, `NVDA`, `GOOGL`

### Что получает пользователь:

1. **Тональность руководства**
   - Evasiveness Index: 0-100 (чем ниже, тем лучше)
   - Confidence Score: 0-100 (чем выше, тем лучше)
   - Sentiment Shift: изменение настроения vs предыдущий квартал
   - Overall Tone: confident/cautious/uncertain

2. **Guidance vs Consensus**
   - Company Guidance: EPS и Revenue от компании
   - Consensus Estimate: ожидания аналитиков
   - Beat: превысил/не превысил ожидания
   - Delta: процент превышения/недовыполнения

3. **Квартальный тренд**
   - Confidence по кварталам
   - Evasiveness по кварталам
   - Sentiment по кварталам

4. **Ключевые темы**
   - Топ-10 обсуждаемых тем
   - Частота упоминания
   - Сентимент по каждой теме

5. **Ключевые цитаты**
   - Топ-5 цитат от CEO/CFO
   - Уровень уверенности (high/medium/low)
   - Квартал

6. **Торговый сигнал**
   - Signal: bull/bear/flat
   - Strength: 0-100%
   - Reasons: объяснение почему такой сигнал

---

## 🧪 Тестирование

### Тест 1: Уверенный рост (BULL)

```bash
# Введите тикер с уверенным руководством
# Например: NVDA (NVIDIA)

# Ожидаемый результат:
# - Confidence Score: > 70
# - Evasiveness Index: < 20
# - Signal: BULL
# - Strength: > 70%
```

### Тест 2: Проблемы (BEAR)

```bash
# Введите тикер с проблемами
# Например: TSLA (Tesla) в период проблем

# Ожидаемый результат:
# - Confidence Score: < 50
# - Evasiveness Index: > 35
# - Signal: BEAR
# - Strength: > 70%
```

### Тест 3: Стабильность (FLAT)

```bash
# Введите тикер стабильной компании
# Например: KO (Coca-Cola)

# Ожидаемый результат:
# - Confidence Score: 50-70
# - Evasiveness Index: 20-35
# - Signal: FLAT
# - Strength: 50%
```

### Тест 4: API напрямую

```bash
curl http://localhost:3001/api/earnings-call/AAPL
```

**Ожидаемый ответ:** JSON с полным анализом

---

## 📊 Интерпретация результатов

### Evasiveness Index

- **0-20** - Уверенный тон, руководство говорит четко
- **20-35** - Умеренно уклончивый, есть неопределенность
- **35-50** - Сильно уклончивый, много неопределенности
- **50+** - Очень уклончивый, серьезные проблемы

### Confidence Score

- **70-100** - Высокая уверенность, сильное руководство
- **50-70** - Умеренная уверенность
- **30-50** - Низкая уверенность
- **0-30** - Очень низкая уверенность, проблемы

### Sentiment Shift

- **> +10** - Значительное улучшение настроения
- **+5 to +10** - Умеренное улучшение
- **-5 to +5** - Стабильно
- **-10 to -5** - Умеренное ухудшение
- **< -10** - Значительное ухудшение

### Guidance Beat

- **> +5%** - Значительное превышение ожиданий
- **+2 to +5%** - Умеренное превышение
- **-2 to +2%** - В рамках ожиданий
- **-5 to -2%** - Умеренное недовыполнение
- **< -5%** - Значительное недовыполнение

---

## 🎯 Примеры использования

### Пример 1: NVIDIA (NVDA) - Уверенный рост

**Ввод:**
- Тикер: `NVDA`
- Нажмите "Analyze Calls"

**Ожидаемый результат:**
```
Tone:
- Evasiveness: 12/100 ✅ (очень уверенный)
- Confidence: 85/100 ✅ (сильная уверенность)
- Sentiment Shift: +22% ✅ (улучшение)
- Overall: Confident

Guidance:
- EPS: $0.95 vs $0.88 (consensus)
- Beat: +8.0% ✅

Signal: BULL (strength: 92%)
Reasons:
- High confidence score (85/100)
- Low evasiveness (12/100)
- Strong guidance beat (+8.0%)
- Positive sentiment shift (+22%)
```

### Пример 2: Tesla (TSLA) - Проблемы

**Ввод:**
- Тикер: `TSLA`
- Нажмите "Analyze Calls"

**Ожидаемый результат:**
```
Tone:
- Evasiveness: 45/100 ❌ (уклончивый)
- Confidence: 38/100 ❌ (низкая уверенность)
- Sentiment Shift: -18% ❌ (ухудшение)
- Overall: Uncertain

Guidance:
- EPS: $0.75 vs $0.82 (consensus)
- Beat: -8.5% ❌

Signal: BEAR (strength: 78%)
Reasons:
- Low confidence score (38/100)
- High evasiveness (45/100)
- Guidance missed consensus (-8.5%)
- Negative sentiment shift (-18%)
```

### Пример 3: Coca-Cola (KO) - Стабильность

**Ввод:**
- Тикер: `KO`
- Нажмите "Analyze Calls"

**Ожидаемый результат:**
```
Tone:
- Evasiveness: 22/100 (умеренно)
- Confidence: 55/100 (умеренно)
- Sentiment Shift: +2% (стабильно)
- Overall: Cautious

Guidance:
- EPS: $0.68 vs $0.67 (consensus)
- Beat: +1.5% (в рамках ожиданий)

Signal: FLAT (strength: 52%)
Reasons:
- Moderate confidence (55/100)
- Moderate evasiveness (22/100)
- Guidance in line with consensus (+1.5%)
- Stable sentiment (+2%)
```

---

## 🔧 Настройка

### Изменить список уклончивых фраз

Откройте `backend/src/services/earnings-call.service.ts`:

```typescript
const EVASIVE_PHRASES = [
  'we might', 'could potentially', 'uncertain', // Добавьте свои фразы
  // ...
];
```

### Изменить список уверенных фраз

```typescript
const CONFIDENT_PHRASES = [
  'we expect', 'we are confident', 'strong performance', // Добавьте свои фразы
  // ...
];
```

### Изменить ключевые темы

```typescript
const TOPIC_KEYWORDS: Record<string, string[]> = {
  'AI': ['ai', 'artificial intelligence', 'machine learning'], // Добавьте свои темы
  // ...
};
```

### Изменить пороги для сигналов

```typescript
if (confidenceScore > 70) { // Измените порог
  score += 30;
}
```

---

## 🐛 Решение проблем

### Проблема: "No transcripts found"

**Причина:** Finnhub API не нашёл транскриптов для тикера

**Решение:**
- Проверьте что API ключ настроен в `backend/.env`
- Проверьте что тикер правильный
- Система автоматически использует мок-данные если API недоступен

### Проблема: "Finnhub API key not configured"

**Решение:**
```bash
# Добавьте в backend/.env
FINNHUB_API_KEY=your_finnhub_api_key_here

# Перезапустите backend
cd backend
npm run dev
```

### Проблема: Данные не обновляются

**Причина:** Кэш ещё актуален (< 1 часа)

**Решение:**
```bash
# Принудительное обновление
curl -X POST http://localhost:3001/api/earnings-call/cache/clear
```

---

## 📚 Полезные ссылки

- **Finnhub API**: https://finnhub.io/docs/api
- **Регистрация**: https://finnhub.io/register
- **Лимиты**: 60 calls/minute (бесплатно)

---

## 🎯 Следующие шаги

1. ✅ Получить Finnhub API ключ
2. ✅ Добавить ключ в `backend/.env`
3. ✅ Перезапустить backend
4. ✅ Проверить работу API: `curl http://localhost:3001/api/earnings-call/AAPL`
5. ✅ Открыть frontend: http://localhost:5173/#/agent/earn
6. ✅ Ввести тикер и нажать "Analyze Calls"

---

**Готово к использованию!** 🚀
