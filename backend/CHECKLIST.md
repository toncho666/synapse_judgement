# ✅ Чеклист проверки бэкенда

Используйте этот чеклист для проверки корректности работы бэкенда.

## 🎯 Предварительная проверка

- [ ] PostgreSQL запущен и работает
- [ ] База данных `synapse_judgement` создана
- [ ] Все зависимости установлены (`npm install`)
- [ ] Prisma Client сгенерирован (`npm run db:generate`)
- [ ] Схема применена к БД (`npm run db:push`)
- [ ] Тестовые данные загружены (`npm run db:seed`)

## 🚀 Запуск сервера

- [ ] Сервер запускается без ошибок
- [ ] В консоли видно: `🚀 Server running on port 3001`
- [ ] В консоли видно: `📝 Environment: development`
- [ ] В консоли видно: `🔗 Frontend URL: http://localhost:5173`

## 🧪 Проверка эндпоинтов

### 1. Health Check
```bash
curl http://localhost:3001/health
```
- [ ] Возвращает `{"status":"ok","timestamp":"..."}`
- [ ] Статус код: 200

### 2. Регистрация
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test","password":"pass123"}'
```
- [ ] Возвращает токен и данные пользователя
- [ ] Статус код: 201
- [ ] Пользователь создан в БД (проверьте через `npm run db:studio`)

### 3. Вход
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@synapse.ai","password":"demo123"}'
```
- [ ] Возвращает токен
- [ ] Статус код: 200
- [ ] Сохраните токен: `export TOKEN="..."`

### 4. Неавторизованный доступ
```bash
curl http://localhost:3001/api/users/me
```
- [ ] Возвращает ошибку 401
- [ ] Сообщение: "Access denied. No token provided."

### 5. Получить профиль
```bash
curl http://localhost:3001/api/users/me \
  -H "Authorization: Bearer $TOKEN"
```
- [ ] Возвращает данные пользователя
- [ ] Статус код: 200
- [ ] Поля: id, email, name, avatar, plan, credits, referralCode

### 6. Получить список агентов
```bash
curl http://localhost:3001/api/agents
```
- [ ] Возвращает массив из 5 агентов
- [ ] Статус код: 200
- [ ] Каждый агент имеет: id, name, short, desc, price, color, tags, speed

### 7. Получить профиль агента
```bash
curl http://localhost:3001/api/agents/tech/profile
```
- [ ] Возвращает детальную информацию
- [ ] Статус код: 200
- [ ] Поля: tagline, stats, reads, methodology, strengths, blindSpots, sample

### 8. Запустить анализ
```bash
curl -X POST http://localhost:3001/api/analysis/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"ticker":"AAPL","agents":["tech","fund","news"]}'
```
- [ ] Возвращает sessionId и статус RUNNING
- [ ] Статус код: 201
- [ ] Кредиты списались (проверьте профиль)
- [ ] Сессия создана в БД

### 9. Получить результат анализа (подождите 3 секунды)
```bash
curl http://localhost:3001/api/analysis/{sessionId} \
  -H "Authorization: Bearer $TOKEN"
```
- [ ] Возвращает полный результат
- [ ] Статус: COMPLETED
- [ ] Есть verdict, confidence, targetPrice, basePrice
- [ ] Есть agentVerdicts (массив выводов агентов)
- [ ] Есть rationale (массив обоснований)

### 10. Получить историю
```bash
curl http://localhost:3001/api/analysis/history \
  -H "Authorization: Bearer $TOKEN"
```
- [ ] Возвращает массив сессий
- [ ] Статус код: 200
- [ ] Включает демо-сессии из seed

### 11. Получить статистику
```bash
curl http://localhost:3001/api/users/me/stats \
  -H "Authorization: Bearer $TOKEN"
```
- [ ] Возвращает статистику
- [ ] Статус код: 200
- [ ] Поля: totalSessions, totalSpent, avgConfidence, agentUsage, verdictDistribution

## 📊 Проверка базы данных

```bash
# Подключиться к БД
psql -U postgres -d synapse_judgement

# Проверить таблицы
\dt
```
- [ ] Есть таблицы: users, sessions, agent_verdicts, transactions

