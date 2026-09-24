# 🚀 Локальный запуск проекта

Полная пошаговая инструкция по запуску Synapse Judgement на вашем компьютере.

---

## 📋 Требования

Перед началом убедитесь что установлены:

### 1. Node.js 18+ и npm 9+

**Проверка:**
```bash
node --version   # Должно показать v18.x.x или выше
npm --version    # Должно показать 9.x.x или выше
```

**Установка:**
- **macOS:** `brew install node@20`
- **Windows:** Скачайте с https://nodejs.org/
- **Linux:** https://nodejs.org/en/download/package-manager

### 2. PostgreSQL 14+

**Проверка:**
```bash
psql --version   # Должно показать 14.x или выше
```

**Установка:**
- **macOS:** `brew install postgresql@15 && brew services start postgresql@15`
- **Windows:** Скачайте с https://www.postgresql.org/download/windows/
- **Linux:** `sudo apt install postgresql postgresql-contrib`

### 3. Git

**Проверка:**
```bash
git --version
```

**Установка:**
- **macOS:** `brew install git`
- **Windows:** https://git-scm.com/download/win
- **Linux:** `sudo apt install git`

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
# Если есть корневой package.json с workspaces
npm install

# Или вручную
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
```

---

## 🗄️ Шаг 3: Настройка PostgreSQL

### 3.1. Убедитесь что PostgreSQL запущен

**macOS:**
```bash
brew services start postgresql@15
pg_isready   # Должно показать: accepting connections
```

**Linux:**
```bash
sudo systemctl start postgresql
sudo systemctl status postgresql
```

**Windows:**
Проверьте что служба PostgreSQL запущена в Services.

### 3.2. Создайте базу данных

**Вариант A: Через командную строку**
```bash
# Создать базу данных
createdb synapse_judgement

# Проверить что создана
psql -l | grep synapse_judgement
```

**Вариант B: Через psql**
```bash
psql -U postgres

# Внутри psql:
CREATE DATABASE synapse_judgement;
\q
```

### 3.3. Узнайте ваши credentials PostgreSQL

**macOS (Homebrew):**
```bash
whoami   # Ваше имя пользователя (например: anton)
# Пароль обычно не требуется для локального подключения
```

**Linux:**
```bash
sudo -u postgres psql
# Внутри psql:
CREATE USER your_username WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE synapse_judgement TO your_username;
\q
```

**Windows:**
- Пользователь: `postgres`
- Пароль: тот что вы указали при установке

---

## 🔧 Шаг 4: Настройка переменных окружения

### 4.1. Создайте .env файл для backend

```bash
cd backend
cp .env.example .env
```

### 4.2. Отредактируйте .env

Откройте `backend/.env` в редакторе и измените `DATABASE_URL`:

**macOS (без пароля):**
```env
DATABASE_URL="postgresql://anton@localhost:5432/synapse_judgement?schema=public"
```
(замените `anton` на ваше имя пользователя)

**Linux/Windows (с паролем):**
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/synapse_judgement?schema=public"
```

**Полный пример .env:**
```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL="postgresql://anton@localhost:5432/synapse_judgement?schema=public"

# JWT
JWT_SECRET="dev-secret-key-change-in-production-abc123xyz789"
JWT_EXPIRES_IN="7d"

# CORS
FRONTEND_URL="http://localhost:5173"

# Logging
LOG_LEVEL="debug"
```

---

## 🗃️ Шаг 5: Инициализация базы данных

### 5.1. Сгенерируйте Prisma Client

```bash
cd backend
npm run db:generate
```

**Ожидаемый вывод:**
```
✔ Generated Prisma Client
```

### 5.2. Примените схему к базе данных

```bash
npm run db:push
```

**Ожидаемый вывод:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "synapse_judgement", schema "public" at "localhost:5432"

