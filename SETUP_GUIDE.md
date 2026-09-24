# 🚀 Полное руководство по установке

## 📋 Требования

- **Node.js** 18+ ([скачать](https://nodejs.org/))
- **PostgreSQL** 14+ ([скачать](https://www.postgresql.org/download/))
- **Git** ([скачать](https://git-scm.com/))
- **npm** 9+ (устанавливается с Node.js)

---

## 🍎 macOS (Homebrew)

### 1. Установка Homebrew

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Установка Node.js

```bash
brew install node@20
node --version  # Должно показать v20.x.x
```

### 3. Установка PostgreSQL

```bash
brew install postgresql@15
brew services start postgresql@15
pg_isready  # Должно показать: accepting connections
```

### 4. Клонирование проекта

```bash
git clone <your-repo-url>
cd synapse-judgement
```

### 5. Установка зависимостей

```bash
make install
# или
npm run install:all
```

### 6. Настройка базы данных

```bash
# Создать базу данных
createdb synapse_judgement

# Настроить переменные окружения
cp backend/.env.example backend/.env
nano backend/.env
# Изменить DATABASE_URL на: postgresql://your_user@localhost:5432/synapse_judgement

# Инициализировать БД
make db-setup
# или
npm run db:push
npm run db:seed
```

### 7. Запуск

```bash
make dev
# или
npm run dev
```

Откройте:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

---

## 🐧 Linux (Ubuntu/Debian)

### 1. Установка Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
```

### 2. Установка PostgreSQL

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 3. Создание пользователя и БД

```bash
sudo -u postgres psql

# В PostgreSQL:
CREATE USER your_user WITH PASSWORD 'your_password';
CREATE DATABASE synapse_judgement OWNER your_user;
\q
```

### 4. Клонирование и установка

```bash
git clone <your-repo-url>
cd synapse-judgement
make install
```

### 5. Настройка БД

```bash
# Настроить backend/.env
cp backend/.env.example backend/.env
nano backend/.env
# DATABASE_URL="postgresql://your_user:your_password@localhost:5432/synapse_judgement"

# Инициализировать
make db-setup
```

### 6. Запуск

```bash
make dev
```

---

## 🪟 Windows

### 1. Установка Node.js

Скачайте и установите с [nodejs.org](https://nodejs.org/)

### 2. Установка PostgreSQL

Скачайте и установите с [postgresql.org](https://www.postgresql.org/download/windows/)

Во время установки:
- Установите пароль для пользователя `postgres`
- Запомните порт (обычно 5432)

### 3. Создание базы данных

Откройте **pgAdmin** или **psql**:

```sql
CREATE DATABASE synapse_judgement;
```

### 4. Клонирование и установка

```powershell
git clone <your-repo-url>
cd synapse-judgement
npm run install:all
```

### 5. Настройка БД

```powershell
# Скопировать .env
copy backend\.env.example backend\.env
notepad backend\.env

# Изменить DATABASE_URL:
# postgresql://postgres:your_password@localhost:5432/synapse_judgement

# Инициализировать
cd backend
npm run db:generate
npm run db:push
npm run db:seed
```

### 6. Запуск

Откройте **два терминала**:

**Терминал 1 (Backend):**
```powershell
cd backend
npm run dev
```

**Терминал 2 (Frontend):**
```powershell
cd frontend
npm run dev
```

---

## 🐳 Docker (все платформы)

### 1. Установите Docker Desktop

- [macOS](https://docs.docker.com/desktop/install/mac-install/)
- [Windows](https://docs.docker.com/desktop/install/windows-install/)
- [Linux](https://docs.docker.com/desktop/install/linux-install/)

### 2. Запустите всё одной командой

```bash
docker-compose up -d
```

### 3. Откройте

- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Database: localhost:5432

### 4. Остановите

```bash
docker-compose down
```

---

## ✅ Проверка установки

### 1. Проверьте версии

```bash
node --version      # v18+ или v20+
npm --version       # 9+
psql --version      # 14+
git --version       # 2+
```

### 2. Проверьте PostgreSQL

```bash
pg_isready
# Должно показать: accepting connections
```

### 3. Проверьте базу данных

```bash
psql -d synapse_judgement -c "SELECT 1;"
# Должно показать: ?column? = 1
```

### 4. Проверьте backend

```bash
curl http://localhost:3001/health
# Должно вернуть: {"status":"ok","timestamp":"..."}
```

### 5. Проверьте frontend

Откройте http://localhost:5173 в браузере

---

## 🔧 Решение проблем

### Проблема: "command not found: node"

**Решение:**
```bash
# macOS
brew install node@20
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Linux
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Проблема: PostgreSQL не запускается

**Решение:**
```bash
# macOS
brew services start postgresql@15

# Linux
sudo systemctl start postgresql

# Проверьте статус
pg_isready
```

### Проблема: "Database does not exist"

**Решение:**
```bash
createdb synapse_judgement
# или
psql -U postgres -c "CREATE DATABASE synapse_judgement;"
```

### Проблема: "Port 3001 already in use"

**Решение:**
```bash
# Найти процесс
lsof -i :3001

# Убить процесс
kill -9 <PID>

# Или изменить порт в backend/.env
```

### Проблема: Фронтенд без стилей

**Решение:**
```bash
cd frontend
rm -rf node_modules/.vite
npm run dev
```

### Проблема: Prisma ошибки

**Решение:**
```bash
cd backend
npm run db:generate
npm run db:push
```

---

## 📊 Полезные команды

### Управление проектом

```bash
make help              # Показать все команды
make install           # Установить зависимости
make dev               # Запустить оба проекта
make backend           # Только backend
make frontend          # Только frontend
make db-setup          # Настроить БД
make db-reset          # Сбросить БД
make stop              # Остановить всё
make clean             # Очистить node_modules
make status            # Показать статус сервисов
```

### Работа с базой данных

```bash
cd backend
npm run db:studio      # Открыть веб-интерфейс БД
npm run db:push        # Применить схему
npm run db:seed        # Загрузить тестовые данные
npm run db:reset       # Сбросить и пересоздать
```

### Логи

```bash
make logs              # Логи backend
make logs-error        # Только ошибки
```

---

## 🎯 Первый запуск

### 1. Войдите в систему

Откройте http://localhost:5173

**Демо-доступ:**
- Email: `demo@synapse.ai`
- Password: `demo123`

### 2. Изучите агентов

Перейдите в раздел "Agents" и кликните на любого агента для просмотра детальной информации.

### 3. Запустите анализ

1. Введите тикер (например, AAPL)
2. Выберите агентов
3. Нажмите "Run Analysis"
4. Дождитесь результата (~90 секунд)

### 4. Проверьте дашборд

Перейдите в личный кабинет для просмотра:
- Истории анализов
- Статистики
- Достижений
- Реферального кода

---

## 📚 Дополнительная информация

- [Backend API Documentation](./backend/README.md)
- [Frontend Guide](./frontend/README.md)
- [Contributing Guide](./CONTRIBUTING.md)
- [Deployment Guide](./DEPLOYMENT.md)

---

## 💡 Советы

### Для разработки

```bash
# Используйте два терминала
# Терминал 1: backend
cd backend && npm run dev

# Терминал 2: frontend
cd frontend && npm run dev
```

### Для тестирования API

```bash
# Импортируйте Postman коллекцию
# backend/postman_collection.json

# Или используйте curl
curl http://localhost:3001/api/agents
```

### Для отладки

```bash
# Включите debug логи
# backend/.env
LOG_LEVEL="debug"

# Смотрите логи
tail -f backend/logs/combined.log
```

---

## 🆘 Поддержка

Если возникли проблемы:

1. Проверьте [Troubleshooting](#-решение-проблем)
2. Проверьте логи: `make logs`
3. Проверьте статус: `make status`
4. Создайте issue на GitHub

---

**Удачи в разработке! 🚀**
