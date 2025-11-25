# Development Environment Guide

## Current Architecture
The application runs with two main components:
- **PostgreSQL Database**: Always in Docker container
- **Node.js Backend**: Can run in Docker or locally

## Development Workflow Options

### Option 1: Full Docker Development (Current Setup)
**When to use**: Testing, production-like environment, CI/CD
```bash
# Start both services
docker compose up --build -d

# View logs
docker compose logs -f backend

# Stop services
docker compose down
```

### Option 2: Hybrid Development (Recommended for Development)
**When to use**: Active development with fast iteration
```bash
# Start only database
docker compose up db -d

# Run backend locally (in backend folder)
npm run dev:local

# This uses .env.local with localhost database connection
```

### Option 3: Full Local Development
**When to use**: Complete local setup without Docker
- Requires local PostgreSQL installation
- Use `.env.local` configuration
- Not recommended due to environment complexity

## Environment Files

| File | Purpose | Database Host | Use Case |
|------|---------|---------------|----------|
| `.env.docker` | Docker containers | `db` | Full Docker setup |
| `.env.local` | Local development | `localhost` | Hybrid development |
| `.env.production` | Production | `db` | Production deployment |

## Quick Commands

```bash
# Development
npm run dev:local      # Local backend + Docker DB
npm run dev:docker     # Copy Docker env and run locally
npm run docker:up      # Start both containers
npm run docker:down    # Stop containers
npm run docker:logs    # View backend logs

# API Testing (requires containers running)
curl http://localhost:3010/api/candidates
```

## Important Notes

1. **API Testing**: Always requires both services running (either full Docker or hybrid)
2. **Database**: PostgreSQL should always run in Docker for consistency
3. **File Storage**: Volumes are mapped between host and container
4. **Hot Reload**: Only available when running backend locally with `npm run dev:local`

## Production Considerations

- Use Docker secrets for sensitive data
- Implement proper logging and monitoring
- Consider container orchestration (Kubernetes)
- Set up CI/CD pipelines
- Database migrations strategy
- Load balancing for multiple backend instances