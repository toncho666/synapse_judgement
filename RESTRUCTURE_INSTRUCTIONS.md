# 🔄 Инструкция по реструктуризации проекта

## ⚠️ Важно!

Ваш проект сейчас имеет **неправильную структуру**:
- Frontend код находится в корне проекта (`src/`, `package.json`, `vite.config.js`)
- Backend код находится в папке `backend/`

**Нужно переместить frontend в отдельную папку `frontend/`**

---

## 🎯 Целевая структура

```
synapse-judgement/
├── frontend/              # Frontend (React + Vite)
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   ├── tsconfig.json
│   └── index.html
├── backend/               # Backend (Node.js + Express)
│   ├── src/
│   ├── package.json
│   └── ...
├── scripts/               # Скрипты
├── docker/                # Docker
├── package.json           # Корневой orchestrator
└── README.md
```

---

## 🚀 Автоматическая реструктуризация

### Шаг 1: Запустите скрипт

```bash
chmod +x scripts/restructure.sh
./scripts/restructure.sh
```

Скрипт автоматически:
- ✅ Создаст папку `frontend/`
- ✅ Переместит `src/` в `frontend/src/`
- ✅ Переместит конфигурационные файлы
- ✅ Обновит `.gitignore`
- ✅ Создаст правильные README файлы

### Шаг 2: Установите зависимости

```bash
# Корневые зависимости
npm install

# Frontend зависимости
cd frontend
npm install
cd ..

# Backend зависимости
cd backend
npm install
cd ..
```

### Шаг 3: Настройте базу данных

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

### Шаг 4: Запустите проект

```bash
# Запустить оба проекта
npm run dev

# Или по отдельности
npm run dev:frontend   # http://localhost:5173
npm run dev:backend    # http://localhost:3001
```

---

## 🔧 Ручная реструктуризация

Если автоматический скрипт не работает, выполните вручную:

### 1. Создайте структуру папок

```bash
mkdir -p frontend/src/components
mkdir -p frontend/src/lib
mkdir -p frontend/src/data
```

### 2. Переместите файлы фронтенда

```bash
# Переместить src/
mv src/* frontend/src/
rmdir src

# Переместить конфигурационные файлы
mv index.html frontend/
mv vite.config.js frontend/
mv tsconfig.json frontend/
mv package-lock.json frontend/ 2>/dev/null || true
```

### 3. Проверьте package.json

Корневой `package.json` уже настроен как orchestrator:

```json
{
  "name": "synapse-judgement",
  "workspaces": ["frontend", "backend"],
  "scripts": {
    "dev": "concurrently \"npm run dev:frontend\" \"npm run dev:backend\"",
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "cd backend && npm run dev",
    ...
  }
}
```

Frontend `frontend/package.json` уже создан с правильными зависимостями.

### 4. Установите зависимости

```bash
# Корневые
npm install

# Frontend
cd frontend && npm install && cd ..

# Backend
cd backend && npm install && cd ..
```

---

## ✅ Проверка структуры

После реструктуризации выполните:

```bash
# Проверить структуру
tree -L 2 -d

# Должно показать:
# .
# ├── backend
# ├── docker
# ├── frontend
# │   └── src
# └── scripts
```

---

## 🧪 Тестирование

### 1. Запустите frontend

```bash
cd frontend
npm run dev
```

Откройте http://localhost:5173 - должна загрузиться страница.

### 2. Запустите backend

```bash
cd backend
npm run dev
```

Проверьте http://localhost:3001/health - должен вернуть `{"status":"ok"}`.

### 3. Запустите оба проекта

```bash
# Из корня проекта
npm run dev
```

Оба проекта должны запуститься одновременно.

---

## 🐛 Решение проблем

### Проблема: "Cannot find module '@tailwindcss/vite'"

**Решение:**
```bash
cd frontend
npm install
```

### Проблема: "Port 5173 already in use"

**Решение:**
```bash
lsof -i :5173
kill -9 <PID>
```

### Проблема: "Cannot connect to backend"

**Решение:**
1. Убедитесь что backend запущен на порту 3001
2. Проверьте proxy настройки в `frontend/vite.config.js`
3. Перезапустите frontend

---

## 📊 Команды для управления

### Из корня проекта

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

### Из папки frontend

```bash
cd frontend
npm run dev              # Запустить frontend
npm run build            # Собрать production
npm run preview          # Preview production
```

### Из папки backend

```bash
cd backend
npm run dev              # Запустить backend
npm run db:studio        # Открыть Prisma Studio
npm run db:push          # Применить схему БД
```

---

## 🎯 Следующие шаги

После успешной реструктуризации:

1. **Протестируйте проект**
   ```bash
   npm run dev
   ```

2. **Опубликуйте на GitHub**
   ```bash
   git init
   git add .
   git commit -m "Restructure to monorepo"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

3. **Настройте CI/CD**
   - GitHub Actions уже настроен в `.github/workflows/ci.yml`

---

## 📚 Документация

- [README.md](./README.md) - главная документация
- [frontend/README.md](./frontend/README.md) - frontend документация
- [backend/README.md](./backend/README.md) - backend документация
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - подробная инструкция

---

## ✅ Чеклист

- [ ] Запущен скрипт `scripts/restructure.sh`
- [ ] Установлены зависимости (`npm run install:all`)
- [ ] Создана база данных (`createdb synapse_judgement`)
- [ ] Настроен `backend/.env`
- [ ] Инициализирована БД (`npm run db:push && npm run db:seed`)
- [ ] Frontend запускается (`npm run dev:frontend`)
- [ ] Backend запускается (`npm run dev:backend`)
- [ ] Оба проекта работают вместе (`npm run dev`)
- [ ] Структура проверена (`tree -L 2 -d`)

---

**Удачи с реструктуризацией! 🚀**

Если возникнут проблемы, проверьте:
1. [RESTRUCTURE_GUIDE.md](./RESTRUCTURE_GUIDE.md) - подробная инструкция
2. [SETUP_GUIDE.md](./SETUP_GUIDE.md) - руководство по установке
3. [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - справочник команд
