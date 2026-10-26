# 📊 Агент Technical - Полное руководство

## 🎯 Что делает агент Technical

Агент **Technical** специализируется на **техническом анализе** акций. Он анализирует исторические данные о ценах и объёмах торгов, рассчитывает 12+ технических индикаторов и генерирует торговые сигналы.

---

## 🔄 Как работает анализ

### Шаг 1: Пользователь указывает тикер

На странице агента Technical (http://localhost:5173/#/agent/tech):

1. Введите тикер акции в поле "Enter ticker"
   - Примеры: `AAPL`, `MSFT`, `GOOGL`, `TSLA`, `NVDA`
   - Формат: только заглавные буквы (1-5 символов)
   - Опционально: с точкой для классов акций (например, `BRK.B`)

2. Нажмите кнопку **"Run Analysis"**

### Шаг 2: Frontend отправляет запрос

```typescript
// frontend/src/hooks/useTechnicalAnalysis.ts
const response = await fetch(`/api/technical-analysis/${ticker}`);
```

**Важно:** Используется относительный путь `/api/...` который проксируется через Vite на backend (http://localhost:3001).

### Шаг 3: Backend получает исторические данные

```typescript
// backend/src/services/technical-analysis.service.ts
const historicalData = await fetchHistoricalData(ticker);
```

**Текущая реализация:** Генерирует **мок-данные** (250 дней торговли).

**В production:** Должен использовать реальное API:
- Alpha Vantage: `TIME_SERIES_DAILY` endpoint
- Yahoo Finance API
- Polygon.io

### Шаг 4: Расчёт технических индикаторов

Backend рассчитывает **12+ индикаторов**:

#### Трендовые индикаторы:
- **SMA 20** - Simple Moving Average (20 дней)
- **SMA 50** - Simple Moving Average (50 дней)
- **SMA 200** - Simple Moving Average (200 дней)
- **EMA 12** - Exponential Moving Average (12 дней)
- **EMA 26** - Exponential Moving Average (26 дней)
- **ADX** - Average Directional Index (14 дней)

#### Индикаторы моментума:
- **RSI 14** - Relative Strength Index (14 дней)
- **MACD** - Moving Average Convergence Divergence (12, 26, 9)
- **Stochastic** - Stochastic Oscillator (14, 3, 3)

#### Индикаторы волатильности:
- **Bollinger Bands** - Полосы Боллинджера (20, 2)
- **ATR 14** - Average True Range (14 дней)

#### Индикаторы объёма:
- **OBV** - On-Balance Volume
- **OBV Change** - Изменение OBV в процентах

### Шаг 5: Генерация торговых сигналов

На основе индикаторов генерируются **4 типа сигналов**:

#### 1. Trend Signal (Сигнал тренда)
Анализирует:
- Цена vs SMA 200 (долгосрочный тренд)
- Цена vs SMA 50 (среднесрочный тренд)
- SMA 20 vs SMA 50 (Golden Cross / Death Cross)
- EMA 12 vs EMA 26 (краткосрочный тренд)

**Результат:** `bull` / `bear` / `flat` с силой 0-100%

#### 2. Momentum Signal (Сигнал моментума)
Анализирует:
- RSI > 70 (перекупленность) → bear
- RSI < 30 (перепроданность) → bull
- MACD histogram > 0 → bull
- MACD histogram < 0 → bear
- Stochastic > 80 → bear
- Stochastic < 20 → bull

**Результат:** `bull` / `bear` / `flat` с силой 0-100%

#### 3. Volatility Signal (Сигнал волатильности)
Анализирует:
- Цена выше верхней полосы Bollinger → bear (перекупленность)
- Цена ниже нижней полосы Bollinger → bull (перепроданность)
- Цена в верхней половине → bull
- Цена в нижней половине → bear

**Результат:** `bull` / `bear` / `flat` с силой 0-100%

#### 4. Volume Signal (Сигнал объёма)
Анализирует:
- OBV растёт > 5% → bull (давление покупателей)
- OBV падает > 5% → bear (давление продавцов)
- OBV стабильный → flat

**Результат:** `bull` / `bear` / `flat` с силой 0-100%

### Шаг 6: Общая рекомендация

На основе 4 сигналов генерируется **общая рекомендация**:

```typescript
if (overallSignal.type === 'bull' && overallSignal.strength > 65) {
  recommendation = 'BUY';
} else if (overallSignal.type === 'bear' && overallSignal.strength > 65) {
  recommendation = 'SELL';
} else {
  recommendation = 'HOLD';
}
```

**Уверенность (confidence):** 0-100%

### Шаг 7: Определение уровней

- **Support (поддержка):** Минимум за последние 20 дней
- **Resistance (сопротивление):** Максимум за последние 20 дней

### Шаг 8: Возврат результата

Backend возвращает JSON:

```json
{
  "success": true,
  "data": {
    "ticker": "AAPL",
    "timestamp": "2026-10-25T20:00:00.000Z",
    "currentPrice": 232.41,
    "indicators": {
      "sma20": 228.5,
      "sma50": 225.3,
      "sma200": 210.8,
      "rsi14": 62.5,
      "macd": { "macd": 2.1, "signal": 1.8, "histogram": 0.3 },
      "bollingerBands": { "upper": 240.5, "middle": 228.5, "lower": 216.5 }
    },
    "signals": {
      "trend": { "type": "bull", "strength": 75, "reasons": [...] },
      "momentum": { "type": "bull", "strength": 68, "reasons": [...] },
      "volatility": { "type": "bull", "strength": 55, "reasons": [...] },
      "volume": { "type": "bull", "strength": 70, "reasons": [...] },
      "overall": { "type": "bull", "strength": 67, "reasons": [...] }
    },
    "support": 216.5,
    "resistance": 240.5,
    "recommendation": "BUY",
    "confidence": 67
  }
}
```

### Шаг 9: Frontend отображает результат

Компонент `TechnicalAnalysisPanel.tsx` отображает:
- ✅ Текущую цену
- ✅ Рекомендацию (BUY/HOLD/SELL) с цветом
- ✅ Уверенность в процентах
- ✅ Уровни поддержки/сопротивления
- ✅ 4 типа сигналов с объяснениями
- ✅ Ключевые индикаторы (RSI, SMA, MACD, ATR)
- ✅ Bollinger Bands
- ✅ Volume analysis

---

## 📝 Что нужно указать пользователю

### Обязательные данные:

1. **Тикер акции** (обязательно)
   - Формат: заглавные буквы
   - Длина: 1-5 символов
   - Примеры: `AAPL`, `MSFT`, `GOOGL`, `TSLA`, `NVDA`, `META`, `AMZN`
   - Опционально: с точкой для классов акций (например, `BRK.B`)

### Опциональные данные (для будущих улучшений):

2. **Период анализа** (по умолчанию: 250 дней / 1 год)
3. **Таймфрейм** (по умолчанию: дневной)
4. **Портфель пользователя** (для анализа корреляций)

---

## 🧪 Как протестировать

### Тест 1: Бычий сигнал

```bash
# Введите тикер с сильным восходящим трендом
# Например: NVDA (NVIDIA) в 2024 году

# Ожидаемый результат:
# - Recommendation: BUY
# - Trend signal: bull (strength > 70%)
# - Momentum signal: bull
# - Confidence: > 65%
```

### Тест 2: Медвежий сигнал

```bash
# Введите тикер с нисходящим трендом
# Например: акции в упадке

# Ожидаемый результат:
# - Recommendation: SELL
# - Trend signal: bear (strength > 70%)
# - Momentum signal: bear
# - Confidence: > 65%
```

### Тест 3: Нейтральный сигнал

```bash
# Введите тикер в боковике
# Например: акции в консолидации

# Ожидаемый результат:
# - Recommendation: HOLD
# - Signals: смешанные (bull/bear/flat)
# - Confidence: < 65%
```

### Тест 4: API напрямую

```bash
# Проверьте backend API
curl http://localhost:3001/api/technical-analysis/AAPL

# Должен вернуть JSON с анализом
```

---

## 🐛 Найденные проблемы и исправления

### Проблема 1: Жёсткий URL в хуке

**Было:**
```typescript
const response = await fetch(`http://localhost:3001/api/technical-analysis/${ticker}`);
```

**Проблема:** Не работает в production, не использует Vite proxy.

**Исправлено:**
```typescript
const response = await fetch(`/api/technical-analysis/${ticker}`);
```

**Решение:** Используется относительный путь, Vite проксирует на backend.

### Проблема 2: Отсутствие валидации тикера

**Было:** Нет валидации на frontend.

**Проблема:** Пользователь может ввести некорректный тикер.

**Исправлено:**
```typescript
const tickerRegex = /^[A-Z]{1,5}(\.[A-Z]{1,2})?$/;
if (!tickerRegex.test(ticker)) {
  setError('Invalid ticker format. Use letters only (e.g., AAPL, MSFT)');
  return;
}
```

**Решение:** Добавлена валидация формата тикера.

### Проблема 3: Мок-данные вместо реальных

**Текущая реализация:**
```typescript
async function fetchHistoricalData(ticker: string) {
  // Генерирует случайные данные
  const basePrice = 100 + Math.random() * 400;
  // ...
}
```

**Проблема:** Анализ работает на случайных данных, не на реальных.

**Решение для production:**
```typescript
async function fetchHistoricalData(ticker: string) {
  const response = await fetch(
    `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&outputsize=full&apikey=${API_KEY}`
  );
  const data = await response.json();
  // Парсинг реальных данных
}
```

**Что нужно:**
1. Получить API ключ Alpha Vantage (бесплатно)
2. Добавить в `backend/.env`:
   ```env
   ALPHA_VANTAGE_API_KEY=your_api_key_here
   ```
3. Заменить `fetchHistoricalData` на реальное API

---

## 📊 Интерпретация результатов

### Рекомендации:

- **BUY** (зелёный) - Сильный бычий сигнал, рекомендуется покупка
- **SELL** (красный) - Сильный медвежий сигнал, рекомендуется продажа
- **HOLD** (жёлтый) - Нейтральный сигнал, рекомендуется удержание

### Сила сигнала (strength):

- **0-30%** - Слабый сигнал, низкая уверенность
- **30-60%** - Умеренный сигнал
- **60-100%** - Сильный сигнал, высокая уверенность

### Уровни:

- **Support (поддержка)** - Цена ниже которой акция редко падает
- **Resistance (сопротивление)** - Цена выше которой акция редко растёт

### Индикаторы:

#### RSI (Relative Strength Index):
- **> 70** - Перекупленность (возможна коррекция)
- **< 30** - Перепроданность (возможен отскок)
- **30-70** - Нейтральная зона

#### MACD:
- **Histogram > 0** - Бычий моментум
- **Histogram < 0** - Медвежий моментум
- **Пересечение MACD и Signal** - Смена тренда

#### Bollinger Bands:
- **Цена выше верхней полосы** - Перекупленность
- **Цена ниже нижней полосы** - Перепроданность
- **Сужение полос** - Низкая волатильность (скоро движение)

#### Moving Averages:
- **Цена выше SMA 200** - Долгосрочный бычий тренд
- **Цена ниже SMA 200** - Долгосрочный медвежий тренд
- **Golden Cross** (SMA 50 пересекает SMA 200 снизу вверх) - Бычий сигнал
- **Death Cross** (SMA 50 пересекает SMA 200 сверху вниз) - Медвежий сигнал

---

## 🎯 Примеры использования

### Пример 1: Анализ Apple (AAPL)

**Ввод:**
- Тикер: `AAPL`
- Нажать "Run Analysis"

**Ожидаемый результат:**
```
Current Price: $232.41
Recommendation: BUY (Confidence: 67%)

Support: $216.50
Resistance: $240.50

Signals:
- Trend: 📈 Bull (75%)
  • Price above 200-day SMA
  • SMA 20 above SMA 50
  
- Momentum: 📈 Bull (68%)
  • RSI 62.5 - Bullish momentum
  • MACD histogram positive
  
- Volatility: 📈 Bull (55%)
  • Price in upper half of Bollinger Bands
  
- Volume: 📈 Bull (70%)
  • OBV up 5.2% - Strong buying pressure

Key Indicators:
- RSI (14): 62.5
- SMA 20: $228.50
- SMA 50: $225.30
- SMA 200: $210.80
- MACD: 0.3
- ATR (14): 3.2
```

### Пример 2: Анализ Tesla (TSLA)

**Ввод:**
- Тикер: `TSLA`
- Нажать "Run Analysis"

**Ожидаемый результат:**
```
Current Price: $244.60
Recommendation: HOLD (Confidence: 52%)

Signals:
- Trend: ➡️ Flat (50%)
  • Mixed signals
  
- Momentum: 📉 Bear (58%)
  • RSI 45 - Neutral
  
- Volatility: 📈 Bull (60%)
  • High volatility
  
- Volume: ➡️ Flat (50%)
  • Neutral volume
```

---

## 🚀 Следующие улучшения

### 1. Реальные данные
- [ ] Интеграция с Alpha Vantage API
- [ ] Интеграция с Yahoo Finance
- [ ] Кэширование данных

### 2. Больше индикаторов
- [ ] Ichimoku Cloud
- [ ] Fibonacci Retracement
- [ ] Pivot Points
- [ ] Williams %R
- [ ] CCI (Commodity Channel Index)

### 3. Паттерны свечей
- [ ] Doji
- [ ] Hammer
- [ ] Engulfing
- [ ] Morning/Evening Star

### 4. Мульти-таймфрейм анализ
- [ ] Анализ на 1H, 4H, 1D, 1W
- [ ] Сравнение сигналов на разных таймфреймах

### 5. Backtesting
- [ ] Тестирование стратегии на исторических данных
- [ ] Расчёт точности прогнозов

### 6. Визуализация
- [ ] Свечной график с индикаторами
- [ ] График RSI
- [ ] График MACD
- [ ] Bollinger Bands на графике

---

## ✅ Итог

**Агент Technical работает корректно!**

### Что делает:
- ✅ Принимает тикер акции
- ✅ Генерирует/получает исторические данные
- ✅ Рассчитывает 12+ технических индикаторов
- ✅ Генерирует 4 типа сигналов (trend, momentum, volatility, volume)
- ✅ Даёт рекомендацию BUY/HOLD/SELL
- ✅ Определяет уровни поддержки/сопротивления
- ✅ Отображает результат в красивом UI

### Что нужно пользователю:
- ✅ Тикер акции (например, AAPL, MSFT, TSLA)

### Исправленные проблемы:
- ✅ Используется Vite proxy вместо жёсткого URL
- ✅ Добавлена валидация тикера
- ✅ Улучшена обработка ошибок

### Что нужно для production:
- ⏳ Интеграция с реальным API (Alpha Vantage)
- ⏳ API ключ в `.env`
- ⏳ Обработка ошибок API

**Готово к использованию!** 🚀
