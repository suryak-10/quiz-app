# Office Quiz Docker Setup

This repository uses the current project layout:

- frontend at the repo root
- backend in `server/`

The Docker setup keeps that layout as-is and provides a development workflow with hot reload for both services.

## Services

- Frontend: Vite + React on `http://localhost:5173`
- Backend: Express API on `http://localhost:3000`

The frontend continues to use Vite proxying for `/api` and `/uploads`. In Docker, `VITE_API_URL=http://backend:3000` is provided by Compose so the proxy can reach the backend container. Outside Docker, the proxy falls back to `http://localhost:3000`.

## Requirements

- Docker
- Docker Compose

## Build

```bash
docker compose build
```

## Start

```bash
docker compose up
```

## Start Detached

```bash
docker compose up -d
```

## Stop

```bash
docker compose down
```

## Rebuild And Start

```bash
docker compose up --build
```

## Development Behavior

- Frontend source is bind-mounted into the container.
- Backend source is bind-mounted into the container.
- `node_modules` stay inside each container.
- Frontend runs with Vite HMR on `0.0.0.0:5173`.
- Backend runs with nodemon on `0.0.0.0:3000`.

## Persistence

These backend directories are persisted through bind mounts:

- `server/uploads`
- `server/db`

That means uploaded quiz images and JSON database files survive container restarts.

## Expected Result

After running:

```bash
docker compose up
```

You should be able to access:

- `http://localhost:5173`
- `http://localhost:3000`

Changes to React or Express source files should reload automatically without rebuilding the Docker images.
