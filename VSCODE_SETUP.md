# 🚀 Запуск проекта Synapse Judgement в VSCode

Полная пошаговая инструкция по настройке и запуску проекта в Visual Studio Code.

---

## 📋 Содержание

1. [Требования](#1-требования)
2. [Установка VSCode и расширений](#2-установка-vscode-и-расширений)
3. [Клонирование проекта](#3-клонирование-проекта)
4. [Установка PostgreSQL](#4-установка-postgresql)
5. [Настройка проекта](#5-настройка-проекта)
6. [Открытие в VSCode](#6-открытие-в-vscode)
7. [Запуск проекта](#7-запуск-проекта)
8. [Отладка](#8-отладка)
9. [Полезные команды](#9-полезные-команды)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Требования

### Обязательные:
- **VSCode** (последняя версия) - https://code.visualstudio.com/
- **Node.js 18+** - https://nodejs.org/
- **npm 9+** (устанавливается с Node.js)
- **PostgreSQL 14+** - https://www.postgresql.org/download/
- **Git** - https://git-scm.com/

### Проверка установки:

```bash
# Откройте терминал в VSCode (Ctrl+` или Cmd+`)
node --version    # Должно показать v18.x.x или выше
npm --version     # Должно показать 9.x.x или выше
psql --version    # Должно показать 14.x или выше
git --version     # Должно показать версию git
```

---

## 2. Установка VSCode и расширений

### Рекомендуемые расширения:

Откройте VSCode → Extensions (Ctrl+Shift+X / Cmd+Shift+X) и установите:

**Обязательные:**
- ✅ **ESLint** (`dbaeumer.vscode-eslint`) - линтер для JavaScript/TypeScript
- ✅ **Prettier** (`esbenp.prettier-vscode`) - форматирование кода
- ✅ **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`) - автодополнение Tailwind
- ✅ **Prisma** (`prisma.prisma`) - поддержка Prisma ORM

**Рекомендуемые:**
- 🔹 **ES7+ React Snippets** (`dsznajder.es7-react-js-snippets`) - сниппеты для React
- 🔹 **Auto Rename Tag** (`formulahendry.auto-rename-tag`) - автоматическое переименование тегов
- 🔹 **Path Intellisense** (`christian-kohler.path-intellisense`) - автодополнение путей
- 🔹 **REST Client** (`humao.rest-client`) - тестирование API прямо в VSCode
- 🔹 **Docker** (`ms-azuretools.vscode-docker`) - работа с Docker
- 🔹 **Material Icon Theme** (`PKief.material-icon-theme`) - красивые иконки

**Автоматическая установка:**
Проект уже содержит файл `.vscode/extensions.json` - при открытии проекта VSCode предложит установить рекомендуемые расширения.

---

## 3. Клонирование проекта

```bash
# Перейдите в папку проектов
cd ~/projects

# Клонируйте репозиторий
git clone https://github.com/toncho666/synapse_judgement.git

# Перейдите в папку проекта
cd synapse_judgement
```

**Или** откройте VSCode и:
1. `File` → `Open Folder` → выберите папку `synapse_judgement`
2. Или через командную строку: `code synapse_judgement`

---

## 4. Установка PostgreSQL

### macOS (Homebrew):

```bash
# Установите PostgreSQL
brew install postgresql@15

# Запустите службу
brew services start postgresql@15

# Проверьте что запущен
pg_isready
# Должно показать: localhost:5432 - accepting connections
```

### Windows:

1. Скачайте установщик с https://www.postgresql.org/download/windows/
2. Запустите установщик
3. **ВАЖНО:** Запомните пароль для пользователя `postgres`
4. Убедитесь что служба PostgreSQL запущена

### Linux (Ubuntu/Debian):

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Создание базы данных:

```bash
# macOS/Linux (без пароля)
createdb synapse_judgement

# Windows (с паролем)
psql -U postgres
CREATE DATABASE synapse_judgement;
\q
```

---

## 5. Настройка проекта

### Шаг 1: Установка зависимостей

**Через VSCode Tasks (рекомендуется):**
1. Откройте VSCode
2. `Terminal` → `Run Task...` (Ctrl+Shift+P → "Tasks: Run Task")
3. Выберите **"Install All Dependencies"**

**Или через терминал:**
```bash
# Из корня проекта
npm run install:all

# Или по отдельности
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
```

### Шаг 2: Настройка .env файла

```bash
# Перейдите в backend
cd backend

# Скопируйте шаблон
cp .env.example .env

# Откройте .env в VSCode
code .env
```

**Отредактируйте `DATABASE_URL`:**

```env
# macOS (без пароля)
DATABASE_URL="postgresql://ваш_username@localhost:5432/synapse_judgement?schema=public"

# Windows/Linux (с паролем)
DATABASE_URL="postgresql://postgres:ваш_пароль@localhost:5432/synapse_judgement?schema=public"
```

**Получить username на macOS:**
```bash
whoami
```

### Шаг 3: Инициализация базы данных

**Через VSCode Tasks:**
1. `Terminal` → `Run Task...` → **"Database: Full Setup"**

**Или через терминал:**
```bash
cd backend
npm run db:generate   # Генерация Prisma Client
npm run db:push       # Применение схемы к БД
npm run db:seed       # Загрузка тестовых данных
```

**Ожидаемый вывод:**
```
✅ Generated Prisma Client
✅ Your database is now in sync with your Prisma schema
✅ Created demo user: demo@synapse.ai
✅ Created session: AAPL (BUY)
✅ Created session: TSLA (HOLD)
✅ Created session: NVDA (BUY)
```

### Шаг 4: Настройка Alpha Vantage API (опционально)

Для получения реальных котировок акций:

1. Получите бесплатный API ключ: https://www.alphavantage.co/support/#api-key
2. Добавьте в `backend/.env`:

```env
ALPHA_VANTAGE_API_KEY="ваш_api_ключ"
```

**Без API ключа** будут использоваться мок-данные.

---

## 6. Открытие в VSCode

### Вариант 1: Multi-root Workspace (рекомендуется)

Откройте файл `synapse-judgement.code-workspace`:

```bash
# Через терминал
code synapse-judgement.code-workspace

# Или в VSCode
File → Open Workspace from File... → выберите synapse-judgement.code-workspace
```

Это откроет проект с разделением на логические части:
- 📦 Synapse Judgement (Root)
- 🎨 Frontend
- ⚙️ Backend
- 🐳 Docker
- 📜 Scripts

### Вариант 2: Обычная папка

```bash
code .
```

---

## 7. Запуск проекта

### Способ 1: Через VSCode Tasks (самый простой)

1. Откройте Command Palette: `Ctrl+Shift+P` (Windows/Linux) или `Cmd+Shift+P` (macOS)
2. Введите: **"Tasks: Run Task"**
3. Выберите **"Start All Services"**

Это запустит одновременно:
- ✅ Frontend на http://localhost:5173
- ✅ Backend на http://localhost:3001

### Способ 2: Через два терминала

**Терминал 1 - Backend:**
1. Откройте терминал: `Ctrl+` ` (или `Terminal` → `New Terminal`)
2. Выполните:
```bash
cd backend
npm run dev
```

**Терминал 2 - Frontend:**
1. Откройте второй терминал: `Ctrl+Shift+` ` (или `Terminal` → `New Terminal`)
2. Выполните:
```bash
cd frontend
npm run dev
```

### Способ 3: Через корневой package.json

```bash
# Из корня проекта
npm run dev
```

### Проверка работы:

**Backend:**
```bash
curl http://localhost:3001/health
# Должно вернуть: {"status":"ok","timestamp":"..."}
```

**Frontend:**
Откройте браузер: http://localhost:5173

**Демо-доступ:**
- Email: `demo@synapse.ai`
- Password: `demo123`

---

## 8. Отладка

### Отладка Frontend

1. Откройте файл `frontend/src/App.tsx`
2. Поставьте breakpoint (кликните слева от номера строки)
3. Откройте Debug Panel: `Ctrl+Shift+D` (или `Cmd+Shift+D`)
4. Выберите конфигурацию: **"Debug Frontend (Chrome)"**
5. Нажмите **F5** или зеленую кнопку Play

Откроется Chrome с подключенным отладчиком.

### Отладка Backend

1. Откройте файл `backend/src/index.ts`
2. Поставьте breakpoint
3. Выберите конфигурацию: **"Debug Backend (Node.js)"**
4. Нажмите **F5**

### Полная отладка (Full Stack)

1. Выберите конфигурацию: **"Full Stack Debug"**
2. Нажмите **F5**

Это запустит отладку одновременно для frontend и backend.

---

## 9. Полезные команды

### Через Command Palette (Ctrl+Shift+P / Cmd+Shift+P):

**Tasks:**
- `Tasks: Run Task` → Запуск задач
- `Tasks: Run Build Task` → Запуск сборки (Ctrl+Shift+B / Cmd+Shift+B)

**Terminal:**
- `Terminal: Create New Terminal` → Новый терминал (Ctrl+Shift+` / Cmd+Shift+`)
- `Terminal: Kill All Terminals` → Закрыть все терминалы

**Debug:**
- `Debug: Start Debugging` → Запуск отладки (F5)
- `Debug: Stop` → Остановка отладки (Shift+F5)
- `Debug: Restart` → Перезапуск отладки (Ctrl+Shift+F5 / Cmd+Shift+F5)

### Горячие клавиши:

**Навигация:**
- `Ctrl+P` / `Cmd+P` → Быстрый переход к файлу
- `Ctrl+Shift+P` / `Cmd+Shift+P` → Command Palette
- `Ctrl+G` / `Cmd+G` → Переход к строке
- `Ctrl+Tab` → Переключение между файлами

**Редактирование:**
- `Ctrl+D` / `Cmd+D` → Выделить следующее вхождение
- `Ctrl+Shift+L` / `Cmd+Shift+L` → Выделить все вхождения
- `Alt+Up/Down` / `Option+Up/Down` → Переместить строку
- `Ctrl+/` / `Cmd+/` → Закомментировать строку

**Поиск:**
- `Ctrl+F` / `Cmd+F` → Поиск в файле
- `Ctrl+Shift+F` / `Cmd+Shift+F` → Поиск во всех файлах
- `Ctrl+H` / `Cmd+H` → Поиск и замена

### VSCode Tasks (доступны через `Terminal` → `Run Task`):

**Установка:**
- `Install All Dependencies` - установить все зависимости
- `Install Frontend Dependencies` - только frontend
- `Install Backend Dependencies` - только backend

**Запуск:**
- `Start Frontend` - запустить frontend
- `Start Backend` - запустить backend
- `Start All Services` - запустить оба (по умолчанию)

**База данных:**
- `Database: Generate Prisma Client` - генерация клиента
- `Database: Push Schema` - применение схемы
- `Database: Seed Data` - загрузка тестовых данных
- `Database: Open Prisma Studio` - открыть Prisma Studio
- `Database: Full Setup` - полная настройка БД

**Тестирование:**
- `Test: API Health Check` - проверка health endpoint
- `Test: Stock Quotes API` - тест API котировок
- `Test: Technical Analysis API` - тест API тех. анализа

**Сборка:**
- `Build Frontend` - сборка frontend
- `Build Backend` - сборка backend

---

## 10. Troubleshooting

### Проблема: "Cannot find module"

**Решение:**
```bash
# Переустановите зависимости
cd frontend && rm -rf node_modules && npm install
cd ../backend && rm -rf node_modules && npm install
```

### Проблема: "Port 3001 already in use"

**Решение:**
```bash
# Найти процесс
lsof -i :3001

# Убить процесс
kill -9 <PID>

# Или изменить порт в backend/.env
nano backend/.env
# Измените PORT=3002
```

### Проблема: "Database connection failed"

**Решение:**
```bash
# Проверьте что PostgreSQL запущен
pg_isready

# Если не запущен:
# macOS
brew services start postgresql@15

# Linux
sudo systemctl start postgresql

# Windows
# Запустите службу PostgreSQL через Services
```

### Проблема: "P1010: User was denied access"

**Решение:**
Проверьте `DATABASE_URL` в `backend/.env`:

```env
# macOS (без пароля)
DATABASE_URL="postgresql://ваш_username@localhost:5432/synapse_judgement"

# Windows/Linux (с паролем)
DATABASE_URL="postgresql://postgres:ваш_пароль@localhost:5432/synapse_judgement"
```

### Проблема: Frontend не загружается

**Решение:**
```bash
# Очистите кэш Vite
cd frontend
rm -rf node_modules/.vite
npm run dev
```

### Проблема: Prisma Client not generated

**Решение:**
```bash
cd backend
npm run db:generate
```

### Проблема: TypeScript ошибки

**Решение:**
```bash
# Проверьте типы
cd frontend && npm run lint
cd backend && npm run lint
```

### Проблема: VSCode не видит файлы

**Решение:**
1. Закройте VSCode
2. Удалите папку `.vscode` (если есть)
3. Откройте проект заново
4. VSCode пересоздаст конфигурацию

---

## 📚 Дополнительные ресурсы

### Полезные ссылки:
- **VSCode документация**: https://code.visualstudio.com/docs
- **Prisma документация**: https://www.prisma.io/docs
- **React документация**: https://react.dev
- **Express документация**: https://expressjs.com

### Горячие клавиши VSCode:
- https://code.visualstudio.com/shortcuts/keyboard-shortcuts-macos.pdf
- https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf

---

## ✅ Чеклист успешного запуска

- [ ] VSCode установлен
- [ ] Рекомендуемые расширения установлены
- [ ] Node.js 18+ установлен
- [ ] PostgreSQL установлен и запущен
- [ ] База данных `synapse_judgement` создана
- [ ] Зависимости установлены (`npm run install:all`)
- [ ] `backend/.env` настроен с правильным `DATABASE_URL`
- [ ] Prisma Client сгенерирован (`npm run db:generate`)
- [ ] Схема применена к БД (`npm run db:push`)
- [ ] Тестовые данные загружены (`npm run db:seed`)
- [ ] Backend запущен (http://localhost:3001/health работает)
- [ ] Frontend запущен (http://localhost:5173 открывается)
- [ ] Можно войти с demo@synapse.ai / demo123
- [ ] Можно запустить анализ и увидеть результат

---

## 🎯 Быстрый старт (одной командой)

Если всё уже настроено:

```bash
# Запустить оба проекта
npm run dev
```

Или через VSCode:
1. `Ctrl+Shift+P` → "Tasks: Run Task"
2. Выберите "Start All Services"

---

**Готово! Проект запущен и готов к разработке!** 🚀

Если возникли проблемы, проверьте раздел [Troubleshooting](#10-troubleshooting) или создайте issue на GitHub.
