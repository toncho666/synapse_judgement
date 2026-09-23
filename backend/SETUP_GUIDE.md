# 🚀 Инструкция по запуску и проверке бэкенда

## ✅ Что создано

Полный рабочий бэкенд для Synapse Judgement:
- ✅ Node.js + Express + TypeScript
- ✅ PostgreSQL + Prisma ORM
- ✅ JWT аутентификация
- ✅ Валидация данных (Zod)
- ✅ Логирование (Winston)
- ✅ Все API эндпоинты
- ✅ Тестовые данные

## 📦 Структура проекта

```
backend/
├── src/
│   ├── config/              # Конфигурация
│   ├── controllers/         # Контроллеры
│   │   ├── auth.controller.ts
│   │   ├── agents.controller.ts
│   │   ├── analysis.controller.ts
│   │   └── user.controller.ts
│   ├── middleware/          # Middleware
│   │   ├── auth.ts         # JWT аутентификация
│   │   ├── errorHandler.ts # Обработка ошибок
│   │   └── validate.ts     # Валидация
│   ├── routes/             # API роуты
│   │   ├── auth.routes.ts
│   │   ├── agents.routes.ts
│   │   ├── analysis.routes.ts
│   │   └── user.routes.ts
│   ├── services/           # Бизнес-логика
│   │   ├── auth.service.ts
│   │   ├── agents.service.ts
│   │   ├── analysis.service.ts
│   │   └── user.service.ts
│   ├── utils/              # Утилиты
│   │   ├── logger.ts       # Логгер
│   │   └── prisma.ts       # Prisma клиент
│   └── index.ts            # Точка входа
├── prisma/
│   ├── schema.prisma       # Схема БД
│   └── seed.ts             # Тестовые данные
├── scripts/
│   ├── setup-db.sql        # SQL для создания БД
│   ├── quick-setup.sql     # Быстрая настройка
│   └── test-api.sh         # Скрипт тестирования API
├── logs/                   # Логи (создастся автоматически)
├── .env                    # Переменные окружения
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Пошаговая инструкция запуска

### Шаг 1: Установка PostgreSQL

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Windows:**
Скачайте и установите с https://www.postgresql.org/download/windows/

### Шаг 2: Создание базы данных

```bash
# Войдите в PostgreSQL
psql -U postgres

# Создайте базу данных
CREATE DATABASE synapse_judgement;

# Выйдите
\q
```

**Или используйте скрипт:**
```bash
psql -U postgres -f scripts/setup-db.sql
```

### Шаг 3: Установка зависимостей

```bash
cd backend
npm install
```

### Шаг 4: Настройка переменных окружения

Файл `.env` уже создан с дефолтными значениями. Проверьте:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/synapse_judgement?schema=public"
JWT_SECRET="dev-secret-key-change-in-production-abc123xyz789"
FRONTEND_URL="http://localhost:5173"
```

**ВАЖНО:** Если у вас другой пароль для PostgreSQL, измените `DATABASE_URL`:
```
postgresql://postgres:YOUR_PASSWORD@localhost:5432/synapse_judgement
```

### Шаг 5: Генерация Prisma Client

```bash
npm run db:generate
```

### Шаг 6: Применение схемы к базе данных

```bash
npm run db:push
```

Это создаст все таблицы в PostgreSQL.

### Шаг 7: Заполнение тестовыми данными (опционально)

```bash
npm run db:seed
```

Это создаст демо-пользователя:
- Email: `demo@synapse.ai`
- Password: `demo123`
- Credits: 847
- Plan: PRO

### Шаг 8: Запуск сервера

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

## 🧪 Проверка работы

### Вариант 1: Через скрипт

```bash
chmod +x scripts/test-api.sh
./scripts/test-api.sh
```

Скрипт автоматически протестирует все эндпоинты.

### Вариант 2: Вручную через curl

**1. Health Check:**
```bash
curl http://localhost:3001/health
```

Ожидаемый ответ:
```json
{
  "status": "ok",
  "timestamp": "2026-02-20T..."
}
```

**2. Регистрация:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "password123"
  }'
```

Ожидаемый ответ:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "test@example.com",
    "name": "Test User",
    "avatar": "🚀",
    "plan": "FREE",
    "credits": 50,
    "referralCode": "TES..."
  }
}
```

**3. Вход (с демо-пользователем):**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@synapse.ai",
    "password": "demo123"
  }'
