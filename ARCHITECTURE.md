# 🏗️ Architecture

Архитектура проекта Synapse Judgement.

## 📐 Общая архитектура

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend                            │
│                  (React + TypeScript)                    │
│                   Port: 5173                             │
└────────────────┬────────────────────────────────────────┘
                 │ HTTP/REST API
                 │ /api/*
                 ▼
┌─────────────────────────────────────────────────────────┐
│                      Backend                             │
│              (Node.js + Express + JWT)                   │
│                   Port: 3001                             │
└────────────────┬────────────────────────────────────────┘
                 │ Prisma ORM
                 │ SQL Queries
                 ▼
┌─────────────────────────────────────────────────────────┐
│                    PostgreSQL                            │
│                   Port: 5432                             │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │  users   │  │ sessions │  │  agent_verdicts      │  │
│  └──────────┘  └──────────┘  └──────────────────────┘  │
│                                                          │
│  ┌──────────────┐                                       │
│  │ transactions │                                       │
│  └──────────────┘                                       │
└─────────────────────────────────────────────────────────┘
```

## 🎯 Архитектурные принципы

### 1. Разделение ответственности (Separation of Concerns)

**Frontend:**
- UI/UX
- Состояние клиента
- Маршрутизация
- Валидация форм

**Backend:**
- Бизнес-логика
- Аутентификация
- Валидация данных
- Работа с БД

**Database:**
- Хранение данных
- Целостность данных
- Индексы и оптимизация

### 2. Слои приложения

```
┌─────────────────────────────────────┐
│         Presentation Layer          │  ← Frontend (React)
│    (UI, User Interaction)           │
└─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│         Application Layer           │  ← Controllers
│    (Use Cases, Orchestration)       │
└─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│          Business Layer             │  ← Services
│    (Business Logic, Rules)          │
└─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│         Data Access Layer           │  ← Prisma + PostgreSQL
│    (Database, ORM, Queries)         │
└─────────────────────────────────────┘
```

### 3. Модульность

Каждый модуль независим и имеет четкий интерфейс:

```
backend/src/
├── controllers/    # Обработка HTTP запросов
├── services/       # Бизнес-логика
├── routes/         # API маршруты
├── middleware/     # Промежуточные слои
└── utils/          # Утилиты
```

## 🔄 Поток данных

### Анализ тикера

```
1. Frontend
   └─> POST /api/analysis/run
       { ticker: "AAPL", agents: ["tech", "fund"] }

2. Backend Controller
   └─> analysis.controller.ts
       - Валидация входных данных
       - Проверка аутентификации
       - Вызов сервиса

3. Backend Service
   └─> analysis.service.ts
       - Проверка баланса кредитов
       - Создание сессии
       - Списывание кредитов
       - Запуск анализа (async)

4. AI Analysis (Simulated)
   └─> Генерация выводов агентов
       - Technical Agent
       - Fundamental Agent
       - ...

5. Database
   └─> Сохранение результатов
       - sessions
       - agent_verdicts
       - transactions

6. Response
   └─> { sessionId, status, cost }

7. Frontend Polling
   └─> GET /api/analysis/:id
       - Проверка статуса
       - Получение результатов
```

### Аутентификация

```
1. Login Request
   └─> POST /api/auth/login
       { email, password }

2. Validation
   └─> Проверка credentials
       - bcrypt.compare(password, hash)

3. JWT Generation
   └─> jwt.sign({ id, email }, SECRET)

4. Response
   └─> { token, user }

5. Subsequent Requests
   └─> Authorization: Bearer <token>
       - JWT verification
       - Extract user ID
       - Attach to request
```

## 🗄️ Схема базы данных

```
┌─────────────────────────────────────┐
│              users                  │
├─────────────────────────────────────┤
│ id (UUID, PK)                       │
│ email (UNIQUE)                      │
│ name                                │
│ passwordHash                        │
│ avatar                              │
│ plan (ENUM: FREE, PRO, ENTERPRISE)  │
│ credits                             │
│ referralCode (UNIQUE)               │
│ referredById (FK -> users.id)       │
│ createdAt                           │
│ updatedAt                           │
└─────────────────────────────────────┘
                │
                │ 1:N
                ▼
┌─────────────────────────────────────┐
│            sessions                 │
├─────────────────────────────────────┤
│ id (UUID, PK)                       │
│ userId (FK -> users.id)             │
│ ticker                              │
│ agents (ARRAY)                      │
│ portfolio                           │
│ status (ENUM: RUNNING, COMPLETED)   │
│ verdict (ENUM: BUY, HOLD, SELL)     │
│ confidence                          │
│ targetPrice                         │
│ basePrice                           │
│ composite                           │
│ consensusBull                       │
│ consensusFlat                       │
│ consensusBear                       │
│ rationale (ARRAY)                   │
│ cost                                │
│ createdAt                           │
│ completedAt                         │
└─────────────────────────────────────┘
                │
                │ 1:N
                ▼
┌─────────────────────────────────────┐
│         agent_verdicts              │
├─────────────────────────────────────┤
│ id (UUID, PK)                       │
│ sessionId (FK -> sessions.id)       │
│ agentId                             │
│ signal (ENUM: BULL, BEAR, FLAT)     │
│ score                               │
│ confidence                          │
│ lines (ARRAY)                       │
│ metrics (JSONB)                     │
│ createdAt                           │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│          transactions               │
├─────────────────────────────────────┤
│ id (UUID, PK)                       │
│ userId (FK -> users.id)             │
│ type (ENUM)                         │
│ amount                              │
│ description                         │
│ sessionId (FK -> sessions.id)       │
│ createdAt                           │
└─────────────────────────────────────┘
```

## 🔐 Безопасность

### Аутентификация
- JWT токены с expiration
- bcrypt для хеширования паролей
- Middleware для защиты роутов

### Валидация
- Zod schemas для входных данных
- Серверная валидация
- SQL injection prevention (Prisma)

### CORS
- Настроен только для frontend URL
- Credentials support

### Rate Limiting
- Рекомендуется добавить в production

## 📊 Масштабирование

### Горизонтальное масштабирование

```
┌─────────────┐
│   Load      │
│   Balancer  │
└──────┬──────┘
       │
       ├──────────────┬──────────────┐
       ▼              ▼              ▼
┌──────────┐   ┌──────────┐   ┌──────────┐
│ Backend  │   │ Backend  │   │ Backend  │
│ Instance │   │ Instance │   │ Instance │
│    1     │   │    2     │   │    3     │
└────┬─────┘   └────┬─────┘   └────┬─────┘
     │              │              │
     └──────────────┴──────────────┘
                    │
                    ▼
            ┌──────────────┐
            │  PostgreSQL  │
            │   (Primary)  │
            └──────┬───────┘
                   │
            ┌──────┴───────┐
            │  PostgreSQL  │
            │  (Replicas)  │
            └──────────────┘
```

### Кэширование

```
┌──────────┐
│ Frontend │
└────┬─────┘
     │
     ▼
┌──────────┐      ┌──────────┐
│  Redis   │◄────►│ Backend  │
│  Cache   │      │          │
└──────────┘      └────┬─────┘
                       │
                       ▼
                  ┌──────────┐
                  │PostgreSQL│
                  └──────────┘
```

## 🎨 Frontend архитектура

### Компоненты

```
App
├── Nav
├── Routes
│   ├── Home
│   │   ├── Hero
│   │   ├── RequestSection
│   │   ├── AgentStore
│   │   ├── Pipeline
│   │   ├── ResultsDashboard
│   │   ├── Transparency
│   │   └── Faq
│   ├── AgentPage
│   ├── AuthPage
│   ├── Dashboard
│   └── Leaderboard
├── StickyBar
└── Footer
```

### State Management

```
Local State (useState)
├── UI state (modals, forms)
├── Form inputs
└── Component-specific data

Global State (Context)
├── User authentication
├── Selected agents
├── Analysis results
└── UI preferences
```

### Routing

```
Hash-based routing:
#/              → Home
#/agent/:id     → Agent Page
#/auth          → Auth Page
#/dashboard     → Dashboard
#/leaderboard   → Leaderboard
```

## 🔄 Backend архитектура

### Request Flow

```
Request
   │
   ▼
┌──────────────┐
│  Middleware  │
│  - CORS      │
│  - Logger    │
│  - Auth      │
│  - Validate  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Controller  │
│  - Parse     │
│  - Call      │
│    Service   │
│  - Response  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Service    │
│  - Business  │
│    Logic     │
│  - DB Calls  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Prisma     │
│  - ORM       │
│  - Queries   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ PostgreSQL   │
└──────────────┘
```

### Error Handling

```
Error
   │
   ▼
┌──────────────┐
│  Middleware  │
│  (Catch)     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Logger      │
│  (Log)       │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Response    │
│  (JSON)      │
│  { error }   │
└──────────────┘
```

## 🚀 Deployment архитектура

### Production

```
┌─────────────┐
│    CDN      │
│ (CloudFlare)│
└──────┬──────┘
       │
       ├──────────────┐
       ▼              ▼
┌──────────┐   ┌──────────┐
│ Frontend │   │ Backend  │
│ (Vercel) │   │(Railway) │
└──────────┘   └────┬─────┘
                    │
                    ▼
            ┌──────────────┐
            │  PostgreSQL  │
            │ (Supabase)   │
            └──────────────┘
```

### Docker

```
┌─────────────────────────────────┐
│        Docker Compose           │
├─────────────────────────────────┤
│                                 │
│  ┌──────────┐  ┌──────────┐    │
│  │ Frontend │  │ Backend  │    │
│  │  (Nginx) │  │ (Node)   │    │
│  └──────────┘  └────┬─────┘    │
│                     │          │
│                ┌────┴─────┐    │
│                │PostgreSQL│    │
│                └──────────┘    │
│                                 │
└─────────────────────────────────┘
```

---

**Эта архитектура обеспечивает:**
- ✅ Масштабируемость
- ✅ Поддерживаемость
- ✅ Тестируемость
- ✅ Безопасность
- ✅ Производительность
