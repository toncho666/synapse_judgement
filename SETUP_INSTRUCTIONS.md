# 🚀 Инструкция по запуску проекта

## ❌ Проблема

Вы получаете ошибку:
```
npm error enoent Could not read package.json: Error: ENOENT: no such file or directory
```

Это значит что корневой `package.json` отсутствует в вашей локальной папке.

---

## ✅ Решение

### Шаг 1: Создайте корневой package.json

Перейдите в корень проекта:

```bash
cd /Users/anton/projects/StrategyAI/StrategyAI
```

Создайте файл `package.json`:

```bash
nano package.json
```

Вставьте следующее содержимое:

```json
{
  "name": "synapse-judgement",
  "version": "1.0.0",
  "description": "AI Investment Council Platform - Monorepo",
  "private": true,
  "workspaces": [
    "frontend",
    "backend"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:frontend\" \"npm run dev:backend\"",
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "cd backend && npm run dev",
    "build": "npm run build:frontend && npm run build:backend",
    "build:frontend": "cd frontend && npm run build",
    "build:backend": "cd backend && npm run build",
    "lint": "npm run lint:frontend && npm run lint:backend",
    "lint:frontend": "cd frontend && npm run lint",
    "lint:backend": "cd backend && npm run lint",
    "install:all": "npm install && cd frontend && npm install && cd ../backend && npm install",
    "db:generate": "cd backend && npm run db:generate",
    "db:push": "cd backend && npm run db:push",
    "db:seed": "cd backend && npm run db:seed",
    "db:studio": "cd backend && npm run db:studio"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

Сохраните: `Ctrl+O`, `Enter`, `Ctrl+X`

---

### Шаг 2: Удалите лишние файлы из корня

В корне проекта есть дублирующиеся файлы, которые нужно удалить:

```bash
# Удалить лишние файлы из корня
rm -f index.html tsconfig.json vite.config.js package-lock.json

# Удалить лишнюю папку src (всё должно быть в frontend/src/)
rm -rf src/
```

---

### Шаг 3: Проверьте структуру

Убедитесь что структура правильная:

```bash
tree -L 2 -d
```

Должно показать:

```
.
├── backend/
├── docker/
├── frontend/
│   └── src/
└── scripts/
```

**НЕ должно быть:**
- ❌ `src/` в корне
- ❌ `index.html` в корне
- ❌ `vite.config.js` в корне
- ❌ `tsconfig.json` в корне

---

### Шаг 4: Установите зависимости

```bash
# Из корня проекта
npm run install:all
```

Это установит зависимости для:
- Корневого проекта (concurrently)
- Frontend (React, Vite, Tailwind)
- Backend (Express, Prisma, TypeScript)

---

### Шаг 5: Настройте базу данных

```bash
# Создайте базу данных
createdb synapse_judgement

# Перейдите в backend
cd backend

# Создайте .env файл
cp .env.example .env

# Отредактируйте .env
nano .env
```

Измените `DATABASE_URL`:

```env
# macOS (без пароля)
DATABASE_URL="postgresql://anton@localhost:5432/synapse_judgement?schema=public"

# Или если есть пароль
DATABASE_URL="postgresql://postgres:ваш_пароль@localhost:5432/synapse_judgement?schema=public"
```

Сохраните: `Ctrl+O`, `Enter`, `Ctrl+X`

```bash
# Вернитесь в корень
cd ..

# Инициализируйте базу данных
npm run db:generate
npm run db:push
npm run db:seed
```

---

### Шаг 6: Запустите проект

```bash
# Из корня проекта
npm run dev
```

Это запустит:
- Frontend на http://localhost:5173
- Backend на http://localhost:3001

---

## 🧪 Проверка работы

### Проверка Backend

```bash
# Health check
curl http://localhost:3001/health

# Должно вернуть:
# {"status":"ok","timestamp":"..."}
```

### Проверка Frontend

Откройте браузер: http://localhost:5173

Должна загрузиться главная страница.

### Проверка API котировок

```bash
curl http://localhost:3001/api/stocks

# Должны вернуться данные о ценах акций
```

### Проверка технического анализа

```bash
curl http://localhost:3001/api/technical-analysis/AAPL

# Должны вернуться 12+ индикаторов и рекомендация
```

---

## 🎨 Тестирование в браузере

1. Откройте http://localhost:5173
2. Войдите с демо-доступом:
   - Email: `demo@synapse.ai`
   - Password: `demo123`
3. Перейдите на страницу агента (например, Technical)
4. Прокрутите до секции "Live Analysis"
5. Введите тикер (например, AAPL)
6. Нажмите "Run Analysis"
7. Увидите полный технический анализ

---

## 🐛 Решение проблем

### Проблема: "Cannot find module"

```bash
# Переустановите зависимости
cd frontend
rm -rf node_modules package-lock.json
npm install

cd ../backend
rm -rf node_modules package-lock.json
npm install
```

### Проблема: "Port already in use"

```bash
# Найдите процесс
lsof -i :3001  # или :5173

# Убейте процесс
kill -9 <PID>
```

### Проблема: "Database connection failed"

```bash
# Проверьте что PostgreSQL запущен
brew services list | grep postgresql

# Если не запущен
brew services start postgresql@15

# Проверьте подключение
psql -d synapse_judgement -c "SELECT 1;"
```

### Проблема: "Prisma Client not generated"

```bash
cd backend
npm run db:generate
```

---

## 📚 Полезные команды

```bash
# Запустить оба проекта
npm run dev

# Только frontend
npm run dev:frontend

# Только backend
npm run dev:backend

# Собрать production
npm run build

# Открыть Prisma Studio
npm run db:studio

# Проверить статус
./scripts/status.sh
```

---

## ✅ Чеклист успешного запуска

- [ ] Корневой `package.json` создан
- [ ] Лишние файлы из корня удалены
- [ ] Структура правильная (нет `src/` в корне)
- [ ] Зависимости установлены (`npm run install:all`)
- [ ] База данных создана (`createdb synapse_judgement`)
- [ ] `backend/.env` настроен
- [ ] База данных инициализирована (`npm run db:push && npm run db:seed`)
- [ ] Backend запущен (http://localhost:3001/health работает)
- [ ] Frontend запущен (http://localhost:5173 открывается)
- [ ] API котировок работает (`/api/stocks`)
- [ ] API технического анализа работает (`/api/technical-analysis/AAPL`)

---

## 🎯 Готово!

После выполнения всех шагов проект должен работать!

**URLs:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- API Docs: http://localhost:3001/api

**Демо-доступ:**
- Email: `demo@synapse.ai`
- Password: `demo123`

---

**Удачи! 🚀**
