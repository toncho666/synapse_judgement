# 📊 Технический анализ - API документация

## 🎯 Что реализовано

Полноценный endpoint для технического анализа с расчётом 12+ индикаторов и генерацией торговых сигналов.

### Технические индикаторы:

**Трендовые:**
- ✅ SMA (20, 50, 200) - Simple Moving Average
- ✅ EMA (12, 26) - Exponential Moving Average
- ✅ ADX (14) - Average Directional Index

**Моментум:**
- ✅ RSI (14) - Relative Strength Index
- ✅ MACD (12, 26, 9) - Moving Average Convergence Divergence
- ✅ Stochastic (14, 3, 3) - Stochastic Oscillator

**Волатильность:**
- ✅ Bollinger Bands (20, 2)
- ✅ ATR (14) - Average True Range

**Объём:**
- ✅ OBV - On-Balance Volume
- ✅ OBV Change %

### Торговые сигналы:
- ✅ Анализ тренда (bull/bear/flat)
- ✅ Анализ моментума
- ✅ Анализ волатильности
- ✅ Анализ объёма
- ✅ Общий сигнал с уверенностью
- ✅ Уровни поддержки/сопротивления
- ✅ Рекомендация: BUY / HOLD / SELL

---

## 🚀 Использование

### Endpoint

```
GET /api/technical-analysis/:ticker
```

### Пример запроса

```bash
curl http://localhost:3001/api/technical-analysis/AAPL
```

### Пример ответа

```json
{
  "success": true,
  "data": {
    "ticker": "AAPL",
    "timestamp": "2026-02-20T12:00:00.000Z",
    "currentPrice": 232.41,
    "indicators": {
      "sma20": 228.5,
      "sma50": 225.3,
      "sma200": 210.8,
      "ema12": 230.2,
      "ema26": 228.1,
      "rsi14": 62.5,
      "macd": {
        "macd": 2.1,
        "signal": 1.8,
        "histogram": 0.3
      },
      "stochastic": {
        "k": 75.2,
        "d": 72.8
      },
      "adx": 28.5,
      "bollingerBands": {
        "upper": 240.5,
        "middle": 228.5,
        "lower": 216.5
      },
      "atr14": 3.2,
      "obv": 125000000,
      "obvChange": 5.2
    },
    "signals": {
      "trend": {
        "type": "bull",
        "strength": 75,
        "reasons": [
          "Price above 200-day SMA (long-term uptrend)",
          "Price above 50-day SMA (medium-term uptrend)",
          "SMA20 above SMA50 (bullish alignment)"
        ]
      },
      "momentum": {
        "type": "bull",
        "strength": 68,
        "reasons": [
          "RSI 62.5 - Bullish momentum",
          "MACD histogram positive (bullish momentum)"
        ]
      },
      "volatility": {
        "type": "bull",
        "strength": 55,
        "reasons": [
          "Price in upper half of Bollinger Bands - bullish bias"
        ]
      },
      "volume": {
        "type": "bull",
        "strength": 70,
        "reasons": [
          "OBV up 5.2% - strong buying pressure"
        ]
      },
      "overall": {
        "type": "bull",
        "strength": 67,
        "reasons": [
          "Strong bullish consensus (4/4 indicators)"
        ]
      }
    },
    "support": 216.5,
    "resistance": 240.5,
    "recommendation": "BUY",
    "confidence": 67
  }
}
```

---

## 📋 Дополнительные endpoints

### Статус кэша

```bash
GET /api/technical-analysis/cache/status
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "cachedTickers": ["AAPL", "NVDA", "MSFT"],
    "cacheSize": 3
  }
}
```

### Очистка кэша

```bash
POST /api/technical-analysis/cache/clear
```

**Ответ:**
```json
{
  "success": true,
  "message": "Technical analysis cache cleared"
}
```

---

## 🎨 Интерпретация результатов

### Типы сигналов

- **bull** - Бычий сигнал (покупка)
- **bear** - Медвежий сигнал (продажа)
- **flat** - Нейтральный сигнал (удержание)

### Сила сигнала (strength)

- **0-30** - Слабый сигнал
- **30-60** - Умеренный сигнал
- **60-100** - Сильный сигнал

### Рекомендации

- **BUY** - Покупка (общий сигнал bull, сила > 65%)
- **SELL** - Продажа (общий сигнал bear, сила > 65%)
- **HOLD** - Удержание (смешанные сигналы или сила < 65%)

### Уровни поддержки/сопротивления

- **support** - Уровень поддержки (минимум за последние 20 дней)
- **resistance** - Уровень сопротивления (максимум за последние 20 дней)

---

## 🔧 Настройка

### Изменить список индикаторов

Откройте `backend/src/services/technical-analysis.service.ts`:

```typescript
const indicators: TechnicalIndicators = {
  sma20: calculateSMA(closes, 20),  // Измените период
  sma50: calculateSMA(closes, 50),
  // ...
};
```

### Изменить пороги для сигналов

В функциях `generateTrendSignal`, `generateMomentumSignal` и т.д.:

```typescript
if (indicators.rsi14 > 70) {  // Измените порог
  bearPoints += 2;
  reasons.push(`RSI ${indicators.rsi14.toFixed(1)} - Overbought`);
}
```

### Изменить длительность кэша

```typescript
const CACHE_DURATION = 60 * 60 * 1000; // 1 час
```

---

## 📊 Как работает анализ

### 1. Получение данных

Система получает исторические данные за ~250 дней (1 год):
- Open, High, Low, Close цены
- Объёмы торгов

### 2. Расчёт индикаторов

