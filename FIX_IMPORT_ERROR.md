# 🔧 Исправление ошибки импорта agentMock

## ❌ Проблема

```
Failed to resolve import "../data/agentMock" from "src/components/AgentPage.tsx"
```

## ✅ Решение

### Шаг 1: Очистите кэш Vite

```bash
cd frontend
rm -rf node_modules/.vite
```

### Шаг 2: Перезапустите dev server

```bash
# Остановите текущий процесс (Ctrl+C)
npm run dev
```

### Шаг 3: Если не помогло, переустановите зависимости

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## 🔍 Проверка что файл существует

Файл `frontend/src/data/agentMock.ts` должен существовать и содержать:

```typescript
export const AGENT_PAGES: Record<string, AgentPageData> = {
  tech: { ... },
  fund: { ... },
  port: { ... },
  news: { ... },
  earn: { ... },
};
```

### Проверьте что файл на месте:

```bash
ls -la frontend/src/data/
# Должно показать: agentMock.ts

# Проверьте содержимое
head -20 frontend/src/data/agentMock.ts
# Должно показать: export const AGENT_PAGES
```

---

## 🐛 Если файл не существует

Создайте файл `frontend/src/data/agentMock.ts` с содержимым из оригинального проекта.

---

## ✅ После исправления

Frontend должен запуститься без ошибок:

```bash
cd frontend
npm run dev
```

Откройте http://localhost:5173 - страница должна загрузиться.

---

**Очистите кэш Vite и перезапустите dev server!** 🚀
