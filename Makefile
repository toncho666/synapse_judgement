.PHONY: install dev backend frontend db-setup db-reset stop clean help

# Цвета для вывода
GREEN := \033[0;32m
BLUE := \033[0;34m
NC := \033[0m # No Color

help: ## Показать помощь
	@echo "$(BLUE)Synapse Judgement - Доступные команды:$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-15s$(NC) %s\n", $$1, $$2}'

install: ## Установить все зависимости
	@echo "$(BLUE)Установка зависимостей...$(NC)"
	npm run install:all
	@echo "$(GREEN)✓ Установка завершена$(NC)"

dev: ## Запустить frontend и backend
	@echo "$(BLUE)Запуск обоих проектов...$(NC)"
	@echo "$(GREEN)Frontend: http://localhost:5173$(NC)"
	@echo "$(GREEN)Backend:  http://localhost:3001$(NC)"
	npm run dev

backend: ## Запустить только backend
	@echo "$(BLUE)Запуск backend...$(NC)"
	@echo "$(GREEN)API: http://localhost:3001$(NC)"
	npm run dev:backend

frontend: ## Запустить только frontend
	@echo "$(BLUE)Запуск frontend...$(NC)"
	@echo "$(GREEN)App: http://localhost:5173$(NC)"
	npm run dev:frontend

db-setup: ## Настроить базу данных
	@echo "$(BLUE)Настройка базы данных...$(NC)"
	cd backend && npm run db:generate
	cd backend && npm run db:push
	cd backend && npm run db:seed
	@echo "$(GREEN)✓ База данных настроена$(NC)"

db-reset: ## Сбросить базу данных
	@echo "$(BLUE)Сброс базы данных...$(NC)"
	cd backend && npx prisma migrate reset --force
	@echo "$(GREEN)✓ База данных сброшена$(NC)"

db-studio: ## Открыть Prisma Studio
	@echo "$(BLUE)Открытие Prisma Studio...$(NC)"
	@echo "$(GREEN)http://localhost:5555$(NC)"
	cd backend && npm run db:studio

stop: ## Остановить все процессы
	@echo "$(BLUE)Остановка всех процессов...$(NC)"
	@pkill -f "node.*backend" || true
	@pkill -f "vite" || true
	@echo "$(GREEN)✓ Все процессы остановлены$(NC)"

clean: ## Очистить node_modules и dist
	@echo "$(BLUE)Очистка проекта...$(NC)"
	rm -rf node_modules
	rm -rf frontend/node_modules
	rm -rf backend/node_modules
	rm -rf frontend/dist
	rm -rf backend/dist
	@echo "$(GREEN)✓ Очистка завершена$(NC)"

test: ## Запустить все тесты
	@echo "$(BLUE)Запуск тестов...$(NC)"
	npm run test

lint: ## Проверить код
	@echo "$(BLUE)Проверка кода...$(NC)"
	npm run lint

build: ## Собрать production версию
	@echo "$(BLUE)Сборка production версии...$(NC)"
	npm run build
	@echo "$(GREEN)✓ Сборка завершена$(NC)"

status: ## Показать статус сервисов
	@echo "$(BLUE)Статус сервисов:$(NC)"
	@echo ""
	@echo "PostgreSQL:"
	@pg_isready || echo "  ❌ Не запущен"
	@echo ""
	@echo "Backend (порт 3001):"
	@curl -s http://localhost:3001/health > /dev/null && echo "  ✓ Работает" || echo "  ❌ Не запущен"
	@echo ""
	@echo "Frontend (порт 5173):"
	@curl -s http://localhost:5173 > /dev/null && echo "  ✓ Работает" || echo "  ❌ Не запущен"

logs: ## Показать логи backend
	@echo "$(BLUE)Логи backend:$(NC)"
	@tail -f backend/logs/combined.log

logs-error: ## Показать ошибки backend
	@echo "$(BLUE)Ошибки backend:$(NC)"
	@tail -f backend/logs/error.log

setup: ## Полная настройка проекта (первый запуск)
	@echo "$(BLUE)Полная настройка проекта...$(NC)"
	@echo ""
	@make install
	@echo ""
	@make db-setup
	@echo ""
	@echo "$(GREEN)✓ Настройка завершена!$(NC)"
	@echo ""
	@echo "$(BLUE)Для запуска выполните:$(NC)"
	@echo "  make dev"
	@echo ""
	@echo "$(BLUE)Или по отдельности:$(NC)"
	@echo "  make backend   # Backend на :3001"
	@echo "  make frontend  # Frontend на :5173"
