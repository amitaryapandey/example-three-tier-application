# example-three-tier-application

A reference implementation of a three-tier web application: a Next.js frontend, an Express REST API, and a PostgreSQL database. It runs locally with Docker Compose and deploys to Google Cloud Platform (Cloud Run + Cloud SQL) via Terraform.

## Architecture

```
Browser → Web (Next.js :3000) → API (Express :3001) → PostgreSQL
```

| Layer | Technology | Location |
|-------|-----------|----------|
| Frontend | Next.js 16, React 19, Tailwind CSS | `src/web/` |
| API | Express 5, Node.js 22 | `src/api/` |
| Database | PostgreSQL 17 | managed by Docker / Cloud SQL |
| Migrations | node-pg-migrate | `src/db/` |
| Infrastructure | Terraform (GCP) | `src/infrastructure/` |

The app is a simple task manager (to-do list) that demonstrates how the three tiers communicate.

## Installation, Running, and Testing

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose plugin)
- [Node.js 22+](https://nodejs.org/) (for local development and testing without Docker)
- [Git](https://git-scm.com/)

### Quick Start with Docker Compose

The fastest way to get the entire application running:

```bash
# Clone the repository
git clone https://github.com/amitaryapandey/example-three-tier-application.git
cd example-three-tier-application

# Start all services (database, migrations, API, web)
docker compose up --build
```

Once the output shows "ready - started server on 0.0.0.0:3000", open [http://localhost:3000](http://localhost:3000) in your browser.

**Note**: The first build may take 60–120 seconds. Subsequent runs are faster.

### Local Development (Without Docker)

To develop and test individual tiers locally:

#### 1. Start PostgreSQL

```bash
# Using Docker (recommended)
docker run --name postgres-dev -e POSTGRES_DB=app -e POSTGRES_USER=app -e POSTGRES_PASSWORD=app -p 5432:5432 -d postgres:17-alpine

# Or use an existing Postgres installation
# Ensure DATABASE_URL is set: postgres://app:app@localhost:5432/app
```

#### 2. Run Database Migrations

```bash
cd src/db
npm install
DATABASE_URL=postgres://app:app@localhost:5432/app npm run migrate
```

#### 3. Start the API Server

```bash
cd src/api
npm install
DATABASE_URL=postgres://app:app@localhost:5432/app npm run dev
```

The API will be available at `http://localhost:3001`.

#### 4. Start the Web Frontend

In a new terminal:

```bash
cd src/web
npm install
API_URL=http://localhost:3001 npm run dev
```

The web app will be available at `http://localhost:3000`.

### Testing

#### Manual Testing

1. **Health Check**: Verify the API is running:
   ```bash
   curl http://localhost:3001/health
   # Expected: { "status": "ok" }
   ```

2. **Create a Task**: 
   ```bash
   curl -X POST http://localhost:3001/tasks \
     -H "Content-Type: application/json" \
     -d '{"title": "Test task"}'
   ```

3. **List Tasks**:
   ```bash
   curl http://localhost:3001/tasks
   ```

4. **Update a Task**:
   ```bash
   curl -X PATCH http://localhost:3001/tasks/1 \
     -H "Content-Type: application/json" \
     -d '{"completed": true}'
   ```

5. **Web UI**: Open [http://localhost:3000](http://localhost:3000) and interact with the task manager interface.

#### Linting

Lint the web tier (the only tier with ESLint configured):

```bash
cd src/web
npm install
npm run lint
```

#### Type Checking

Type-check the web tier (TypeScript strict mode):

```bash
cd src/web
npm install
npx tsc --noEmit
```

#### Building

Build the web tier for production:

```bash
cd src/web
npm install
npm run build
```

This generates optimized output in `.next/`.

#### Full Stack Verification

Before pushing changes, run this complete verification:

```bash
# 1. Start the full stack
docker compose up --build

# 2. In another terminal, lint the web tier
cd src/web
npm run lint

# 3. Type-check the web tier
npx tsc --noEmit

# 4. Build the web tier
npm run build

# 5. Test the API manually
curl http://localhost:3001/health
curl http://localhost:3001/tasks

# 6. Test the web UI
# Open http://localhost:3000 and create/update a task
```

### Stopping and Cleaning Up

```bash
# Stop containers (keeps database data)
docker compose down

# Stop and delete all data (fresh start)
docker compose down -v

# Stop local development servers
# Press Ctrl+C in each terminal
```

### Troubleshooting

**Docker Compose takes too long to build**:
- Pull images first: `docker compose pull`
- Build images separately: `docker compose build`

**Port 3000 or 3001 already in use**:
- Change the port in `docker-compose.yml` or use `docker compose -p <project-name> up`
- For local development, set `PORT` environment variable before running `npm run dev`

**Database connection errors**:
- Ensure PostgreSQL is running and `DATABASE_URL` is set correctly
- Check that the database user `app` exists with password `app`
- Verify the database `app` exists

**Migrations fail**:
- Check that PostgreSQL is healthy: `docker compose logs postgres`
- Manually run migrations: `cd src/db && DATABASE_URL=... npm run migrate`
- View migration status: `DATABASE_URL=... npx node-pg-migrate status`

**Next.js build fails with memory errors**:
- Increase Docker memory limit in Docker Desktop settings
- Build incrementally: `npm run build` in `src/web/` separately before `docker compose up`

## Running locally with Docker Compose

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose plugin)

### Start the stack

```bash
docker compose up --build
```

This starts four services in order:

1. **postgres** — PostgreSQL 17 database, waits until healthy
2. **migrate** — runs `node-pg-migrate up` to apply schema migrations, then exits
3. **api** — Express API on port 3001 (internal only)
4. **web** — Next.js frontend on port 3000 (exposed to host)

Once running, open [http://localhost:3000](http://localhost:3000).

### Stop and clean up

```bash
# Stop containers (keeps the postgres_data volume)
docker compose down

# Stop and delete all data
docker compose down -v
```

### Rebuild after code changes

```bash
docker compose up --build
```

### API endpoints

The API is not exposed directly, but you can reach it through the web container or by temporarily mapping its port:

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/tasks` | List all tasks |
| POST | `/tasks` | Create a task (`{ "title": "..." }`) |
| PATCH | `/tasks/:id` | Update a task (`{ "completed": true }` or `{ "title": "..." }`) |

## Project structure

```
src/
├── api/            # Express REST API
│   ├── index.js    # Route handlers
│   ├── db.js       # PostgreSQL connection pool
│   └── Dockerfile
├── db/             # Database migrations
│   ├── migrations/ # node-pg-migrate migration files
│   └── Dockerfile
├── web/            # Next.js frontend
│   ├── app/        # App Router pages and components
│   └── Dockerfile
└── infrastructure/ # Terraform for GCP deployment
    ├── main.tf
    ├── variables.tf
    └── outputs.tf
```

## Deploying to GCP

The `src/infrastructure/` directory contains Terraform that provisions:

- VPC network and subnet
- Cloud SQL PostgreSQL 17 instance (private IP)
- Cloud Run services for the API and web frontend
- Secret Manager secret for the database URL
- Service accounts and IAM bindings

### Required variables

| Variable | Description |
|----------|-------------|
| `project_id` | GCP project ID |
| `api_image` | Container image URI for the API (e.g. `gcr.io/PROJECT/api:TAG`) |
| `web_image` | Container image URI for the web frontend |
| `region` | GCP region (default: `us-central1`) |
| `environment` | `dev`, `staging`, or `prod` (default: `dev`) |

```bash
cd src/infrastructure
terraform init
terraform apply -var="project_id=my-project" \
                -var="api_image=gcr.io/my-project/api:latest" \
                -var="web_image=gcr.io/my-project/web:latest"
```

After apply, `terraform output web_url` gives the public URL.

## Database migrations

Migrations live in `src/db/migrations/` and use [node-pg-migrate](https://salsita.github.io/node-pg-migrate/).

```bash
# Apply all pending migrations (run inside the db container or with DATABASE_URL set)
cd src/db
DATABASE_URL=postgres://app:app@localhost:5432/app npx node-pg-migrate up

# Roll back the last migration
DATABASE_URL=postgres://app:app@localhost:5432/app npx node-pg-migrate down
```

When running via Docker Compose the `migrate` service handles this automatically on startup.
