# syntax=docker/dockerfile:1

#####################################
# 1. Dependencies
#####################################
FROM node:22-alpine AS deps

# Needed for some native modules on Alpine
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy only the manifest/lockfiles first for better layer caching
COPY package.json package-lock.json* pnpm-lock.yaml* bun.lockb* ./

RUN \
  if [ -f bun.lockb ]; then \
    npm install -g bun && bun install --frozen-lockfile; \
  elif [ -f pnpm-lock.yaml ]; then \
    corepack enable && corepack prepare pnpm@latest --activate && pnpm install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then \
    npm ci; \
  else \
    npm install; \
  fi

#####################################
# 2. Build
#####################################
FROM node:22-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Build the standalone Next.js output (requires `output: "standalone"` in next.config)
RUN \
  if [ -f bun.lockb ]; then \
    npm install -g bun && bun run build; \
  elif [ -f pnpm-lock.yaml ]; then \
    corepack enable && corepack prepare pnpm@latest --activate && pnpm run build; \
  else \
    npm run build; \
  fi

#####################################
# 3. Runtime
#####################################
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Defaults — override at `docker run` / compose time as needed
ENV DATA_DIR=/app/data
ENV DOWNLOAD_ROOT=/app/downloads

# Non-root user
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Standalone server + static assets + public files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Persistent directories for sessions and downloaded media
RUN mkdir -p /app/data /app/downloads \
  && chown -R nextjs:nodejs /app/data /app/downloads

VOLUME ["/app/data", "/app/downloads"]

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
