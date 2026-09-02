FROM node:24.15.0-bookworm-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --ignore-scripts

COPY prisma ./prisma
COPY prisma7.config.ts ./
COPY nest-cli.json ./
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src

ENV DATABASE_URL=postgresql://postgres:postgres@localhost:5432/node_chat

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

RUN npx prisma generate
RUN npm run build

FROM node:24.15.0-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./

RUN npm ci --omit=dev --ignore-scripts \
    && npm cache clean --force

COPY --from=builder /app/dist ./dist

USER node

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
