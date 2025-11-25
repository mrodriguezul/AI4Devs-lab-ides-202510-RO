# syntax=docker/dockerfile:1

FROM node:20-bullseye AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./tsconfig.json
COPY prisma ./prisma
COPY src ./src

# Use db service name for Docker network
ENV DATABASE_URL="postgresql://LTIdbUser:D1ymf8wyQEGthFR1E9xhCq@db:5432/LTIdb"
RUN npx prisma generate
RUN npm run build

FROM node:20-bullseye AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3010
CMD ["node", "dist/index.js"]

