# 🎯 Synapse Judgement

AI-платформа инвестиционного анализа с 5 агентами и Судьёй.

## 📦 Структура проекта

```
synapse-judgement/
├── frontend/              # React + Vite + Tailwind (порт 5173)
├── backend/               # Node.js + Express + Prisma (порт 3001)
├── scripts/               # Скрипты автоматизации
├── docker/                # Docker конфигурации
├── package.json           # Корневой orchestrator
└── README.md              # Этот файл
```

**Frontend** находится в папке `frontend/` (порт 5173)  
**Backend** находится в папке `backend/` (порт 3001)

## 🚀 Быстрый старт

### Требования
- Node.js 18+
- PostgreSQL 14+
- npm

### 1. Установка зависимостей

```bash
# Установить все зависимости
npm run install:all

# Или по отдельности
cd frontend && npm install
cd ../backend && npm install
```

### 2. Настройка базы данных

```bash
# Создать БД
createdb synapse_judgement

# Настроить backend/.env
cd backend
cp .env.example .env
# Отредактировать DATABASE_URL

# Инициализировать БД
npm run db:generate
npm run db:push
npm run db:seed
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

## 📚 Документация

- [Frontend README](./frontend/README.md)
- [Backend README](./backend/README.md)
- [Setup Guide](./SETUP_GUIDE.md)
- [Architecture](./ARCHITECTURE.md)

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

## 🔄 Реструктуризация проекта

Если у вас старая структура (frontend в корне), выполните:

```bash
chmod +x scripts/restructure.sh
./scripts/restructure.sh
```

Подробная инструкция: [RESTRUCTURE_GUIDE.md](./RESTRUCTURE_GUIDE.md)

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

## 🐳 Docker

```bash
# Запустить всё через Docker Compose
docker-compose up -d

# Остановить
docker-compose down
```

## 🧪 Тестирование

```bash
# Тесты backend
cd backend && npm test

# API тесты через скрипт
cd backend && ./scripts/test-api.sh
```

## 📊 Мониторинг

```bash
# Логи backend
tail -f backend/logs/combined.log

# Prisma Studio (веб-интерфейс БД)
cd backend && npm run db:studio
```

## 📝 Переменные окружения

### Backend (.env)
```env
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://user@localhost:5432/synapse_judgement"
JWT_SECRET="your-secret-key"
FRONTEND_URL="http://localhost:5173"
LOG_LEVEL="debug"
```

## 🚨 Решение проблем

### PostgreSQL не запускается
```bash
# macOS
brew services start postgresql@15

# Linux
sudo systemctl start postgresql
```

### Порт занят
```bash
# Найти процесс
lsof -i :3001  # или :5173

# Убить процесс
kill -9 <PID>
```

### Ошибки Prisma
```bash
cd backend
npm run db:generate
npm run db:push
```

## 🎯 Следующие шаги

1. **Изучите код**
   - `frontend/src/App.tsx` - главный компонент
   - `backend/src/services/analysis.service.ts` - логика анализа
   - `backend/prisma/schema.prisma` - схема БД

2. **Добавьте AI модели**
   - Замените мок-данные в `analysis.service.ts`
   - Интегрируйте OpenAI/Anthropic API

3. **Деплой**
   - Frontend: Vercel, Netlify
   - Backend: Railway, Render, AWS
   - Database: Supabase, Neon, Railway

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте ветку (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 Лицензия

MIT

---

**Создано с ❤️ для инвестиционного анализа**
