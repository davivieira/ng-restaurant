# NgRestaurant – Project plan and roadmap

## 1. High-level architecture

### 1.1 Repo and services

- **Monorepo** with:
  - **apps/web** – Angular SPA (waiters + kitchen + admin)
  - **apps/api** – NestJS REST API
- Single Angular app with **role-based routes and layouts** (waiter / kitchen / admin). One build, different entry views.
- **Docker:** one docker-compose that runs API + DB + (optionally) Angular dev or built app.

### 1.2 Multi-tenancy (security)

- **Tenant = Restaurant.** Every Admin belongs to one restaurant (`restaurantId`).
- **Row-level isolation:** all tenant-scoped tables have `restaurantId`; every query filters by the current user’s `restaurantId`.
- JWT carries `restaurantId` + `role` + `userId`; backend **never** trusts client for `restaurantId`.
- No cross-restaurant APIs; no “super admin” across restaurants in v1.

---

## 2. Technology choices

### 2.1 Databases

| Use case           | Suggestion   | Why                                                                 |
|--------------------|-------------|---------------------------------------------------------------------|
| Primary DB         | PostgreSQL  | ACID, JSON support, good for orders/menu/audit; works well with NestJS and TypeORM/Prisma. |
| Sessions / cache   | Redis       | Optional for refresh tokens blacklist, rate limiting, or future job queue. Can add in a later phase. |

**Recommendation:** PostgreSQL only for the first stages; add Redis when you need token blacklist or queues.

### 2.2 Backend (NestJS)

- **ORM:** TypeORM or Prisma (Prisma is simpler for schema and migrations).
- **Auth:** JWT (access + optional refresh). Passport strategies: jwt, local (login).
- **Validation:** class-validator + class-transformer (Nest pipes).
- **API style:** REST; WebSockets only if you need live kitchen/waiter updates (can be Phase 2+).

### 2.3 Frontend (Angular + NgRx)

- Angular 19 (or latest stable).
- **NgRx:** Store, Effects, Entity (for menus, dishes, orders, tables). Feature slices: auth, restaurant, menu, orders, tables, kitchen, admin.
- **UI:** Angular Material or PrimeNG (tablet-friendly). Use your own theme (see below), no inline colors.
- **Real-time (optional):** WebSocket or polling for kitchen/waiter views; can start with polling.

### 2.4 Docker

- **Images:**
  - `Dockerfile.api` – NestJS (node image).
  - `Dockerfile.web` – Angular build served with nginx (multi-stage).
- **Compose services:**
  - `postgres` (volume for data).
  - `api` (depends on postgres).
  - `web` (depends on api for dev proxy or env-based API URL).
- **Env:** `.env` for DB URL, JWT secret, NODE_ENV; no secrets in images.

### 2.5 Auth and security

- **Password hashing:** bcrypt (or argon2) in NestJS.
- **JWT:** short-lived access token (e.g. 15–60 min), optional refresh token (e.g. 7 days) in httpOnly cookie or separate endpoint.
- **Guards:**
  - Auth guard on all API routes except login/register (if you expose it).
  - Role guard for admin-only endpoints.
  - Tenant guard: set `restaurantId` from token and inject into services so every query is scoped.

---

## 3. Data model (conceptual)

### 3.1 Core entities

- **Restaurant** – id, name, slug (optional), createdAt.
- **User** – id, email, passwordHash, name, role (admin | waiter | kitchen), restaurantId (FK). Admin “is” the restaurant; waiters/kitchen belong to one restaurant.
- **Table** – id, restaurantId, number (e.g. “5”), status (e.g. free | occupied), currentWaiterId (nullable). “Client” in your wording = table + its orders.
- **Waiter** – same as User with role=waiter; or a separate Waiter profile. Easiest: User with role.
- **Dish** – id, restaurantId, name, description, price, categoryId (optional), isActive.
- **Category** (optional) – id, restaurantId, name (e.g. “Starters”, “Drinks”).
- **Order** – id, restaurantId, tableId, waiterId (userId), status (pending | in_progress | delivered | cancelled), createdAt, updatedAt. One order = one table, one “round”.
- **OrderItem** – id, orderId, dishId, quantity, observations (text), unitPrice (snapshot), status (optional, e.g. pending/done for kitchen).
- **Bill** (optional for v1) – id, orderId or tableId, total, paidAt, printedAt. Or derive “bill” from order totals and a “printed” flag on Order.

