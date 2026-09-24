# 📁 Project Structure

Детальное описание структуры проекта Synapse Judgement.

## 🌳 Дерево файлов

```
synapse-judgement/
│
├── 📄 README.md                      # Главная документация
├── 📄 LICENSE                        # MIT лицензия
├── 📄 .gitignore                     # Git ignore правила
├── 📄 .gitattributes                 # Git атрибуты
├── 📄 package.json                   # Корневые скрипты
├── 📄 Makefile                       # Команды для Unix/Mac
├── 📄 docker-compose.yml             # Docker Compose конфигурация
├── 📄 docker-compose.override.yml    # Docker overrides для dev
├── 📄 .env.example                   # Шаблон переменных окружения
│
├── 📂 frontend/                      # React приложение
│   ├── 📄 README.md                  # Frontend документация
│   ├── 📄 package.json               # Frontend зависимости
│   ├── 📄 vite.config.js             # Vite конфигурация
│   ├── 📄 tsconfig.json              # TypeScript конфигурация
│   ├── 📄 index.html                 # HTML шаблон
│   ├── 📄 Dockerfile                 # Docker для production
│   ├── 📄 nginx.conf                 # Nginx конфигурация
│   ├── 📄 .dockerignore              # Docker ignore
│   │
│   ├── 📂 src/                       # Исходный код
│   │   ├── 📄 App.tsx                # Главный компонент
│   │   ├── 📄 main.tsx               # Точка входа
│   │   ├── 📄 index.css              # Глобальные стили
│   │   │
│   │   ├── 📂 components/            # React компоненты
│   │   │   ├── 📄 Nav.tsx            # Навигация
│   │   │   ├── 📄 Hero.tsx           # Hero секция
│   │   │   ├── 📄 AgentStore.tsx     # Магазин агентов
│   │   │   ├── 📄 AgentPage.tsx      # Страница агента
│   │   │   ├── 📄 ResultsDashboard.tsx # Дашборд результатов
│   │   │   ├── 📄 AuthPage.tsx       # Авторизация
│   │   │   ├── 📄 Dashboard.tsx      # Личный кабинет
│   │   │   ├── 📄 Leaderboard.tsx    # Лидерборд
│   │   │   └── 📄 ...                # Другие компоненты
│   │   │
│   │   ├── 📂 lib/                   # Утилиты и хуки
│   │   │   ├── 📄 engine.ts          # Движок анализа
│   │   │   ├── 📄 auth.ts            # Аутентификация
│   │   │   ├── 📄 router.ts          # Роутинг
│   │   │   └── 📄 hooks.ts           # Custom hooks
│   │   │
│   │   └── 📂 data/                  # Мок-данные
│   │       └── 📄 agentMock.ts       # Данные агентов
│   │
│   └── 📂 public/                    # Статические файлы
│       └── 📄 ...
│
├── 📂 backend/                       # Node.js API
│   ├── 📄 README.md                  # Backend документация
│   ├── 📄 package.json               # Backend зависимости
│   ├── 📄 tsconfig.json              # TypeScript конфигурация
│   ├── 📄 .env                       # Переменные окружения
│   ├── 📄 .env.example               # Шаблон .env
│   ├── 📄 Dockerfile                 # Docker для production
│   ├── 📄 .dockerignore              # Docker ignore
│   ├── 📄 postman_collection.json    # Postman коллекция
│   │
│   ├── 📂 src/                       # Исходный код
│   │   ├── 📄 index.ts               # Точка входа
│   │   │
│   │   ├── 📂 config/                # Конфигурация
│   │   │   └── 📄 index.ts
│   │   │
│   │   ├── 📂 controllers/           # Контроллеры
│   │   │   ├── 📄 auth.controller.ts
│   │   │   ├── 📄 user.controller.ts
│   │   │   ├── 📄 agents.controller.ts
│   │   │   └── 📄 analysis.controller.ts
│   │   │
│   │   ├── 📂 services/              # Бизнес-логика
│   │   │   ├── 📄 auth.service.ts
│   │   │   ├── 📄 user.service.ts
│   │   │   ├── 📄 agents.service.ts
│   │   │   └── 📄 analysis.service.ts
│   │   │
│   │   ├── 📂 routes/                # API роуты
│   │   │   ├── 📄 auth.routes.ts
│   │   │   ├── 📄 user.routes.ts
│   │   │   ├── 📄 agents.routes.ts
│   │   │   └── 📄 analysis.routes.ts
│   │   │
│   │   ├── 📂 middleware/            # Middleware
│   │   │   ├── 📄 auth.ts            # JWT аутентификация
│   │   │   ├── 📄 validate.ts        # Валидация
│   │   │   └── 📄 errorHandler.ts    # Обработка ошибок
│   │   │
│   │   └── 📂 utils/                 # Утилиты
│   │       ├── 📄 logger.ts          # Winston логгер
│   │       └── 📄 prisma.ts          # Prisma клиент
│   │
│   ├── 📂 prisma/                    # Prisma ORM
│   │   ├── 📄 schema.prisma          # Схема БД
│   │   └── 📄 seed.ts                # Тестовые данные
│   │
│   ├── 📂 scripts/                   # Скрипты
│   │   ├── 📄 setup-db.sql           # SQL для создания БД
│   │   ├── 📄 quick-setup.sql        # Быстрая настройка
│   │   └── 📄 test-api.sh            # Тест API
│   │
│   └── 📂 logs/                      # Логи (создается автоматически)
│       ├── 📄 combined.log
│       └── 📄 error.log
│
├── 📂 scripts/                       # Скрипты автоматизации
│   ├── 📄 setup.sh                   # Первоначальная настройка
│   ├── 📄 init-db.sh                 # Инициализация БД
│   ├── 📄 status.sh                  # Проверка статуса
│   ├── 📄 test-api.sh                # Тест API
│   ├── 📄 clean.sh                   # Очистка проекта
│   ├── 📄 sync.sh                    # Синхронизация структуры
│   └── 📄 migrate.sh                 # Миграция из старой структуры
│
├── 📂 docker/                        # Docker файлы
│   └── 📄 init.sql                   # Инициализация БД в Docker
│
└── 📂 .github/                       # GitHub конфигурация
    ├── 📂 workflows/
    │   └── 📄 ci.yml                 # CI/CD pipeline
    ├── 📂 ISSUE_TEMPLATE/
    │   ├── 📄 bug_report.md          # Шаблон bug report
    │   └── 📄 feature_request.md     # Шаблон feature request
    ├── 📄 pull_request_template.md   # Шаблон PR
    ├── 📄 FUNDING.yml                # Настройки спонсорства
    ├── 📄 dependabot.yml             # Dependabot конфигурация
    └── 📄 SECURITY.md                # Политика безопасности
```

