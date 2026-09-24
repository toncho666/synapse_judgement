# 📊 Project Summary

Краткое описание проекта Synapse Judgement.

## 🎯 Что это?

**Synapse Judgement** - AI-платформа инвестиционного анализа с 5 специализированными агентами и Судьёй, который синтезирует их выводы в единый вердикт.

## 💡 Идея

Вместо одного "универсального" AI-аналитика, мы используем 5 специализированных агентов, каждый из которых анализирует компанию со своей точки зрения:

1. **Technical** - технический анализ (графики, индикаторы)
2. **Fundamental** - фундаментальный анализ (финансы, оценка)
3. **Portfolio** - портфельный анализ (риски, корреляции)
4. **News** - новостной анализ (sentiment, события)
5. **Earning Calls** - анализ звонков (тон, гайдансы)

**The Judge** - 6-й агент, который взвешивает выводы всех аналитиков и выносит финальный вердикт (BUY/HOLD/SELL) с обоснованием.

## 🎨 Особенности

### Для пользователей
- ✅ Прозрачная система оплаты (плати только за нужных агентов)
- ✅ Мгновенное обновление цен
- ✅ Детальные отчёты с визуализациями
- ✅ Личный кабинет с историей
- ✅ Система достижений
- ✅ Лидерборд
- ✅ Реферальная программа

### Для разработчиков
- ✅ Чистая монорепо структура
- ✅ TypeScript везде
- ✅ Автоматизация через Makefile
- ✅ Docker поддержка
- ✅ CI/CD pipeline
- ✅ Полная документация

## 🛠 Технологический стек

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS 4
- React Router
- Custom hooks

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT authentication
- Winston logger

### Infrastructure
- Docker + Docker Compose
- GitHub Actions (CI/CD)
- Makefile для автоматизации

## 📊 Ключевые метрики

- **5** AI агентов
- **1** Судья
- **~90 секунд** на анализ
- **$4-8** за агента
- **$15** за Судью (бесплатно при 2+ агентах)
- **10,400+** источников данных

## 🎯 Целевая аудитория

- Розничные инвесторы
- Трейдеры
- Портфельные менеджеры
- Финансовые консультанты
- Инвестиционные клубы

## 💰 Бизнес-модель

### Freemium
- **Free**: 50 кредитов при регистрации
- **Pro**: $29/месяц (500 кредитов)
- **Enterprise**: $99/месяц (2000 кредитов)

### Вирусный рост
- Реферальная программа (25 кредитов за друга)
- Лидерборд (социальное доказательство)
- Достижения (геймификация)

## 📈 Roadmap

### Phase 1: MVP ✅
- [x] Frontend приложение
- [x] Backend API
- [x] База данных
- [x] Аутентификация
- [x] 5 агентов + Судья
- [x] Личный кабинет
- [x] Лидерборд

### Phase 2: AI Integration 🔄
- [ ] Реальные AI модели (OpenAI/Anthropic)
- [ ] Источники данных (Alpha Vantage, Yahoo Finance)
- [ ] Real-time обновления

### Phase 3: Growth 📋
- [ ] Платежи (Stripe)
- [ ] Мобильное приложение
- [ ] API для разработчиков
- [ ] White-label решения

### Phase 4: Scale 🚀
- [ ] Kubernetes
- [ ] Multi-region deployment
- [ ] Advanced analytics
- [ ] Custom agents marketplace

## 🏆 Конкурентные преимущества

1. **Прозрачность** - видно цену до запуска анализа
2. **Гибкость** - выбираешь только нужных агентов
3. **Качество** - 5 специализированных моделей лучше одной универсальной
4. **Социальность** - лидерборд, рефералы, достижения
5. **UX** - Apple-inspired дизайн, плавные анимации

## 📚 Документация

- [Главный README](./README.md)
- [Setup Guide](./SETUP_GUIDE.md)
- [Architecture](./ARCHITECTURE.md)
- [Project Structure](./PROJECT_STRUCTURE.md)
- [Quick Reference](./QUICK_REFERENCE.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Contributing Guide](./CONTRIBUTING.md)

## 🚀 Быстрый старт

```bash
# Клонировать
git clone <repo-url>
cd synapse-judgement

# Установить
make install

# Настроить БД
make db-setup

# Запустить
make dev
```

Открыть:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

**Демо-доступ:**
- Email: `demo@synapse.ai`
- Password: `demo123`

## 📞 Контакты

- GitHub Issues
- Email: team@synapse-judgement.com
- Twitter: @synapsejudgement

---

**Synapse Judgement - Инвестиционный совет. Без компромиссов.** 🎯
