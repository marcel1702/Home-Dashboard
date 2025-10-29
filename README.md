# Home Dashboard

Ein modernes, kachelbasiertes Dashboard zur Übersicht deiner internen und externen Dienste inklusive Admin-Verwaltung.

## Projektstruktur

```
backend/    Express-API, Auth, Datenbankzugriff
frontend/   Vue-Frontend (Dashboard + Admin)
backend/prisma/     Datenbank-Schema & Migrationen
scripts/    Hilfsskripte (z. B. Passwort-Hashing)
docker/     Container-Build & Compose-Stack
docs/       Weitere Dokumentation
```

## Voraussetzungen

- Node.js ≥ 18
- npm ≥ 9

## Lokale Entwicklung

### Backend

```bash
cd backend
npm install
cp .env.example .env   # optional, siehe unten
npm run dev
```

Setze in `.env` mindestens:

```
SESSION_SECRET=ein-sicheres-geheimnis
DB_PATH=../data/app.db
MAX_UPLOAD_KB=512
ADMIN_PASSWORD_HASH=<aus scripts/seed-admin.js>
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Das Vite-Dev-Server proxied API-Anfragen nach `http://localhost:8080`.

## Datenbank & Migration

- Schema siehe `backend/prisma/schema.prisma`.
- Erste Migration liegt in `backend/prisma/migrations/000-init`.
- Der Produktionsstart (`npm start` oder der Docker-Container) führt automatisch `prisma migrate deploy` aus, damit die Datenbanktabellen vorhanden sind.
- Für lokale Tests kann die Migration bei Bedarf mit `npm run migrate` angewendet werden (Prisma CLI benötigt Internetzugang für Engine-Download).

## Docker Build

```bash
cd docker
docker build -t home-dashboard ..
```

Oder via Compose:

```bash
cd docker
docker compose up --build
```

Setze dabei die Umgebungsvariablen (`SESSION_SECRET`, `ADMIN_PASSWORD_HASH`, `DB_PATH`, `MAX_UPLOAD_KB`).

## Healthcheck

`GET /api/health` → `{ "status": "healthy" }`

## Lizenz

MIT
