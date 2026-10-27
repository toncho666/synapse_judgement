#!/bin/bash

# Тестовый скрипт для проверки News API

echo "🧪 Тестирование News API"
echo "========================"
echo ""

# Загружаем переменные окружения
source backend/.env

echo "📋 Проверка API ключа Alpha Vantage..."
echo "API Key: ${ALPHA_VANTAGE_API_KEY:0:4}...${ALPHA_VANTAGE_API_KEY: -4}"
echo ""

# Тест 1: Проверка API ключа
echo "🔍 Тест 1: Проверка API ключа (запрос котировок)..."
RESPONSE=$(curl -s "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IBM&apikey=${ALPHA_VANTAGE_API_KEY}")
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Тест 2: Запрос новостей для NVDA
echo "📰 Тест 2: Запрос новостей для NVDA..."
RESPONSE=$(curl -s "https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=NVDA&limit=10&apikey=${ALPHA_VANTAGE_API_KEY}")
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Тест 3: Запрос новостей для AAPL (более популярный тикер)
echo "📰 Тест 3: Запрос новостей для AAPL..."
RESPONSE=$(curl -s "https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=AAPL&limit=10&apikey=${ALPHA_VANTAGE_API_KEY}")
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Тест 4: Проверка лимитов API
echo "📊 Тест 4: Проверка статуса API..."
RESPONSE=$(curl -s "https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=MSFT&limit=1&apikey=${ALPHA_VANTAGE_API_KEY}")
if echo "$RESPONSE" | grep -q "Note"; then
    echo "⚠️  Достигнут лимит API!"
    echo "$RESPONSE" | jq '.Note'
else
    echo "✅ API работает нормально"
fi
echo ""

echo "📝 Рекомендации:"
echo "1. Если видите 'No news found' - это нормально для некоторых тикеров"
echo "2. Alpha Vantage имеет лимит 25 запросов/день"
echo "3. Попробуйте более популярные тикеры: AAPL, MSFT, TSLA"
echo "4. Проверьте что API ключ правильный"
