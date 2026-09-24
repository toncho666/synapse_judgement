# 🚨 КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ - Перемещение файлов frontend

## ❌ Проблема

CI/CD падает с ошибкой:
```
error TS18003: No inputs were found in config file '/home/runner/work/synapse_judgement/synapse_judgement/frontend/tsconfig.json'. 
Specified 'include' paths were '["src"]' and 'exclude' paths were '[]'.
```

**Причина:** Файлы frontend всё ещё находятся в корне проекта (`src/`), а не в `frontend/src/`.

---

## ✅ Решение - Выполните эти команды локально

### Шаг 1: Переместите файлы frontend

Выполните эти команды в терминале из корня проекта:

```bash
# Создаём структуру папок
mkdir -p frontend/src/components
mkdir -p frontend/src/lib
mkdir -p frontend/src/data

# Перемещаем src/ в frontend/src/
mv src/* frontend/src/
rmdir src

# Удаляем дубликаты из корня (они уже есть в frontend/)
rm -f index.html vite.config.js tsconfig.json

# Перемещаем package-lock.json
mv package-lock.json frontend/ 2>/dev/null || true
```

### Шаг 2: Проверьте структуру

```bash
# Должно показать правильную структуру
tree -L 2 -d

# Ожидаемый результат:
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

### Шаг 3: Проверьте что файлы на месте

```bash
# Проверьте основные файлы
ls frontend/src/
# Должно показать: App.tsx  components  data  index.css  lib  main.tsx

ls frontend/src/components/
# Должно показать все компоненты (15+ файлов)

ls frontend/src/lib/
# Должно показать: auth.ts  engine.ts  hooks.ts  router.ts
```

### Шаг 4: Установите зависимости

```bash
cd frontend
npm install
cd ..
```

### Шаг 5: Проверьте что frontend запускается

```bash
cd frontend
npm run dev
```

Откройте http://localhost:5173 - должна загрузиться страница.

### Шаг 6: Закоммитьте изменения

```bash
git add .
git commit -m "fix: move frontend files to frontend/src/ directory"
git push
```

---

## 📋 Альтернатива - Используйте скрипт

Если у вас есть скрипт `scripts/move-frontend.sh`, выполните:

```bash
chmod +x scripts/move-frontend.sh
./scripts/move-frontend.sh
```

---

## ✅ Проверка после перемещения

После перемещения выполните:

```bash
# Из корня проекта
cd frontend && npm run lint
```

Должно пройти без ошибок.

Затем:

```bash
cd frontend && npm run build
```

Должно собраться без ошибок.

---

## 🎯 Что должно быть в frontend/src/

```
frontend/src/
├── App.tsx                    # Главный компонент
├── main.tsx                   # Точка входа
├── index.css                  # Глобальные стили
├── components/                # React компоненты
│   ├── AgentPage.tsx
│   ├── AgentStore.tsx
│   ├── AuthPage.tsx
│   ├── Dashboard.tsx
│   ├── Faq.tsx
│   ├── Footer.tsx
│   ├── Hero.tsx
│   ├── Icon.tsx
│   ├── Leaderboard.tsx
│   ├── Nav.tsx
│   ├── Pipeline.tsx
│   ├── RequestSection.tsx
│   ├── ResultsDashboard.tsx
│   ├── Reveal.tsx
│   ├── StickyBar.tsx
│   ├── Transparency.tsx
│   └── viz.tsx
├── lib/                       # Утилиты
│   ├── auth.ts
│   ├── engine.ts
│   ├── hooks.ts
│   └── router.ts
└── data/                      # Мок-данные
    └── agentMock.ts
```

---

## 🐛 Если возникли проблемы

### Проблема: "Cannot find module"

**Решение:**
```bash
cd frontend
rm -rf node_modules
npm install
```

### Проблема: "Module not found: Can't resolve './components/...'"

**Решение:** Убедитесь что все файлы перемещены:
```bash
ls frontend/src/components/
# Должно показать 17 файлов
```

### Проблема: TypeScript ошибки

**Решение:** Проверьте tsconfig.json:
```bash
cat frontend/tsconfig.json
# Должно быть: "include": ["src"]
```

---

## 📊 Ожидаемый результат

После перемещения:

1. ✅ CI/CD проходит успешно
2. ✅ `npm run lint` в frontend работает
3. ✅ `npm run build` в frontend работает
4. ✅ Frontend запускается на http://localhost:5173
5. ✅ Все компоненты загружаются

---

## 🚀 Следующие шаги

1. Выполните команды из **Шага 1**
2. Проверьте структуру (**Шаг 2**)
3. Установите зависимости (**Шаг 4**)
4. Закоммитьте изменения (**Шаг 6**)
5. Создайте Pull Request

CI должен пройти успешно! ✅

---

**Важно:** Эти команды нужно выполнить **локально** на вашем компьютере, а не в этом чате.
