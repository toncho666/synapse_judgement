# 🔄 Реструктуризация проекта в монорепо

## 📋 Что нужно сделать

Проект нужно переструктурировать из текущей плоской структуры в правильную монорепо:

**Текущая структура (неправильная):**
```
synapse-judgement/
├── src/              # Frontend в корне ❌
├── backend/          # Backend
├── package.json      # Frontend package.json ❌
└── ...
```

**Целевая структура (правильная):**
```
synapse-judgement/
├── frontend/         # Frontend в отдельной папке ✅
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── ...
├── backend/          # Backend в отдельной папке ✅
│   ├── src/
│   ├── package.json
│   └── ...
├── scripts/          # Скрипты
├── docker/           # Docker
├── package.json      # Корневой orchestrator ✅
└── README.md
```

---

## 🚀 Автоматическая реструктуризация

### Шаг 1: Запустите скрипт

```bash
chmod +x scripts/restructure.sh
./scripts/restructure.sh
```

Скрипт автоматически:
- ✅ Создаст папку `frontend/`
- ✅ Переместит `src/` в `frontend/src/`
- ✅ Переместит конфигурационные файлы (index.html, vite.config.js, tsconfig.json)
- ✅ Обновит `.gitignore`
- ✅ Создаст правильные README файлы

### Шаг 2: Установите зависимости

```bash
# Установить все зависимости
npm run install:all

# Или по отдельности
cd frontend && npm install
cd ../backend && npm install
cd ..
```

### Шаг 3: Настройте базу данных

```bash
# Создать БД
createdb synapse_judgement

# Настроить backend/.env
cd backend
cp .env.example .env
nano .env  # Изменить DATABASE_URL

# Инициализировать БД
npm run db:generate
npm run db:push
npm run db:seed
cd ..
```

### Шаг 4: Запустите проект

```bash
# Запустить оба проекта
npm run dev

# Или по отдельности
npm run dev:frontend   # http://localhost:5173
npm run dev:backend    # http://localhost:3001
```

---

## 🔧 Ручная реструктуризация (если скрипт не работает)

Если автоматический скрипт не работает, выполните вручную:

### 1. Создайте структуру папок

```bash
mkdir -p frontend/src/components
mkdir -p frontend/src/lib
mkdir -p frontend/src/data
```

### 2. Переместите файлы фронтенда

```bash
# Переместить src/
mv src/* frontend/src/
rmdir src

# Переместить конфигурационные файлы
mv index.html frontend/
mv vite.config.js frontend/
mv tsconfig.json frontend/
mv package-lock.json frontend/ 2>/dev/null || true
```

### 3. Обновите package.json

Корневой `package.json` должен быть "оркестратором":

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
    "install:all": "npm install && cd frontend && npm install && cd ../backend && npm install",
    "db:generate": "cd backend && npm run db:generate",
    "db:push": "cd backend && npm run db:push",
    "db:seed": "cd backend && npm run db:seed",
    "db:studio": "cd backend && npm run db:studio"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

Frontend `frontend/package.json`:

```json
{
  "name": "@synapse-judgement/frontend",
  "version": "1.0.0",
  "description": "Synapse Judgement - Frontend Application",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "framer-motion": "^11.16.1",
    "lucide-react": "^0.294.0",
    "recharts": "^2.10.0",
    "date-fns": "^2.30.0",
    "uuid": "^9.0.1",
    "canvas-confetti": "^1.9.3",
    "@supabase/supabase-js": "^2.98.0",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "@dnd-kit/utilities": "^3.2.2"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/uuid": "^9.0.7",
    "@types/canvas-confetti": "^1.6.4",
    "@vitejs/plugin-react": "^4.3.4",
    "@tailwindcss/vite": "^4.1.7",
    "tailwindcss": "^4.1.7",
    "typescript": "^5.7.0",
    "vite": "^6.3.5"
  }
}
```

### 4. Обновите vite.config.js

Добавьте прокси для API:

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "localhost",
    port: 5173,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  },
});
```

### 5. Установите зависимости

```bash
# Корневые зависимости (concurrently)
npm install

# Frontend зависимости
cd frontend
npm install
cd ..

# Backend зависимости
cd backend
npm install
cd ..
```

---

## ✅ Проверка структуры

После реструктуризации должно быть:

```bash
# Проверить структуру
tree -L 2 -d

