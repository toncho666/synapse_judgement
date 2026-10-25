# ⚡ VSCode Шпаргалка - Synapse Judgement

Быстрый справочник команд и горячих клавиш для работы с проектом.

---

## 🚀 Быстрый старт

### Запуск проекта
```bash
# Через терминал
npm run dev

# Или через VSCode Tasks
Ctrl+Shift+P → "Tasks: Run Task" → "Start All Services"
```

### URLs
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **API Health**: http://localhost:3001/health
- **Prisma Studio**: `npm run db:studio` → http://localhost:5555

### Демо-доступ
- **Email**: demo@synapse.ai
- **Password**: demo123

---

## ⌨️ Горячие клавиши VSCode

### Основные
| Действие | Windows/Linux | macOS |
|----------|---------------|-------|
| Command Palette | `Ctrl+Shift+P` | `Cmd+Shift+P` |
| Быстрый переход к файлу | `Ctrl+P` | `Cmd+P` |
| Новый терминал | `Ctrl+Shift+`` | `Cmd+Shift+`` |
| Переключение терминалов | `Ctrl+`` | `Cmd+`` |
| Закрыть терминал | `Ctrl+D` | `Cmd+D` |

### Редактирование
| Действие | Windows/Linux | macOS |
|----------|---------------|-------|
| Закомментировать строку | `Ctrl+/` | `Cmd+/` |
| Дублировать строку | `Shift+Alt+↓` | `Shift+Option+↓` |
| Переместить строку | `Alt+↑/↓` | `Option+↑/↓` |
| Выделить следующее вхождение | `Ctrl+D` | `Cmd+D` |
| Выделить все вхождения | `Ctrl+Shift+L` | `Cmd+Shift+L` |
| Форматирование | `Shift+Alt+F` | `Shift+Option+F` |

### Навигация
| Действие | Windows/Linux | macOS |
|----------|---------------|-------|
| Перейти к определению | `F12` | `F12` |
| Найти все ссылки | `Shift+F12` | `Shift+F12` |
| Переименовать символ | `F2` | `F2` |
| Быстрое исправление | `Ctrl+.` | `Cmd+.` |
| Перейти назад | `Alt+←` | `Ctrl+-` |
| Перейти вперед | `Alt+→` | `Ctrl+Shift+-` |

### Поиск
| Действие | Windows/Linux | macOS |
|----------|---------------|-------|
| Поиск в файле | `Ctrl+F` | `Cmd+F` |
| Поиск во всех файлах | `Ctrl+Shift+F` | `Cmd+Shift+F` |
| Поиск и замена | `Ctrl+H` | `Cmd+H` |
| Заменить во всех файлах | `Ctrl+Shift+H` | `Cmd+Shift+H` |

### Отладка
| Действие | Windows/Linux | macOS |
|----------|---------------|-------|
| Запуск отладки | `F5` | `F5` |
| Остановка отладки | `Shift+F5` | `Shift+F5` |
| Перезапуск отладки | `Ctrl+Shift+F5` | `Cmd+Shift+F5` |
| Toggle breakpoint | `F9` | `F9` |
| Step over | `F10` | `F10` |
| Step into | `F11` | `F11` |
| Step out | `Shift+F11` | `Shift+F11` |

---

## 📋 VSCode Tasks

### Установка
- **Install All Dependencies** - установить все зависимости
- **Install Frontend Dependencies** - только frontend
- **Install Backend Dependencies** - только backend

### Запуск
- **Start Frontend** - запустить frontend (порт 5173)
- **Start Backend** - запустить backend (порт 3001)
- **Start All Services** - запустить оба (по умолчанию)

### База данных
- **Database: Generate Prisma Client** - генерация клиента
- **Database: Push Schema** - применение схемы
- **Database: Seed Data** - загрузка тестовых данных
- **Database: Open Prisma Studio** - открыть Prisma Studio
- **Database: Full Setup** - полная настройка БД

### Тестирование
- **Test: API Health Check** - проверка health endpoint
- **Test: Stock Quotes API** - тест API котировок
- **Test: Technical Analysis API** - тест API тех. анализа

### Сборка
- **Build Frontend** - сборка frontend
- **Build Backend** - сборка backend

---

## 🔧 Полезные команды терминала

### Управление проектом
```bash
# Запустить оба проекта
npm run dev

# Только frontend
npm run dev:frontend

# Только backend
npm run dev:backend

# Собрать production
npm run build

# Установить все зависимости
npm run install:all
```

### Работа с БД
```bash
# Генерация Prisma Client
npm run db:generate

# Применение схемы
npm run db:push

# Загрузка тестовых данных
npm run db:seed

# Открыть Prisma Studio
npm run db:studio

# Сброс БД
cd backend && npx prisma migrate reset
```

### Git
```bash
# Статус
git status

# Добавить все изменения
git add .

# Коммит
git commit -m "описание изменений"

# Пуш
git push origin main

# Создать ветку
git checkout -b feature/new-feature

# Переключиться на ветку
git checkout main
```

