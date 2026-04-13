# Phase 1 — Getting Started

## Prerequisites
- Docker Desktop running
- Node.js 20+
- pnpm 9+: `npm install -g pnpm`

## Step 1 — Install dependencies
```bash
cd d:/Projects/FoodDash
pnpm install
```

## Step 2 — Start infrastructure
```bash
docker-compose up -d
```
This starts:
- PostgreSQL on :5432 (databases: auth_db, payment_db)
- MongoDB on :27017 (replica set rs0)
- Redis on :6379
- Redis Commander UI: http://localhost:8081
- Mongo Express UI:   http://localhost:8082

## Step 3 — Set up env files
```bash
cp apps/api-gateway/.env.example  apps/api-gateway/.env
cp apps/auth-service/.env.example apps/auth-service/.env
cp apps/user-service/.env.example apps/user-service/.env
```

## Step 4 — Run services (3 terminals)
```bash
# Terminal 1
pnpm --filter @food-dash/auth-service dev

# Terminal 2
pnpm --filter @food-dash/user-service dev

# Terminal 3
pnpm --filter @food-dash/api-gateway dev
```

## Step 5 — Test the flow
```bash
# Register
curl -c cookies.txt -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login
curl -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get profile (replace TOKEN with accessToken from login)
curl -H "Authorization: Bearer TOKEN" http://localhost:3000/api/users/me

# Add address
curl -X POST http://localhost:3000/api/users/me/addresses \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"label":"Home","street":"123 Main St","city":"Mumbai","country":"IN","lat":19.07,"lng":72.87}'
```

## Architecture so far
```
Browser / curl
    ↓
API Gateway :3000
    ├── POST /api/auth/* → proxied to Auth Service :3001
    │     └── gRPC :50051 for token verification (gateway calls this internally)
    └── GET  /api/users/* → proxied to User Service :3002
```

## Key things to understand in this phase
1. How `http-proxy-middleware` routes requests in `proxy.controller.ts`
2. How `JwtAuthGuard` in the gateway verifies tokens locally (no gRPC call yet — that's an upgrade)
3. How Redis stores refresh tokens in `auth-service/auth.service.ts` → `generateTokenPair()`
4. How the cache-aside pattern works in `user-service/user.service.ts` → `getOrCreateProfile()`
5. How Docker service names resolve (e.g. `mongodb` resolves within docker network)