```sql
-- Проверить пользователей
SELECT id, email, name, plan, credits FROM users;
```
- [ ] Есть демо-пользователь: demo@synapse.ai
- [ ] Credits: 847 (или меньше после анализов)

```sql
-- Проверить сессии
SELECT id, ticker, verdict, confidence, cost FROM sessions;
```
- [ ] Есть демо-сессии: AAPL, TSLA, NVDA
- [ ] Статус: COMPLETED

```sql
-- Проверить выводы агентов
SELECT sessionId, agentId, signal, confidence FROM agent_verdicts;
```
- [ ] Есть записи для каждой сессии
- [ ] Каждая сессия имеет 2-5 выводов агентов

```sql
-- Проверить транзакции
SELECT userId, type, amount, description FROM transactions;
```
- [ ] Есть WELCOME_BONUS для демо-пользователя
- [ ] Есть ANALYSIS транзакции после запусков

```sql
-- Выйти
\q
```

## 📝 Проверка логов

```bash
# Просмотр логов
tail -f backend/logs/combined.log
```
- [ ] Логируются все запросы
- [ ] Формат: `YYYY-MM-DD HH:mm:ss [level] : message`
- [ ] Есть логи auth, analysis, agents

```bash
# Просмотр ошибок
tail -f backend/logs/error.log
```
- [ ] Файл существует (может быть пустым)
- [ ] Ошибки записываются сюда

## 🔍 Проверка Prisma Studio

```bash
npm run db:studio
```
- [ ] Открывается на http://localhost:5555
- [ ] Видны все таблицы
- [ ] Можно просматривать и редактировать данные
- [ ] Видны связи между таблицами

## ⚠️ Проверка обработки ошибок

### Невалидный email при регистрации
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid","name":"Test","password":"pass123"}'
```
- [ ] Статус код: 400
- [ ] Сообщение об ошибке валидации

### Недостаточно кредитов
```bash
# Создайте пользователя с 0 кредитов и попробуйте запустить анализ
```
- [ ] Статус код: 400
- [ ] Сообщение: "Insufficient credits"

### Несуществующий агент
```bash
curl http://localhost:3001/api/agents/invalid
```
- [ ] Статус код: 404
- [ ] Сообщение: "Agent not found"

### Несуществующая сессия
```bash
curl http://localhost:3001/api/analysis/invalid-id \
  -H "Authorization: Bearer $TOKEN"
```
- [ ] Статус код: 404
- [ ] Сообщение: "Session not found"

## 🎯 Интеграция с фронтендом

- [ ] Фронтенд запущен на http://localhost:5173
- [ ] Можно зарегистрироваться через UI
- [ ] Можно войти через UI
- [ ] Видны агенты в магазине
- [ ] Можно запустить анализ через UI
- [ ] Результаты отображаются в дашборде
- [ ] История видна в личном кабинете

## ✅ Финальная проверка

- [ ] Все эндпоинты работают
- [ ] Аутентификация работает
- [ ] База данных заполнена
- [ ] Логи пишутся корректно
- [ ] Ошибки обрабатываются
- [ ] Фронтенд интегрирован
- [ ] Нет ошибок в консоли
- [ ] Нет ошибок в логах

## 📊 Итоговая статистика

После всех проверок должно быть:
- Пользователей: 2+ (demo + test)
- Сессий: 3+ (из seed + новые)
- Выводов агентов: 10+ (3-5 на сессию)
- Транзакций: 4+ (welcome + analysis)

## 🐛 Если что-то не работает

1. **Проверьте логи**: `tail -f backend/logs/error.log`
2. **Проверьте БД**: `npm run db:studio`
3. **Перезапустите сервер**: Ctrl+C и `npm run dev`
4. **Пересоздайте Prisma Client**: `npm run db:generate`
5. **Сбросьте БД**: `npx prisma migrate reset`

## 🎉 Успех!

Если все пункты отмечены ✅ - бэкенд работает корректно!

Следующие шаги:
1. Интеграция с реальными AI моделями
2. Добавление источников данных
3. Интеграция платежей (Stripe)
4. Деплой на production

---

**Дата проверки**: ___________
**Проверил**: ___________
**Результат**: ✅ PASS / ❌ FAIL
