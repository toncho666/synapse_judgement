#!/bin/bash

# Скрипт автоматической настройки проекта Synapse Judgement
# Запуск: ./scripts/auto-setup.sh

set -e

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Synapse Judgement - Автоматическая настройка${NC}"
echo ""

# Проверка что мы в корне проекта
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Ошибка: package.json не найден в текущей директории${NC}"
    echo -e "${YELLOW}Перейдите в корень проекта и запустите скрипт снова${NC}"
    exit 1
fi

# Шаг 1: Удаление лишних файлов
echo -e "${BLUE}📦 Шаг 1: Удаление лишних файлов из корня...${NC}"
rm -f index.html tsconfig.json vite.config.js package-lock.json 2>/dev/null || true
rm -rf src/ 2>/dev/null || true
echo -e "${GREEN}✓ Лишние файлы удалены${NC}"
echo ""

# Шаг 2: Проверка структуры
echo -e "${BLUE}🔍 Шаг 2: Проверка структуры проекта...${NC}"
if [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Ошибка: папка frontend не найдена${NC}"
    exit 1
fi

if [ ! -d "backend" ]; then
    echo -e "${RED}❌ Ошибка: папка backend не найдена${NC}"
    exit 1
fi

if [ ! -d "frontend/src" ]; then
    echo -e "${RED}❌ Ошибка: папка frontend/src не найдена${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Структура проекта корректна${NC}"
echo ""

# Шаг 3: Установка зависимостей
echo -e "${BLUE}📥 Шаг 3: Установка зависимостей...${NC}"
npm run install:all
echo -e "${GREEN}✓ Зависимости установлены${NC}"
echo ""

# Шаг 4: Настройка базы данных
echo -e "${BLUE}🗄️  Шаг 4: Настройка базы данных...${NC}"

# Проверка PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL не установлен${NC}"
    echo -e "${YELLOW}Установите PostgreSQL и создайте базу данных вручную:${NC}"
    echo -e "${YELLOW}  createdb synapse_judgement${NC}"
else
    # Создание базы данных
    if ! psql -lqt | cut -d \| -f 1 | grep -qw synapse_judgement; then
        echo -e "${BLUE}Создание базы данных...${NC}"
        createdb synapse_judgement || {
            echo -e "${YELLOW}⚠️  Не удалось создать базу данных автоматически${NC}"
            echo -e "${YELLOW}Создайте вручную: createdb synapse_judgement${NC}"
        }
    else
        echo -e "${GREEN}✓ База данных уже существует${NC}"
    fi
fi

# Настройка .env
if [ ! -f "backend/.env" ]; then
    echo -e "${BLUE}Создание backend/.env...${NC}"
    cp backend/.env.example backend/.env
    
    # Получение имени пользователя
    CURRENT_USER=$(whoami)
    
    # Обновление DATABASE_URL
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|postgresql://.*|postgresql://$CURRENT_USER@localhost:5432/synapse_judgement?schema=public\"|" backend/.env
    else
        # Linux
        sed -i "s|postgresql://.*|postgresql://$CURRENT_USER@localhost:5432/synapse_judgement?schema=public\"|" backend/.env
    fi
    
    echo -e "${GREEN}✓ backend/.env создан${NC}"
    echo -e "${YELLOW}⚠️  Проверьте backend/.env и убедитесь что DATABASE_URL правильный${NC}"
else
    echo -e "${GREEN}✓ backend/.env уже существует${NC}"
fi

# Инициализация базы данных
echo -e "${BLUE}Инициализация базы данных...${NC}"
npm run db:generate
npm run db:push
npm run db:seed
echo -e "${GREEN}✓ База данных инициализирована${NC}"
echo ""

# Шаг 5: Проверка
echo -e "${BLUE}✅ Шаг 5: Проверка настройки...${NC}"

# Проверка frontend
if [ -f "frontend/node_modules/.bin/vite" ]; then
    echo -e "${GREEN}✓ Frontend зависимости установлены${NC}"
else
    echo -e "${RED}❌ Frontend зависимости не установлены${NC}"
fi

# Проверка backend
if [ -f "backend/node_modules/.bin/tsx" ]; then
    echo -e "${GREEN}✓ Backend зависимости установлены${NC}"
else
    echo -e "${RED}❌ Backend зависимости не установлены${NC}"
fi

echo ""

# Финальное сообщение
echo -e "${GREEN}====================================${NC}"
echo -e "${GREEN}✓ Настройка завершена!${NC}"
echo -e "${GREEN}====================================${NC}"
echo ""
echo -e "${BLUE}Для запуска проекта выполните:${NC}"
echo -e "${YELLOW}  npm run dev${NC}"
echo ""
echo -e "${BLUE}Проект будет доступен по адресам:${NC}"
echo -e "${YELLOW}  Frontend: http://localhost:5173${NC}"
echo -e "${YELLOW}  Backend:  http://localhost:3001${NC}"
echo ""
echo -e "${BLUE}Демо-доступ:${NC}"
echo -e "${YELLOW}  Email: demo@synapse.ai${NC}"
echo -e "${YELLOW}  Password: demo123${NC}"
echo ""
echo -e "${BLUE}Полезные команды:${NC}"
echo -e "${YELLOW}  npm run dev              # Запустить оба проекта${NC}"
echo -e "${YELLOW}  npm run dev:frontend     # Только frontend${NC}"
echo -e "${YELLOW}  npm run dev:backend      # Только backend${NC}"
echo -e "${YELLOW}  npm run db:studio        # Открыть Prisma Studio${NC}"
echo ""
