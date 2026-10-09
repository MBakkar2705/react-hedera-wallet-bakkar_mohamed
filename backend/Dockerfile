# syntax=docker/dockerfile:1

# Build from the repository root, because the lockfile and the workspace
# files are there:
#   docker build -f backend/Dockerfile -t hedera-wallet .
#
# Node 22 LTS (matches the local toolchain); pnpm version comes from
# "packageManager" in the root package.json via corepack.
FROM node:22-bookworm-slim AS base
ENV PNPM_HOME=/pnpm \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /app

# Toolchain for sqlite3's native addon, used only if its prebuilt binary
# cannot be downloaded. Never reaches the runtime image.
FROM base AS toolchain
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/

# Full install of the backend (dev deps included) and compile TypeScript
# to backend/dist/
FROM toolchain AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter backend
COPY backend/tsconfig.json backend/tsconfig.build.json backend/nest-cli.json ./backend/
COPY backend/src ./backend/src
RUN pnpm --filter backend build

# Production-only dependencies of the backend
FROM toolchain AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --prod --frozen-lockfile --filter backend

# Runtime image
FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app/backend
# pnpm stores the packages in /app/node_modules/.pnpm and links them from
# backend/node_modules: both folders are needed, at the same relative place.
COPY --from=prod-deps --chown=node:node /app/node_modules /app/node_modules
COPY --from=prod-deps --chown=node:node /app/backend/node_modules ./node_modules
COPY --from=build --chown=node:node /app/backend/dist ./dist
COPY --chown=node:node backend/package.json ./
# The app writes hedera-wallet.db into the working directory
RUN chown node:node /app/backend
USER node
EXPOSE 3000
# Hedera credentials are provided at runtime,
# e.g. docker run --env-file backend/.env
CMD ["node", "dist/main.js"]
