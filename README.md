# Podorozhnik

Сайт digital-агентства. Стек как у Greydstroy: Vue, FastAPI, PostgreSQL.

```text
frontend/    Vue 3 + Vite
backend/     FastAPI
database/    PostgreSQL, init.sql
```

## Локальный запуск

Нужны Node.js 20+, Python 3.12+ и PostgreSQL.

1. База: создайте БД `podorozhnik` или поднимите только Postgres:

```bash
docker compose up -d postgres
```

2. Backend:

```bash
cp backend/.env.example backend/.env
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python run_api.py
```

API: [http://localhost:8000/api/health](http://localhost:8000/api/health)

3. Frontend:

```bash
cd frontend
npm install
npm run dev
```

Сайт: [http://localhost:5173](http://localhost:5173). Vite проксирует `/api` на backend.

## Продакшен

На сервере с Docker:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
# в .env: SITE_ADDRESS=podorozhnik-agency.ru, ACME_EMAIL, POSTGRES_PASSWORD
# в backend/.env: ADMIN_PASSWORD, DB_PASSWORD (= POSTGRES_PASSWORD)

docker compose up -d --build
```

DNS до запуска:

- `A` → `podorozhnik-agency.ru` → IP сервера  
- `A` → `www.podorozhnik-agency.ru` → тот же IP  

Схема: Internet → Caddy :443 (TLS) → nginx (SPA + `/api`) → FastAPI → PostgreSQL.

Caddyfile: `deploy/caddy/Caddyfile`.

