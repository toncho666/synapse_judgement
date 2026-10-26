# 🚀 Агент Earnings Calls - Быстрый старт

## ✅ Что реализовано

Полная интеграция агента Earnings Calls с анализом транскриптов квартальных звонков.

### Backend
- ✅ Сервис `earnings-call.service.ts` с интеграцией Finnhub API
- ✅ Роуты `/api/earnings-call/:ticker`
- ✅ Анализ тональности (evasiveness, confidence, sentiment shift)
- ✅ Извлечение ключевых тем и цитат
- ✅ Генерация торговых сигналов
- ✅ Кэширование на 1 час

### Frontend
- ✅ Хук `useEarningsCall.ts`
- ✅ Компонент `EarningsCallPanel.tsx` с визуализацией
- ✅ Интеграция в `AgentPage.tsx` для агента "earn"

---

## 🎯 Что нужно сделать

### Шаг 1: Получить Finnhub API ключ

1. Перейдите на https://finnhub.io/register
2. Зарегистрируйтесь (бесплатно)
3. Скопируйте API ключ

### Шаг 2: Добавить ключ в backend/.env

```bash
cd backend
nano .env
```

Добавьте строку:
```env
FINNHUB_API_KEY=your_finnhub_api_key_here
```

Сохраните: `Ctrl+O`, `Enter`, `Ctrl+X`

### Шаг 3: Перезапустите backend

```bash
# Остановите текущий процесс (Ctrl+C)
npm run dev
```

### Шаг 4: Протестируйте API

```bash
curl http://localhost:3001/api/earnings-call/AAPL
```

**Ожидаемый ответ:**
```json
{
  "success": true,
  "data": {
    "ticker": "AAPL",
    "tone": {
      "evasivenessIndex": 18,
      "confidenceScore": 82,
      "sentimentShift": 15,
      "overallTone": "confident"
    },
    "signal": "bull",
    "strength": 78
  }
}
```

### Шаг 5: Протестируйте в браузере

1. Откройте http://localhost:5173
2. Перейдите на страницу агента Earnings Calls: http://localhost:5173/#/agent/earn
3. Введите тикер (например, `AAPL`)
4. Нажмите "Analyze Calls"
5. Увидите полный анализ

---

## 📊 Что показывает агент

### 1. Тональность руководства
- **Evasiveness Index**: 0-100 (чем ниже, тем лучше)
- **Confidence Score**: 0-100 (чем выше, тем лучше)
- **Sentiment Shift**: изменение настроения vs предыдущий квартал
- **Overall Tone**: confident/cautious/uncertain

### 2. Guidance vs Consensus
- Company Guidance: EPS и Revenue от компании
- Consensus Estimate: ожидания аналитиков
- Beat: превысил/не превысил ожидания
- Delta: процент превышения/недовыполнения

### 3. Квартальный тренд
- Confidence по кварталам (визуализация)
- Evasiveness по кварталам
- Sentiment по кварталам

### 4. Ключевые темы
- Топ-10 обсуждаемых тем
- Частота упоминания
- Сентимент по каждой теме

### 5. Ключевые цитаты
- Топ-5 цитат от CEO/CFO
- Уровень уверенности (high/medium/low)
- Квартал

### 6. Торговый сигнал
- Signal: bull/bear/flat
- Strength: 0-100%
- Reasons: объяснение почему такой сигнал

---

## 🧪 Примеры тестирования

### Тест 1: Уверенный рост (BULL)
```
Тикер: NVDA
Ожидаемый результат:
- Confidence: > 70
- Evasiveness: < 20
- Signal: BULL
- Strength: > 70%
```

### Тест 2: Проблемы (BEAR)
```
Тикер: TSLA (в период проблем)
Ожидаемый результат:
- Confidence: < 50
- Evasiveness: > 35
- Signal: BEAR
- Strength: > 70%
```

### Тест 3: Стабильность (FLAT)
```
Тикер: KO
Ожидаемый результат:
- Confidence: 50-70
- Evasiveness: 20-35
- Signal: FLAT
- Strength: ~50%
```

---

## 📁 Созданные файлы

### Backend
- `backend/src/services/earnings-call.service.ts` - сервис анализа
- `backend/src/routes/earnings-call.routes.ts` - API роуты
- `backend/src/index.ts` - обновлён (подключён роут)
- `backend/.env.example` - обновлён (добавлен FINNHUB_API_KEY)

### Frontend
- `frontend/src/hooks/useEarningsCall.ts` - React хук
- `frontend/src/components/EarningsCallPanel.tsx` - компонент UI
- `frontend/src/components/AgentPage.tsx` - обновлён (добавлена секция)

### Документация
- `EARNINGS_CALL_GUIDE.md` - полное руководство
- `EARNINGS_CALL_QUICKSTART.md` - этот файл

---

## 🐛 Решение проблем

### Проблема: "No transcripts found"
**Решение:** Проверьте что API ключ настроен в `backend/.env`

### Проблема: "Finnhub API key not configured"
**Решение:** Добавьте `FINNHUB_API_KEY=your_key` в `backend/.env` и перезапустите backend

### Проблема: Данные не обновляются
**Решение:** Очистите кэш: `curl -X POST http://localhost:3001/api/earnings-call/cache/clear`

---

## 📚 API Endpoints

```
GET  /api/earnings-call/:ticker              - Анализ звонков
GET  /api/earnings-call/cache/status         - Статус кэша
POST /api/earnings-call/cache/clear          - Очистка кэша
```

---

## ✅ Готово!

Агент Earnings Calls полностью реализован и готов к использованию!

**Следующие шаги:**
1. Получите Finnhub API ключ
2. Добавьте в `backend/.env`
3. Перезапустите backend
4. Протестируйте на http://localhost:5173/#/agent/earn

**Удачи!** 🚀
