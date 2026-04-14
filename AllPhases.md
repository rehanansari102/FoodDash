# FoodDash

## What is this project?

FoodDash is a full-stack food delivery platform — similar to Uber Eats or DoorDash — built as a **production-grade microservices application**.

The goal is not just to build a working app, but to learn and apply real-world backend engineering patterns:
- Microservices architecture with independent deployable services
- API Gateway pattern for a single entry point
- JWT authentication with refresh token rotation and Redis blacklisting
- Database-per-service (PostgreSQL for transactional data, MongoDB for document data)
- Redis caching (cache-aside pattern) and session management
- Real-time features via WebSockets
- Event-driven communication between services
- File uploads via S3 presigned URLs
- Email delivery via Brevo (transactional emails)
- Docker Compose for local development, Kubernetes-ready for production

### Tech stack
| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router, Server Actions, TypeScript) |
| Backend | NestJS (TypeScript) — one app per service |
| Auth DB | PostgreSQL + TypeORM |
| Document DBs | MongoDB + Mongoose |
| Cache / Sessions | Redis (ioredis) |
| API Gateway | NestJS reverse proxy + JWT guard |
| Service-to-service | gRPC (token verification), REST (data) |
| Email | Brevo (@getbrevo/brevo) |
| File storage | AWS S3 (presigned URLs) |
| Containerisation | Docker + Docker Compose |
| Monorepo | pnpm workspaces |

### Who is it for?

This is a learning project designed to go from zero to a fully working multi-service platform. Each phase builds on the last, introducing new patterns and services. The codebase is structured the way a real engineering team would build it.

---

# Full Project Roadmap

## Architecture Overview
```
Browser (Next.js :3010)
    ↓  HTTP
API Gateway :3000  (NestJS — routing, JWT guard, rate limiting)
    ├── /api/auth/*        → Auth Service     :3001  (PostgreSQL + Redis)
    ├── /api/users/*       → User Service     :3002  (MongoDB + Redis)
    ├── /api/restaurants/* → Restaurant Svc   :3003  (MongoDB + Redis)
    ├── /api/menus/*       → Menu Service     :3004  (MongoDB + Redis)
    ├── /api/orders/*      → Order Service    :3005  (MongoDB)
    ├── /api/payments/*    → Payment Service  :3006  (PostgreSQL)
    ├── /api/delivery/*    → Delivery Service :3007  (MongoDB)
    └── /api/media/*       → Media Service    :3008  (S3 / local storage)

Internal event bus: Redis Pub/Sub (→ Kafka in production)
Real-time: WebSocket Gateway (NestJS @WebSocketGateway)
```

---

## ✅ Phase 1 — Foundation (COMPLETE)

### What's built
| Layer | Status |
|---|---|
| Docker infra (Postgres, MongoDB, Redis) | ✅ |
| Auth Service — register, login, refresh, logout | ✅ |
| Auth Service — forgot/reset password (Brevo email) | ✅ |
| User Service — profile, addresses (MongoDB) | ✅ |
| API Gateway — JWT guard, proxy routing | ✅ |
| Frontend — login, register, forgot/reset password pages | ✅ |
| Frontend — auth server actions, cookie management | ✅ |

### Phase 1 additions
- **Email verification on register** — send verification link via Brevo, block ordering until verified ✅
- **OAuth login** — Google / Facebook sign-in (optional, post-MVP)
- **2FA** — TOTP-based two-factor auth (optional, admin accounts)

### Key files
- `apps/auth-service/src/auth/` — JWT, bcrypt, Redis token blacklist
- `apps/user-service/src/user/` — MongoDB profile, cache-aside pattern
- `apps/api-gateway/src/proxy/proxy.controller.ts` — reverse proxy routing
- `apps/frontend/src/app/(auth)/` — login, register, forgot/reset pages
- `apps/frontend/src/app/actions/auth.ts` — server actions

### Ports
- API Gateway: http://localhost:3000
- Auth Service: http://localhost:3001
- User Service: http://localhost:3002
- Frontend: http://localhost:3010

---

## 🔨 Phase 2 — Restaurant & Menu Management (NEXT)

### Goal
Restaurant owners can create/manage their restaurant and menu. Customers can browse restaurants and menus.

### Backend — restaurant-service :3003 (already scaffolded)
**Already exists:**
- `POST /restaurants` — create restaurant (owner only)
- `GET /restaurants/nearby?lat=&lng=&radius=` — geospatial search (MongoDB 2dsphere)
- `GET /restaurants/my` — owner's restaurants
- `GET /restaurants/:id` — public restaurant detail
- `PATCH /restaurants/:id` — update restaurant