### Тестирование API
```bash
# Health check
curl http://localhost:3001/health

# Получить котировки
curl http://localhost:3001/api/stocks

# Технический анализ
curl http://localhost:3001/api/technical-analysis/AAPL

# С форматированием (нужен jq)
curl -s http://localhost:3001/api/stocks | jq .
```

---

## 🎯 Отладка

### Конфигурации отладки

1. **Debug Frontend (Chrome)**
   - Отладка React приложения
   - Breakpoints в браузере
   - Автоматический запуск frontend

2. **Debug Backend (Node.js)**
   - Отладка Express API
   - Breakpoints в Node.js
   - Автоматический запуск backend

3. **Full Stack Debug**
   - Одновременная отладка frontend и backend
   - Compound configuration

### Как использовать

1. Поставьте breakpoint (кликните слева от номера строки)
2. Откройте Debug Panel: `Ctrl+Shift+D` / `Cmd+Shift+D`
3. Выберите конфигурацию из dropdown
4. Нажмите **F5** или зеленую кнопку Play

---

## 📁 Структура проекта

```
synapse-judgement/
├── frontend/              # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/    # React компоненты
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Утилиты
│   │   └── data/          # Мок-данные
│   └── package.json
│
├── backend/               # Node.js + Express + Prisma
│   ├── src/
│   │   ├── controllers/   # Обработка запросов
│   │   ├── services/      # Бизнес-логика
│   │   ├── routes/        # API endpoints
│   │   ├── middleware/    # Auth, validation
│   │   └── utils/         # Logger, Prisma
│   ├── prisma/            # Схема БД
│   └── package.json
│
├── scripts/               # Скрипты автоматизации
├── docker/                # Docker конфигурации
└── package.json           # Корневой orchestrator
```

---

## 🐛 Решение проблем

### Backend не запускается
```bash
# Проверьте логи
cd backend && npm run dev

# Проверьте PostgreSQL
pg_isready

# Проверьте .env
cat backend/.env
```

### Frontend не загружается
```bash
# Очистите кэш
cd frontend && rm -rf node_modules/.vite

# Переустановите зависимости
cd frontend && rm -rf node_modules && npm install
```

### Ошибки TypeScript
```bash
# Проверьте типы
cd frontend && npm run lint
cd backend && npm run lint
```

### Порт занят
```bash
# Найти процесс
lsof -i :3001  # или :5173

# Убить процесс
kill -9 <PID>
```

---

## 📚 Расширения VSCode

### Установленные (рекомендуемые)
- ✅ ESLint - линтер
- ✅ Prettier - форматирование
- ✅ Tailwind CSS IntelliSense - автодополнение Tailwind
- ✅ Prisma - поддержка Prisma ORM
- ✅ ES7+ React Snippets - сниппеты React
- ✅ REST Client - тестирование API
- ✅ Docker - работа с Docker

### Как установить
1. Откройте Extensions: `Ctrl+Shift+X` / `Cmd+Shift+X`
2. Найдите расширение по имени
3. Нажмите "Install"

**Или** автоматически:
VSCode предложит установить рекомендуемые расширения при открытии проекта (файл `.vscode/extensions.json`).

---

## 🎨 Полезные настройки VSCode

### Auto-save
```json
{
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000
}
```

### Format on save
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

### Minimap
```json
{
  "editor.minimap.enabled": false
}
```

### Terminal
```json
{
  "terminal.integrated.defaultProfile.osx": "zsh",
  "terminal.integrated.fontSize": 14
}
```

---

## 🔗 Быстрые ссылки

### Локальные
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- API Docs: http://localhost:3001/api
- Prisma Studio: http://localhost:5555

### Внешние
- GitHub: https://github.com/toncho666/synapse_judgement
- Alpha Vantage: https://www.alphavantage.co/
- Prisma Docs: https://www.prisma.io/docs
- React Docs: https://react.dev

---

## 💡 Советы

### Multi-root Workspace
Используйте файл `synapse-judgement.code-workspace` для удобной работы с frontend и backend как отдельными workspace folders.

### Split Terminal
Разделите терминал на две части:
- Левая: backend
- Правая: frontend

`Ctrl+5` (или `Cmd+5`) - разделить терминал вертикально

### Integrated Terminal
Используйте встроенный терминал вместо внешнего:
- `Ctrl+`` - открыть/закрыть терминал
- `Ctrl+Shift+`` - новый терминал

### Emmet
Используйте Emmet для быстрого написания HTML/JSX:
- Напишите `div.container>h1{Title}` и нажмите `Tab`
- Развернется в полный HTML

### Snippets
Используйте сниппеты для React:
- `rafce` - React Arrow Function Component with ES6 module
- `useState` - React useState hook
- `useEffect` - React useEffect hook

---

**Готово! Теперь вы знаете все команды и горячие клавиши для работы с проектом!** 🚀
