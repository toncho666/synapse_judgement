# 🚀 Быстрая настройка API котировок

## ⚡ За 3 шага

### 1️⃣ Получите бесплатный API ключ

Перейдите на https://www.alphavantage.co/support/#api-key и получите ключ.

### 2️⃣ Добавьте ключ в .env

```bash
cd backend
echo 'ALPHA_VANTAGE_API_KEY="ваш_ключ_здесь"' >> .env
```

**Или вручную**:
```bash
nano backend/.env
```

Добавьте в конец файла:
```env
ALPHA_VANTAGE_API_KEY="ABC123XYZ456"
```

### 3️⃣ Перезапустите backend

```bash
cd backend
npm run dev
```

Вы должны увидеть:
```
🚀 Starting background stock updates (every 60 minutes)
📊 Fetching stock data...
✅ Fetched 11 stock quotes
```

---

## ✅ Проверка

```bash
# Проверьте что API работает
curl http://localhost:3001/api/stocks

# Должны увидеть реальные данные о ценах
```

Откройте http://localhost:5173 - лента котировок должна показывать реальные данные!

---

## 📊 Что отслеживается

- **Акции**: AAPL, NVDA, MSFT, TSLA, AMZN, GOOGL, META
- **Крипто**: BTC, ETH
- **Индексы**: S&P 500, NASDAQ (мок-данные)

**Обновление**: Каждые 60 минут автоматически

---

## 🆘 Если не работает

1. **Проверьте API ключ**:
   ```bash
   cat backend/.env | grep ALPHA_VANTAGE
   ```

2. **Проверьте лимиты**:
   - Free tier: 5 запросов/мин, 500/день
   - Мы делаем ~24 запроса/день ✅

3. **Перезапустите backend**:
   ```bash
   cd backend
   npm run dev
   ```

4. **Принудительное обновление**:
   ```bash
   curl -X POST http://localhost:3001/api/stocks/refresh
   ```

---

**Подробная документация**: [STOCK_API_SETUP.md](./STOCK_API_SETUP.md)
