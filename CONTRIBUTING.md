# 🤝 Contributing to Synapse Judgement

Спасибо за интерес к проекту! Вот как вы можете помочь.

## 🎯 Как внести вклад

### 1. Fork репозитория

Нажмите "Fork" в правом верхнем углу GitHub.

### 2. Клонируйте fork

```bash
git clone https://github.com/YOUR_USERNAME/synapse-judgement.git
cd synapse-judgement
```

### 3. Создайте ветку

```bash
git checkout -b feature/amazing-feature
# или
git checkout -b fix/bug-fix
```

### 4. Внесите изменения

- Следуйте стилю кода
- Добавьте тесты если нужно
- Обновите документацию

### 5. Проверьте что всё работает

```bash
# Установите зависимости
make install

# Запустите тесты
make test

# Проверьте lint
make lint

# Запустите проект
make dev
```

### 6. Commit изменения

```bash
git add .
git commit -m "Add amazing feature"
```

Используйте conventional commits:
- `feat:` новая функция
- `fix:` исправление бага
- `docs:` изменения в документации
- `style:` форматирование
- `refactor:` рефакторинг
- `test:` добавление тестов
- `chore:` обновление зависимостей

### 7. Push в ветку

```bash
git push origin feature/amazing-feature
```

### 8. Откройте Pull Request

Перейдите в ваш fork на GitHub и нажмите "Pull Request".

---

## 📝 Стиль кода

### TypeScript

```typescript
// ✅ Хорошо
interface User {
  id: string;
  email: string;
  name: string;
}

function getUserById(id: string): User {
  // ...
}

// ❌ Плохо
function getUser(id) {
  // ...
}
```

### React

```typescript
// ✅ Хорошо
export default function UserCard({ user }: { user: User }) {
  return (
    <div className="rounded-lg border p-4">
      <h3>{user.name}</h3>
    </div>
  );
}

// ❌ Плохо
export const UserCard = (props) => {
  return <div>...</div>
}
```

### CSS/Tailwind

```typescript
// ✅ Хорошо
<div className="flex items-center gap-2 rounded-lg bg-white p-4 shadow-sm">

// ❌ Плохо
<div style={{ display: 'flex', alignItems: 'center' }}>
```

---

## 🧪 Тестирование

### Backend

```bash
cd backend
npm test
```

### Frontend

```bash
cd frontend
npm test
```

### API Tests

```bash
cd backend
./scripts/test-api.sh
```

---

## 📚 Документация

- Обновляйте README если добавляете новые функции
- Добавляйте комментарии в сложный код
- Обновляйте API документацию

---

## 🐛 Нашли баг?

1. Проверьте существующие issues
2. Создайте новый issue с описанием:
   - Что делали
   - Что ожидали
   - Что произошло
   - Логи ошибок
   - Версии (Node, PostgreSQL, OS)

---

## 💡 Есть идея?

1. Откройте issue с label `enhancement`
2. Опишите идею
3. Обсудите с maintainers
4. Создайте PR

---

## 🎨 Дизайн

Следуем Apple-inspired стилю:
- Чистый минимализм
- Много воздуха
- Плавные анимации
- Градиенты синий→фиолетовый

---

## 📞 Вопросы?

- Откройте issue
- Напишите в discussions
- Свяжитесь с maintainers

---

**Спасибо за вклад! 🚀**
