# 🚀 Быстрый старт - Исправление ошибки

## ❌ Ваша ошибка

```
npm error enoent Could not read package.json: Error: ENOENT: no such file or directory
```

**Причина:** В корне проекта отсутствует `package.json`

---

## ✅ Решение (2 способа)

### Способ 1: Автоматический (рекомендуется)

```bash
# Перейдите в корень проекта
cd /Users/anton/projects/StrategyAI/StrategyAI

# Сделайте скрипт исполняемым
chmod +x scripts/auto-setup.sh

# Запустите автоматическую настройку
./scripts/auto-setup.sh
```

Скрипт автоматически:
- ✅ Создаст корневой `package.json` (если нужно)
- ✅ Удалит лишние файлы
- ✅ Установит зависимости
- ✅ Настроит базу данных
- ✅ Инициализирует БД

---

### Способ 2: Вручную

#### Шаг 1: Создайте корневой package.json

```bash
cd /Users/anton/projects/StrategyAI/StrategyAI

# Создайте файл
nano package.json
```

Вставьте:

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

#### Шаг 2: Удалите лишние файлы

```bash
# Удалить дубликаты из корня
rm -f index.html tsconfig.json vite.config.js package-lock.json

# Удалить лишнюю папку src
rm -rf src/
```

#### Шаг 3: Установите зависимости

```bash
npm run install:all
```

#### Шаг 4: Настройте базу данных

```bash
# Создайте БД
createdb synapse_judgement

# Настройте .env
cd backend
cp .env.example .env
nano .env
```

Измените `DATABASE_URL`:
```env
DATABASE_URL="postgresql://anton@localhost:5432/synapse_judgement?schema=public"
```

Сохраните: `Ctrl+O`, `Enter`, `Ctrl+X`

```bash
# Вернитесь в корень
cd ..

# Инициализируйте БД
npm run db:generate
npm run db:push
npm run db:seed
```

#### Шаг 5: Запустите проект

```bash
npm run dev
```

---

## 🧪 Проверка

### Backend

```bash
curl http://localhost:3001/health
# Должно вернуть: {"status":"ok","timestamp":"..."}
```

### Frontend

Откройте: http://localhost:5173

### API котировок

```bash
curl http://localhost:3001/api/stocks
```

### API технического анализа

```bash
curl http://localhost:3001/api/technical-analysis/AAPL
```

---

## 🎨 Использование

1. Откройте http://localhost:5173
2. Войдите: `demo@synapse.ai` / `demo123`
3. Перейдите на страницу агента (Technical)
4. Введите тикер (AAPL)
5. Нажмите "Run Analysis"
6. Увидите полный технический анализ

---

## 🐛 Решение проблем

### Проблема: "Cannot find module"

```bash
# Переустановите зависимости
cd frontend && rm -rf node_modules && npm install && cd ..
cd backend && rm -rf node_modules && npm install && cd ..
```

### Проблема: "Port already in use"

```bash
# Найдите процесс
lsof -i :3001

# Убейте
kill -9 <PID>
```

### Проблема: "Database connection failed"

```bash
# Проверьте PostgreSQL
brew services list | grep postgresql

# Запустите если нужно
brew services start postgresql@15
```

---

## 📚 Документация

- **[SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)** - Полная инструкция
- **[FINAL_VERIFICATION.md](./FINAL_VERIFICATION.md)** - Проверка проекта
- **[README.md](./README.md)** - Главная документация

---

**Готово! Проект должен работать!** 🚀