**Relations:**

- Restaurant → Users, Tables, Dishes, Orders.
- Order → Table, Waiter (User), OrderItems → Dish.
- Every query filtered by `restaurantId` from JWT.

### 3.2 Indexes (important for kitchen and waiters)

- `Order(restaurantId, createdAt)` – kitchen “orders by time”.
- `Order(restaurantId, status)` – “orders in progress”.
- `Order(tableId)` – waiter “table’s orders”.
- `User(restaurantId, role)` – admin listing waiters/kitchen.

---

## 4. Theme definition (from reference image)

Define a single theme (e.g. in `styles/_theme.scss` or Angular `styles.scss`) using **CSS custom properties** so there are no inline colors.

```css
:root {
  /* Backgrounds */
  --ngr-bg-primary: #F9FAFC;
  --ngr-bg-sidebar: #F0F2F5;
  --ngr-bg-card: #FFFFFF;

  /* Primary (nav, links, charts, CTAs) */
  --ngr-primary: #6D8BFC;
  --ngr-primary-hover: #5A7AE8;

  /* Secondary / accent (KPIs, highlights) */
  --ngr-accent: #FF6B8B;
  --ngr-accent-soft: #E0528D;

  /* Semantic */
  --ngr-success: #4CAF50;
  --ngr-success-light: #66BB6A;
  --ngr-error: #F44336;
  --ngr-error-light: #EF5350;
  --ngr-warning: #FFC107;

  /* Text */
  --ngr-text-primary: #333333;
  --ngr-text-secondary: #777777;
  --ngr-text-muted: #9E9E9E;

  /* Borders & elevation */
  --ngr-border: #E0E0E0;
  --ngr-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
  --ngr-shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --ngr-radius: 8px;
  --ngr-radius-lg: 12px;

  /* Layout */
  --ngr-sidebar-width: 240px;
}
```

Use these variables everywhere (components, Material/PrimeNG theme overrides). No `style="color: #333"` in templates.

---

## 5. Application structure (high level)

### 5.1 Angular (apps/web)

- **Core:** auth interceptor, tenant/role guards, theme loader.
- **Features:**
  - **auth** – login, logout, NgRx auth state.
  - **dashboard** – main dashboard (active tables, waiters, orders in progress, orders by day).
  - **menu** – dish list (read-only for waiters; CRUD for admin).
  - **tables** – table list; waiter selects table → orders.
  - **orders** – create order (items, quantities, observations), cancel (if not in progress), “summarise & print bill”.
  - **kitchen** – orders sorted by time, status actions, confirm cancellation.
  - **admin** – users (waiters, kitchen), dishes, categories, restaurant settings.
- **Layout:** sidebar + top bar; sidebar entries and dashboard widgets depend on role.

### 5.2 NestJS (apps/api)

- **Modules:** Auth, Users, Restaurants, Tables, Menu (Dishes/Categories), Orders, Kitchen (or part of Orders).
- **Guards:** JwtAuthGuard, RolesGuard, TenantGuard (inject restaurantId into request).
- **Services:** Always accept restaurantId (from request) and use it in every DB call.

### 5.3 Docker layout

```
/
├── docker-compose.yml
├── .env.example
├── apps/
│   ├── api/
│   │   ├── Dockerfile
│   │   └── ...
│   └── web/
│       ├── Dockerfile
│       └── ...
```

---

## 6. Phased stages (to progress step by step)

### Stage 1 – Foundation (Week 1–2)

