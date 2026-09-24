# 🎨 Frontend - Synapse Judgement

React + TypeScript + Tailwind CSS приложение для AI-платформы инвестиционного анализа.

## 📦 Технологии

- **React 18** - UI библиотека
- **TypeScript** - Типизация
- **Vite** - Build tool
- **Tailwind CSS 4** - Стилизация
- **React Router** - Маршрутизация

## 🚀 Быстрый старт

```bash
# Из корня проекта
npm run install:frontend
npm run dev:frontend

# Или напрямую
cd frontend
npm install
npm run dev
```

Откройте http://localhost:5173

## 📁 Структура

```
frontend/
├── src/
│   ├── components/     # React компоненты
│   ├── lib/           # Утилиты, хуки, роутер
│   ├── data/          # Мок-данные
│   ├── App.tsx        # Главный компонент
│   ├── main.tsx       # Точка входа
│   └── index.css      # Глобальные стили
├── public/            # Статические файлы
├── index.html         # HTML шаблон
├── vite.config.js     # Vite конфигурация
└── package.json
```

## 🎯 Основные страницы

- **Лендинг** - Главная страница с hero-секцией
- **Агенты** - Магазин агентов с детальными страницами
- **Авторизация** - Вход/регистрация
- **Дашборд** - Личный кабинет пользователя
- **Лидерборд** - Рейтинг пользователей

## 🎨 Дизайн

Apple-inspired UI:
- Чистый минимализм
- Градиенты синий→фиолетовый
- Плавные анимации
- Адаптивный дизайн

## 📝 Скрипты

```bash
npm run dev          # Запуск dev сервера
npm run build        # Production сборка
npm run preview      # Preview production сборки
npm run lint         # Проверка кода
```

## 🔗 Интеграция с Backend

API запросы проксируются через Vite:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

Все `/api/*` запросы автоматически перенаправляются на backend.

## 📚 Документация

- [Главный README](../README.md)
- [Backend Documentation](../backend/README.md)
- [Setup Guide](../SETUP_GUIDE.md)

---

**Подробнее в [главном README](../README.md)**
