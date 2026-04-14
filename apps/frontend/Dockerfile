# ── Stage 1: Build ──────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY apps/frontend/package.json apps/frontend/package-lock.json* ./

RUN npm install --legacy-peer-deps

COPY apps/frontend ./

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── Stage 2: Production ──────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3010
ENV PORT=3010
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
