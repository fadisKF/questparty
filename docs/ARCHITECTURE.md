# QuestParty — System Architecture

## 1. General Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (React SPA)                        │
│  Pages: Auth, Dashboard, Projects, Quest, Kanban, Shop, Profile │
│  State: Zustand | HTTP: Axios | WS: STOMP/SockJS               │
└────────────────────────────┬────────────────────────────────────┘
                             │ REST (JWT) + WebSocket
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Spring Boot 3.4 API (context: /api)               │
│  ┌──────────────┐ ┌──────────────┐ ┌────────────────────────┐ │
│  │ Controllers  │ │ WebSocket    │ │ Security (JWT Filter)    │ │
│  └──────┬───────┘ └──────┬───────┘ └────────────────────────┘ │
│         ▼                ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Service Layer (business rules, gamification, access)    │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                             ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ JPA Repositories → PostgreSQL                             │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Layered modules (backend package `com.questparty`)

| Layer | Responsibility |
|-------|----------------|
| `controller` | REST endpoints, validation, OpenAPI |
| `websocket` | STOMP handlers for chat |
| `service` | Business logic, transactions |
| `repository` | Data access |
| `domain` | Entities, enums |
| `dto` | API contracts |
| `mapper` | Entity ↔ DTO |
| `security` | JWT, UserPrincipal |
| `config` | Security, WS, OpenAPI, seed |
| `exception` | Global error handling |

## 2. Database (ER)

```
users ─────────────┬──────────────── projects
     │             │                      │
     │             │                      ├── sprints (quests)
     │             │                      │       ├── sprint_members (party)
     │             │                      │       ├── tasks
     │             │                      │       │     └── task_comments
     │             │                      │       └── sprint_messages (chat)
     │             │                      └── project_members
     │             │
     ├── user_achievements ── achievements
     ├── purchases ── shop_items
     └── notifications
```

## 3. Entities

| Entity | Table | Description |
|--------|-------|-------------|
| User | users | Account, role, level, XP, coins |
| Project | projects | Project container |
| ProjectMember | project_members | Project team |
| Sprint | sprints | Quest (sprint) |
| SprintMember | sprint_members | Party |
| Task | tasks | Kanban card |
| TaskComment | task_comments | Task discussion |
| SprintMessage | sprint_messages | Quest chat |
| Achievement | achievements | Achievement definition |
| UserAchievement | user_achievements | Unlocked achievements |
| ShopItem | shop_items | Shop catalog |
| Purchase | purchases | Purchase history |
| Notification | notifications | User notifications |

## 4. Development Phases

| Phase | Scope |
|-------|--------|
| 1 | Auth, users, JWT, profile |
| 2 | Projects, sprints, party |
| 3 | Tasks, Kanban, move API |
| 4 | Gamification (XP, coins, levels, achievements) |
| 5 | Shop, purchases |
| 6 | Comments, chat, notifications (WS) |
| 7 | Analytics dashboard |
| 8 | React frontend |
| 9 | Docker, CI, polish |

## 5. Backend Structure

```
src/main/java/com/questparty/
├── QuestPartyApplication.java
├── config/
├── controller/
├── domain/entity/, domain/enums/
├── dto/request/, dto/response/
├── exception/
├── mapper/
├── repository/
├── security/
├── service/
└── websocket/
```

## 6. Frontend Structure (planned)

```
frontend/
├── src/
│   ├── api/           # axios clients
│   ├── components/    # UI, Kanban, Chat
│   ├── pages/         # routes
│   ├── store/         # zustand
│   ├── hooks/
│   └── types/
├── package.json
└── vite.config.ts
```

## API Overview

- `POST /api/auth/register`, `/login`
- `GET/PUT /api/auth/profile`
- `/api/projects`, `/api/projects/{id}/sprints`
- `/api/sprints/{id}/kanban`, `/api/tasks/{id}/move`
- `/api/shop/items`, `/api/shop/purchase`
- `/api/analytics/dashboard?sprintId=`
- WebSocket: `ws://localhost:8080/api/ws`

Default admin: `admin@questparty.local` / `admin123`
