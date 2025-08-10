# Appliance Service CRM (Web-Only MVP)

Stack:
- **Backend**: Node.js + Fastify + TypeScript + Prisma + PostgreSQL + JWT + Swagger
- **Frontend**: React + Vite + TypeScript + Tailwind
- **DB**: Postgres
- **Auth Roles**: ADMIN, CALL_CENTER, MASTER, ACCOUNTING

## Quick Start (with Docker)
1) Copy `.env.example` to `.env` and adjust if needed.
2) Run:
```bash
docker compose up -d --build
```
3) Wait ~30-60s for DB & migrations. Then open http://localhost:5173
4) Log in with:
- **Admin**: phone `+10000000001`, password `admin123`
- **Call center**: phone `+10000000002`, password `call123`
- **Master**: phone `+10000000003`, password `master123`
- **Accounting**: phone `+10000000004`, password `acc123`

> Backend API docs: http://localhost:4000/docs

## Manual Dev (without Docker)
- Start Postgres and set env via `.env`
- Backend:
```bash
cd backend
npm i
npx prisma migrate dev
npm run dev
```
- Frontend:
```bash
cd frontend
npm i
npm run dev
```
Open http://localhost:5173

## Features covered (per TZ)
- Call center: create orders, assign masters, view statuses, search
- Master: see assigned orders, mark completed, set amount, add comments, upload attachments
- Accounting: list completed orders, filter, export CSV, download attachments
- Admin: users list, simple management (readonly in UI; write via API), audit log in API
- Notifications: stub table + audit hooks (ready for SMS/Push integration)
- Maps: link + embedded Leaflet (OSM); basic geocode via Nominatim (client-side fetch)
- Security: JWT, role-based guards, password hashing, input validation (zod), audit logging
- Docs: OpenAPI/Swagger at `/docs`
- Exports: `/reports/completed.csv?from=YYYY-MM-DD&to=YYYY-MM-DD`

## Notes
- This is an MVP scaffold designed to be extended. Code is clean, typed, and split by routes/services.
- File uploads are stored in `backend/uploads`. In Docker, this is a volume `crm_uploads`.
- For production, put the frontend behind a reverse proxy and set `JWT_SECRET` and `DATABASE_URL` properly.
