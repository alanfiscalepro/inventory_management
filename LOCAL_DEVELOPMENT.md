# Local Development Guide

Complete guide for running the Inventory Manager application locally on your machine.

## Prerequisites

- **Docker Desktop** installed and running
  - Download from: https://www.docker.com/products/docker-desktop
  - Minimum 4GB RAM allocated to Docker
- **Git** (for cloning the repository)

## Quick Start (Recommended)

### One-Command Setup

```bash
# Make the setup script executable
chmod +x local-setup.sh

# Run the setup script
./local-setup.sh
```

That's it! The script will:
1. ✅ Check Docker is installed and running
2. ✅ Create `.env.local` with auto-generated JWT secret
3. ✅ Build all Docker images
4. ✅ Start PostgreSQL, Backend, and Frontend
5. ✅ Wait for all services to be healthy
6. ✅ Display access URLs and useful commands

### Access Your Application

Once setup is complete:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Database**: localhost:5432

## Manual Setup (Alternative)

If you prefer to set up manually:

### Step 1: Create Environment File

```bash
# Copy the example file
cp .env.local.example .env.local

# Generate a secure JWT secret
JWT_SECRET=$(openssl rand -base64 64)

# On macOS:
sed -i '' "s|JWT_SECRET=|JWT_SECRET=${JWT_SECRET}|g" .env.local

# On Linux:
sed -i "s|JWT_SECRET=|JWT_SECRET=${JWT_SECRET}|g" .env.local
```

### Step 2: Start Services

```bash
# Build and start all services
docker-compose -f docker-compose.local.yaml --env-file .env.local up -d

# View logs
docker-compose -f docker-compose.local.yaml logs -f
```

### Step 3: Wait for Services

Services will be ready when:
- PostgreSQL: About 10 seconds
- Backend: About 60-90 seconds (first time)
- Frontend: About 60-90 seconds (first time)

## Environment Configuration

### Default Local Settings

The `.env.local` file includes these defaults:

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `DB_NAME` | `inventory_db` | Database name |
| `DB_USER` | `postgres` | Database username |
| `DB_PASSWORD` | `postgres` | Database password |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` | Backend API URL |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | Frontend URL |
| `JWT_SECRET` | Auto-generated | JWT signing secret |
| `SPRING_PROFILES_ACTIVE` | `dev` | Spring Boot profile |
| `JPA_DDL_AUTO` | `update` | Auto-update database schema |
| `JPA_SHOW_SQL` | `true` | Show SQL queries in logs |

### Customizing Configuration

Edit `.env.local` to customize:

```bash
# Use a different database name
DB_NAME=my_inventory

# Change database credentials
DB_USER=myuser
DB_PASSWORD=mypassword

# Adjust Java memory
JAVA_OPTS=-Xms512m -Xmx1024m

# Change log levels
LOGGING_LEVEL_ROOT=DEBUG
LOGGING_LEVEL_APP=TRACE
```

Then restart services:
```bash
docker-compose -f docker-compose.local.yaml --env-file .env.local restart
```

## Common Tasks

### View Logs

```bash
# All services
docker-compose -f docker-compose.local.yaml logs -f

# Specific service
docker-compose -f docker-compose.local.yaml logs -f backend
docker-compose -f docker-compose.local.yaml logs -f frontend
docker-compose -f docker-compose.local.yaml logs -f postgres
```

### Stop Services

```bash
# Stop all services
docker-compose -f docker-compose.local.yaml down

# Stop and remove volumes (DELETES DATABASE!)
docker-compose -f docker-compose.local.yaml down -v
```

### Restart Services

```bash
# Restart all services
docker-compose -f docker-compose.local.yaml restart

# Restart specific service
docker-compose -f docker-compose.local.yaml restart backend
```

### Rebuild After Code Changes

```bash
# Rebuild and restart backend
docker-compose -f docker-compose.local.yaml up -d --build backend

# Rebuild and restart frontend
docker-compose -f docker-compose.local.yaml up -d --build frontend
```

### Check Service Status

```bash
# View running containers
docker-compose -f docker-compose.local.yaml ps

# Check health status
docker-compose -f docker-compose.local.yaml ps
```

### Access Database

```bash
# Connect to PostgreSQL using psql
docker-compose -f docker-compose.local.yaml exec postgres psql -U postgres -d inventory_db

# Or use any database client:
# Host: localhost
# Port: 5432
# Database: inventory_db
# User: postgres
# Password: postgres
```

### Execute Commands in Containers

```bash
# Backend shell
docker-compose -f docker-compose.local.yaml exec backend sh

# Frontend shell
docker-compose -f docker-compose.local.yaml exec frontend sh

