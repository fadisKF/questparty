# QuestParty Frontend Architecture

## Stack

| Layer | Technology |
|-------|------------|
| Build | Vite 6 + TypeScript 5 |
| UI | React 19, Tailwind CSS 4, shadcn/ui patterns |
| Routing | React Router 7 |
| Server state | TanStack React Query 5 |
| Client state | Zustand 5 |
| HTTP | Axios |
| DnD | @hello-pangea/dnd (React 19 compatible) |
| Realtime | SockJS + @stomp/stompjs |
| Motion | Framer Motion |
| Icons | Lucide React |

## Folder structure

```
frontend/src/
├── app/              # App shell, providers
├── assets/
├── components/
│   ├── ui/           # shadcn primitives
│   ├── layout/       # Sidebar, Header, AppShell
│   ├── auth/         # Auth forms
│   ├── dashboard/    # Dashboard widgets
│   ├── kanban/       # Board, columns, cards
│   ├── sprint/       # Sprint list, party, chat
│   ├── shop/         # Shop grid, purchase
│   └── profile/      # Profile, achievements
├── hooks/            # useAuth, useWebSocket, useToast
├── layouts/          # AuthLayout, DashboardLayout
├── pages/            # Route-level pages
├── router/           # Routes, guards
├── services/         # API modules (auth, tasks, …)
├── store/            # Zustand stores
├── types/            # DTOs mirroring backend
├── utils/            # cn, format, storage
└── websocket/        # STOMP client, subscriptions
```

## Routing

| Path | Page | Guard |
|------|------|-------|
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/` | Dashboard | Auth |
| `/projects` | Projects | Auth |
| `/projects/:projectId/sprints` | Sprint list | Auth |
| `/sprints/:sprintId` | Sprint detail | Auth |
| `/sprints/:sprintId/kanban` | Kanban | Auth |
| `/sprints/:sprintId/chat` | Party chat | Auth |
| `/shop` | Shop | Auth |
| `/profile` | Profile | Auth |
| `/achievements` | Achievements | Auth |
| `*` | NotFound | — |

Admin-only UI: `user.role === 'ADMIN'` gates shop item creation.

## State management

```
┌─────────────────────────────────────────┐
│ Zustand: authStore (token, user)        │
│   persist → localStorage                │
└─────────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────┐
│ React Query: server cache                 │
│   keys: ['projects'], ['kanban', id], …   │
└─────────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────┐
│ Axios apiClient + JWT interceptor         │
└─────────────────────────────────────────┘
```

## API integration

- Base URL: `VITE_API_URL` → `http://localhost:8080/api`
- Request: `Authorization: Bearer <token>` from authStore
- 401 → clear auth, redirect `/login`
- Errors → typed `ApiError` from `ErrorResponse`

## WebSocket

- Endpoint: `VITE_WS_URL` → `http://localhost:8080/api/ws` (SockJS)
- Subscribe: `/topic/sprints/{id}/chat`, `/topic/users/{userId}/notifications`
- Send chat: prefer REST `POST /sprints/{id}/chat` (JWT); STOMP optional
- Reconnect with exponential backoff in `websocket/stompClient.ts`

## Design system

- Theme: dark RPG dashboard (`--background`, `--primary` gold/purple)
- Glass cards: `backdrop-blur`, semi-transparent borders
- Typography: system + accent for XP/level numbers
- Components: Button, Input, Card, Badge, Progress, Avatar (ui/)

## Component hierarchy

```
App
└── AppProviders (QueryClient, Router, Toaster)
    └── AppRouter
        ├── AuthLayout → Login | Register
        └── DashboardLayout
            ├── Sidebar
            ├── Header (notifications, user menu)
            └── Outlet → Page components
```

## Phase 1 (current)

- [x] Project scaffold, Vite, Tailwind
- [x] Routing + protected routes
- [x] Auth (login, register, JWT storage)
- [x] API client + auth service
- [ ] Dashboard widgets (phase 2)
- [ ] Kanban + DnD (phase 2)
- [ ] WebSocket chat (phase 2)
