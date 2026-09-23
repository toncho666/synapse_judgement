# 🚀 Быстрый старт - Synapse Judgement

## ⚡ Самый быстрый способ (2 минуты)

```bash
# 1. Убедитесь что PostgreSQL запущен
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql

# 2. Создайте базу данных
psql -U postgres -c "CREATE DATABASE synapse_judgement;"

# 3. Установите и запустите бэкенд
cd backend
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev

# 4. В другом терминале запустите фронтенд
cd frontend
npm install
npm run dev
```

**Готово!** Откройте http://localhost:5173

**Демо-доступ:**
- Email: `demo@synapse.ai`
- Password: `demo123`

---

## 📋 Пошаговая инструкция

### Шаг 1: Проверьте PostgreSQL

```bash
# Проверьте что PostgreSQL запущен
pg_isready

# Если не запущен:
# macOS:
brew services start postgresql

# Linux:
sudo systemctl start postgresql

# Windows:
# Запустите службу PostgreSQL через Services
```

### Шаг 2: Создайте базу данных

```bash
# Войдите в PostgreSQL
psql -U postgres

# Создайте базу данных
CREATE DATABASE synapse_judgement;

# Выйдите
\q
```

**Или одной командой:**
```bash
createdb -U postgres synapse_judgement
```

### Шаг 3: Настройте бэкенд

```bash
cd backend

# Установите зависимости
npm install

# Проверьте .env (должен быть создан автоматически)
cat .env

# Если нужно, измените DATABASE_URL с вашим паролем PostgreSQL
# postgresql://postgres:YOUR_PASSWORD@localhost:5432/synapse_judgement
```

### Шаг 4: Инициализируйте базу данных

```bash
# Сгенерируйте Prisma Client
npm run db:generate

# Примените схему к базе данных
npm run db:push

# Загрузите тестовые данные
npm run db:seed
```

### Шаг 5: Запустите бэкенд

```bash
npm run dev
```

Вы должны увидеть:
```
🚀 Server running on port 3001
📝 Environment: development
🔗 Frontend URL: http://localhost:5173
📊 API available at http://localhost:3001/api
```

### Шаг 6: Запустите фронтенд (в другом терминале)

```bash
cd frontend
npm install
npm run dev
```

Вы должны увидеть:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### Шаг 7: Откройте в браузере

Перейдите на **http://localhost:5173**

Войдите с демо-доступом:
- Email: `demo@synapse.ai`
- Password: `demo123`

---

## 🧪 Проверка работы

### Быстрый тест через curl

```bash
# 1. Health check
curl http://localhost:3001/health

# 2. Войти и получить токен
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@synapse.ai","password":"demo123"}' | jq -r '.token')

# 3. Получить профиль
curl http://localhost:3001/api/users/me \
  -H "Authorization: Bearer $TOKEN"

# 4. Получить агентов
curl http://localhost:3001/api/agents

# 5. Запустить анализ
curl -X POST http://localhost:3001/api/analysis/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"ticker":"AAPL","agents":["tech","fund"]}'
```

### Автоматический тест

```bash
cd backend
chmod +x scripts/test-api.sh
./scripts/test-api.sh
```

### Визуальная проверка БД

```bash
cd backend
npm run db:studio
```

Откроется http://localhost:5555 - веб-интерфейс для просмотра данных.

---

## 🐛 Решение проблем

### PostgreSQL не запущен
```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Проверьте статус
pg_isready
```

### Ошибка "Database does not exist"
```bash
createdb -U postgres synapse_judgement
```

### Ошибка "Connection refused"
Проверьте что PostgreSQL запущен и пароль в `.env` правильный.

### Ошибка "Port 3001 already in use"
Измените порт в `backend/.env`:
```env
PORT=3002
```

### Prisma Client не сгенерирован
```bash
cd backend
npm run db:generate
```

### База данных пустая
```bash
cd backend
npm run db:seed
```

---

## 📊 Что должно работать

✅ **Backend (http://localhost:3001)**
- Health check: `/health`
- Auth: `/api/auth/register`, `/api/auth/login`
- Users: `/api/users/me`
- Agents: `/api/agents`
- Analysis: `/api/analysis/run`, `/api/analysis/history`

✅ **Frontend (http://localhost:5173)**
- Лендинг с агентами
- Страницы агентов
- Авторизация
- Личный кабинет
- Запуск анализов

✅ **Database (PostgreSQL)**
- Таблицы: users, sessions, agent_verdicts, transactions
- Демо-пользователь: demo@synapse.ai
- Тестовые сессии: AAPL, TSLA, NVDA

---

## 📝 Логи

```bash
# Backend логи
tail -f backend/logs/combined.log
tail -f backend/logs/error.log

# Frontend логи - в терминале где запущен npm run dev
```

---

## 🎯 Следующие шаги

После успешного запуска:

1. **Изучите API**
   - Импортируйте `backend/postman_collection.json` в Postman
   - Протестируйте все эндпоинты

2. **Посмотрите код**
   - `backend/src/services/analysis.service.ts` - логика анализа
   - `backend/src/controllers/` - обработка запросов
   - `backend/prisma/schema.prisma` - структура БД

3. **Добавьте AI**
   - Замените мок-данные в `analysis.service.ts`
   - Интегрируйте OpenAI/Anthropic API

4. **Деплой**
   - Выберите хостинг
   - Настройте production переменные
   - Задеплойте

---

## 📚 Документация

- `backend/README.md` - полная документация бэкенда
- `backend/SETUP_GUIDE.md` - подробная инструкция
- `backend/CHECKLIST.md` - чеклист проверки
- `README.md` (корневой) - общая документация

---

## 💡 Подсказки

**Посмотреть данные в БД:**
```bash
psql -U postgres -d synapse_judgement
SELECT * FROM users;
SELECT * FROM sessions;
```

**Сбросить БД и начать заново:**
```bash
cd backend
npx prisma migrate reset
npm run db:seed
```

**Остановить сервер:**
- Ctrl+C в терминале где запущен `npm run dev`

**Перезапустить после изменений:**
- Сервер автоматически перезагружается в режиме `npm run dev`

---

## ✅ Готово!

Теперь у вас работает полный стек:
- Frontend на React
- Backend на Node.js + Express
- Database на PostgreSQL
- JWT аутентификация
- REST API

Можно начинать разработку и добавление новых функций! 🚀