🚀 Your database is now in sync with your Prisma schema. Done in 245ms
```

### 5.3. Загрузите тестовые данные

```bash
npm run db:seed
```

**Ожидаемый вывод:**
```
🌱 Starting database seed...
✅ Created demo user: demo@synapse.ai
✅ Created session: AAPL (BUY)
✅ Created session: TSLA (HOLD)
✅ Created session: NVDA (BUY)
✅ Created welcome transaction
🎉 Database seed completed successfully!
```

### 5.4. Проверьте данные (опционально)

```bash
# Открыть Prisma Studio (веб-интерфейс для просмотра БД)
npm run db:studio
```

Откроется http://localhost:5555 - можно просматривать таблицы.

---

## ▶️ Шаг 6: Запуск проекта

### Вариант A: Запуск обоих проектов одновременно

**Из корня проекта:**
```bash
# Если настроен concurrently в package.json
npm run dev

# Или используйте Makefile (macOS/Linux)
make dev
```

### Вариант B: Запуск по отдельности (рекомендуется для разработки)

**Терминал 1 - Backend:**
```bash
cd backend
npm run dev
```

**Ожидаемый вывод:**
```
🚀 Server running on port 3001
📝 Environment: development
🔗 Frontend URL: http://localhost:5173
📊 API available at http://localhost:3001/api
```

**Терминал 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Ожидаемый вывод:**
```
VITE v5.x.x  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

---

## ✅ Шаг 7: Проверка что всё работает

### 7.1. Проверка Backend

**Health check:**
```bash
curl http://localhost:3001/health
```

**Ожидаемый ответ:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-20T12:00:00.000Z"
}
```

**Получить список агентов:**
```bash
curl http://localhost:3001/api/agents
```

**Ожидаемый ответ:** Массив из 5 агентов (Technical, Fundamental, Portfolio, News, Earning Calls)

### 7.2. Проверка Frontend

Откройте браузер и перейдите на:
```
http://localhost:5173
```

**Что должно работать:**
- ✅ Лендинг загружается
- ✅ Видны 5 агентов
- ✅ Можно кликнуть на агента и увидеть детальную страницу
- ✅ Можно войти в систему

### 7.3. Вход в систему

Используйте демо-доступ:
- **Email:** `demo@synapse.ai`
- **Password:** `demo123`

**Что должно работать:**
- ✅ Вход успешен
- ✅ Видны кредиты (847)
- ✅ Видна история сессий
- ✅ Можно запустить новый анализ

### 7.4. Запуск анализа

1. Введите тикер (например, `AAPL`)
2. Выберите агентов (например, Technical, Fundamental, News)
3. Нажмите "Run Analysis"
4. Дождитесь результата (~3 секунды в демо)

**Ожидаемый результат:**
- ✅ Вердикт (BUY/HOLD/SELL)
- ✅ Confidence score
- ✅ Выводы каждого агента
- ✅ Обоснование Судьи

---

## 🐛 Решение типичных проблем

### Проблема 1: "Cannot find module"

**Решение:**
```bash
# Переустановите зависимости
cd frontend
rm -rf node_modules package-lock.json
npm install

cd ../backend
rm -rf node_modules package-lock.json
npm install
```

### Проблема 2: "Connection refused" при подключении к БД

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

### Проблема 3: "Database does not exist"

**Решение:**
```bash
# Создайте базу данных
createdb synapse_judgement

# Или через psql
psql -U postgres -c "CREATE DATABASE synapse_judgement;"
```

### Проблема 4: "P1010: User was denied access"

**Решение:** Проверьте `DATABASE_URL` в `backend/.env`:

**macOS (без пароля):**
```env
DATABASE_URL="postgresql://ваш_логин@localhost:5432/synapse_judgement"
```

**Linux/Windows (с паролем):**
```env
DATABASE_URL="postgresql://postgres:пароль@localhost:5432/synapse_judgement"
```

### Проблема 5: "Port 3001 already in use"

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

### Проблема 6: "Port 5173 already in use"

**Решение:**
```bash
# Найти процесс
lsof -i :5173

# Убить процесс
kill -9 <PID>

