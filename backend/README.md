# 🔧 Backend - Synapse Judgement

Node.js + Express + TypeScript API для AI-платформы инвестиционного анализа.

## 📦 Технологии

- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Типизация
- **Prisma** - ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Winston** - Logging

## 🚀 Быстрый старт

```bash
# Из корня проекта
npm run install:backend
cd backend
npm run db:generate
npm run db:push
npm run db:seed
npm run dev

# Или напрямую
cd backend
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

API доступен на http://localhost:3001

## 📁 Структура

```
backend/
├── src/
│   ├── controllers/   # Обработка запросов
│   ├── services/      # Бизнес-логика
│   ├── routes/        # API эндпоинты
│   ├── middleware/    # Auth, validation, errors
│   ├── utils/         # Logger, Prisma client
│   ├── config/        # Конфигурация
│   └── index.ts       # Точка входа
├── prisma/
│   ├── schema.prisma  # Схема БД
│   └── seed.ts        # Тестовые данные
├── scripts/           # SQL скрипты, тесты
├── logs/              # Логи
├── .env               # Переменные окружения
└── package.json
```

## 🌐 API Endpoints

### Authentication
```
POST /api/auth/register    - Регистрация
POST /api/auth/login       - Вход
POST /api/auth/logout      - Выход
```

### Users
```
GET    /api/users/me          - Профиль
PUT    /api/users/me          - Обновить
GET    /api/users/me/stats    - Статистика
```

### Agents
```
GET /api/agents              - Список агентов
GET /api/agents/:id          - Агент по ID
GET /api/agents/:id/profile  - Детальная информация
```

### Analysis
```
POST /api/analysis/run       - Запустить анализ
GET  /api/analysis/:id       - Результат
GET  /api/analysis/history   - История
```

## 🗄️ База данных

### Таблицы
- **users** - пользователи
- **sessions** - сессии анализа
- **agent_verdicts** - выводы агентов
- **transactions** - транзакции

### Скрипты
```bash
npm run db:generate    # Генерация Prisma Client
npm run db:push        # Применить схему
npm run db:seed        # Загрузить тестовые данные
npm run db:studio      # Открыть Prisma Studio
npm run db:reset       # Сбросить БД
```

## 🔐 Аутентификация

JWT токены в заголовке:
```
Authorization: Bearer <token>
```

## 📝 Переменные окружения

```env
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://user@localhost:5432/synapse_judgement"
JWT_SECRET="your-secret-key"
FRONTEND_URL="http://localhost:5173"
LOG_LEVEL="debug"
```

## 📊 Логи

- `logs/combined.log` - все логи
- `logs/error.log` - только ошибки

## 🧪 Тестирование

```bash
# Автоматический тест
./scripts/test-api.sh

# Через Postman
# Импортируйте postman_collection.json
```

## 📚 Документация

- [Главный README](../README.md)
- [Frontend Documentation](../frontend/README.md)
- [Setup Guide](../SETUP_GUIDE.md)

---

**Подробнее в [главном README](../README.md)**