```

Сохраните токен:
```bash
export TOKEN="ваш_токен_из_ответа"
```

**4. Получить профиль:**
```bash
curl http://localhost:3001/api/users/me \
  -H "Authorization: Bearer $TOKEN"
```

**5. Получить список агентов:**
```bash
curl http://localhost:3001/api/agents
```

**6. Запустить анализ:**
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

Ожидаемый ответ:
```json
{
  "sessionId": "uuid",
  "status": "RUNNING",
  "cost": 16,
  "estimatedTime": 90
}
```

**7. Получить результат анализа (подождите 3 секунды):**
```bash
curl http://localhost:3001/api/analysis/{sessionId} \
  -H "Authorization: Bearer $TOKEN"
```

### Вариант 3: Через Postman

1. Импортируйте `postman_collection.json` в Postman
2. Используйте переменные `base_url` и `token`
3. Токен автоматически сохранится после login/register

### Вариант 4: Через Prisma Studio

```bash
npm run db:studio
```

Откроется веб-интерфейс на `http://localhost:5555` для просмотра данных в БД.

## 📊 Проверка логов

Логи сохраняются в:
- `logs/combined.log` - все логи
- `logs/error.log` - только ошибки

Просмотр в реальном времени:
```bash
tail -f logs/combined.log
```

## 🔍 Проверка базы данных

```bash
# Подключиться к БД
psql -U postgres -d synapse_judgement

# Посмотреть таблицы
\dt

# Посмотреть пользователей
SELECT id, email, name, plan, credits FROM users;

# Посмотреть сессии
SELECT id, ticker, verdict, confidence, cost FROM sessions;

# Выйти
\q
```

## ⚠️ Возможные проблемы и решения

### Проблема: "Connection refused"
**Решение:** Проверьте что PostgreSQL запущен:
```bash
# macOS
brew services list

# Linux
sudo systemctl status postgresql
```

### Проблема: "Database not found"
**Решение:** Создайте базу данных:
```bash
createdb -U postgres synapse_judgement
```

### Проблема: "Invalid password"
**Решение:** Проверьте пароль в `DATABASE_URL` в `.env`

### Проблема: "Port 3001 already in use"
**Решение:** Измените порт в `.env`:
```env
PORT=3002
```

### Проблема: "Prisma Client not generated"
**Решение:** Перегенерируйте:
```bash
npm run db:generate
```

## 🎯 Интеграция с фронтендом

Фронтенд уже настроен на работу с бэкендом. Просто запустите оба:

**Терминал 1 (бэкенд):**
```bash
cd backend
npm run dev
```

**Терминал 2 (фронтенд):**
```bash
cd frontend
npm run dev
```

Фронтенд будет работать на `http://localhost:5173`
Бэкенд будет работать на `http://localhost:3001`

## 📝 Что реализовано

### ✅ Аутентификация
- Регистрация с валидацией
- Вход с JWT токенами
- Защита роутов

### ✅ Пользователи
- Получение профиля
- Обновление профиля
- Статистика пользователя

### ✅ Агенты
- Список всех агентов
- Детальная информация об агенте
- Профиль агента с методологией

### ✅ Анализ
- Запуск анализа
- Получение результата
- История анализов
- Автоматическая генерация выводов агентов
- Расчёт вердикта Судьи

### ✅ Логирование
- Все запросы логируются
- Ошибки записываются в отдельные файлы
- Debug режим для разработки

## 🚀 Следующие шаги

После проверки работы бэкенда:

1. **Интеграция с реальными AI моделями**
   - Замените мок-данные в `analysis.service.ts` на вызовы OpenAI/Anthropic

2. **Добавление источников данных**
   - Интеграция с Alpha Vantage, Yahoo Finance, Polygon.io

3. **Платежи**
   - Stripe интеграция для подписок

4. **Деплой**
   - Выберите хостинг (Vercel, AWS, DigitalOcean)
   - Настройте домен и SSL

5. **Мониторинг**
   - Добавьте Sentry для отслеживания ошибок
   - Настройте метрики производительности

## 📞 Поддержка

Если что-то не работает:
1. Проверьте логи в `logs/`
2. Убедитесь что PostgreSQL запущен
3. Проверьте переменные в `.env`
4. Пересоздайте Prisma Client: `npm run db:generate`
5. Перезапустите сервер

Удачи! 🎉
