# syntax=docker/dockerfile:1

FROM node:20-alpine AS base

# ---- Dependencies -----------------------------------------------------
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ---- Build --------------------------------------------------------------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Dummy values so `next build` can type-check/collect env references —
# real credentials are supplied at `docker run` time via --env-file/-e.
ENV TELEGRAM_API_ID=0
ENV TELEGRAM_API_HASH=build
RUN npm run build

# ---- Runtime --------------------------------------------------------------
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache su-exec \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 telextract

# Next.js standalone output: a minimal server.js plus only the node_modules
# it actually needs — no full node_modules copy required in this stage.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=telextract:nodejs /app/.next/standalone ./
COPY --from=builder --chown=telextract:nodejs /app/.next/static ./.next/static

# Baked-in default data/download dirs, for when no volume is mounted at all.
RUN mkdir -p /app/data /app/downloads && chown -R telextract:nodejs /app/data /app/downloads

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Stays root here — the entrypoint fixes up DATA_DIR/DOWNLOAD_ROOT ownership
# (which may be a freshly mounted volume) and then drops to the non-root
# "telextract" user itself before exec'ing the actual server.
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]
