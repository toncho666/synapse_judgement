# 🚨 ФИНАЛЬНАЯ ИНСТРУКЦИЯ - Очистка и реструктуризация

## ⚠️ Выполните эти команды локально

### Шаг 1: Удалите лишние markdown файлы

```bash
cd /path/to/synapse-judgement

# Удалить все лишние markdown файлы
rm -f ARCHITECTURE.md CHANGELOG.md CI_FIX.md CODE_OF_CONDUCT.md CONTRIBUTING.md
rm -f DEPLOYMENT.md FINAL_CHECK.md FINAL_SUMMARY.md FIX_FRONTEND_STRUCTURE.md
rm -f GITHUB_SETUP.md IMPLEMENTATION_SUMMARY.md PRODUCT_OVERVIEW.md PROJECT_STRUCTURE.md
rm -f QUICKSTART.md QUICK_REFERENCE.md RESTRUCTURE_GUIDE.md RESTRUCTURE_INSTRUCTIONS.md
rm -f SETUP_GUIDE.md STRUCTURE_CHECK.md SUMMARY.md URGENT_FIX.md VERIFICATION_COMPLETE.md
```

### Шаг 2: Переместите frontend файлы в правильную структуру

```bash
# Создать структуру
mkdir -p frontend/src/components
mkdir -p frontend/src/lib
mkdir -p frontend/src/data

# Переместить файлы из src/ в frontend/src/
cp -r src/* frontend/src/
rm -rf src

# Удалить дубликаты из корня
rm -f index.html vite.config.js tsconfig.json package-lock.json
```

### Шаг 3: Проверьте структуру

```bash
tree -L 2 -d

# Должно показать:
# .
# ├── backend
# ├── docker
# ├── frontend
# │   └── src
# │       ├── components
# │       ├── data
# │       └── lib
# └── scripts
```

### Шаг 4: Установите зависимости

```bash
cd frontend
npm install
cd ..
```

### Шаг 5: Проверьте что frontend работает

```bash
cd frontend
npm run dev
```

Откройте http://localhost:5173 - должна загрузиться страница.

### Шаг 6: Закоммитьте изменения

```bash
git add .
git commit -m "refactor: restructure to monorepo with proper frontend/backend separation"
git push
```

---

## ✅ Или используйте скрипт

```bash
chmod +x scripts/final-restructure.sh
./scripts/final-restructure.sh
```

---

## 📋 Правильная структура проекта

```
synapse-judgement/
│
├── frontend/                    # Frontend приложение
│   ├── src/
│   │   ├── components/         # React компоненты (17 файлов)
│   │   │   ├── AgentPage.tsx
│   │   │   ├── AgentStore.tsx
│   │   │   ├── AuthPage.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Faq.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── Icon.tsx
│   │   │   ├── Leaderboard.tsx
│   │   │   ├── Nav.tsx
│   │   │   ├── Pipeline.tsx
│   │   │   ├── RequestSection.tsx
│   │   │   ├── ResultsDashboard.tsx
│   │   │   ├── Reveal.tsx
│   │   │   ├── StickyBar.tsx
│   │   │   ├── Transparency.tsx
│   │   │   └── viz.tsx
│   │   ├── lib/                # Утилиты (4 файла)
│   │   │   ├── auth.ts
│   │   │   ├── engine.ts
│   │   │   ├── hooks.ts
│   │   │   └── router.ts
│   │   ├── data/               # Мок-данные (1 файл)
│   │   │   └── agentMock.ts
│   │   ├── App.tsx             # Главный компонент
│   │   ├── main.tsx            # Точка входа
│   │   └── index.css           # Глобальные стили
│   ├── package.json
│   ├── vite.config.js
│   ├── tsconfig.json
│   ├── index.html
│   └── README.md
│
├── backend/                     # Backend API
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── utils/
│   │   ├── config/
│   │   └── index.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── scripts/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── README.md
│
├── scripts/                     # Скрипты автоматизации
│   ├── setup.sh
│   ├── init-db.sh
│   ├── status.sh
│   ├── test-api.sh
│   ├── clean.sh
│   ├── sync.sh
│   ├── migrate.sh
│   └── final-restructure.sh
│
├── docker/                      # Docker конфигурации
│   ├── frontend.Dockerfile
│   ├── nginx.conf
│   └── init.sql
│
├── .github/                     # GitHub интеграция
│   ├── workflows/
│   │   └── ci.yml
│   ├── ISSUE_TEMPLATE/
│   ├── pull_request_template.md
│   ├── dependabot.yml
│   ├── SECURITY.md
│   └── FUNDING.yml
│
├── package.json                 # Корневой orchestrator
├── Makefile                     # Команды для Unix/Mac
├── docker-compose.yml           # Docker Compose
├── docker-compose.override.yml  # Docker overrides
├── .env.example                 # Шаблон переменных
├── .gitignore                   # Git ignore
├── .gitattributes               # Git атрибуты
├── LICENSE                      # MIT лицензия
└── README.md                    # Главная документация
```

---

## 🎯 После реструктуризации

1. ✅ CI/CD пройдёт успешно
2. ✅ Frontend запустится на http://localhost:5173
3. ✅ Backend будет работать на http://localhost:3001
4. ✅ Структура будет правильной монорепо

---

**Выполните команды выше и закоммитьте изменения!** 🚀