Для каждого индикатора используются стандартные формулы:
- **SMA**: Средняя цена за N периодов
- **EMA**: Экспоненциальная средняя с весом
- **RSI**: Относительная сила на основе gains/losses
- **MACD**: Разница между EMA12 и EMA26
- **Bollinger Bands**: SMA ± 2 стандартных отклонения
- **ATR**: Средняя истинная волатильность
- **OBV**: Кумулятивный объём с учётом направления

### 3. Генерация сигналов

Каждый аспект анализируется отдельно:

**Тренд:**
- Цена vs SMA200 (долгосрочный тренд)
- Цена vs SMA50 (среднесрочный тренд)
- SMA20 vs SMA50 (Golden/Death Cross)
- EMA12 vs EMA26 (краткосрочный тренд)

**Моментум:**
- RSI (перекупленность/перепроданность)
- MACD histogram (направление моментума)
- Stochastic (зоны перекупленности/перепроданности)

**Волатильность:**
- Bollinger Bands (позиция цены относительно полос)

**Объём:**
- OBV change (давление покупателей/продавцов)

### 4. Общая рекомендация

На основе всех сигналов генерируется общая рекомендация:
- Подсчёт bull/bear сигналов
- Расчёт средней силы
- Определение BUY/HOLD/SELL

---

## 🧪 Тестирование

### Тест с разными тикерами

```bash
# Apple
curl http://localhost:3001/api/technical-analysis/AAPL

# Tesla
curl http://localhost:3001/api/technical-analysis/TSLA

# Bitcoin (если поддерживается)
curl http://localhost:3001/api/technical-analysis/BTC
```

### Проверка кэширования

```bash
# Первый запрос (медленный)
time curl http://localhost:3001/api/technical-analysis/AAPL

# Второй запрос (быстрый - из кэша)
time curl http://localhost:3001/api/technical-analysis/AAPL
```

### Проверка статуса кэша

```bash
curl http://localhost:3001/api/technical-analysis/cache/status
```

---

## 🚀 Интеграция с frontend

### Создание хука useTechnicalAnalysis

```typescript
// frontend/src/hooks/useTechnicalAnalysis.ts

import { useState, useEffect } from 'react';

interface TechnicalAnalysis {
  ticker: string;
  currentPrice: number;
  indicators: any;
  signals: {
    trend: { type: string; strength: number; reasons: string[] };
    momentum: { type: string; strength: number; reasons: string[] };
    volatility: { type: string; strength: number; reasons: string[] };
    volume: { type: string; strength: number; reasons: string[] };
    overall: { type: string; strength: number; reasons: string[] };
  };
  support: number | null;
  resistance: number | null;
  recommendation: 'BUY' | 'HOLD' | 'SELL';
  confidence: number;
}

export function useTechnicalAnalysis(ticker: string) {
  const [analysis, setAnalysis] = useState<TechnicalAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ticker) return;

    const fetchAnalysis = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `http://localhost:3001/api/technical-analysis/${ticker}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch technical analysis');
        }

        const data = await response.json();
        
        if (data.success) {
          setAnalysis(data.data);
        } else {
          throw new Error(data.error || 'Unknown error');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [ticker]);

  return { analysis, loading, error };
}
```

### Использование в компоненте

```typescript
import { useTechnicalAnalysis } from './hooks/useTechnicalAnalysis';

function TechnicalAnalysisPanel({ ticker }: { ticker: string }) {
  const { analysis, loading, error } = useTechnicalAnalysis(ticker);

  if (loading) return <div>Loading analysis...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!analysis) return null;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold">{ticker} Technical Analysis</h2>
      
      <div className="mt-4">
        <p className="text-lg">
          Price: ${analysis.currentPrice.toFixed(2)}
        </p>
        <p className="text-lg">
          Recommendation: <strong>{analysis.recommendation}</strong>
        </p>
        <p className="text-lg">
          Confidence: {analysis.confidence.toFixed(0)}%
        </p>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-semibold">Signals</h3>
        
        <div className="mt-2">
          <p>Trend: {analysis.signals.trend.type} ({analysis.signals.trend.strength.toFixed(0)}%)</p>
          <p>Momentum: {analysis.signals.momentum.type} ({analysis.signals.momentum.strength.toFixed(0)}%)</p>
          <p>Volatility: {analysis.signals.volatility.type} ({analysis.signals.volatility.strength.toFixed(0)}%)</p>
          <p>Volume: {analysis.signals.volume.type} ({analysis.signals.volume.strength.toFixed(0)}%)</p>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-semibold">Key Levels</h3>
        <p>Support: ${analysis.support?.toFixed(2)}</p>
        <p>Resistance: ${analysis.resistance?.toFixed(2)}</p>
      </div>
    </div>
  );
}
```

---

## 📈 Следующие улучшения

### 1. Реальные данные
Заменить мок-данные на реальные исторические данные через Alpha Vantage:

```typescript
async function fetchHistoricalData(ticker: string) {
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&outputsize=full&apikey=${API_KEY}`;
  // ...
}
```

### 2. Больше индикаторов
- Ichimoku Cloud
- Fibonacci Retracement
- Pivot Points
- Williams %R
- CCI (Commodity Channel Index)

### 3. Паттерны свечей
- Doji
- Hammer
- Engulfing
- Morning/Evening Star

### 4. Мульти-таймфрейм анализ
Анализ на разных таймфреймах (1H, 4H, 1D, 1W)

### 5. Backtesting
Тестирование стратегии на исторических данных

---

## ✅ Итог

Реализован полноценный endpoint для технического анализа с:
- ✅ 12+ технических индикаторов
- ✅ Генерация торговых сигналов
- ✅ Уровни поддержки/сопротивления
- ✅ Рекомендации BUY/HOLD/SELL
- ✅ Кэширование результатов
- ✅ Подробная документация

**Endpoint**: `GET /api/technical-analysis/:ticker`

**Готово к использованию!** 🚀
