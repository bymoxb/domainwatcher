# DomainWatcher

DomainWatcher is a full-stack web application for tracking domain expiration dates and notifying subscribers when a domain is close to expiring.

It includes:
- A Go backend (API, scheduler, notifications, persistence)
- A React frontend (search + watchlist UI)
- SQLite or PostgreSQL storage

## Why this project

- Monitor domain expiration from one interface
- Subscribe to domain alerts using email
- Receive notifications through SMTP or Telegram
- Periodically re-check watched domains with cron
- Use multiple provider sources (RDAP by default, WhoisJSON optionally)

## Quick start (Docker first)

Use the published image from main branch to run the app immediately.

### Create app.db sqlite file

```sh
mkdir ./config && touch ./config/app.db
```

### Create `.env` file

```sh
touch .env
```

Populate required variables from sección ["Minimal working .env (SQLite + Telegram)"](minimal-working-env-sqlite-telegram).

### Option A: Docker Compose (recommended)

```bash
docker compose up -d
```

This uses the root `docker-compose.yaml` and expects:
- A `.env` file in project root
- A writable sqlite path mounted as `./config/app.db`

### Option B: Docker run

```bash
docker run -d \
	--name domainwatcher \
	--env-file .env \
	-v "./config/app.db:/app/app.db" \
	-p 9876:9876 \
	bymoxb/dw-app:latest
```

App URL: http://localhost:9876

## Tech stack

Backend:
- Go 1.25+
- Gin (HTTP server)
- GORM (ORM)
- robfig/cron v3 (scheduler)
- SQLite or PostgreSQL drivers

Frontend:
- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- Radix UI (Themes + Icons)

Containerization:
- Docker multi-stage build (frontend + backend)
- Docker Compose

## Architecture overview

- cmd/server/main.go
	- Process entry point
	- Initializes app wiring and starts server on port 9876

- internal/infra/app
	- Dependency wiring
	- HTTP route registration
	- Scheduler registration
	- Event subscriber registration

- internal/application/services
	- Core use-cases:
	- RegistryService: cache-aware lookup + refresh + expiration checks
	- WatcherService: create/search/toggle/delete watcher subscriptions

- internal/domain
	- Entities, value objects, repository contracts, event contracts

- internal/infra/adapters
	- External providers:
	- RDAP provider (always enabled)
	- WhoisJSON provider (enabled when API key is present)

- internal/infra/persistence
	- Repository implementations for sqlite and postgres
	- AutoMigrate setup for domain models

- internal/infra/events
	- In-process pub/sub dispatcher
	- Subscribers for registry refresh + SMTP + Telegram notifications

- internal/infra/http/static
	- Embedded frontend static files served by Gin in production

- frontend
	- Single-page app with two tabs:
	- Search Domains
	- My Domains

## Request and notification flow

1. User searches a domain in Search Domains.
2. Backend checks local cache first.
3. If missing or stale, backend queries providers sequentially.
4. User subscribes with email via watcher creation endpoint.
5. Cron runs periodic expiration checks.
6. Matching registries publish events to subscribers.
7. Notifications are sent through the configured channel (SMTP or Telegram).

## Repository structure

```text
cmd/                 # executable entrypoints
internal/
	application/       # service-level use-cases
	domain/            # entities, VOs, repository/event contracts
	infra/             # adapters, config, http, persistence, events
frontend/            # React SPA
db/                  # SQL schema and optional PostgreSQL compose
requests/            # API request examples (.cartero)
```

## Requirements

- Go 1.25+
- Node.js 22+
- pnpm 10+
- SQLite (default) or PostgreSQL 17+
- Docker (optional)

## Environment variables

There is no committed .env.example file, so create a .env in the project root.

### Minimal working .env (SQLite + Telegram)

