# Synapse Judgement Backend

Backend API для AI-платформы инвестиционного анализа Synapse Judgement.

## 🛠 Стек технологий

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Validation**: Zod
- **Logging**: Winston

## 📋 Требования

- Node.js 18+
- PostgreSQL 14+
- npm или yarn

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
cd backend
npm install
```

### 2. Настройка базы данных

Создайте базу данных PostgreSQL:

```bash
# Вариант 1: Через psql
psql -U postgres
CREATE DATABASE synapse_judgement;
\q

# Вариант 2: Через скрипт
psql -U postgres -f scripts/setup-db.sql
```

### 3. Настройка переменных окружения

Скопируйте `.env.example` в `.env` и настройте:

```bash
cp .env.example .env
```

Отредактируйте `.env`:

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/synapse_judgement?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
FRONTEND_URL="http://localhost:5173"
```

### 4. Генерация Prisma Client

```bash
npm run db:generate
```

### 5. Применение миграций

```bash
npm run db:push
```

### 6. Заполнение тестовыми данными (опционально)

```bash
npm run db:seed
```

Это создаст демо-пользователя:
- Email: `demo@synapse.ai`
- Password: `demo123`

### 7. Запуск сервера

**Режим разработки:**
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm start
```

Сервер запустится на `http://localhost:3001`

## 📚 API Endpoints

### Authentication

```
POST /api/auth/register    - Регистрация
POST /api/auth/login       - Вход
POST /api/auth/logout      - Выход
```

### Users

```
GET    /api/users/me          - Текущий пользователь
PUT    /api/users/me          - Обновить профиль
GET    /api/users/me/stats    - Статистика пользователя
```

### Agents

```
GET /api/agents              - Список всех агентов
GET /api/agents/:id          - Агент по ID
GET /api/agents/:id/profile  - Детальная страница агента
```

### Analysis

```
POST /api/analysis/run       - Запустить анализ
GET  /api/analysis/:id       - Результат анализа
GET  /api/analysis/history   - История анализов
```

## 🧪 Тестирование API

### Регистрация

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "password123"
  }'
```

### Вход

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@synapse.ai",
    "password": "demo123"
  }'
```

Сохраните токен из ответа:

```bash
TOKEN="your-jwt-token-here"
```

### Получить профиль

```bash
curl http://localhost:3001/api/users/me \
  -H "Authorization: Bearer $TOKEN"
```

### Получить список агентов

```bash
curl http://localhost:3001/api/agents
```

### Запустить анализ

```bash
curl -X POST http://localhost:3001/api/analysis/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "ticker": "AAPL",
    "agents": ["tech", "fund", "news"],
    "portfolio": 100000
  }'
```

### Получить результат анализа

```bash
curl http://localhost:3001/api/analysis/{sessionId} \
  -H "Authorization: Bearer $TOKEN"
```

### Получить историю

```bash
curl http://localhost:3001/api/analysis/history \
  -H "Authorization: Bearer $TOKEN"
```

## 📊 Структура базы данных

### Users
- id, email, name, passwordHash
- avatar, plan, credits, referralCode

### Sessions
- id, userId, ticker, agents
- status, verdict, confidence
- targetPrice, basePrice, cost

### AgentVerdicts
- id, sessionId, agentId
- signal, score, confidence
- lines, metrics

### Transactions
- id, userId, type, amount
- description, sessionId

## 🔐 Аутентификация

Используется JWT токены. Добавьте токен в заголовок:

```
Authorization: Bearer <your-token>
```

Токен возвращается при регистрации и входе.

## 📝 Логирование

Логи сохраняются в:
- `logs/error.log` - ошибки
- `logs/combined.log` - все логи

Уровень логирования настраивается в `.env`:
```env
LOG_LEVEL="debug"  # debug, info, warn, error
```

## 🐛 Отладка

### Проверка подключения к БД

```bash
npx prisma studio
```

Откроется веб-интерфейс для просмотра данных.

### Проверка миграций

```bash
npx prisma migrate status
```

### Сброс базы данных

```bash
npx prisma migrate reset
```

## 📦 Скрипты

```bash
npm run dev          # Запуск в режиме разработки
npm run build        # Сборка для production
npm start            # Запуск production версии
npm run db:generate  # Генерация Prisma Client
npm run db:push      # Применение схемы к БД
npm run db:migrate   # Создание миграции
npm run db:seed      # Заполнение тестовыми данными
npm run db:studio    # Открыть Prisma Studio
```

## 🌐 CORS

Настроено для фронтенда на `http://localhost:5173`. Измените в `.env`:

```env
FRONTEND_URL="https://your-frontend.com"
```

## 🚨 Обработка ошибок

Все ошибки логируются и возвращаются в формате:

```json
{
  "error": "Error message",
  "details": [...]  // для ошибок валидации
}
```

## 📈 Production deployment

### Переменные окружения

Обязательно измените:
- `JWT_SECRET` - используйте длинную случайную строку
- `DATABASE_URL` - укажите production БД
- `NODE_ENV=production`

### PM2 (рекомендуется)

```bash
npm install -g pm2
pm2 start dist/index.js --name synapse-backend
pm2 save
pm2 startup
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи в `logs/`
2. Убедитесь что PostgreSQL запущен
3. Проверьте переменные в `.env`
4. Пересоздайте Prisma Client: `npm run db:generate`

## 📄 Лицензия

MIT
