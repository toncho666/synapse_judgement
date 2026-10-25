# 🔧 Исправление конфликтов версий - Полная переустановка

## ✅ Что исправлено

### Frontend (React 18 + стабильные версии):
- ✅ `react`: `18.3.1` (вместо 19.x)
- ✅ `react-dom`: `18.3.1`
- ✅ `react-router-dom`: `6.28.0` (совместим с React 18)
- ✅ `lucide-react`: `0.294.0` (совместим с React 18)
- ✅ `framer-motion`: `10.16.16` (стабильная)
- ✅ `typescript`: `5.6.3` (стабильная)
- ✅ `vite`: `6.0.0` (стабильная)
- ✅ `tailwindcss`: `3.4.0` (стабильная)

### Backend (Prisma 5 + стабильные версии):
- ✅ `@prisma/client`: `5.22.0` (вместо 7.x - совместимо со схемой)
- ✅ `prisma`: `5.22.0`
- ✅ `express`: `4.21.1` (стабильная, вместо 5.x)
- ✅ `zod`: `3.23.8` (стабильная, вместо 4.x)
- ✅ `dotenv`: `16.4.5` (стабильная)
- ✅ `typescript`: `5.6.3` (стабильная)
- ✅ `@types/node`: `22.9.0` (стабильная)

---

## 🚀 Пошаговая инструкция

### Шаг 1: Скопируйте новые package.json файлы

**Важно:** Файлы уже обновлены в моей среде. Вам нужно скопировать их в локальный проект.

#### Вариант А: Вручную скопируйте содержимое

**Frontend:**
```bash
cd /Users/anton/synapse_judgement/synapse_judgement/frontend
nano package.json
```

Удалите всё содержимое и вставьте новый `package.json` из моей среды (выше).

**Backend:**
```bash
cd ../backend
nano package.json
```

Удалите всё содержимое и вставьте новый `package.json` из моей среды (выше).

#### Вариант Б: Скажите мне "Покажи содержимое файла frontend/package.json"

Я покажу код, вы скопируете его.

---

### Шаг 2: Полная очистка

```bash
cd /Users/anton/synapse_judgement/synapse_judgement

# Удалите все node_modules и lock-файлы
rm -rf node_modules package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json
rm -rf backend/node_modules backend/package-lock.json
```

---

### Шаг 3: Установка зависимостей

```bash
# Установите корневые зависимости
npm install

# Установите frontend
cd frontend
npm install
cd ..

# Установите backend
cd backend
npm install
cd ..
```

---

### Шаг 4: Проверка версий

```bash
# Проверьте Prisma
cd backend
npx prisma --version
```

**Должно показать:**
```
prisma                  : 5.22.0
@prisma/client          : 5.22.0
```

Если показывает 7.x или 8.x - значит package.json не обновился. Вернитесь к Шагу 1.

```bash
# Проверьте React
cd ../frontend
npm list react
```

**Должно показать:**
```
react@18.3.1
```

---

### Шаг 5: Генерация Prisma Client

```bash
cd backend
npm run db:generate
```

**Ожидаемый вывод:**
```
✔ Generated Prisma Client to ./node_modules/@prisma/client
```

---

### Шаг 6: Применение схемы к БД

```bash
npm run db:push
```

**Ожидаемый вывод:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "synapse_judgement", schema "public" at "localhost:5432"

🚀 Your database is now in sync with your Prisma schema. Done in 245ms
```

---

### Шаг 7: Загрузка тестовых данных

```bash
npm run db:seed
```

**Ожидаемый вывод:**
```
🌱 Starting database seed...
✅ Created demo user: demo@synapse.ai
✅ Created session: AAPL (BUY)
✅ Created session: TSLA (HOLD)
✅ Created session: NVDA (BUY)
✅ Created welcome transaction
🎉 Database seed completed successfully!
```

---

### Шаг 8: Запуск проекта

```bash
cd ..
npm run dev
```

**Ожидаемый вывод:**
```
[0] VITE v6.0.0  ready in xxx ms
[0] ➜  Local:   http://localhost:5173/
[1] 🚀 Server running on port 3001
[1] 📝 Environment: development
[1] 📊 API available at http://localhost:3001/api
```

---

## 🧪 Проверка работы

### Backend

```bash
curl http://localhost:3001/health
```

**Ожидаемый ответ:**
```json
{"status":"ok","timestamp":"2026-10-25T..."}
```

### Frontend

Откройте браузер: **http://localhost:5173**

**Демо-доступ:**
- Email: `demo@synapse.ai`
- Password: `demo123`

### API котировок

```bash
curl http://localhost:3001/api/stocks
```

### API технического анализа

```bash
curl http://localhost:3001/api/technical-analysis/AAPL
```

---

## 🐛 Если снова будут ошибки

### Ошибка: "Cannot find module '.prisma/client/default'"

```bash
cd backend
npm run db:generate
```

### Ошибка: "Database connection failed"

```bash
# Проверьте что PostgreSQL запущен
brew services list | grep postgresql

# Если не запущен
brew services start postgresql@15

# Проверьте подключение
psql -d synapse_judgement -c "SELECT 1;"
```

### Ошибка: "P1010: User was denied access"

Проверьте `backend/.env`:

```env
DATABASE_URL="postgresql://anton@localhost:5432/synapse_judgement?schema=public"
```

### Ошибка: "Port 3001 already in use"

```bash
# Найти процесс
lsof -i :3001

# Убить процесс
kill -9 <PID>
```

---

## 📊 Итоговые версии

### Frontend
```
react: 18.3.1
react-dom: 18.3.1
react-router-dom: 6.28.0
lucide-react: 0.294.0
typescript: 5.6.3
vite: 6.0.0
tailwindcss: 3.4.0
```

### Backend
```
@prisma/client: 5.22.0
prisma: 5.22.0
express: 4.21.1
zod: 3.23.8
dotenv: 16.4.5
typescript: 5.6.3
@types/node: 22.9.0
```

---

## ✅ Чеклист

- [ ] Скопированы новые `package.json` файлы
- [ ] Удалены все `node_modules` и `package-lock.json`
- [ ] Установлены зависимости (`npm install` во всех папках)
- [ ] Проверена версия Prisma (`npx prisma --version` → 5.22.0)
- [ ] Проверена версия React (`npm list react` → 18.3.1)
- [ ] Сгенерирован Prisma Client (`npm run db:generate`)
- [ ] Применена схема к БД (`npm run db:push`)
- [ ] Загружены тестовые данные (`npm run db:seed`)
- [ ] Backend запущен (http://localhost:3001/health работает)
- [ ] Frontend запущен (http://localhost:5173 открывается)
- [ ] Можно войти с demo@synapse.ai / demo123

---

## 🎯 Следующие шаги

После успешного запуска:

1. **Изучите код**
   - `frontend/src/App.tsx` - главный компонент
   - `backend/src/services/technical-analysis.service.ts` - логика анализа
   - `backend/prisma/schema.prisma` - схема БД

2. **Протестируйте API**
   - Импортируйте `backend/postman_collection.json` в Postman
   - Протестируйте все эндпоинты

3. **Добавьте AI модели**
   - Замените мок-данные в `analysis.service.ts`
   - Интегрируйте OpenAI/Anthropic API

4. **Деплой**
   - Frontend: Vercel, Netlify
   - Backend: Railway, Render, AWS
   - Database: Supabase, Neon, Railway

---

**Выполните команды из Шагов 1-8 и напишите результат!** 🚀

Если возникнут ошибки - пришлите полный текст ошибки и вывод `npx prisma --version`.
