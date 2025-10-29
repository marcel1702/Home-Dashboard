# syntax=docker/dockerfile:1

FROM node:20-bullseye-slim AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend .
RUN npm run build

FROM node:20-bullseye-slim AS backend
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./backend/
RUN cd backend && npm ci
COPY backend ./backend
RUN cd backend && npm run prisma:generate
RUN cd backend && npm prune --omit=dev
COPY --from=frontend /app/frontend/dist ./backend/public

WORKDIR /app/backend
ENV NODE_ENV=production
ENV PORT=8080
ENV DB_PATH=/data/app.db
ENV SESSION_SECRET=change-me
ENV MAX_UPLOAD_KB=512
EXPOSE 8080

CMD ["node", "scripts/migrate-and-start.js"]