- Monorepo: Angular app + NestJS app.
- Docker: Postgres + API + Web (dev and prod layout).
- DB schema: Restaurant, User (with role, restaurantId), basic migrations.
- Auth: register (admin creates restaurant + first user), login, JWT, guards.
- Angular: login screen, auth NgRx, HTTP interceptor (token + base URL), route guards by role.

**Goal:** Admin can register, log in, and see a simple “dashboard” shell with sidebar; API rejects unauthenticated/unauthorized requests.

**Status:** Done.

---

### Stage 2 – Multi-tenant core and menu (Week 2–3)

- **Dishes** + optional **Categories**; CRUD API with `restaurantId` on every operation.
- **Admin UI:** register dishes (name, description, price, category).
- **Waiter UI:** read-only menu (list by category).
- **Theme:** apply CSS variables globally; sidebar and a couple of cards using the theme.

**Goal:** Admin manages menu; waiter sees menu; strict tenant isolation verified.

---

### Stage 3 – Tables and orders (Waiter flow) (Week 3–4)

- **Tables CRUD** (admin or seeded); table status and “current waiter” if needed.
- **Orders API:** create order (table, waiter, items with quantity and observations); list orders by table.
- **Waiter UI:** select table → add items from menu (quantity, observations) → submit order; view table’s orders; cancel order only if status ≠ in_progress.
- **NgRx:** orders and tables state; effects for API calls.

**Goal:** Waiters can create and cancel (when allowed) orders per table.

---

### Stage 4 – Kitchen flow (Week 4–5)

- **Orders list API:** by restaurant, sorted by createdAt, filter by status.
- **Status transitions:** pending → in_progress → delivered; cancelled with “confirmed by kitchen”.
- **Kitchen UI:** orders list (by time); mark in progress, delivered; confirm cancellation.
- **Optional:** simple polling or WebSocket for live updates.

**Goal:** Kitchen sees and controls order status; cancellations are confirmed.

---

### Stage 5 – Bills and dashboard (Week 5–6)

- **Bill:** compute total from order items; “print” (browser print or PDF endpoint); optional Bill entity and “paid” state.
- **Dashboard:** widgets – active tables, active waiters, orders in progress, orders delivered by day (from Orders API with aggregates).
- **Role-based dashboard:** same layout, different data or visibility.

**Goal:** Waiters can “summarise and print bill”; dashboard shows main KPIs in the style of your image.

---

### Stage 6 – Admin and polish (Week 6–7)

- **Admin:** register waiters and kitchen workers (User with role + restaurantId); deactivate users.
- **Validation and error handling** everywhere; loading states and toasts.
- **Security review:** no endpoint returns another restaurant’s data; all lists filtered by restaurantId.

**Goal:** Full admin capabilities; app safe for multi-tenant use.

---

### Stage 7 – Optional later

- Redis for token blacklist or rate limiting.
- WebSockets for real-time kitchen/waiter updates.
- Reports (orders by day, popular dishes).
- PWA for tablets (offline menu cache, etc.).

---

## 7. Security checklist (tenant isolation)

- [ ] JWT contains restaurantId; backend reads it from token, never from body/query.
- [ ] Every dish/table/order/user query includes `WHERE restaurantId = :id`.
- [ ] No “list all restaurants” or “switch restaurant” for normal users.
- [ ] Admin registration creates new Restaurant + first User; no cross-tenant admin.
- [ ] Passwords hashed; HTTPS in production; secrets in env, not in code.

---

## 8. Summary

| Layer        | Choices                                                                 |
|-------------|-------------------------------------------------------------------------|
| Frontend    | Angular 19, NgRx, Material/PrimeNG, theme via CSS variables            |
| Backend     | NestJS, PostgreSQL, TypeORM or Prisma, JWT auth                        |
| Infra       | Docker Compose (Postgres + API + Web)                                  |
| Auth        | JWT (access + optional refresh), role + tenant guards                   |
| Multi-tenancy | One restaurant per admin; restaurantId in JWT and in every query    |

Start with Stage 1 (monorepo, Docker, auth and role-based shell), then move through stages 2–6 one by one. Use this roadmap to break each stage into concrete file-level tasks or API/route lists when implementing.
