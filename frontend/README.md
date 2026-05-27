# QuestParty Frontend

React + TypeScript + Vite приложение для QuestParty.

## Требования

- Node.js 20+
- Backend на `http://localhost:8080/api`

## Установка

```bash
cd frontend
npm install
npm run dev
```

Откройте: **http://localhost:5173**

## Переменные окружения

Скопируйте `.env.example` → `.env`:

```
VITE_API_URL=http://localhost:8080/api
VITE_WS_URL=http://localhost:8080/api/ws
```

## Тестовый вход

- Email: `admin@questparty.local`
- Password: `admin123`

## Архитектура

См. [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)

## Реализованный функционал

- Авторизация и регистрация через JWT.
- Dashboard с API-аналитикой, уведомлениями и лидербордом.
- Проекты и квесты-спринты.
- Party-команда квеста.
- Kanban-доска с drag-and-drop.
- Создание задач с наградами XP/монетами.
- Party chat через REST + WebSocket/STOMP.
- Игровой магазин и покупка товаров за внутреннюю валюту.
- Достижения и профиль пользователя.
