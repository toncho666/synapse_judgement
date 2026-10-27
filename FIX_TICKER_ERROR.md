# 🔧 Исправление ошибки "Enter a ticker" при запуске анализа

## ❌ Проблема

После исправления mock-данных, при запуске анализа появлялась ошибка "Enter a ticker — for example, AAPL or NVDA" даже если тикер был указан корректно.

**Симптомы:**
- Пользователь вводит тикер (например, NVDA)
- Нажимает "Run Analysis"
- Появляется ошибка "Enter a ticker"
- Анализ не запускается

## 🔍 Причина

В коде `App.tsx` использовалось одно состояние `errorNonce` для двух разных типов ошибок:

1. **Ошибка валидации тикера** - когда тикер не введён или невалидный
2. **Ошибка анализа** - когда backend API вернул ошибку (например, нет токена, API недоступен)

Когда анализ не удавался из-за ошибки API (например, "No authentication token found"), код увеличивал `errorNonce`, что показывало сообщение "Enter a ticker" - неправильное сообщение для этой ошибки.

```typescript
// ❌ БЫЛО (неправильно):
} catch (error) {
  console.error('Analysis failed:', error);
  setErrorNonce((v) => v + 1);  // ← Это показывало "Enter a ticker"
  setStage("idle");
}
```

## ✅ Решение

### 1. Добавлено отдельное состояние для ошибок анализа

```typescript
const [analysisError, setAnalysisError] = useState<string | null>(null);
```

### 2. Разделена логика обработки ошибок

```typescript
// ✅ СТАЛО (правильно):
if (!validTicker) {
  setErrorNonce((v) => v + 1);      // ← Ошибка валидации тикера
  setAnalysisError(null);
  // ...
  return;
}

try {
  const res = await runAnalysisAPI(ticker, selected, portfolio);
  // ...
} catch (error) {
  console.error('Analysis failed:', error);
  const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
  setAnalysisError(errorMessage);   // ← Ошибка анализа
  setStage("idle");
}
```

### 3. Добавлено отображение разных ошибок

```typescript
{/* Ошибка валидации тикера */}
{errorNonce > 0 && (
  <div key={errorNonce} className="anim-shake ...">
    <p className="...">
      <Icon name="bolt" size={16} />Enter a ticker — for example, AAPL or NVDA.
    </p>
  </div>
)}

{/* Ошибка анализа */}
{analysisError && (
  <div key={analysisError} className="anim-shake ...">
    <p className="...">
      <Icon name="bolt" size={16} />{analysisError}
    </p>
  </div>
)}
```

### 4. Автоматическая очистка ошибки при изменении тикера

```typescript
// Clear analysis error when ticker changes
useEffect(() => {
  setAnalysisError(null);
}, [ticker]);
```

---

## 📊 Типы ошибок

### Ошибка валидации тикера (errorNonce)

**Когда появляется:**
- Тикер не введён
- Тикер содержит недопустимые символы
- Тикер слишком длинный (> 7 символов)

**Сообщение:**
```
⚡ Enter a ticker — for example, AAPL or NVDA.
```

**Regex валидации:**
```typescript
const validTicker = /^[A-Z.\-]{1,7}$/.test(ticker);
```

### Ошибка анализа (analysisError)

**Когда появляется:**
- Нет токена аутентификации
- Backend API недоступен
- Анализ не удался на backend
- Таймаут ожидания результата

**Сообщения:**
```
⚡ No authentication token found. Please login first.
⚡ Analysis failed on backend
⚡ Analysis timeout - backend took too long to complete
⚡ HTTP error! status: 500
```

---

## 🧪 Как проверить

### Тест 1: Ошибка валидации тикера

1. Откройте http://localhost:5173
2. Оставьте поле тикера пустым
3. Выберите агента
4. Нажмите "Run Analysis"

**Ожидаемый результат:**
```
⚡ Enter a ticker — for example, AAPL or NVDA.
```

### Тест 2: Ошибка анализа (нет токена)

1. Откройте http://localhost:5173
2. НЕ входите в систему
3. Введите тикер: `NVDA`
4. Выберите агента
5. Нажмите "Run Analysis"

**Ожидаемый результат:**
```
⚡ No authentication token found. Please login first.
```

### Тест 3: Успешный анализ

1. Откройте http://localhost:5173
2. Войдите: `demo@synapse.ai` / `demo123`
3. Введите тикер: `NVDA`
4. Выберите агента: `Technical`
5. Нажмите "Run Analysis"

**Ожидаемый результат:**
- ✅ Анализ запускается
- ✅ Показываются реальные данные
- ✅ Нет ошибок

### Тест 4: Очистка ошибки при изменении тикера

1. Вызовите ошибку анализа (например, без входа)
2. Измените тикер на другой
3. Ошибка должна исчезнуть

**Ожидаемый результат:**
- ✅ Ошибка исчезает при изменении тикера

---

## 📚 Изменённые файлы

### `frontend/src/App.tsx`

**Добавлено:**
- ✅ Состояние `analysisError` для ошибок анализа
- ✅ Разделение логики ошибок (валидация vs анализ)
- ✅ Отображение разных сообщений об ошибках
- ✅ Автоматическая очистка ошибки при изменении тикера

**Изменено:**
- ✅ `launchInner()` - использует `analysisError` вместо `errorNonce` для ошибок анализа
- ✅ UI - показывает разные сообщения для разных типов ошибок

---

## 🐛 Решение проблем

### Проблема: Ошибка "No authentication token found"

**Причина:** Пользователь не вошёл в систему

**Решение:**
1. Нажмите "Sign in" в навигации
2. Войдите с `demo@synapse.ai` / `demo123`
3. Попробуйте запустить анализ снова

### Проблема: Ошибка "Analysis failed on backend"

**Причина:** Backend вернул ошибку

**Решение:**
1. Проверьте логи backend
2. Убедитесь что API ключи настроены
3. Проверьте что база данных доступна
4. Перезапустите backend

### Проблема: Ошибка "Analysis timeout"

**Причина:** Backend слишком долго обрабатывает запрос

**Решение:**
1. Подождите 30 секунд (максимальное время ожидания)
2. Проверьте логи backend
3. Убедитесь что API работают
4. Попробуйте снова

### Проблема: Ошибка не исчезает при изменении тикера

**Причина:** useEffect не срабатывает

**Решение:**
1. Перезапустите frontend
2. Проверьте консоль браузера на ошибки
3. Очистите кэш браузера

---

## ✅ Итог

**Проблема решена!**

Теперь:
- ✅ Разделены ошибки валидации тикера и ошибки анализа
- ✅ Показываются правильные сообщения об ошибках
- ✅ Ошибки анализа отображают реальную причину проблемы
- ✅ Ошибки автоматически очищаются при изменении тикера

**Типы ошибок:**
- 🔴 **Валидация тикера** - "Enter a ticker — for example, AAPL or NVDA."
- 🔴 **Ошибка анализа** - реальное сообщение от backend API

---

**Перезапустите frontend и проверьте что ошибки показываются правильно!** 🚀
