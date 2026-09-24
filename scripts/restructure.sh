#!/bin/bash

# Script to restructure project into proper monorepo
# Run this script from the project root

set -e

echo "🔄 Restructuring project into monorepo..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Create frontend directory structure
echo -e "${BLUE}Creating frontend directory structure...${NC}"
mkdir -p frontend/src/components
mkdir -p frontend/src/lib
mkdir -p frontend/src/data
echo -e "${GREEN}✓ Frontend directories created${NC}"
echo ""

# Move frontend files
echo -e "${BLUE}Moving frontend files...${NC}"

# Move src/ to frontend/src/
if [ -d "src" ]; then
    mv src/* frontend/src/ 2>/dev/null || true
    rmdir src 2>/dev/null || true
    echo -e "${GREEN}✓ Moved src/ to frontend/src/${NC}"
fi

# Move frontend config files
if [ -f "index.html" ] && [ ! -f "frontend/index.html" ]; then
    mv index.html frontend/
    echo -e "${GREEN}✓ Moved index.html to frontend/${NC}"
fi

if [ -f "vite.config.js" ] && [ ! -f "frontend/vite.config.js" ]; then
    mv vite.config.js frontend/
    echo -e "${GREEN}✓ Moved vite.config.js to frontend/${NC}"
fi

if [ -f "tsconfig.json" ] && [ ! -f "frontend/tsconfig.json" ]; then
    mv tsconfig.json frontend/
    echo -e "${GREEN}✓ Moved tsconfig.json to frontend/${NC}"
fi

if [ -f "package-lock.json" ] && [ ! -f "frontend/package-lock.json" ]; then
    mv package-lock.json frontend/
    echo -e "${GREEN}✓ Moved package-lock.json to frontend/${NC}"
fi

echo ""

# Update .gitignore
echo -e "${BLUE}Updating .gitignore...${NC}"
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
dist/
build/

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Prisma
prisma/*.db
prisma/*.db-journal

# Misc
.cache/
.temp/
*.tsbuildinfo

# Docker
docker-compose.override.yml

# Temporary
tmp/
temp/
EOF
echo -e "${GREEN}✓ .gitignore updated${NC}"
echo ""

# Create root README if not exists
if [ ! -f "README.md" ]; then
    echo -e "${BLUE}Creating root README.md...${NC}"
    cat > README.md << 'EOF'
# 🎯 Synapse Judgement

AI-платформа инвестиционного анализа с 5 агентами и Судьёй.

## 📦 Структура проекта

```
synapse-judgement/
├── frontend/              # React + Vite + Tailwind (порт 5173)
├── backend/               # Node.js + Express + Prisma (порт 3001)
├── scripts/               # Скрипты автоматизации
├── docker/                # Docker конфигурации
└── README.md              # Этот файл
```

## 🚀 Быстрый старт

### Требования
- Node.js 18+
- PostgreSQL 14+
- npm

### 1. Установка зависимостей

```bash
# Установить все зависимости
npm run install:all

# Или по отдельности
cd frontend && npm install
cd ../backend && npm install
```

### 2. Настройка базы данных

```bash
# Создать БД
createdb synapse_judgement

# Настроить backend/.env
cd backend
cp .env.example .env
# Отредактировать DATABASE_URL

# Инициализировать БД
npm run db:generate
npm run db:push
npm run db:seed
```

### 3. Запуск

```bash
# Запустить оба проекта
npm run dev

# Или по отдельности
npm run dev:frontend   # http://localhost:5173
npm run dev:backend    # http://localhost:3001
```

### 4. Открыть в браузере

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api

**Демо-доступ:**
- Email: `demo@synapse.ai`
- Password: `demo123`

## 📚 Документация

- [Frontend README](./frontend/README.md)
- [Backend README](./backend/README.md)
- [Setup Guide](./SETUP_GUIDE.md)

## 🛠 Команды

```bash
npm run dev              # Запустить frontend + backend
npm run dev:frontend     # Только frontend
npm run dev:backend      # Только backend
npm run build            # Собрать production
npm run install:all      # Установить все зависимости
npm run db:push          # Применить схему БД
npm run db:seed          # Загрузить тестовые данные
npm run db:studio        # Открыть Prisma Studio
```

## 📄 Лицензия

MIT
EOF
    echo -e "${GREEN}✓ README.md created${NC}"
    echo ""
fi

# Create frontend README if not exists
if [ ! -f "frontend/README.md" ]; then
    echo -e "${BLUE}Creating frontend README.md...${NC}"
    cat > frontend/README.md << 'EOF'
# 🎨 Frontend - Synapse Judgement

React + TypeScript + Tailwind CSS приложение для AI-платформы инвестиционного анализа.

## 📦 Технологии

- **React 18** - UI библиотека
- **TypeScript** - Типизация
- **Vite** - Build tool
- **Tailwind CSS 4** - Стилизация

## 🚀 Быстрый старт

```bash
npm install
npm run dev
```

Откройте http://localhost:5173

## 📁 Структура

```
frontend/
├── src/
│   ├── components/     # React компоненты
│   ├── lib/           # Утилиты, хуки
│   ├── data/          # Мок-данные
│   ├── App.tsx        # Главный компонент
│   ├── main.tsx       # Точка входа
│   └── index.css      # Глобальные стили
├── index.html
├── vite.config.js
├── tsconfig.json
└── package.json
```

## 📝 Скрипты

```bash
npm run dev          # Запуск dev сервера
npm run build        # Production сборка
npm run preview      # Preview production сборки
npm run lint         # Проверка типов
```

## 🔗 Интеграция с Backend

API запросы проксируются через Vite:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

Все `/api/*` запросы автоматически перенаправляются на backend.
EOF
    echo -e "${GREEN}✓ frontend/README.md created${NC}"
    echo ""
fi

echo -e "${GREEN}====================================${NC}"
echo -e "${GREEN}✓ Restructuring complete!${NC}"
echo -e "${GREEN}====================================${NC}"
echo ""
echo -e "${BLUE}New structure:${NC}"
echo "  synapse-judgement/"
echo "  ├── frontend/     # React app"
echo "  ├── backend/      # Node.js API"
echo "  ├── scripts/      # Automation scripts"
echo "  └── README.md     # Documentation"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Install dependencies: npm run install:all"
echo "  2. Setup database: cd backend && npm run db:push && npm run db:seed"
echo "  3. Start project: npm run dev"
echo ""
