# ── Stage 1: Build ──────────────────────────────────────────
FROM node:22-alpine AS builder
RUN corepack enable
WORKDIR /app

# Manifests first so the dependency layer stays cached when only source changes.
# pnpm needs every workspace manifest present to satisfy --frozen-lockfile.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/common-guards/package.json ./packages/common-guards/
COPY packages/logger/package.json ./packages/logger/
COPY packages/proto/package.json ./packages/proto/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY apps/api-gateway/package.json ./apps/api-gateway/
COPY apps/auth-service/package.json ./apps/auth-service/
COPY apps/frontend/package.json ./apps/frontend/
COPY apps/media-service/package.json ./apps/media-service/
COPY apps/menu-service/package.json ./apps/menu-service/
COPY apps/order-service/package.json ./apps/order-service/
COPY apps/restaurant-service/package.json ./apps/restaurant-service/
COPY apps/user-service/package.json ./apps/user-service/

RUN pnpm install --frozen-lockfile --filter @snapbite/api-gateway...

COPY tsconfig.base.json turbo.json ./
COPY packages ./packages
COPY apps/api-gateway ./apps/api-gateway

# The trailing "..." also builds the workspace packages this service depends on.
RUN pnpm --filter @snapbite/api-gateway... run build

# ── Stage 2: Production ─────────────────────────────────────
FROM node:22-alpine AS runner
RUN corepack enable
WORKDIR /app
ENV NODE_ENV=production

# Reinstall with --prod so the runtime image carries no build-time dependencies.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/common-guards/package.json ./packages/common-guards/
COPY packages/logger/package.json ./packages/logger/
COPY packages/proto/package.json ./packages/proto/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY apps/api-gateway/package.json ./apps/api-gateway/
COPY apps/auth-service/package.json ./apps/auth-service/
COPY apps/frontend/package.json ./apps/frontend/
COPY apps/media-service/package.json ./apps/media-service/
COPY apps/menu-service/package.json ./apps/menu-service/
COPY apps/order-service/package.json ./apps/order-service/
COPY apps/restaurant-service/package.json ./apps/restaurant-service/
COPY apps/user-service/package.json ./apps/user-service/

RUN pnpm install --frozen-lockfile --prod --filter @snapbite/api-gateway...

COPY --from=builder /app/packages/common-guards/dist ./packages/common-guards/dist
COPY --from=builder /app/apps/api-gateway/dist ./apps/api-gateway/dist

EXPOSE 3000
# Render injects PORT; main.ts reads it and falls back to 3000 locally.
CMD ["node", "apps/api-gateway/dist/main"]
