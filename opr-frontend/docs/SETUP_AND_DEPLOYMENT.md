## Setup and Deployment — OPR Frontend

---

Detailed environment variables (expanded)

Below is a more complete list with purpose and examples. Keep secrets out of the repo and use env management.

- `API_BASE_URL` — backend base URL (e.g., https://api.example.com)
- `NEXT_PUBLIC_API_BASE_URL` — client-side URL used by browser code (e.g., https://api.example.com)
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — Google OAuth client id
- `OAUTH_REDIRECT_URI` — redirect URI used in OAuth flows
- `SENTRY_DSN` — Sentry project DSN for client-side errors (optional)
- `ANALYTICS_WRITE_KEY` — analytics service key (optional)
- `NEXT_PUBLIC_FEATURE_FLAG_X` — feature flag for client toggles
- `NODE_ENV` — environment indicator (development|production)
- `DOCKER_REGISTRY` — image registry for CI/CD pipelines

Example docker-compose override for local secure secrets

```yaml
version: '3.8'
services:
  frontend:
    build: ./opr-frontend
    ports:
      - '3000:3000'
    environment:
      - NEXT_PUBLIC_API_BASE_URL=http://backend:8000
      - NODE_ENV=development
    depends_on:
      - backend
  backend:
    build: ./spring-service
    ports:
      - '8000:8000'
```

Docker debugging tips

- Use `docker compose logs -f frontend` to follow logs.
- Use `docker compose exec frontend /bin/bash` to open a shell in the container and run `pnpm build` or check files.

CI sample (GitHub Actions) — build, test, deploy snippet

```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - name: Install
        run: pnpm install
      - name: Lint
        run: pnpm lint
      - name: Test
        run: pnpm test -- --ci
      - name: Build
        run: pnpm build
      - name: Build Docker image
        run: |
          docker build -t ${{ secrets.DOCKER_REGISTRY }}/autoweave-frontend:${{ github.sha }} -f opr-frontend/Dockerfile .
```

Production deployment patterns

- Serverless/static: Vercel for Next.js with environment variables set in project settings. Use preview deployments for PRs.
- Containerized: Push built image to registry, deploy via Kubernetes or ECS with proper health checks, autoscaling groups, and secrets stored in vault.

Cache and asset optimization

- Use HTTP caching and CDN (Cache-Control headers) for static files.
- Enable image optimization and sizing.

Rollback strategy

- For containerized deploys: keep previous image tag and roll back by updating the deployment manifest to the earlier tag.
- For Vercel: use the Vercel UI to rollback to previous deployment.

Monitoring & alerting

- Integrate Sentry for client errors and Prometheus/Grafana for backend metrics.
- Add lightweight synthetic checks for key flows (login, save workflow, run workflow).

This document describes local development setup, required environment variables, Docker setup (frontend + backend), build and optimization steps, and deployment guidance for production.

Audience
- Developers who want to run the app locally, CI/CD engineers, and platform teams.

Prerequisites
- Node.js (recommended LTS >=18)
- pnpm or npm (project uses pnpm where available)
- Docker and docker-compose for local multi-service runs
- Git and a code editor (VS Code recommended)

Local development setup

1) Clone repo

```bash
git clone git@github.com:ScorchedPearl/Autoweave.git
cd Autoweave/opr-frontend
```

2) Install dependencies

```bash
pnpm install
# or
npm install
```

3) Environment variables

Create a `.env.local` at the project root or use your environment manager. Minimal variables:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NODE_ENV=development
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<google-client-id>
```

Backend-specific envs (when running with backend locally)

```
API_BASE_URL=http://localhost:8000
DB_CONNECTION_STRING=postgres://user:pass@localhost:5432/autoweave
```

4) Run frontend locally

```bash
pnpm dev
# or
npm run dev
```

5) Run frontend with backend (docker-compose)

We include a top-level `docker-compose.yml` that can spin up frontend, the python/langchain service, and the spring backend. To run locally:

```bash
docker compose up --build
```

This will build services and run them. The frontend typically available at http://localhost:3000 and backend at http://localhost:8000 depending on compose config.

Environment variables required (full list)
- `API_BASE_URL` — backend base URL
- `NEXT_PUBLIC_API_BASE_URL` — frontend base URL used by client-side code
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — Google OAuth client id
- `OAUTH_REDIRECT_URI` — redirect URI for OAuth flows
- `SENTRY_DSN` — optional for error reporting
- `NODE_ENV` — production/development

Docker setup notes

- The repository contains service definitions in `docker-compose.yml`. Services included:
  - frontend (opr-frontend)
  - langchain-service
  - spring-service (backend)

- When running with Docker, ensure environment variable overrides are provided in `.env` or via Docker secrets for sensitive values.

Building for production

1) Build static assets

```bash
pnpm build
# or
npm run build
```

2) Preview production build locally

```bash
pnpm start
# or
npm run start
```

Optimizations
- Use Next.js image optimization and static rendering where possible.
- Lazy-load heavy components (editor/demo) using dynamic imports with ssr: false.
- Tree-shake: avoid importing entire editor libraries in landing pages.

CI/CD pipeline suggestions

- Steps:
  - Install dependencies
  - Run lint and tests
  - Build frontend (pnpm build)
  - Optionally run a smoke test against built artifacts
  - Publish artifacts or build docker image

Docker image build (example)

```bash
docker build -t autoweave-frontend:latest -f opr-frontend/Dockerfile .
```

Deploying to production

Options:
- Static host: Vercel/Netlify (recommended for Next.js frontends) — configure environment variables in host UI and deploy via Git integrations.
- Containerized deploy: build docker image and deploy to Kubernetes or ECS. Use an ingress and TLS via cert-manager or ACM.

Security & runtime

- Use secure cookies and SameSite policy for auth.
- Ensure CORS is configured on backend to allow frontend origins.

Troubleshooting common setup issues

- Port conflicts: verify ports (3000 for frontend, 8000 for backend) and ensure no other services are running.
- env vars missing: check `console` for warnings and ensure `.env.local` is loaded.
- Docker build failures: run `docker compose build` with `--no-cache` to force fresh builds and inspect logs.

Backing services & scaling

- For production, ensure backend and long-running services (langchain, worker queues) are scaled separately; frontend can be horizontally scaled behind CDN.

Maintenance & housekeeping

- Keep `Dockerfile` and `docker-compose.yml` updated when adding environment variables or services.
- Provide brief `README` snippets in each service folder with service-specific run instructions.


