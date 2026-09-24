# 🚀 Deployment Guide

Руководство по деплою Synapse Judgement в production.

## 📋 Варианты деплоя

### 1. Vercel + Railway (рекомендуется)

**Frontend на Vercel:**
```bash
cd frontend
npm run build
vercel deploy
```

**Backend на Railway:**
```bash
# Подключите GitHub репозиторий
# Railway автоматически определит Node.js проект
# Добавьте переменные окружения в Railway dashboard
```

**Database на Railway:**
```bash
# Добавьте PostgreSQL в Railway
# Скопируйте DATABASE_URL
# Добавьте в backend переменные окружения
```

### 2. AWS

**Frontend (S3 + CloudFront):**
```bash
cd frontend
npm run build
aws s3 sync dist/ s3://your-bucket-name
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

**Backend (ECS Fargate):**
```bash
# Создайте Docker образ
docker build -t synapse-backend backend/

# Загрузите в ECR
aws ecr create-repository --repository-name synapse-backend
docker tag synapse-backend:latest YOUR_ECR_URL/synapse-backend:latest
docker push YOUR_ECR_URL/synapse-backend:latest

# Создайте ECS сервис
aws ecs create-service --cluster production --service-name backend ...
```

**Database (RDS):**
```bash
aws rds create-db-instance \
  --db-instance-identifier synapse-db \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --master-username admin \
  --master-user-password YOUR_PASSWORD
```

### 3. DigitalOcean

**App Platform (проще всего):**
```bash
# Подключите GitHub репозиторий
# DigitalOcean автоматически определит структуру
# Добавьте PostgreSQL в компоненты
```

**VPS (Droplet):**
```bash
# Подключитесь к серверу
ssh root@your-server-ip

# Установите Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Клонируйте репозиторий
git clone <your-repo-url>
cd synapse-judgement

# Запустите через Docker Compose
docker-compose up -d
```

### 4. Render

```bash
# Подключите GitHub репозиторий
# Render автоматически определит структуру
# Добавьте PostgreSQL в blueprint
```

---

## 🔧 Настройка production

### Backend (.env)

```env
NODE_ENV=production
PORT=3001

# Database (production)
DATABASE_URL="postgresql://user:password@host:5432/synapse_judgement"

# JWT (используйте сильный секрет!)
JWT_SECRET="very-long-random-string-at-least-32-chars"
JWT_EXPIRES_IN="7d"

# CORS
FRONTEND_URL="https://your-domain.com"

# Logging
LOG_LEVEL="info"
```

### Frontend

Создайте `.env.production`:
```env
VITE_API_URL=https://api.your-domain.com
```

### Database

```bash
# Создайте production базу
createdb synapse_judgement_prod

# Примените схему
cd backend
DATABASE_URL="postgresql://..." npm run db:push

# НЕ запускайте seed в production!
```

---

## 🔐 Безопасность

### Обязательно:
- ✅ Измените JWT_SECRET на длинную случайную строку
- ✅ Используйте HTTPS
- ✅ Настройте CORS только для вашего домена
- ✅ Используйте сильные пароли для БД
- ✅ Включите rate limiting
- ✅ Добавьте helmet для HTTP headers
- ✅ Настройте backup для БД

### Рекомендуется:
- ⚠️ Используйте secrets manager (AWS Secrets Manager, etc.)
- ⚠️ Включите 2FA для админов
- ⚠️ Настройте мониторинг ошибок (Sentry)
- ⚠️ Добавьте WAF (Web Application Firewall)

---

## 📊 Мониторинг

### Логи

```bash
# Backend логи
tail -f backend/logs/combined.log
tail -f backend/logs/error.log

# Docker логи
docker-compose logs -f backend
```

### Метрики

Добавьте:
- **Sentry** - отслеживание ошибок
- **PostHog** - аналитика
- **UptimeRobot** - мониторинг доступности

---

## 🔄 CI/CD

### GitHub Actions

Создайте `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm run install:all
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy
        run: |
          # Ваш скрипт деплоя
```

---

## 💰 Стоимость

### Бюджетный вариант (~$20/месяц)
- Frontend: Vercel (бесплатно)
- Backend: Railway ($5/месяц)
- Database: Railway ($10/месяц)
- Domain: $10/год

### Средний вариант (~$50/месяц)
- Frontend: Vercel Pro ($20/месяц)
- Backend: Render ($7/месяц)
- Database: Supabase Pro ($25/месяц)
- Domain: $10/год

### Production вариант (~$200+/месяц)
- AWS/GCP/Azure
- Масштабируемая архитектура
- CDN, backup, monitoring

---

## 📚 Полезные ссылки

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Supabase Documentation](https://supabase.com/docs)
- [AWS Documentation](https://docs.aws.amazon.com)
- [DigitalOcean Documentation](https://docs.digitalocean.com)

---

## 🆘 Поддержка

Если возникли проблемы при деплое:
1. Проверьте логи
2. Проверьте переменные окружения
3. Проверьте CORS настройки
4. Создайте issue на GitHub

---

**Удачи в деплое! 🚀**