# Или изменить порт в frontend/vite.config.js
nano frontend/vite.config.js
# Измените port: 5174
```

### Проблема 7: Frontend без стилей

**Решение:**
```bash
cd frontend
rm -rf node_modules/.vite
npm run dev
```

### Проблема 8: "Prisma Client not generated"

**Решение:**
```bash
cd backend
npm run db:generate
```

### Проблема 9: TypeScript ошибки

**Решение:**
```bash
# Проверьте типы frontend
cd frontend
npm run lint

# Проверьте типы backend
cd backend
npm run lint
```

### Проблема 10: CORS ошибки в браузере

**Решение:** Убедитесь что backend запущен на порту 3001 и frontend на 5173. Проверьте настройки CORS в `backend/src/index.ts`.

---

## 📊 Полезные команды

### Управление проектом

```bash
# Запустить оба проекта
npm run dev

# Только frontend
npm run dev:frontend

# Только backend
npm run dev:backend

# Собрать production версию
npm run build

# Проверить типы
npm run lint
```

### Работа с базой данных

```bash
# Открыть Prisma Studio
cd backend && npm run db:studio

# Сбросить БД и пересоздать
cd backend && npx prisma migrate reset

# Применить изменения схемы
cd backend && npm run db:push

# Загрузить тестовые данные
cd backend && npm run db:seed
```

### Мониторинг

```bash
# Логи backend
tail -f backend/logs/combined.log

# Только ошибки
tail -f backend/logs/error.log

# Проверить статус
curl http://localhost:3001/health
```

### Git команды

```bash
# Статус
git status

# Добавить все изменения
git add .

# Коммит
git commit -m "описание изменений"

# Пуш
git push origin main
```

---

## 🎯 Быстрый старт (одной командой)

Если всё уже настроено, просто выполните:

```bash
# Из корня проекта
npm run dev

# Или используйте Makefile
make dev
```

Откройте:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

Войдите:
- Email: `demo@synapse.ai`
- Password: `demo123`

---

## 📝 Чеклист успешного запуска

- [ ] Node.js 18+ установлен
- [ ] PostgreSQL 14+ установлен и запущен
- [ ] База данных `synapse_judgement` создана
- [ ] Зависимости frontend установлены (`npm install`)
- [ ] Зависимости backend установлены (`npm install`)
- [ ] `backend/.env` настроен с правильным `DATABASE_URL`
- [ ] Prisma Client сгенерирован (`npm run db:generate`)
- [ ] Схема применена к БД (`npm run db:push`)
- [ ] Тестовые данные загружены (`npm run db:seed`)
- [ ] Backend запущен на порту 3001
- [ ] Frontend запущен на порту 5173
- [ ] Health check проходит (`curl http://localhost:3001/health`)
- [ ] Frontend открывается в браузере
- [ ] Можно войти с demo@synapse.ai / demo123
- [ ] Можно запустить анализ и увидеть результат

---

## 🆘 Если ничего не помогает

1. **Проверьте логи:**
   ```bash
   tail -f backend/logs/error.log
   ```

2. **Перезапустите PostgreSQL:**
   ```bash
   brew services restart postgresql@15  # macOS
   sudo systemctl restart postgresql    # Linux
   ```

3. **Полный сброс:**
   ```bash
   # Удалить node_modules
   rm -rf frontend/node_modules backend/node_modules
   
   # Переустановить
   cd frontend && npm install && cd ..
   cd backend && npm install && cd ..
   
   # Сбросить БД
   cd backend
   npx prisma migrate reset
   npm run db:seed
   ```

4. **Проверьте версии:**
   ```bash
   node --version
   npm --version
   psql --version
   ```

---

## 📚 Дополнительная информация

- [README.md](./README.md) - главная документация
- [backend/README.md](./backend/README.md) - backend документация
- [frontend/README.md](./frontend/README.md) - frontend документация
- [CHANGELOG.md](./CHANGELOG.md) - история изменений

---

**Удачи с запуском! 🚀**

Если возникли проблемы, проверьте раздел "Решение типичных проблем" или создайте issue на GitHub.
