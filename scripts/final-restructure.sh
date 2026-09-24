#!/bin/bash

# Финальная реструктуризация проекта
# Выполните этот скрипт для правильной структуры монорепо

set -e

echo "🔄 Финальная реструктуризация проекта..."
echo ""

# Цвета
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Проверка
if [ ! -d "src" ]; then
    echo -e "${GREEN}✓ Файлы уже в правильной структуре${NC}"
    exit 0
fi

echo -e "${BLUE}📁 Создание структуры frontend/src/...${NC}"
mkdir -p frontend/src/components
mkdir -p frontend/src/lib
mkdir -p frontend/src/data

echo -e "${BLUE}📦 Перемещение файлов из src/ в frontend/src/...${NC}"

# Перемещаем все файлы из src/ в frontend/src/
cp -r src/* frontend/src/

# Удаляем старую src/
rm -rf src

echo -e "${GREEN}✓ Файлы перемещены${NC}"
echo ""

# Удаляем дубликаты из корня
echo -e "${BLUE}🗑️  Удаление дубликатов из корня...${NC}"
rm -f index.html vite.config.js tsconfig.json package-lock.json
echo -e "${GREEN}✓ Дубликаты удалены${NC}"
echo ""

# Удаляем лишние markdown файлы
echo -e "${BLUE}🗑️  Удаление лишних markdown файлов...${NC}"
rm -f ARCHITECTURE.md CHANGELOG.md CI_FIX.md CODE_OF_CONDUCT.md CONTRIBUTING.md
rm -f DEPLOYMENT.md FINAL_CHECK.md FINAL_SUMMARY.md FIX_FRONTEND_STRUCTURE.md
rm -f GITHUB_SETUP.md IMPLEMENTATION_SUMMARY.md PRODUCT_OVERVIEW.md PROJECT_STRUCTURE.md
rm -f QUICKSTART.md QUICK_REFERENCE.md RESTRUCTURE_GUIDE.md RESTRUCTURE_INSTRUCTIONS.md
rm -f SETUP_GUIDE.md STRUCTURE_CHECK.md SUMMARY.md URGENT_FIX.md VERIFICATION_COMPLETE.md
echo -e "${GREEN}✓ Лишние файлы удалены${NC}"
echo ""

# Проверяем структуру
echo -e "${BLUE}🔍 Проверка структуры...${NC}"

if [ ! -f "frontend/src/main.tsx" ]; then
    echo -e "${RED}❌ frontend/src/main.tsx не найден${NC}"
    exit 1
fi

if [ ! -f "frontend/src/App.tsx" ]; then
    echo -e "${RED}❌ frontend/src/App.tsx не найден${NC}"
    exit 1
fi

if [ ! -d "frontend/src/components" ]; then
    echo -e "${RED}❌ frontend/src/components/ не найден${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Структура корректна${NC}"
echo ""

# Итоговая структура
echo -e "${GREEN}====================================${NC}"
echo -e "${GREEN}✓ Реструктуризация завершена!${NC}"
echo -e "${GREEN}====================================${NC}"
echo ""
echo -e "${BLUE}Структура проекта:${NC}"
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
echo "  ├── scripts/"
echo "  ├── docker/"
echo "  ├── .github/"
echo "  ├── package.json          # Корневой orchestrator"
echo "  ├── README.md"
echo "  └── LICENSE"
echo ""
echo -e "${BLUE}Следующие шаги:${NC}"
echo "  1. Установить зависимости:"
echo "     cd frontend && npm install"
echo ""
echo "  2. Проверить что frontend работает:"
echo "     cd frontend && npm run dev"
echo ""
echo "  3. Закоммитить изменения:"
echo "     git add ."
echo "     git commit -m 'refactor: restructure to monorepo'"
echo "     git push"
echo ""