**Needs adding:**
- `PATCH /restaurants/:id/toggle` — manual open/close toggle
- `PUT /restaurants/:id/hours` — structured weekly opening hours schedule
- `GET /restaurants/:id/hours` — is restaurant open right now (computed from schedule)
- Restaurant approval flow (admin approves before going live)
- Delivery zone radius per restaurant (reject orders outside range)
- Minimum order amount + delivery fee config per restaurant
- `POST /restaurants/:id/favourite` — customer favourites a restaurant
- `GET /restaurants/favourites` — customer's saved restaurants

### Backend — menu-service :3004 (already scaffolded)
**Already exists:**
- `POST /menus/:restaurantId/items` — add menu item
- `GET /menus/:restaurantId` — get full menu (grouped by category)
- `PATCH /menus/:restaurantId/items/:itemId` — update item
- `DELETE /menus/:restaurantId/items/:itemId` — remove item

**Needs adding:**
- `PATCH /menus/:restaurantId/items/:itemId/toggle` — availability toggle

### Backend — media-service :3008 (already scaffolded)
**Already exists:**
- `POST /media/presigned-url` — generate S3 presigned upload URL
- `DELETE /media/*key` — delete file from storage

### Frontend pages needed
- `/dashboard` — redirect based on role (customer vs owner vs admin)
- `/dashboard/restaurant/new` — create restaurant form
- `/dashboard/restaurant/:id` — manage restaurant + menu items + opening hours
- `/restaurants` — public listing with search/filter/map
- `/restaurants/:id` — public restaurant page with full menu
- `/favourites` — customer's saved restaurants

### Data flow
```
Owner creates restaurant → restaurant-service saves to MongoDB
Owner uploads logo → frontend → media-service presigned URL → S3 → imageUrl saved
Owner adds menu items → menu-service saves to MongoDB
Customer visits /restaurants → restaurant-service returns nearby list
Customer clicks restaurant → menu-service returns grouped menu
```

---

## � Phase 2.5 — Notifications Service

### Goal
Centralised service that sends emails and push notifications for all order lifecycle events. Decouples notification logic from business services.

### Backend — notification-service (needs creating)
- Subscribes to Redis Pub/Sub events from order/payment/delivery services
- `POST /notifications/send` — internal endpoint for direct sends
- Channels: **Email** (Brevo), **Push** (Firebase FCM), **In-app** (stored in MongoDB, polled by frontend)

### Events handled
```
order.placed      → email customer "Order received"
order.confirmed   → email + push "Restaurant confirmed your order"
order.ready       → push "Driver is picking up your order"
order.delivered   → email "Order delivered — leave a review"
order.cancelled   → email + push with refund info
payment.failed    → email customer
```

### Frontend
- Notification bell icon in header showing unread count
- `/notifications` — full notification history
- Browser push permission prompt on first order

---

## �📦 Phase 3 — Orders

### Goal
Customers can add items to a cart and place orders. Restaurant owners see incoming orders.

### Backend — order-service :3005 (needs creating)
```
POST /orders              — place order (validate items via menu-service)
GET  /orders              — customer's order history
GET  /orders/:id          — order detail
PATCH /orders/:id/status  — restaurant/driver updates status
```

### Order lifecycle
```
PENDING → CONFIRMED → PREPARING → READY → PICKED_UP → DELIVERED
                ↓
            CANCELLED (owner or customer)
```

### Events (Redis Pub/Sub)
```
order.placed   → notify restaurant-service, payment-service
order.confirmed → notify customer (WebSocket)
order.ready    → notify delivery-service
order.delivered → trigger payment capture
```

### Cart — server-side vs client-side
- **Phase 3**: cart in Redis (keyed by userId) — survives refresh, works across devices
- `POST /orders/cart/items` — add item
- `DELETE /orders/cart/items/:itemId` — remove item
- `GET /orders/cart` — get current cart with live price calculation
- Delivery fee and minimum order amount validated at checkout

### Frontend pages
- `/cart` — cart drawer/page (synced with Redis cart)
- `/checkout` — address selection, promo code, payment method, order summary + delivery fee
- `/orders` — customer order history
- `/orders/:id` — live order tracking page
- `/orders/:id/receipt` — printable/downloadable invoice
- `/dashboard/orders` — restaurant owner incoming orders view (real-time)

---

## 💳 Phase 4 — Payments

### Goal
Secure payment collection tied to order state. Refunds on cancellation.

### Backend — payment-service :3006 (needs creating, PostgreSQL)
```
POST /payments/intent       — create Stripe/Razorpay payment intent
POST /payments/confirm      — confirm payment, release order
POST /payments/refund/:id   — refund on cancellation
GET  /payments/history      — customer payment history
```

### Key behaviours
- Payment captured only after `order.confirmed` event
- Full refund if restaurant cancels within 5 min
- Partial refund logic for driver no-show

### Frontend pages
- Stripe Elements / Razorpay checkout embedded in `/checkout`
- `/dashboard/earnings` — restaurant owner revenue dashboard
- Receipt PDF generation (React PDF or server-side)

