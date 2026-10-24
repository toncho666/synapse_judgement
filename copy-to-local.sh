#!/bin/bash

# Скрипт для копирования всех файлов проекта из текущей директории
# в ваш локальный проект

echo "📦 Копирование файлов проекта Synapse Judgement"
echo ""

# Целевая директория (измените на ваш путь)
TARGET_DIR="/Users/anton/projects/StrategyAI/StrategyAI"

if [ ! -d "$TARGET_DIR" ]; then
    echo "❌ Директория $TARGET_DIR не найдена!"
    echo "Создайте её или измените путь в скрипте"
    exit 1
fi

echo "✅ Целевая директория: $TARGET_DIR"
echo ""

# Копирование frontend файлов
echo "📁 Копирование frontend..."
mkdir -p "$TARGET_DIR/frontend/src/components"
mkdir -p "$TARGET_DIR/frontend/src/hooks"
mkdir -p "$TARGET_DIR/frontend/src/lib"
mkdir -p "$TARGET_DIR/frontend/src/data"

# Основные frontend файлы
cp -v src/App.tsx "$TARGET_DIR/frontend/src/" 2>/dev/null || echo "⚠️  App.tsx не найден"
cp -v src/components/TechnicalAnalysisPanel.tsx "$TARGET_DIR/frontend/src/components/" 2>/dev/null || echo "⚠️  TechnicalAnalysisPanel.tsx не найден"
cp -v src/hooks/useTechnicalAnalysis.ts "$TARGET_DIR/frontend/src/hooks/" 2>/dev/null || echo "⚠️  useTechnicalAnalysis.ts не найден"
cp -v src/hooks/useStocks.ts "$TARGET_DIR/frontend/src/hooks/" 2>/dev/null || echo "⚠️  useStocks.ts не найден"
cp -v src/components/AgentPage.tsx "$TARGET_DIR/frontend/src/components/" 2>/dev/null || echo "⚠️  AgentPage.tsx не найден"
cp -v src/components/Icon.tsx "$TARGET_DIR/frontend/src/components/" 2>/dev/null || echo "⚠️  Icon.tsx не найден"
cp -v src/components/Reveal.tsx "$TARGET_DIR/frontend/src/components/" 2>/dev/null || echo "⚠️  Reveal.tsx не найден"
cp -v src/lib/engine.ts "$TARGET_DIR/frontend/src/lib/" 2>/dev/null || echo "⚠️  engine.ts не найден"
cp -v src/lib/auth.ts "$TARGET_DIR/frontend/src/lib/" 2>/dev/null || echo "⚠️  auth.ts не найден"
cp -v src/lib/hooks.ts "$TARGET_DIR/frontend/src/lib/" 2>/dev/null || echo "⚠️  hooks.ts не найден"
cp -v src/lib/router.ts "$TARGET_DIR/frontend/src/lib/" 2>/dev/null || echo "⚠️  router.ts не найден"
cp -v src/data/agentMock.ts "$TARGET_DIR/frontend/src/data/" 2>/dev/null || echo "⚠️  agentMock.ts не найден"
cp -v src/index.css "$TARGET_DIR/frontend/src/" 2>/dev/null || echo "⚠️  index.css не найден"
cp -v src/main.tsx "$TARGET_DIR/frontend/src/" 2>/dev/null || echo "⚠️  main.tsx не найден"

# Frontend конфигурация
cp -v frontend/package.json "$TARGET_DIR/frontend/" 2>/dev/null || echo "⚠️  frontend/package.json не найден"
cp -v frontend/index.html "$TARGET_DIR/frontend/" 2>/dev/null || echo "⚠️  frontend/index.html не найден"
cp -v frontend/vite.config.js "$TARGET_DIR/frontend/" 2>/dev/null || echo "⚠️  frontend/vite.config.js не найден"
cp -v frontend/tsconfig.json "$TARGET_DIR/frontend/" 2>/dev/null || echo "⚠️  frontend/tsconfig.json не найден"

echo ""

