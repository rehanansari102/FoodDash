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

RUN pnpm install --frozen-lockfile --filter @snapbite/frontend...

COPY tsconfig.base.json ./
COPY apps/frontend ./apps/frontend

ENV NEXT_TELEMETRY_DISABLED=1

# NEXT_PUBLIC_* values are inlined into the client bundle at build time, so they
# must be present here rather than only in the runtime environment.
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_ORDER_SERVICE_WS
ARG NEXT_PUBLIC_MEDIA_BASE_URL
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY \
    NEXT_PUBLIC_ORDER_SERVICE_WS=$NEXT_PUBLIC_ORDER_SERVICE_WS \
    NEXT_PUBLIC_MEDIA_BASE_URL=$NEXT_PUBLIC_MEDIA_BASE_URL

RUN pnpm --filter @snapbite/frontend run build

# ── Stage 2: Production ─────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# outputFileTracingRoot points at the workspace root, so the standalone bundle
# keeps the monorepo layout: node_modules/ at the root, server.js under apps/frontend.
COPY --from=builder /app/apps/frontend/.next/standalone ./
COPY --from=builder /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=builder /app/apps/frontend/public ./apps/frontend/public

EXPOSE 3010
# Render injects PORT; these are the local fallbacks.
ENV PORT=3010
ENV HOSTNAME=0.0.0.0

CMD ["node", "apps/frontend/server.js"]