---

## 🎟 Phase 4.5 — Promotions & Coupons

### Goal
Promo codes and discounts to drive customer acquisition and retention.

### Backend — promotion-service (needs creating, PostgreSQL)
```
POST /promotions           — admin creates promo code
GET  /promotions/:code     — validate + return discount amount
POST /promotions/:code/use — mark code as used (idempotent per user)
```

### Types of promotions
- Flat discount (`SAVE50` → ₹50 off)
- Percentage discount (`FIRST20` → 20% off, first order only)
- Free delivery code
- Restaurant-specific codes (owner creates their own)
- Expiry date + usage limit per code

### Frontend
- Promo code input field on `/checkout`
- Applied discount shown in order summary
- `/dashboard/promotions` — owner creates restaurant-specific codes

---

## 🛵 Phase 5 — Delivery & Real-time Tracking

### Goal
Driver assignment, real-time GPS location, live ETA on customer order page.

### Backend — delivery-service :3007 (needs creating, MongoDB)
```
POST   /delivery/register        — driver registers (name, vehicle, license)
PATCH  /delivery/availability     — driver toggles online/offline
GET    /delivery/available         — list nearby available drivers (internal)
POST   /delivery/assign           — assign driver to order (event-triggered)
PATCH  /delivery/:id/accept       — driver accepts the job
PATCH  /delivery/:id/location      — driver updates GPS position
GET    /delivery/:id              — get delivery status + driver location
GET    /delivery/driver/history   — driver's completed deliveries + earnings
```

### WebSocket Gateway (add to API Gateway)
```
ws://localhost:3000
  order:{orderId}:status    — order status updates → customer
  delivery:{orderId}:location — driver GPS → customer map
  restaurant:new-order       — new order alert → owner dashboard
```

### Frontend — Customer
- Live map on `/orders/:id` showing driver location (Leaflet / Google Maps)
- Estimated arrival countdown

### Frontend — Driver Portal (`/driver` sub-app)
- `/driver/login` — driver-specific login
- `/driver/dashboard` — go online/offline toggle + incoming job requests
- `/driver/delivery/:id` — active delivery with customer address + map
- `/driver/earnings` — daily/weekly earnings summary

---

## ⭐ Phase 6 — Reviews & Ratings

### Backend — review-service (needs creating, MongoDB)
```
POST /reviews              — customer submits review after delivery
GET  /reviews/:restaurantId — public reviews for a restaurant
```
- Rating aggregation updates `restaurant.rating` and `restaurant.reviewCount`
- One review per order enforced

### Frontend
- Review prompt on order completion
- Star ratings + photos on restaurant page

---

## 🔍 Phase 7 — Search & Discovery

### Backend — search-service (needs creating)
- Elasticsearch or MongoDB Atlas Search
- Full-text search across restaurants and menu items
- Filters: cuisine, rating, price range, delivery time, open now
- Autocomplete endpoint

### Frontend
- Global search bar in header
- `/search?q=pizza&cuisine=italian` results page

---

## 🛠 Phase 8 — Admin Panel

### Frontend — `/admin` (role-gated)
- Approve/reject restaurant applications
- User management (ban, role change)
- Platform analytics (orders/day, revenue, active restaurants)
- Promo code management (create platform-wide codes)
- Monitor service health
- Dispute resolution — handle refund disputes between customer and restaurant

---

## 🌐 Phase 9 — Internationalisation & Multi-city (Post-MVP)

- Multi-currency support (INR, USD, GBP)
- Multi-language (i18n with `next-intl`)
- City/region selector — filters restaurants by delivery zone
- Timezone-aware opening hours

---

## 🚀 Phase 10 — Production Readiness

### Goal
Harden the app for real traffic before going live.

- Replace Redis Pub/Sub with **Kafka** for reliable event delivery
- Add **distributed tracing** (OpenTelemetry + Jaeger)
- Add **structured logging** (already partially done with correlation-id middleware)
- **Health check endpoints** on every service (already scaffolded)
- **Rate limiting** per user, not just per IP
- **Database migrations** — replace TypeORM `synchronize` with proper migration files
- **CI/CD pipeline** — GitHub Actions: test → build → push Docker image → deploy
- **Kubernetes manifests** or **AWS ECS task definitions**
- **AWS Secrets Manager** instead of `.env` files
- **CDN** for media files (CloudFront in front of S3)

---

## Infrastructure notes (for later phases)

| Concern | Dev | Production |
|---|---|---|
| Message bus | Redis Pub/Sub | Kafka |
| File storage | Local / MinIO | AWS S3 |
| Search | MongoDB text index | Elasticsearch |
| Caching | Redis | Redis Cluster |
| DB migrations | TypeORM synchronize | TypeORM migrations |
| Container orchestration | docker-compose | Kubernetes / ECS |
| Secrets | .env files | AWS Secrets Manager |

