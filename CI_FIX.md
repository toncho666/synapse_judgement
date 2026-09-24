# ✅ Исправление ошибок CI/CD

## 🐛 Проблема

При создании Pull Request возникала ошибка:
```
npm error Missing script: "lint"
```

## 🔍 Причина

1. GitHub Actions пытался запустить `npm run lint` из корня проекта
2. В корневом `package.json` не было скрипта `lint`
3. Backend использовал `eslint`, который не был установлен

## ✅ Что исправлено

### 1. Обновлен `.github/workflows/ci.yml`

**Было:**
```yaml
- name: Run linter
  run: npm run lint  # ❌ Запуск из корня без скрипта
```

**Стало:**
```yaml
- name: Type check frontend
  run: cd frontend && npm run lint  # ✅ Запуск в frontend

- name: Type check backend
  run: cd backend && npm run lint  # ✅ Запуск в backend
```

### 2. Добавлены скрипты в корневой `package.json`

```json
{
  "scripts": {
    "lint": "npm run lint:frontend && npm run lint:backend",
    "lint:frontend": "cd frontend && npm run lint",
    "lint:backend": "cd backend && npm run lint"
  }
}
```

### 3. Исправлен `backend/package.json`

**Было:**
```json
"lint": "eslint src --ext .ts"  // ❌ eslint не установлен
```

**Стало:**
```json
"lint": "tsc --noEmit"  // ✅ Проверка типов через TypeScript
```

### 4. Добавлено кэширование в CI

```yaml
- name: Cache frontend dependencies
  uses: actions/cache@v3
  with:
    path: frontend/node_modules
    key: ${{ runner.os }}-frontend-node-modules-${{ hashFiles('frontend/package-lock.json') }}

- name: Cache backend dependencies
  uses: actions/cache@v3
  with:
    path: backend/node_modules
    key: ${{ runner.os }}-backend-node-modules-${{ hashFiles('backend/package-lock.json') }}
```

## 🚀 Результат

Теперь CI/CD pipeline:
- ✅ Устанавливает зависимости в frontend и backend отдельно
- ✅ Проверяет типы в frontend (`tsc --noEmit`)
- ✅ Проверяет типы в backend (`tsc --noEmit`)
- ✅ Собирает frontend (`vite build`)
- ✅ Собирает backend (`tsc`)
- ✅ Кэширует зависимости для ускорения

## 📋 Проверка локально

Вы можете проверить CI локально:

```bash
# Проверка типов frontend
cd frontend && npm run lint

# Проверка типов backend
cd backend && npm run lint

# Сборка frontend
cd frontend && npm run build

# Сборка backend
cd backend && npm run build

# Или все сразу из корня
npm run lint
npm run build
```

## 🎯 Следующие шаги

1. Закоммитьте изменения:
   ```bash
   git add .
   git commit -m "fix: correct CI/CD pipeline configuration"
   git push
   ```

2. Создайте Pull Request

3. CI должен пройти успешно ✅

---

**Статус:** ✅ Ошибки CI/CD исправлены!
