# Home Dashboard – Projektüberblick

Dieses Dokument fasst die Architektur und die wichtigsten Workflows der Home-Dashboard-Anwendung zusammen.

## Komponenten

- **Frontend** (`/frontend`): Vite + Vue 3 + Tailwind CSS. Stellt das öffentliche Dashboard sowie den Admin-Bereich bereit.
- **Backend** (`/backend`): Express-Server mit REST-API, Session-Auth und Prisma-Integration.
- **Datenbank**: SQLite-Datei (`/data/app.db`). Migrationen liegen in `/app/backend/prisma/migrations`.
- **Container**: Dockerfile in `/docker/Dockerfile`, Compose-Stack in `/docker/docker-compose.yml`.

## Wichtige Features

- Responsive Dashboard mit Modal-Auswahl zwischen interner und externer URL.
- Passwortgeschütztes Admin-Interface mit CRUD, Icon-Upload (DB-BLOB) und Drag-&-Drop-Sortierung.
- Sicherheitsmaßnahmen wie Helmet, Session-Cookies (HttpOnly, SameSite=Lax) und Rate-Limits auf Login.

## Entwicklungs-Workflow

1. **Backend**: `cd backend && npm install` (bereits erledigt) → `.env` pflegen → `npm run dev`.
2. **Frontend**: `cd frontend && npm install` → `npm run dev`.
3. Für eine lokale Integration laufen beide Dienste parallel; das Frontend proxied `/api` an `localhost:8080`.

## Build & Deployment

1. `npm run build` im Frontend erzeugt `/frontend/dist`.
2. Docker-Image via `docker build -f docker/Dockerfile -t home-dashboard .` bauen.
3. Persistente DB über Volume `/data/app.db` einbinden.
4. Admin-Passwort-Hash per `scripts/seed-admin.js` generieren und als `ADMIN_PASSWORD_HASH` setzen.

## Health & Tests

- `/api/health` liefert `{ status: "healthy" }`.
- Smoke-Tests siehe `README.md` im Repository-Hauptverzeichnis.