# Должно показать:
# .
# ├── backend
# ├── docker
# ├── frontend
# │   └── src
# └── scripts
```

---

## 🧪 Тестирование

### 1. Запустите frontend

```bash
cd frontend
npm run dev
```

Откройте http://localhost:5173 - должна загрузиться страница.

### 2. Запустите backend

```bash
cd backend
npm run dev
```

Проверьте http://localhost:3001/health - должен вернуть `{"status":"ok"}`.

### 3. Запустите оба проекта

```bash
# Из корня проекта
npm run dev
```

Оба проекта должны запуститься одновременно.

---

## 🐛 Решение проблем

### Проблема: "Cannot find module '@tailwindcss/vite'"

**Решение:**
```bash
cd frontend
npm install @tailwindcss/vite
```

### Проблема: "Port 5173 already in use"

**Решение:**
```bash
# Найти процесс
lsof -i :5173

# Убить процесс
kill -9 <PID>

# Или изменить порт в frontend/vite.config.js
```

### Проблема: "Cannot connect to backend"

**Решение:**
1. Убедитесь что backend запущен на порту 3001
2. Проверьте proxy настройки в `frontend/vite.config.js`
3. Перезапустите frontend

### Проблема: "Module not found" после перемещения

**Решение:**
```bash
cd frontend
rm -rf node_modules
npm install
```

---

## 📊 Финальная структура

После успешной реструктуризации:

```
synapse-judgement/
│
├── 📂 frontend/              # Frontend приложение
│   ├── 📂 src/
│   │   ├── 📂 components/    # React компоненты
│   │   ├── 📂 lib/           # Утилиты
│   │   ├── 📂 data/          # Мок-данные
│   │   ├── 📄 App.tsx
│   │   ├── 📄 main.tsx
│   │   └── 📄 index.css
│   ├── 📄 package.json
│   ├── 📄 vite.config.js
│   ├── 📄 tsconfig.json
│   ├── 📄 index.html
│   └── 📄 README.md
│
├── 📂 backend/               # Backend API
│   ├── 📂 src/
│   │   ├── 📂 controllers/
│   │   ├── 📂 services/
│   │   ├── 📂 routes/
│   │   ├── 📂 middleware/
│   │   ├── 📂 utils/
│   │   └── 📄 index.ts
│   ├── 📂 prisma/
│   │   ├── 📄 schema.prisma
│   │   └── 📄 seed.ts
│   ├── 📄 package.json
│   ├── 📄 tsconfig.json
│   ├── 📄 .env.example
│   └── 📄 README.md
│
├── 📂 scripts/               # Скрипты автоматизации
│   ├── 📄 setup.sh
│   ├── 📄 init-db.sh
│   ├── 📄 status.sh
│   ├── 📄 test-api.sh
│   ├── 📄 clean.sh
│   ├── 📄 sync.sh
│   ├── 📄 migrate.sh
│   └── 📄 restructure.sh
│
├── 📂 docker/                # Docker конфигурации
│   ├── 📄 frontend.Dockerfile
│   ├── 📄 nginx.conf
│   └── 📄 init.sql
│
├── 📂 .github/               # GitHub интеграция
│   ├── 📂 workflows/
│   │   └── 📄 ci.yml
│   └── 📄 ...
│
├── 📄 package.json           # Корневой orchestrator
├── 📄 Makefile               # Команды для Unix/Mac
├── 📄 docker-compose.yml     # Docker Compose
├── 📄 .env.example           # Шаблон переменных
├── 📄 .gitignore             # Git ignore
├── 📄 LICENSE                # MIT лицензия
├── 📄 README.md              # Главная документация
└── 📄 ... (другие docs)
```

---

## 🎯 Следующие шаги

После успешной реструктуризации:

1. **Протестируйте проект**
   ```bash
   npm run dev
   ```

2. **Опубликуйте на GitHub**
   ```bash
   git init
   git add .
   git commit -m "Restructure to monorepo"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

3. **Настройте CI/CD**
   - GitHub Actions уже настроен в `.github/workflows/ci.yml`

---

## 📚 Документация

- [README.md](./README.md) - главная документация
- [frontend/README.md](./frontend/README.md) - frontend документация
- [backend/README.md](./backend/README.md) - backend документация
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - подробная инструкция

---

**Удачи с реструктуризацией! 🚀**
