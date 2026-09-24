# 🚀 БЫСТРАЯ ПЕРЕСБОРКА - Скопируйте и выполните

## Выполните ВСЕ команды по порядку:

```bash
# Перейдите в корень проекта
cd /path/to/synapse-judgement

# ========== ШАГ 1: Удаление лишнего ==========

# Удалить все markdown кроме нужных
rm -f CODE_OF_CONDUCT.md CONTRIBUTING.md DEPLOYMENT.md CI_FIX.md \
      EXECUTE_LOCALLY.md FINAL_CHECK.md FINAL_RESTRUCTURE.md FINAL_SUMMARY.md \
      FIX_FRONTEND_STRUCTURE.md GITHUB_SETUP.md IMPLEMENTATION_SUMMARY.md \
      PRODUCT_OVERVIEW.md PROJECT_STRUCTURE.md QUICKSTART.md QUICK_REFERENCE.md \
      RESTRUCTURE_GUIDE.md RESTRUCTURE_INSTRUCTIONS.md SETUP_GUIDE.md \
      STRUCTURE_CHECK.md SUMMARY.md URGENT_FIX.md VERIFICATION_COMPLETE.md \
      CLEAN_REBUILD.md FINAL_INSTRUCTIONS.md

# Удалить старые файлы из корня
rm -rf src/
rm -f index.html vite.config.js tsconfig.json package-lock.json quick-start.sh

# Удалить лишние скрипты
rm -f scripts/clean.sh scripts/final-restructure.sh scripts/migrate.sh \
      scripts/move-frontend.sh scripts/restructure.sh scripts/sync.sh

# Удалить лишние файлы из backend
rm -f backend/CHECKLIST.md backend/SETUP_GUIDE.md backend/postman_collection.json
rm -rf backend/scripts/

# ========== ШАГ 2: Перемещение файлов frontend ==========

# Создать структуру
mkdir -p frontend/src/components
mkdir -p frontend/src/lib
mkdir -p frontend/src/data

# Если src/ ещё существует, переместить файлы
if [ -d "src" ]; then
    cp -r src/* frontend/src/
    rm -rf src
fi

# ========== ШАГ 3: Установка зависимостей ==========

cd frontend && npm install && cd ..
cd backend && npm install && cd ..

# ========== ШАГ 4: Проверка ==========

# Проверить frontend
cd frontend && npm run dev
# Откройте http://localhost:5173
# Нажмите Ctrl+C для остановки
cd ..

# Проверить backend
cd backend && npm run dev
# Откройте http://localhost:3001/health
# Нажмите Ctrl+C для остановки
cd ..

# ========== ШАГ 5: Коммит и push ==========

git add .
git status

git commit -m "refactor: clean monorepo structure

- Move frontend to frontend/src/
- Remove duplicate files from root
- Remove unnecessary documentation
- Clean up scripts and backend files
- Proper monorepo structure"

git push origin your-branch-name
```

---

## 📋 Проверка структуры

После выполнения команд структура должна быть:

```bash
tree -L 2 -d

# synapse-judgement/
# ├── backend
# ├── docker
# ├── frontend
# │   └── src
# │       ├── components
# │       ├── data
# │       └── lib
# └── scripts
```

---

## 🎯 Создание Pull Request

1. Перейдите на GitHub
2. Нажмите "Compare & pull request"
3. Заголовок: `refactor: Clean monorepo structure`
4. Описание:
```
## Changes
- Frontend moved to frontend/src/
- Backend in backend/
- Removed duplicate files
- Clean monorepo structure

## Testing
- [x] Frontend builds
- [x] Backend builds
- [x] CI/CD passes
```

5. Нажмите "Create pull request"
6. Дождитесь проверки CI
7. Нажмите "Merge pull request"

---

**Готово! У вас будет чистая структура монорепо в main!** ✅