## 📊 Описание компонентов

### Frontend (React + TypeScript + Tailwind)

**Основные страницы:**
- Лендинг с hero-секцией и анимациями
- Магазин агентов с iOS-тумблерами
- Детальные страницы каждого агента
- Дашборд результатов с визуализацией
- Авторизация и регистрация
- Личный кабинет с 4 вкладками
- Лидерборд с рейтингом

**Ключевые компоненты:**
- `App.tsx` - главный компонент с роутингом
- `AgentStore.tsx` - магазин агентов
- `AgentPage.tsx` - детальная страница агента
- `ResultsDashboard.tsx` - дашборд результатов
- `Dashboard.tsx` - личный кабинет

### Backend (Node.js + Express + Prisma)

**API эндпоинты:**
- `/api/auth/*` - аутентификация
- `/api/users/*` - пользователи
- `/api/agents/*` - агенты
- `/api/analysis/*` - анализ

**Ключевые сервисы:**
- `auth.service.ts` - аутентификация и JWT
- `analysis.service.ts` - логика анализа
- `agents.service.ts` - данные агентов
- `user.service.ts` - управление пользователями

**База данных:**
- `schema.prisma` - схема БД
- `seed.ts` - тестовые данные
- 4 таблицы: users, sessions, agent_verdicts, transactions

### Scripts

Автоматизация рутинных задач:
- `setup.sh` - первоначальная настройка
- `init-db.sh` - инициализация БД
- `status.sh` - проверка статуса
- `test-api.sh` - тестирование API
- `clean.sh` - очистка проекта
- `sync.sh` - синхронизация структуры
- `migrate.sh` - миграция из старой структуры

### Docker

Контейнеризация для production:
- `docker-compose.yml` - весь стек
- `Dockerfile` для frontend и backend
- `nginx.conf` для frontend
- `init.sql` для инициализации БД

### GitHub

CI/CD и автоматизация:
- `ci.yml` - автоматические тесты
- `dependabot.yml` - обновление зависимостей
- Шаблоны для issues и PR
- Политика безопасности

---

## 🎯 Принципы организации

### 1. Разделение ответственности
- Frontend - только UI
- Backend - только API и бизнес-логика
- Database - только данные

### 2. Модульность
- Каждый компонент независим
- Четкие интерфейсы между модулями
- Легко тестировать и заменять

### 3. Масштабируемость
- Монорепо структура
- Docker для деплоя
- CI/CD для автоматизации

### 4. Документация
- README на каждом уровне
- Комментарии в коде
- API документация

---

## 📝 Соглашения

### Именование файлов
- Компоненты: `PascalCase.tsx` (например, `AgentStore.tsx`)
- Утилиты: `camelCase.ts` (например, `logger.ts`)
- Скрипты: `kebab-case.sh` (например, `test-api.sh`)

### Именование папок
- Всегда `lowercase`
- Множественное число для коллекций (например, `components/`)

### Структура компонентов
```typescript
// 1. Imports
import React from 'react';

// 2. Types/Interfaces
interface Props {
  // ...
}

// 3. Component
export default function ComponentName({ ... }: Props) {
  // ...
}
```

---

**Эта структура обеспечивает:**
- ✅ Легкость навигации
- ✅ Четкое разделение ответственности
- ✅ Простоту масштабирования
- ✅ Удобство командной работы
- ✅ Автоматизацию рутинных задач
