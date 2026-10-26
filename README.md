# 🎯 Synapse Judgement

AI-платформа инвестиционного анализа с 5 специализированными агентами и Судьёй, который синтезирует их выводы в единый вердикт.

## 📦 Структура проекта

```
synapse-judgement/
├── frontend/              # React + Vite + Tailwind CSS (порт 5173)
│   ├── src/
│   │   ├── components/    # React компоненты
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Утилиты
│   │   └── data/          # Мок-данные
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
│
├── backend/               # Node.js + Express + Prisma (порт 3001)
│   ├── src/
│   │   ├── controllers/   # Обработка запросов
│   │   ├── services/      # Бизнес-логика
│   │   ├── routes/        # API endpoints
│   │   ├── middleware/    # Auth, validation, errors
│   │   └── utils/         # Logger, Prisma client
│   ├── prisma/            # Схема БД
│   └── package.json
│
├── scripts/               # Скрипты автоматизации
├── docker/                # Docker конфигурации
├── package.json           # Корневой orchestrator
└── README.md
```

## 🚀 Быстрый старт

### Требования
- Node.js 18+
- PostgreSQL 14+
- npm

### 1. Установка зависимостей

```bash
# Установить все зависимости
npm install

# Или по отдельности
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
```

### 2. Настройка базы данных

```bash
# Создать БД
createdb synapse_judgement

# Настроить backend/.env
cd backend
cp .env.example .env
nano .env  # Изменить DATABASE_URL

# Инициализировать БД
npm run db:generate
npm run db:push
npm run db:seed
cd ..
```

### 3. Запуск

```bash
# Запустить оба проекта
npm run dev

# Или по отдельности
npm run dev:frontend   # http://localhost:5173
npm run dev:backend    # http://localhost:3001
```

### 4. Открыть в браузере

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api

**Демо-доступ:**
- Email: `demo@synapse.ai`
- Password: `demo123`

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

### Stocks
```
GET  /api/stocks             - Получить котировки
POST /api/stocks/refresh     - Принудительное обновление
GET  /api/stocks/status      - Статус кэша
```

**Автоматическое обновление**: Каждые 60 минут через Alpha Vantage API

### Technical Analysis
```
GET  /api/technical-analysis/:ticker        - Анализ тикера
GET  /api/technical-analysis/cache/status   - Статус кэша
POST /api/technical-analysis/cache/clear    - Очистка кэша
```

**12+ индикаторов**: SMA, EMA, RSI, MACD, Bollinger Bands, ATR, OBV, Stochastic, ADX

## 🛠 Команды

```bash
npm run dev              # Запустить frontend + backend
npm run dev:frontend     # Только frontend
npm run dev:backend      # Только backend
npm run build            # Собрать production
npm run install:all      # Установить все зависимости
npm run db:push          # Применить схему БД
npm run db:seed          # Загрузить тестовые данные
npm run db:studio        # Открыть Prisma Studio
```

## 📊 Возможности

### Frontend
- ✅ 5 AI агентов с детальными профилями
- ✅ Технический анализ с 12+ индикаторами
- ✅ Котировки акций в реальном времени
- ✅ Личный кабинет с историей
- ✅ Лидерборд и реферальная система
- ✅ Адаптивный дизайн

### Backend
- ✅ REST API на Express + TypeScript
- ✅ Технический анализ (12+ индикаторов)
- ✅ Котировки акций (Alpha Vantage API)
- ✅ Аутентификация JWT
- ✅ PostgreSQL + Prisma ORM
- ✅ Фоновое обновление котировок

## 🧪 Тестирование

```bash
# Health check
curl http://localhost:3001/health

# Получить котировки
curl http://localhost:3001/api/stocks

# Технический анализ
curl http://localhost:3001/api/technical-analysis/AAPL
```

## 📚 Документация

- [Backend README](./backend/README.md) - документация backend

## 🐛 Решение проблем

### PostgreSQL не запускается
```bash
# macOS
brew services start postgresql@15

# Linux
sudo systemctl start postgresql
```

### Порт занят
```bash
lsof -i :3001  # или :5173
kill -9 <PID>
```

### Ошибки Prisma
```bash
cd backend
npm run db:generate
npm run db:push
```

### Frontend без стилей
```bash
cd frontend
rm -rf node_modules/.vite
npm run dev
```

### Ошибки Tailwind CSS
Если видите ошибки связанные с Tailwind:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## 📄 Лицензия

MIT

---

**Создано с ❤️ для инвестиционного анализа**
