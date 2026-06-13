# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=24.13.0-slim

FROM node:${NODE_VERSION} AS base

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
  HUSKY=0 \
  NEXT_TELEMETRY_DISABLED=1 \
  PNPM_HOME=/pnpm \
  PATH=/pnpm:$PATH

WORKDIR /app

RUN corepack enable

FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store pnpm install --frozen-lockfile

FROM base AS migrator

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

CMD ["pnpm", "db:migrate"]

FROM base AS build

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN --mount=type=cache,id=next-cache,target=/app/.next/cache \
  --mount=type=secret,id=coinfactory_build_env,required=true \
  set -a; \
  . /run/secrets/coinfactory_build_env; \
  set +a; \
  pnpm build

FROM node:${NODE_VERSION} AS runner

WORKDIR /app

ENV HOSTNAME=0.0.0.0 \
  NEXT_TELEMETRY_DISABLED=1 \
  NODE_ENV=production \
  PORT=3000

RUN mkdir .next && chown node:node .next

COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static

USER node

EXPOSE 3000

CMD ["node", "server.js"]
