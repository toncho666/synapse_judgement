# 🚨 ВАЖНО: Исправление структуры проекта

## ❌ Проблема

CI/CD pipeline падает с ошибкой:
```
error TS18003: No inputs were found in config file 'frontend/tsconfig.json'.
Specified 'include' paths were '["src"]' and 'exclude' paths were '[]'.
```

**Причина:** Файлы frontend находятся в корне проекта (`src/`), а должны быть в `frontend/src/`.

---

## ✅ Решение

### Выполните эти команды локально на вашем компьютере:

```bash
# 1. Перейдите в корень проекта
cd /path/to/synapse-judgement

# 2. Создайте структуру папок
mkdir -p frontend/src/components
mkdir -p frontend/src/lib
mkdir -p frontend/src/data

# 3. Переместите файлы из src/ в frontend/src/
mv src/* frontend/src/
rmdir src

# 4. Удалите дубликаты из корня
rm -f index.html vite.config.js tsconfig.json

# 5. Переместите package-lock.json
mv package-lock.json frontend/ 2>/dev/null || true

# 6. Установите зависимости
cd frontend
npm install
cd ..

# 7. Проверьте что всё работает
cd frontend
npm run lint
npm run build
cd ..

# 8. Закоммитьте изменения
git add .
git commit -m "fix: move frontend files to frontend/src/ directory"
git push
```

---

## 📋 Или используйте скрипт

```bash
chmod +x scripts/move-frontend.sh
./scripts/move-frontend.sh
```

---

## ✅ Проверка

После перемещения структура должна быть:

```
synapse-judgement/
├── frontend/
│   ├── src/              # ✅ Исходники frontend
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css
│   │   ├── components/   # 17 файлов
│   │   ├── lib/          # 4 файла
│   │   └── data/         # 1 файл
│   ├── package.json
│   ├── vite.config.js
│   ├── tsconfig.json
│   └── index.html
├── backend/
│   └── ...
└── package.json          # Корневой orchestrator
```

---

## 🎯 После исправления

1. CI/CD должен пройти успешно ✅
2. Frontend должен запускаться на http://localhost:5173
3. Backend должен работать на http://localhost:3001

---

**Подробная инструкция:** [FIX_FRONTEND_STRUCTURE.md](./FIX_FRONTEND_STRUCTURE.md)