# Копирование backend файлов
echo "📁 Копирование backend..."
mkdir -p "$TARGET_DIR/backend/src/services"
mkdir -p "$TARGET_DIR/backend/src/routes"
mkdir -p "$TARGET_DIR/backend/src/controllers"
mkdir -p "$TARGET_DIR/backend/src/middleware"
mkdir -p "$TARGET_DIR/backend/src/utils"
mkdir -p "$TARGET_DIR/backend/src/config"
mkdir -p "$TARGET_DIR/backend/prisma"

# Backend сервисы
cp -v backend/src/services/technical-analysis.service.ts "$TARGET_DIR/backend/src/services/" 2>/dev/null || echo "⚠️  technical-analysis.service.ts не найден"
cp -v backend/src/services/stock.service.ts "$TARGET_DIR/backend/src/services/" 2>/dev/null || echo "⚠️  stock.service.ts не найден"
cp -v backend/src/services/auth.service.ts "$TARGET_DIR/backend/src/services/" 2>/dev/null || echo "⚠️  auth.service.ts не найден"
cp -v backend/src/services/agents.service.ts "$TARGET_DIR/backend/src/services/" 2>/dev/null || echo "⚠️  agents.service.ts не найден"
cp -v backend/src/services/analysis.service.ts "$TARGET_DIR/backend/src/services/" 2>/dev/null || echo "⚠️  analysis.service.ts не найден"
cp -v backend/src/services/user.service.ts "$TARGET_DIR/backend/src/services/" 2>/dev/null || echo "⚠️  user.service.ts не найден"

# Backend роуты
cp -v backend/src/routes/technical-analysis.routes.ts "$TARGET_DIR/backend/src/routes/" 2>/dev/null || echo "⚠️  technical-analysis.routes.ts не найден"
cp -v backend/src/routes/stocks.routes.ts "$TARGET_DIR/backend/src/routes/" 2>/dev/null || echo "⚠️  stocks.routes.ts не найден"
cp -v backend/src/routes/auth.routes.ts "$TARGET_DIR/backend/src/routes/" 2>/dev/null || echo "⚠️  auth.routes.ts не найден"
cp -v backend/src/routes/agents.routes.ts "$TARGET_DIR/backend/src/routes/" 2>/dev/null || echo "⚠️  agents.routes.ts не найден"
cp -v backend/src/routes/analysis.routes.ts "$TARGET_DIR/backend/src/routes/" 2>/dev/null || echo "⚠️  analysis.routes.ts не найден"
cp -v backend/src/routes/user.routes.ts "$TARGET_DIR/backend/src/routes/" 2>/dev/null || echo "⚠️  user.routes.ts не найден"

# Backend остальное
cp -v backend/src/index.ts "$TARGET_DIR/backend/src/" 2>/dev/null || echo "⚠️  backend/src/index.ts не найден"
cp -v backend/src/config/index.ts "$TARGET_DIR/backend/src/config/" 2>/dev/null || echo "⚠️  config/index.ts не найден"
cp -v backend/prisma/schema.prisma "$TARGET_DIR/backend/prisma/" 2>/dev/null || echo "⚠️  schema.prisma не найден"
cp -v backend/prisma/seed.ts "$TARGET_DIR/backend/prisma/" 2>/dev/null || echo "⚠️  seed.ts не найден"
cp -v backend/package.json "$TARGET_DIR/backend/" 2>/dev/null || echo "⚠️  backend/package.json не найден"
cp -v backend/tsconfig.json "$TARGET_DIR/backend/" 2>/dev/null || echo "⚠️  backend/tsconfig.json не найден"
cp -v backend/.env.example "$TARGET_DIR/backend/" 2>/dev/null || echo "⚠️  .env.example не найден"

echo ""

# Копирование корневых файлов
echo "📁 Копирование корневых файлов..."
cp -v package.json "$TARGET_DIR/" 2>/dev/null || echo "⚠️  package.json не найден"
cp -v README.md "$TARGET_DIR/" 2>/dev/null || echo "⚠️  README.md не найден"
cp -v .gitignore "$TARGET_DIR/" 2>/dev/null || echo "⚠️  .gitignore не найден"

echo ""
echo "✅ Копирование завершено!"
echo ""
echo "📋 Следующие шаги:"
echo "1. cd $TARGET_DIR"
echo "2. git add ."
echo "3. git commit -m 'feat: add technical analysis and stock quotes'"
echo "4. git push origin main"
echo ""