```env
# DB engine: sqlite or postgres
DB_DRIVER=sqlite

# DB connection target:
# - sqlite: local file path
DB_URL=app.db

# Cron expression for periodic expiration checks
DW_CRON_VALUE=0 0 * * *

# Notification transport channel: smtp or telegram
DW_NOTIFICATION_CHANNEL=telegram

# Telegram bot token used to send messages
TGRAM_BOT_TOKEN=

# Telegram chat ID where alerts are delivered
TGRAM_CHAT_ID=

# Optional: outbound HTTP timeout in seconds (default: 10)
# DW_HTTP_TIMEOUT=10

# Optional: days-before-expiration threshold to trigger alerts (default: 15)
# DW_EXPIRATION_THRESHOLD=15

# Optional: WhoisJSON API key (enables WhoisJSON provider in adapter chain)
# DW_WHOISJSON_API_KEY=

# Optional: restrict allowed email domains for subscriptions
# DW_ALLOWED_EMAIL_DOMAINS=gmail.com,outlook.com,outlook.es,hotmail.com
```

### SMTP option

```env
# Public app URL used in generated links/notifications
DW_APP_DOMAIN=http://localhost:9876

DW_NOTIFICATION_CHANNEL=smtp
MAIL_HOST=
MAIL_PORT=2525
MAIL_USER=
MAIL_PASSWORD=
MAIL_FROM=no-reply@domainwatcher.local
MAIL_TO=alerts@domainwatcher.local
```

### PostgreSQL option

```env
DB_DRIVER=postgres
DB_URL=host=localhost user=domainwatcher password=domainwatcher dbname=domainwatcher port=5432 sslmode=disable
```

### Deployment

```env
DW_TRUSTED_PLATFORM=cloudflare
DW_TRUSTED_PROXIES=127.0.0.1
```

Notes:
- DW_TRUSTED_PLATFORM currently must be cloudflare, otherwise startup fails.
- If ENV is not production, the app attempts to load .env via godotenv.
- If DW_WHOISJSON_API_KEY is not set, only RDAP is used.

## Local development

### 1. Start frontend (Vite dev server)

```bash
cd frontend
pnpm install
pnpm dev
```

Frontend runs at http://localhost:5173 and proxies /api to http://localhost:9876.

### 2. Start backend

In another terminal from project root:

```bash
go mod download
go run ./cmd/server/main.go
```

Backend (API + static serving) runs at http://localhost:9876.

## Docker

The primary Docker startup commands are at the top of this README.

The root docker-compose.yaml uses the published image and maps:
- 9876:9876
- ./config/app.db -> /app/app.db

If you want PostgreSQL locally, use the compose file under db/:

```bash
cd db
docker compose up -d
```

Then point DB_DRIVER and DB_URL to postgres in your .env.

## API reference

Base path: /api

### GET /api/registry

Query params:
- domain (required)

Example:

```http
GET /api/registry?domain=example.com
```

### GET /api/watcher

Query params:
- email (required)
- order (optional): domain, expires, notification_status, created
- sort (optional): asc, desc

### POST /api/watcher

Form fields:
- registry_id (UUID, required)
- email (required)

Behavior:
- Creates a new watcher if it does not exist
- If watcher exists but was soft-deleted, it is restored
- If watcher exists with notifications off, notifications are re-enabled

### PATCH /api/watcher/:id

Toggles notification_enabled for that watcher.

### DELETE /api/watcher/:id

Soft-deletes watcher subscription.

## Data model

Main tables:
- dw_registry: domain metadata, provider origin, registry dates
- dw_watcher: email subscriptions, notification state, soft-delete timestamps

Migrations are executed automatically at startup using GORM AutoMigrate.

## Providers and notifications

Providers:
- RDAP: default source (rdap.org)
- WhoisJSON: optional secondary source when API key is configured

Notifications:
- SMTP subscriber:
	- Generates HTML email from template
	- Sends to MAIL_TO and BCCs all active watchers for the domain
- Telegram subscriber:
	- Sends status message via Bot API to configured chat

## Frontend behavior

- Search Domains tab:
	- Looks up a domain
	- Shows parsed registry metadata
	- Allows one-click subscription with email

- My Domains tab:
	- Fetches subscriptions by email
	- Supports ordering and sorting
	- Lets users toggle notifications or remove watchers

## Testing status

No automated test suite is currently present in this repository.

## License

This project is distributed under the license included in LICENSE.