# Database shell
docker-compose -f docker-compose.local.yaml exec postgres sh
```

## Development Workflow

### Making Backend Changes

1. Edit Java files in `backend/src/`
2. Rebuild and restart:
   ```bash
   docker-compose -f docker-compose.local.yaml up -d --build backend
   ```
3. View logs:
   ```bash
   docker-compose -f docker-compose.local.yaml logs -f backend
   ```

### Making Frontend Changes

1. Edit files in `frontend/`
2. Rebuild and restart:
   ```bash
   docker-compose -f docker-compose.local.yaml up -d --build frontend
   ```
3. View logs:
   ```bash
   docker-compose -f docker-compose.local.yaml logs -f frontend
   ```

### Database Schema Changes

The application uses `spring.jpa.hibernate.ddl-auto=update` in dev mode, which automatically updates the database schema when you change entities.

To reset the database:
```bash
# Stop services and remove volumes
docker-compose -f docker-compose.local.yaml down -v

# Start fresh
./local-setup.sh
```

## Testing the API

### Using curl

```bash
# Health check
curl http://localhost:8080/actuator/health

# Test endpoints (examples)
curl http://localhost:8080/api/warehouses
curl http://localhost:8080/api/products
```

### Using Postman or Insomnia

Import the API at: `http://localhost:8080`

Base URL: `http://localhost:8080/api`

## Troubleshooting

### Docker Not Running

**Error**: `Cannot connect to the Docker daemon`

**Solution**:
- Open Docker Desktop
- Wait for it to fully start (Docker icon in menu bar shows "running")
- Try again

### Port Already in Use

**Error**: `Bind for 0.0.0.0:8080 failed: port is already allocated`

**Solution**:
```bash
# Find what's using the port
lsof -i :8080  # or :3000 or :5432

# Kill the process or stop that service
# Then try again
```

Or change ports in `.env.local`:
```bash
# Use different ports
echo "BACKEND_PORT=8081" >> .env.local
echo "FRONTEND_PORT=3001" >> .env.local
```

### Backend Won't Start

**Check logs**:
```bash
docker-compose -f docker-compose.local.yaml logs backend
```

**Common issues**:
1. **Database not ready**: Wait 30 seconds and check again
2. **Missing JWT_SECRET**: Run `./local-setup.sh` to regenerate
3. **Port conflict**: Change `BACKEND_PORT` in `.env.local`

### Frontend Won't Start

**Check logs**:
```bash
docker-compose -f docker-compose.local.yaml logs frontend
```

**Common issues**:
1. **Cannot connect to backend**: Verify backend is running at `localhost:8080`
2. **Build errors**: Rebuild with `--no-cache`:
   ```bash
   docker-compose -f docker-compose.local.yaml build --no-cache frontend
   ```

### Database Connection Errors

**Check PostgreSQL is running**:
```bash
docker-compose -f docker-compose.local.yaml ps postgres
```

**Test connection**:
```bash
docker-compose -f docker-compose.local.yaml exec postgres pg_isready -U postgres
```

**Reset database**:
```bash
docker-compose -f docker-compose.local.yaml down -v
./local-setup.sh
```

### Out of Memory Errors

**Increase Docker memory**:
1. Open Docker Desktop
2. Settings → Resources
3. Increase Memory to at least 4GB
4. Click "Apply & Restart"

**Reduce Java heap**:
```bash
# In .env.local
JAVA_OPTS=-Xms256m -Xmx512m
```

### Clean Slate Reset

Start completely fresh:

```bash
# Stop everything
docker-compose -f docker-compose.local.yaml down -v

# Remove all images (optional)
docker-compose -f docker-compose.local.yaml down --rmi all

# Remove .env.local
rm .env.local

# Start fresh
./local-setup.sh
```

## Performance Tips

### Speed Up Builds

**Use BuildKit** (add to ~/.zshrc or ~/.bashrc):
```bash
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
```

### Reduce Build Time

**Layer caching**: Dependencies are cached, only code changes trigger rebuild

**Parallel builds**: Docker Compose builds services in parallel automatically

## Useful Commands Reference

```bash
# Start everything
./local-setup.sh

# Stop everything
docker-compose -f docker-compose.local.yaml down

# Restart a service
docker-compose -f docker-compose.local.yaml restart backend

# View logs
docker-compose -f docker-compose.local.yaml logs -f

# Rebuild a service
docker-compose -f docker-compose.local.yaml up -d --build backend

# Check status
docker-compose -f docker-compose.local.yaml ps

# Clean everything
docker-compose -f docker-compose.local.yaml down -v

# Execute command in container
docker-compose -f docker-compose.local.yaml exec backend sh

# View resource usage
docker stats
```

## Next Steps

Once your local environment is running:

1. **Test the Frontend**: Open http://localhost:3000
2. **Test the Backend API**: Use curl or Postman with http://localhost:8080/api
3. **Access Database**: Connect using your favorite SQL client
4. **Make Changes**: Edit code and rebuild services as needed
5. **Deploy to Production**: Follow DEPLOYMENT_GUIDE.md when ready

## Getting Help

- **Check Logs**: Always start with `docker-compose -f docker-compose.local.yaml logs -f`
- **GitHub Issues**: https://github.com/alanfiscalepro/inventory_management/issues
- **Docker Docs**: https://docs.docker.com/
- **Spring Boot Docs**: https://spring.io/projects/spring-boot
- **Next.js Docs**: https://nextjs.org/docs
