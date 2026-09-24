# 🚀 Локальный запуск Synapse Judgement

Пошаговая инструкция по запуску проекта на вашем компьютере.

---

## 📋 Требования

Перед началом убедитесь что установлены:

### 1. Node.js 18+ и npm 9+

**Проверка:**
```bash
node --version   # Должно показать v18.x.x или выше
npm --version    # Должно показать 9.x.x или выше
```

**Если не установлены:**

macOS (Homebrew):
```bash
brew install node@20
```

Windows/Linux:
Скачайте с [nodejs.org](https://nodejs.org/) (LTS версия)

### 2. PostgreSQL 14+

**Проверка:**
```bash
psql --version   # Должно показать 14.x или выше
pg_isready       # Должно показать: accepting connections
```

**Если не установлен:**

macOS (Homebrew):
```bash
brew install postgresql@15
brew services start postgresql@15
```

Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

Windows:
Скачайте с [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)

---

## 📥 Шаг 1: Клонирование проекта

```bash
# Клонируйте репозиторий
git clone https://github.com/YOUR_USERNAME/synapse-judgement.git

# Перейдите в папку проекта
cd synapse-judgement
```

---

## 📦 Шаг 2: Установка зависимостей

### Frontend

```bash
cd frontend
npm install
cd ..
```

### Backend

```bash
cd backend
npm install
cd ..
```

### Или одной командой из корня

```bash
# Установить всё сразу
npm run install:all
```

---

## 🗄️ Шаг 3: Настройка базы данных

### 3.1. Создайте базу данных

**macOS/Linux:**
```bash
createdb synapse_judgement
```

**Windows (через psql):**
```bash
psql -U postgres
CREATE DATABASE synapse_judgement;
\q
```

**Проверьте что БД создана:**
```bash
psql -l | grep synapse_judgement
```

### 3.2. Настройте переменные окружения

```bash
cd backend
cp .env.example .env
```

Откройте `backend/.env` в редакторе:

```bash
nano .env
# или
code .env
# или
vim .env
```

**Измените `DATABASE_URL`:**

macOS (без пароля):
```env
DATABASE_URL="postgresql://ваш_username@localhost:5432/synapse_judgement?schema=public"
```

Linux/Windows (с паролем):
```env
DATABASE_URL="postgresql://postgres:ваш_пароль@localhost:5432/synapse_judgement?schema=public"
```

**Узнать ваше имя пользователя:**
```bash
whoami
```

Сохраните файл (`Ctrl+O`, `Enter`, `Ctrl+X` в nano).

### 3.3. Инициализируйте базу данных

```bash
cd backend

# Сгенерировать Prisma Client
npm run db:generate

# Применить схему к БД (создать таблицы)
npm run db:push

# Загрузить тестовые данные
npm run db:seed

cd ..
```

**Ожидаемый вывод:**
```
✅ Created demo user: demo@synapse.ai
✅ Created session: AAPL (BUY)
✅ Created session: TSLA (HOLD)
✅ Created session: NVDA (BUY)
✅ Created welcome transaction
🎉 Database seed completed successfully!
```

### 3.4. Проверьте БД через Prisma Studio (опционально)

```bash
cd backend
npm run db:studio
```

Откроется http://localhost:5555 - веб-интерфейс для просмотра данных.

Проверьте:
- Таблица `users` - есть пользователь `demo@synapse.ai`
- Таблица `sessions` - есть 3 сессии
- Таблица `transactions` - есть welcome bonus

Закройте Prisma Studio: `Ctrl+C`

---

## 🚀 Шаг 4: Запуск проекта

### Вариант A: Запуск обоих проектов одновременно

**Из корня проекта:**
```bash
npm run dev
```

Это запустит:
- Frontend на http://localhost:5173
- Backend на http://localhost:3001

### Вариант B: Запуск по отдельности

**Терминал 1 - Backend:**
```bash
cd backend
npm run dev
```

Ожидаемый вывод:
```
🚀 Server running on port 3001
📝 Environment: development
🔗 Frontend URL: http://localhost:5173
📊 API available at http://localhost:3001/api
```

**Терминал 2 - Frontend (Cmd+N для нового терминала):**
```bash
cd frontend
npm run dev
```

Ожидаемый вывод:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## 🌐 Шаг 5: Открытие в браузере

### Frontend

Откройте браузер (Safari, Chrome, Firefox) и перейдите:

**http://localhost:5173**

### Вход в систему

Используйте демо-доступ:
- **Email:** `demo@synapse.ai`
- **Password:** `demo123`

### Что проверить:

✅ Лендинг загружается  
✅ Видны 5 агентов (Technical, Fundamental, Portfolio, News, Earning Calls)  
✅ Можно кликнуть на агента и увидеть детальную страницу  
✅ Можно войти в систему  
✅ Видны кредиты (847)  
✅ Можно запустить анализ (введите тикер, например AAPL)  
✅ Результаты отображаются в дашборде  
✅ Видна история анализов в личном кабинете  
✅ Работает лидерборд  

### Backend API

Проверьте что API работает:

```bash
# Health check
curl http://localhost:3001/health

# Должно вернуть:
# {"status":"ok","timestamp":"2026-..."}
```

Откройте в браузере:
- http://localhost:3001/api/agents - список агентов

---

## 🧪 Шаг 6: Тестирование API

### Через curl

```bash
# 1. Войти и получить токен
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@synapse.ai","password":"demo123"}' | jq -r '.token')

echo "Token: $TOKEN"

# 2. Получить профиль
curl http://localhost:3001/api/users/me \
  -H "Authorization: Bearer $TOKEN" | jq .

# 3. Получить список агентов
curl http://localhost:3001/api/agents | jq .

# 4. Запустить анализ
curl -X POST http://localhost:3001/api/analysis/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"ticker":"AAPL","agents":["tech","fund","news"]}' | jq .

# 5. Подождать 3 секунды и получить результат
sleep 3
SESSION_ID=$(curl -s -X POST http://localhost:3001/api/analysis/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"ticker":"TSLA","agents":["tech","earn"]}' | jq -r '.sessionId')

sleep 3
curl http://localhost:3001/api/analysis/$SESSION_ID \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**Если `jq` не установлен:**
```bash
# macOS
brew install jq

# Linux
sudo apt install jq
```

### Через автоматический скрипт

```bash
cd backend
chmod +x scripts/test-api.sh
./scripts/test-api.sh
```

### Через Postman

1. Откройте Postman
2. Импортируйте `backend/postman_collection.json`
3. Используйте переменные `base_url` и `token`
4. Токен автоматически сохранится после login/register

---

## 📊 Шаг 7: Мониторинг

### Просмотр логов

```bash
# Логи backend (в терминале где запущен backend)
# Логи видны в реальном времени

# Или через файл
tail -f backend/logs/combined.log

# Только ошибки
tail -f backend/logs/error.log
```

### Просмотр базы данных

```bash
# Через Prisma Studio
cd backend
npm run db:studio
# Откроется http://localhost:5555

# Через psql
psql -d synapse_judgement

# Посмотреть пользователей
SELECT id, email, name, plan, credits FROM users;

# Посмотреть сессии
SELECT id, ticker, verdict, confidence, cost FROM sessions;

# Выйти
\q
```

---

## 🛑 Остановка серверов

### Остановить оба сервера

**Терминал 1 (backend):** `Ctrl+C`  
**Терминал 2 (frontend):** `Ctrl+C`

### Остановить PostgreSQL

**macOS:**
```bash
brew services stop postgresql@15
```

**Linux:**
```bash
sudo systemctl stop postgresql
```

### Запустить снова

```bash
# Терминал 1 - backend
cd backend
npm run dev

# Терминал 2 - frontend
cd frontend
npm run dev
```

---

## 📝 Полезные команды

### Frontend

```bash
cd frontend

# Запуск dev сервера
npm run dev

# Production сборка
npm run build

# Preview production сборки
npm run preview

# Проверка типов
npm run lint
```

### Backend

```bash
cd backend

# Запуск dev сервера
npm run dev

# Production сборка
npm run build

# Запуск production версии
npm start

# Prisma Studio
npm run db:studio

# Применить изменения схемы
npm run db:push

# Сбросить БД
npx prisma migrate reset

# Загрузить тестовые данные
npm run db:seed
```

### Из корня проекта

```bash
# Запустить оба проекта
npm run dev

# Только frontend
npm run dev:frontend

# Только backend
npm run dev:backend

# Собрать production
npm run build

# Установить все зависимости
npm run install:all

# Открыть Prisma Studio
npm run db:studio
```

---

## 🐛 Решение типичных проблем

### Проблема 1: "command not found: node"

**Решение:**
```bash
# macOS (Homebrew)
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Или через nvm
source ~/.zshrc
nvm use 20
```

### Проблема 2: "Connection refused" при подключении к БД

**Решение:**
```bash
# Проверьте что PostgreSQL запущен
pg_isready

# macOS
brew services start postgresql@15

# Linux
sudo systemctl start postgresql

# Windows
# Запустите службу PostgreSQL через Services
```

### Проблема 3: "User postgres was denied access"

**Решение:**
```bash
# Отредактируйте backend/.env
nano backend/.env

# Измените DATABASE_URL на ваше имя пользователя:
# postgresql://ваш_username@localhost:5432/synapse_judgement

# Узнать ваше имя:
whoami
```

### Проблема 4: "Port 3001 already in use"

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

### Проблема 5: "Port 5173 already in use"

**Решение:**
```bash
# Найти процесс
lsof -i :5173

# Убить процесс
kill -9 <PID>
```

### Проблема 6: "Cannot find module" после npm install

**Решение:**
```bash
# Удалите node_modules и переустановите
cd frontend  # или backend
rm -rf node_modules package-lock.json
npm install
```

### Проблема 7: "Prisma Client not generated"

**Решение:**
```bash
cd backend
npm run db:generate
```

### Проблема 8: Фронтенд без стилей

**Решение:**
```bash
cd frontend
rm -rf node_modules/.vite
npm run dev
```

### Проблема 9: "Database does not exist"

**Решение:**
```bash
# Создать БД
createdb synapse_judgement

# Применить схему
cd backend
npm run db:push

# Загрузить данные
npm run db:seed
```

### Проблема 10: Ошибки TypeScript

**Решение:**
```bash
cd frontend
rm -rf node_modules
npm install
npm run lint
```

---

## ✅ Чеклист успешного запуска

- [ ] Node.js установлен (node --version показывает 18+)
- [ ] PostgreSQL установлен и запущен (pg_isready)
- [ ] База данных создана (psql -l | grep synapse_judgement)
- [ ] Зависимости frontend установлены (frontend/node_modules существует)
- [ ] Зависимости backend установлены (backend/node_modules существует)
- [ ] Prisma Client сгенерирован (backend/node_modules/.prisma существует)
- [ ] Схема применена к БД (таблицы видны в Prisma Studio)
- [ ] Тестовые данные загружены (demo@synapse.ai виден в БД)
- [ ] Backend запущен (http://localhost:3001/health работает)
- [ ] Frontend запущен (http://localhost:5173 открывается)
- [ ] Можно войти с demo@synapse.ai / demo123
- [ ] Можно запустить анализ и увидеть результаты

---

## 🎯 Что дальше?

После успешного запуска:

1. **Изучите код**
   - `frontend/src/App.tsx` - главный компонент
   - `backend/src/services/analysis.service.ts` - логика анализа
   - `backend/prisma/schema.prisma` - схема БД

2. **Протестируйте API**
   - Импортируйте `backend/postman_collection.json` в Postman
   - Протестируйте все эндпоинты

3. **Добавьте AI модели**
   - Замените мок-данные в `analysis.service.ts`
   - Интегрируйте OpenAI/Anthropic API

4. **Добавьте источники данных**
   - Alpha Vantage, Yahoo Finance, Polygon.io

5. **Деплой**
   - Frontend: Vercel, Netlify
   - Backend: Railway, Render, AWS
   - Database: Supabase, Neon, Railway

---

## 📚 Документация

- [README.md](./README.md) - главная документация
- [backend/README.md](./backend/README.md) - backend документация
- [frontend/README.md](./frontend/README.md) - frontend документация
- [CHANGELOG.md](./CHANGELOG.md) - история изменений

---

## 💡 Подсказки

### Горячие клавиши Terminal

- `Cmd+N` - новое окно терминала
- `Cmd+T` - новая вкладка
- `Cmd+W` - закрыть вкладку
- `Ctrl+C` - остановить процесс
- `Ctrl+L` - очистить экран
- `Cmd+K` - очистить экран (в iTerm2)

### Быстрый доступ к папкам

```bash
# Открыть текущую папку в Finder
open .

# Открыть в VS Code
code .

# Открыть в другом редакторе
subl .  # Sublime Text
atom .  # Atom
```

### Полезные alias

Добавьте в `~/.zshrc`:

```bash
alias sj='cd /path/to/synapse-judgement'
alias sjd='npm run dev'
alias sjb='cd backend && npm run dev'
alias sjf='cd frontend && npm run dev'
alias sjdb='cd backend && npm run db:studio'
```

После добавления:
```bash
source ~/.zshrc
```

Теперь можно использовать:
- `sj` - перейти в папку проекта
- `sjd` - запустить оба проекта
- `sjb` - запустить только backend
- `sjf` - запустить только frontend
- `sjdb` - открыть Prisma Studio

---

## 🎉 Готово!

Теперь у вас работает полный стек:
- ✅ Frontend на React (http://localhost:5173)
- ✅ Backend на Node.js (http://localhost:3001)
- ✅ PostgreSQL база данных
- ✅ JWT аутентификация
- ✅ REST API

Можно начинать разработку! 🚀

Если что-то не работает - проверьте раздел "Решение типичных проблем" или создайте issue на GitHub.
