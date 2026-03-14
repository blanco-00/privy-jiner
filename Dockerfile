FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY packages/core/package*.json packages/core/
COPY packages/ai/package*.json packages/ai/
COPY packages/dashboard/package*.json packages/dashboard/
COPY packages/i18n/package*.json packages/i18n/
COPY packages/modules/package*.json packages/modules/

RUN npm ci --workspaces=false

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init

ENV NODE_ENV=production
ENV PORT=3001

COPY --from=builder /app/packages/core/dist ./dist
COPY --from=builder /app/packages/core/node_modules/better-sqlite3 ./node_modules/better-sqlite3
COPY --from=builder /app/packages/core/node_modules/bindings ./node_modules/bindings
COPY --from=builder /app/packages/core/node_modules/file-uri-to-path ./node_modules/file-uri-to-path
COPY --from=builder /app/packages/core/package.json ./package.json

RUN npm install --production --ignore-scripts

RUN addgroup -g 1000 -S appgroup && \
    adduser -u 1000 -S appuser -G appgroup

USER appuser

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
