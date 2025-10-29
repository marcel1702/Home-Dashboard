# syntax=docker/dockerfile:1

FROM node:20-bullseye-slim AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend .
RUN npm run build

FROM node:20-bullseye-slim AS backend
WORKDIR /app
ENV NODE_ENV=production
COPY backend/package.json backend/package-lock.json ./backend/
RUN cd backend && npm ci --omit=dev
COPY backend ./backend
COPY prisma ./prisma
COPY --from=frontend /app/frontend/dist ./backend/public

WORKDIR /app/backend
ENV PORT=8080
ENV DB_PATH=/data/app.db
ENV SESSION_SECRET=change-me
ENV MAX_UPLOAD_KB=512
EXPOSE 8080

CMD ["node", "src/index.js"]
