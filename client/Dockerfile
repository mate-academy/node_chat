FROM node:24.15.0-bookworm-slim AS dependencies

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci


FROM node:24.15.0-bookworm-slim AS builder

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_URL=http://localhost:3000/api
ARG NEXT_PUBLIC_SOCKET_URL=http://localhost:3000

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build


FROM node:24.15.0-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3001

RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3001

CMD ["node", "server.js"]
