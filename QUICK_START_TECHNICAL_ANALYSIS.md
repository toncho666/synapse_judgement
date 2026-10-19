# 🚀 Технический анализ - Быстрый старт

## ✅ Что реализовано

Endpoint для технического анализа с **12+ индикаторами** и генерацией торговых сигналов.

### Индикаторы:
- 📈 **Трендовые**: SMA (20, 50, 200), EMA (12, 26), ADX
- ⚡ **Моментум**: RSI, MACD, Stochastic
- 📊 **Волатильность**: Bollinger Bands, ATR
- 📉 **Объём**: OBV

### Сигналы:
- ✅ Анализ тренда, моментума, волатильности, объёма
- ✅ Уровни поддержки/сопротивления
- ✅ Рекомендация: **BUY / HOLD / SELL**
- ✅ Уверенность: 0-100%

---

## 🎯 Использование

### 1. Запрос анализа

```bash
curl http://localhost:3001/api/technical-analysis/AAPL
```

### 2. Пример ответа

```json
{
  "success": true,
  "data": {
    "ticker": "AAPL",
    "currentPrice": 232.41,
    "recommendation": "BUY",
    "confidence": 67,
    "signals": {
      "trend": { "type": "bull", "strength": 75 },
      "momentum": { "type": "bull", "strength": 68 },
      "volatility": { "type": "bull", "strength": 55 },
      "volume": { "type": "bull", "strength": 70 },
      "overall": { "type": "bull", "strength": 67 }
    },
    "support": 216.5,
    "resistance": 240.5,
    "indicators": {
      "rsi14": 62.5,
      "sma200": 210.8,
      "macd": { "macd": 2.1, "signal": 1.8, "histogram": 0.3 }
      // ... и другие
    }
  }
}
```

---

## 🧪 Тестирование

```bash
# Разные тикеры
curl http://localhost:3001/api/technical-analysis/AAPL
curl http://localhost:3001/api/technical-analysis/TSLA
curl http://localhost:3001/api/technical-analysis/NVDA

# Статус кэша
curl http://localhost:3001/api/technical-analysis/cache/status

# Очистка кэша
curl -X POST http://localhost:3001/api/technical-analysis/cache/clear
```

---

## 📊 Интерпретация

### Рекомендации:
- **BUY** - Покупка (сильный бычий сигнал, уверенность > 65%)
- **SELL** - Продажа (сильный медвежий сигнал, уверенность > 65%)
- **HOLD** - Удержание (смешанные сигналы или низкая уверенность)

### Сила сигнала:
- **0-30%** - Слабый сигнал
- **30-60%** - Умеренный сигнал
- **60-100%** - Сильный сигнал

### Уровни:
- **support** - Уровень поддержки (минимум за 20 дней)
- **resistance** - Уровень сопротивления (максимум за 20 дней)

---

## 🔧 Настройка

### Изменить список индикаторов

Файл: `backend/src/services/technical-analysis.service.ts`

```typescript
const indicators: TechnicalIndicators = {
  sma20: calculateSMA(closes, 20),  // Измените период
  rsi14: calculateRSI(closes, 14),  // Измените период
  // ...
};
```

### Изменить пороги для сигналов

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

## 📚 Документация

- **[TECHNICAL_ANALYSIS_API.md](./TECHNICAL_ANALYSIS_API.md)** - Полная документация API
- **Код**: `backend/src/services/technical-analysis.service.ts`
- **Роуты**: `backend/src/routes/technical-analysis.routes.ts`

---

## 🎯 Следующие шаги

1. ✅ Протестировать endpoint
2. ✅ Интегрировать с frontend
3. ⏳ Заменить мок-данные на реальные (Alpha Vantage)
4. ⏳ Добавить больше индикаторов
5. ⏳ Реализовать backtesting

---

**Готово к использованию!** 🚀
