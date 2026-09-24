# 🎯 Synapse Judgement

AI-платформа инвестиционного анализа с 5 агентами и Судьёй.

## 📦 Структура проекта

```
synapse-judgement/
├── src/                   # Frontend код (React + Vite + Tailwind)
├── backend/               # Backend код (Node.js + Express + Prisma)
├── scripts/               # Скрипты автоматизации
├── docker/                # Docker конфигурации
├── package.json           # Frontend зависимости
├── vite.config.js         # Frontend конфигурация
└── README.md              # Этот файл

**Frontend** находится в корне проекта (порт 5173)  
**Backend** находится в папке `backend/` (порт 3001)
```

## 🚀 Быстрый старт

### Требования
- Node.js 18+
- PostgreSQL 14+
- npm или yarn

### 1. Клонирование

```bash
git clone <your-repo-url>
cd synapse-judgement
```

### 2. Установка зависимостей

```bash
# Установить всё сразу
npm run install:all

# Или по отдельности
cd frontend && npm install
cd ../backend && npm install
```

### 3. Настройка базы данных

```bash
# Создать БД
createdb synapse_judgement

# Настроить backend/.env (скопировать из .env.example)
cp backend/.env.example backend/.env
# Отредактировать DATABASE_URL под вашу систему

# Инициализировать БД
cd backend
npm run db:generate
npm run db:push
npm run db:seed
```

### 4. Запуск

```bash
# Запустить оба проекта одновременно
npm run dev

# Или по отдельности
npm run dev:frontend   # http://localhost:5173
npm run dev:backend    # http://localhost:3001
```

### 5. Открыть в браузере

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api
- **Prisma Studio**: `cd backend && npm run db:studio`

**Демо-доступ:**
- Email: `demo@synapse.ai`
- Password: `demo123`

---

## 📚 Документация

- [Frontend README](./frontend/README.md)
- [Backend README](./backend/README.md)
- [API Documentation](./backend/README.md#api-endpoints)
- [Setup Guide](./SETUP_GUIDE.md)

---

## 🛠 Доступные команды

### Через npm

```bash
npm run install:all      # Установить зависимости везде
npm run dev              # Запустить frontend + backend
npm run dev:frontend     # Только frontend
npm run dev:backend      # Только backend
npm run build            # Собрать production версию
npm run db:push          # Применить схему БД
npm run db:seed          # Загрузить тестовые данные
npm run db:studio        # Открыть Prisma Studio
npm run test             # Запустить тесты
npm run lint             # Проверить код
```

### Через Make (Mac/Linux)

```bash
make install             # Установить всё
make dev                 # Запустить оба проекта
make backend             # Только backend
make frontend            # Только frontend
make db-setup            # Настроить базу данных
make db-reset            # Сбросить БД
make stop                # Остановить все процессы
make clean               # Очистить node_modules
```

---

## 🗄️ База данных

### PostgreSQL настройка

**macOS (Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
createdb synapse_judgement
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt install postgresql
sudo systemctl start postgresql
sudo -u postgres createdb synapse_judgement
```

### Структура БД

- **users** - пользователи (email, name, plan, credits)
- **sessions** - сессии анализа (ticker, agents, verdict)
- **agent_verdicts** - выводы агентов (agentId, signal, confidence)
- **transactions** - транзакции (type, amount)

### Тестовые данные

После `npm run db:seed`:
- Демо-пользователь: `demo@synapse.ai` / `demo123`
- 847 кредитов, PRO план
- 3 тестовые сессии (AAPL, TSLA, NVDA)

---

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

### Пример запроса
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

---

## 🐳 Docker (опционально)

```bash
# Запустить всё через Docker Compose
docker-compose up -d

# Остановить
docker-compose down

# Посмотреть логи
docker-compose logs -f
```

---

## 🧪 Тестирование

```bash
# Тесты backend
cd backend && npm test

# Тесты frontend
cd frontend && npm test

# API тесты через скрипт
cd backend && ./scripts/test-api.sh
```

---

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

### Frontend
Не требует переменных окружения для разработки.

---

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

### Фронтенд без стилей
```bash
cd frontend
rm -rf node_modules/.vite
npm run dev
```

---

## 📊 Мониторинг

```bash
# Логи backend
tail -f backend/logs/combined.log

# Логи ошибок
tail -f backend/logs/error.log

# Prisma Studio (веб-интерфейс БД)
cd backend && npm run db:studio
```

---

## 🎯 Следующие шаги

1. **Изучите код**
   - `frontend/src/App.tsx` - главный компонент
   - `backend/src/services/analysis.service.ts` - логика анализа
   - `backend/prisma/schema.prisma` - схема БД

2. **Добавьте AI модели**
   - Замените мок-данные в `analysis.service.ts`
   - Интегрируйте OpenAI/Anthropic API

3. **Добавьте источники данных**
   - Alpha Vantage, Yahoo Finance, Polygon.io

4. **Деплой**
   - Frontend: Vercel, Netlify
   - Backend: Railway, Render, AWS
   - Database: Supabase, Neon, Railway

---

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте ветку (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

---

## 📄 Лицензия

MIT

---

## 📞 Поддержка

- Документация: [README.md](./README.md)
- Backend: [backend/README.md](./backend/README.md)
- Frontend: [frontend/README.md](./frontend/README.md)
- Issues: GitHub Issues

---

**Создано с ❤️ для инвестиционного анализа**
