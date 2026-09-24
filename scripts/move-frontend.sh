#!/bin/bash

# Скрипт для перемещения frontend файлов в правильную структуру
# Запустите из корня проекта

set -e

echo "🔄 Перемещение frontend файлов..."
echo ""

# Цвета
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Проверка что мы в корне проекта
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Скрипт нужно запускать из корня проекта${NC}"
    exit 1
fi

# Проверка что есть src/ в корне
if [ ! -d "src" ]; then
    echo -e "${YELLOW}⚠️  Папка src/ не найдена в корне${NC}"
    echo -e "${GREEN}✓ Возможно, файлы уже перемещены${NC}"
    exit 0
fi

# Создаём frontend/src если не существует
echo -e "${BLUE}📁 Создание frontend/src/...${NC}"
mkdir -p frontend/src/components
mkdir -p frontend/src/lib
mkdir -p frontend/src/data
echo -e "${GREEN}✓ Папки созданы${NC}"
echo ""

# Перемещаем src/ в frontend/src/
echo -e "${BLUE}📦 Перемещение src/ в frontend/src/...${NC}"
if [ -d "frontend/src" ] && [ "$(ls -A frontend/src 2>/dev/null)" ]; then
    echo -e "${YELLOW}⚠️  frontend/src/ не пустая. Создаём backup...${NC}"
    mv frontend/src frontend/src.backup.$(date +%s)
fi

mv src frontend/
echo -e "${GREEN}✓ src/ перемещён в frontend/src/${NC}"
echo ""

# Удаляем дубликаты из корня
echo -e "${BLUE}🗑️  Удаление дубликатов из корня...${NC}"

if [ -f "index.html" ]; then
    rm index.html
    echo -e "${GREEN}✓ Удалён index.html из корня${NC}"
fi

if [ -f "vite.config.js" ]; then
    rm vite.config.js
    echo -e "${GREEN}✓ Удалён vite.config.js из корня${NC}"
fi

if [ -f "tsconfig.json" ]; then
    rm tsconfig.json
    echo -e "${GREEN}✓ Удалён tsconfig.json из корня${NC}"
fi

if [ -f "package-lock.json" ]; then
    mv package-lock.json frontend/
    echo -e "${GREEN}✓ Перемещён package-lock.json в frontend/${NC}"
fi

echo ""

# Проверка структуры
echo -e "${BLUE}🔍 Проверка структуры...${NC}"

if [ ! -d "frontend/src" ]; then
    echo -e "${RED}❌ frontend/src/ не найден${NC}"
    exit 1
fi

if [ ! -f "frontend/src/main.tsx" ]; then
    echo -e "${RED}❌ frontend/src/main.tsx не найден${NC}"
    exit 1
fi

if [ ! -f "frontend/src/App.tsx" ]; then
    echo -e "${RED}❌ frontend/src/App.tsx не найден${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Структура корректна${NC}"
echo ""

# Итоговая структура
echo -e "${GREEN}====================================${NC}"
echo -e "${GREEN}✓ Перемещение завершено!${NC}"
echo -e "${GREEN}====================================${NC}"
echo ""
echo -e "${BLUE}Новая структура:${NC}"
echo "  synapse-judgement/"
echo "  ├── frontend/"
echo "  │   ├── src/              # ✅ Исходники frontend"
echo "  │   │   ├── components/"
echo "  │   │   ├── lib/"
echo "  │   │   ├── data/"
echo "  │   │   ├── App.tsx"
echo "  │   │   └── main.tsx"
echo "  │   ├── package.json"
echo "  │   ├── vite.config.js"
echo "  │   ├── tsconfig.json"
echo "  │   └── index.html"
echo "  ├── backend/"
echo "  │   └── ..."
echo "  └── package.json          # Корневой orchestrator"
echo ""
echo -e "${BLUE}Следующие шаги:${NC}"
echo "  1. Установить зависимости:"
echo "     cd frontend && npm install"
echo ""
echo "  2. Проверить что frontend запускается:"
echo "     cd frontend && npm run dev"
echo ""
echo "  3. Закоммитить изменения:"
echo "     git add ."
echo "     git commit -m 'fix: move frontend files to frontend/ directory'"
echo "     git push"
echo ""
