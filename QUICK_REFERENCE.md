# ⚡ Quick Reference

Быстрый справочник команд для повседневной работы.

## 🚀 Запуск

```bash
# Запустить оба проекта
make dev
# или
npm run dev

# Только backend
make backend
# или
cd backend && npm run dev

# Только frontend
make frontend
# или
cd frontend && npm run dev
```

## 🗄️ База данных

```bash
# Настроить БД
make db-setup

# Открыть Prisma Studio
make db-studio
# или
cd backend && npm run db:studio

# Сбросить БД
make db-reset

# Применить схему
cd backend && npm run db:push

# Загрузить тестовые данные
cd backend && npm run db:seed
```

## 🧪 Тестирование

```bash
# Все тесты
make test

# API тесты
cd backend && ./scripts/test-api.sh

# Проверка статуса
make status
# или
./scripts/status.sh
```

## 📦 Зависимости

```bash
# Установить все
make install
# или
npm run install:all

# Только frontend
cd frontend && npm install

# Только backend
cd backend && npm install
```

## 🧹 Очистка

```bash
# Очистить node_modules
make clean

# Полная очистка (включая БД)
make clean:all

# Очистить кэш Vite
cd frontend && rm -rf node_modules/.vite
```

## 🐳 Docker

```bash
# Запустить всё
docker-compose up -d

# Остановить
docker-compose down

# Логи
docker-compose logs -f

# Пересобрать
docker-compose up -d --build
```

## 🔍 Отладка

```bash
# Логи backend
make logs

# Только ошибки
make logs-error

# Проверить PostgreSQL
pg_isready

# Подключиться к БД
psql -d synapse_judgement

# Проверить порты
lsof -i :3001  # backend
lsof -i :5173  # frontend
```

## 📊 Мониторинг

```bash
# Статус всех сервисов
make status

# Проверить backend
curl http://localhost:3001/health

# Проверить frontend
curl http://localhost:5173

# Проверить БД
psql -d synapse_judgement -c "SELECT count(*) FROM users;"
```

## 🔧 Утилиты

```bash
# Синхронизировать структуру
./scripts/sync.sh

# Мигрировать из старой структуры
./scripts/migrate.sh

# Инициализировать БД
./scripts/init-db.sh

# Первоначальная настройка
./scripts/setup.sh
```

## 📝 Git

```bash
# Статус
git status

# Добавить все изменения
git add .

# Commit
git commit -m "feat: add amazing feature"

# Push
git push origin main

# Создать ветку
git checkout -b feature/new-feature

# Переключиться на ветку
git checkout feature/new-feature
```

## 🌐 API запросы

```bash
# Health check
curl http://localhost:3001/health

# Получить агентов
curl http://localhost:3001/api/agents

# Войти
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@synapse.ai","password":"demo123"}' | jq -r '.token')

# Получить профиль
curl http://localhost:3001/api/users/me \
  -H "Authorization: Bearer $TOKEN"

# Запустить анализ
curl -X POST http://localhost:3001/api/analysis/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"ticker":"AAPL","agents":["tech","fund"]}'
```

## 🎯 Демо-доступ

```
Email: demo@synapse.ai
Password: demo123
Credits: 847
Plan: PRO
```

## 📚 Документация

```bash
# Главная документация
cat README.md

# Backend документация
cat backend/README.md

# Frontend документация
cat frontend/README.md

# Руководство по установке
cat SETUP_GUIDE.md

# Структура проекта
cat PROJECT_STRUCTURE.md
```

## 🐛 Решение проблем

```bash
# PostgreSQL не запускается
brew services start postgresql@15  # macOS
sudo systemctl start postgresql    # Linux

# Порт занят
lsof -i :3001
kill -9 <PID>

# Ошибки Prisma
cd backend
npm run db:generate
npm run db:push

# Фронтенд без стилей
cd frontend
rm -rf node_modules/.vite
npm run dev
```

## 📊 Полезные ссылки

- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Prisma Studio: http://localhost:5555
- API Docs: http://localhost:3001/api

---

**Сохраните этот файл для быстрого доступа! ⚡**
