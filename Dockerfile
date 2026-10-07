# syntax=docker/dockerfile:1

# Node 22 LTS (matches the local toolchain); pnpm version comes from
# "packageManager" in package.json via corepack.
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

# Full install (dev deps included) and compile TypeScript to dist/
FROM toolchain AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN pnpm build

# Production-only dependencies
FROM toolchain AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --prod --frozen-lockfile

# Runtime image
FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json ./
# The app writes hedera-wallet.db into the working directory
RUN chown node:node /app
USER node
EXPOSE 3000
# Hedera credentials are provided at runtime, e.g. docker run --env-file .env
CMD ["node", "dist/main.js"]
