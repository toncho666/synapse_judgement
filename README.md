# 🎯 Synapse Judgement - Полный стек

AI-платформа инвестиционного анализа с 5 агентами и Судьёй.

## 📦 Что включено

### ✅ Frontend (React + TypeScript + Tailwind)
- Лендинг с hero-секцией
- Магазин агентов с iOS-тумблерами
- Детальные страницы каждого агента
- Дашборд результатов с визуализацией
- Авторизация и личный кабинет
- Лидерборд
- Реферальная программа
- Система достижений

### ✅ Backend (Node.js + Express + TypeScript)
- REST API со всеми эндпоинтами
- JWT аутентификация
- PostgreSQL + Prisma ORM
- Валидация данных (Zod)
- Логирование (Winston)
- Обработка ошибок

## 🚀 Быстрый старт

### Требования
- Node.js 18+
- PostgreSQL 14+
- npm

### Автоматическая установка

```bash
# Сделать скрипт исполняемым
chmod +x quick-start.sh

# Запустить установку и запуск
./quick-start.sh
```

### Ручная установка

**1. Backend:**
```bash
cd backend
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

**2. Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 📍 URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/health

## 🔐 Демо-доступ

После запуска `npm run db:seed`:
- Email: `demo@synapse.ai`
- Password: `demo123`
- Credits: 847
- Plan: PRO

## 📚 API Документация

### Authentication
```
POST /api/auth/register    - Регистрация
POST /api/auth/login       - Вход
POST /api/auth/logout      - Выход
```

### Users
```
GET    /api/users/me          - Профиль
PUT    /api/users/me          - Обновить профиль
GET    /api/users/me/stats    - Статистика
```

### Agents
```
GET /api/agents              - Список агентов
GET /api/agents/:id          - Агент по ID
GET /api/agents/:id/profile  - Профиль агента
```

### Analysis
```
POST /api/analysis/run       - Запустить анализ
GET  /api/analysis/:id       - Результат
GET  /api/analysis/history   - История
```

## 🧪 Тестирование API

**Через скрипт:**
```bash
cd backend
chmod +x scripts/test-api.sh
./scripts/test-api.sh
```

**Через curl:**
```bash
# Войти
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@synapse.ai","password":"demo123"}' | jq -r '.token')

# Получить агентов
curl http://localhost:3001/api/agents

# Запустить анализ
curl -X POST http://localhost:3001/api/analysis/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"ticker":"AAPL","agents":["tech","fund","news"]}'
```

**Через Postman:**
Импортируйте `backend/postman_collection.json`

## 📊 База данных

**Просмотр данных:**
```bash
cd backend
npm run db:studio
```

Откроется Prisma Studio на http://localhost:5555

**SQL запросы:**
```bash
psql -U postgres -d synapse_judgement

SELECT * FROM users;
SELECT * FROM sessions;
SELECT * FROM agent_verdicts;
```

## 📝 Логи

```bash
# Backend логи
tail -f backend/logs/combined.log
tail -f backend/logs/error.log

# Frontend логи (в терминале где запущен)
```

## 🗂 Структура проекта

```
synapse-judgement/
├── frontend/              # React + TypeScript + Tailwind
│   ├── src/
│   │   ├── components/   # UI компоненты
│   │   ├── lib/          # Утилиты, хуки, роутер
│   │   ├── data/         # Мок-данные
│   │   └── App.tsx       # Главный компонент
│   └── package.json
│
├── backend/               # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── controllers/  # Обработка запросов
│   │   ├── services/     # Бизнес-логика
│   │   ├── routes/       # API эндпоинты
│   │   ├── middleware/   # Auth, validation, errors
│   │   ├── utils/        # Logger, Prisma client
│   │   └── index.ts      # Точка входа
│   ├── prisma/
│   │   ├── schema.prisma # Схема БД
│   │   └── seed.ts       # Тестовые данные
│   ├── scripts/          # SQL скрипты, тесты
│   ├── logs/             # Логи
│   └── package.json
│
├── quick-start.sh         # Автоматическая установка
└── README.md             # Этот файл
```

## 🔧 Переменные окружения

### Backend (.env)
```env
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/synapse_judgement"
JWT_SECRET="your-secret-key"
FRONTEND_URL="http://localhost:5173"
LOG_LEVEL="debug"
```

## 🐛 Отладка

**Backend не запускается:**
1. Проверьте PostgreSQL: `pg_isready`
2. Проверьте `.env` в `backend/`
3. Проверьте логи: `tail -f backend/logs/error.log`

**Frontend не подключается:**
1. Убедитесь что backend запущен на порту 3001
2. Проверьте CORS настройки в `backend/src/index.ts`

**Ошибки базы данных:**
```bash
cd backend
npm run db:generate
npm run db:push
npm run db:seed
```

## 📈 Production

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
# Разместите dist/ на хостинге
```

### Docker
```bash
# Backend
docker build -t synapse-backend backend/
docker run -p 3001:3001 synapse-backend

# Frontend
docker build -t synapse-frontend frontend/
docker run -p 80:80 synapse-frontend
```

## 💡 Следующие шаги

1. **Интеграция с AI**
   - Замените мок-данные в `backend/src/services/analysis.service.ts`
   - Добавьте OpenAI/Anthropic API

2. **Реальные данные**
   - Интеграция с Alpha Vantage, Yahoo Finance
   - Парсинг новостей

3. **Платежи**
   - Stripe интеграция
   - Управление подписками

4. **Деплой**
   - Выберите хостинг
   - Настройте домен и SSL
   - Настройте мониторинг

## 📞 Поддержка

При проблемах:
1. Проверьте логи
2. Убедитесь что все зависимости установлены
3. Проверьте переменные окружения
4. Пересоздайте Prisma Client

## 📄 Лицензия

MIT

---

**Создано с ❤️ для инвестиционного анализа**
