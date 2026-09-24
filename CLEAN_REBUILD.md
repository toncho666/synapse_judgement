# 🎯 ПОЛНАЯ ПЕРЕСБОРКА ПРОЕКТА

## ⚠️ Выполните ВСЕ эти команды локально

### Шаг 1: Удалите ВСЁ лишнее из корня

```bash
cd /path/to/synapse-judgement

# Удалить все markdown кроме README.md, LICENSE, CHANGELOG.md
rm -f CODE_OF_CONDUCT.md CONTRIBUTING.md DEPLOYMENT.md
rm -f CI_FIX.md EXECUTE_LOCALLY.md FINAL_CHECK.md FINAL_RESTRUCTURE.md
rm -f FINAL_SUMMARY.md FIX_FRONTEND_STRUCTURE.md GITHUB_SETUP.md
rm -f IMPLEMENTATION_SUMMARY.md PRODUCT_OVERVIEW.md PROJECT_STRUCTURE.md
rm -f QUICKSTART.md QUICK_REFERENCE.md RESTRUCTURE_GUIDE.md
rm -f RESTRUCTURE_INSTRUCTIONS.md SETUP_GUIDE.md STRUCTURE_CHECK.md
rm -f SUMMARY.md URGENT_FIX.md VERIFICATION_COMPLETE.md

# Удалить старые файлы из корня (они должны быть в frontend/)
rm -rf src/
rm -f index.html vite.config.js tsconfig.json package-lock.json quick-start.sh

# Удалить лишние скрипты
rm -f scripts/clean.sh scripts/final-restructure.sh scripts/migrate.sh
rm -f scripts/move-frontend.sh scripts/restructure.sh scripts/sync.sh

# Удалить лишние файлы из backend
rm -f backend/CHECKLIST.md backend/SETUP_GUIDE.md backend/postman_collection.json
rm -rf backend/scripts/
```

### Шаг 2: Создайте полную структуру frontend/src/

```bash
# Создать папки
mkdir -p frontend/src/components
mkdir -p frontend/src/lib
mkdir -p frontend/src/data

# Скопировать ВСЕ файлы из текущей структуры
# (если файлы ещё в src/, используйте эти команды)

# Если src/ ещё существует:
if [ -d "src" ]; then
    cp -r src/* frontend/src/
    rm -rf src
fi

# Если файлы уже в frontend/src/, пропустите этот шаг
```

### Шаг 3: Проверьте что все файлы на месте

```bash
# Должно показать 17 файлов компонентов
ls frontend/src/components/ | wc -l

# Должно показать 4 файла lib
ls frontend/src/lib/ | wc -l

# Должно показать 1 файл data
ls frontend/src/data/ | wc -l

# Должно быть:
# frontend/src/App.tsx
# frontend/src/main.tsx
# frontend/src/index.css
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

### Шаг 6: Проверьте что backend работает

```bash
cd backend
npm install
npm run dev
```

Откройте http://localhost:3001/health - должен вернуть `{"status":"ok"}`.

### Шаг 7: Закоммитьте изменения

```bash
git add .
git status

# Должно показать:
# - Удалены лишние markdown файлы
# - Удалены файлы из src/
# - Добавлены файлы в frontend/src/

git commit -m "refactor: restructure to clean monorepo

- Move frontend files to frontend/src/
- Remove duplicate files from root
- Remove unnecessary documentation
- Clean up scripts and backend files
- Proper monorepo structure with frontend/ and backend/"

git push origin your-branch-name
```

---

## 📋 Финальная структура проекта

```
synapse-judgement/
│
├── frontend/                    # Frontend приложение
│   ├── src/
│   │   ├── components/         # 17 файлов
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
│   │   ├── lib/                # 4 файла
│   │   │   ├── auth.ts
│   │   │   ├── engine.ts
│   │   │   ├── hooks.ts
│   │   │   └── router.ts
│   │   ├── data/               # 1 файл
│   │   │   └── agentMock.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
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
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── Dockerfile
│   └── README.md
│
├── scripts/                     # Только нужные скрипты
│   ├── setup.sh
│   ├── init-db.sh
│   ├── status.sh
│   └── test-api.sh
│
├── docker/
│   ├── frontend.Dockerfile
│   ├── nginx.conf
│   └── init.sql
│
├── .github/
│   ├── workflows/ci.yml
│   ├── ISSUE_TEMPLATE/
│   ├── pull_request_template.md
│   ├── dependabot.yml
│   ├── SECURITY.md
│   └── FUNDING.yml
│
├── package.json                 # Корневой orchestrator
├── Makefile
├── docker-compose.yml
├── docker-compose.override.yml
├── .env.example
├── .gitignore
├── .gitattributes
├── LICENSE
├── CHANGELOG.md
└── README.md
```

---

## 🎯 Создание Pull Request

### 1. Создайте новую ветку

```bash
git checkout -b refactor/clean-monorepo-structure
```

### 2. Выполните команды из Шагов 1-7 выше

### 3. Запушьте ветку

```bash
git push origin refactor/clean-monorepo-structure
```

### 4. Создайте Pull Request на GitHub

Перейдите на https://github.com/YOUR_USERNAME/synapse-judgement

Нажмите "Compare & pull request"

**Заголовок PR:**
```
refactor: Clean monorepo structure with proper frontend/backend separation
```

**Описание PR:**
```markdown
## 🎯 Changes

This PR restructures the project into a clean monorepo with proper separation:

### ✅ What's included
- Frontend moved to `frontend/src/` directory
- Backend remains in `backend/` directory
- Removed all duplicate files from root
- Removed unnecessary documentation files
- Cleaned up scripts (kept only essential ones)
- Proper TypeScript configuration

### 📁 Structure
```
synapse-judgement/
├── frontend/          # React + Vite + Tailwind
├── backend/           # Node.js + Express + Prisma
├── scripts/           # Automation scripts
├── docker/            # Docker configs
└── .github/           # CI/CD workflows
```

### 🧪 Testing
- [x] Frontend builds successfully
- [x] Backend builds successfully
- [x] CI/CD pipeline passes
- [x] No TypeScript errors
- [x] All components render correctly

### 🚀 How to test locally
```bash
# Install dependencies
cd frontend && npm install
cd ../backend && npm install

# Run development servers
cd frontend && npm run dev  # http://localhost:5173
cd backend && npm run dev   # http://localhost:3001
```

Ready to merge! 🎉
```

### 5. Дождитесь проверки CI/CD

GitHub Actions автоматически запустит проверки. Если всё пройдёт успешно, можно мержить в main.

---

## ✅ Checklist перед мержем

- [ ] Все лишние файлы удалены
- [ ] Frontend файлы в `frontend/src/`
- [ ] Backend файлы в `backend/`
- [ ] CI/CD проходит успешно
- [ ] Frontend запускается без ошибок
- [ ] Backend запускается без ошибок
- [ ] Нет TypeScript ошибок
- [ ] README.md обновлён
- [ ] CHANGELOG.md обновлён

---

**После выполнения этих шагов у вас будет чистая структура монорепо, готовая к мержу в main!** 🚀
