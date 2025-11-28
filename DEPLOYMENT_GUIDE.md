# Inventory Manager - Deployment Guide

This guide covers deploying the backend and frontend services separately using Docker Compose.

## Prerequisites

- Docker and Docker Compose installed
- PostgreSQL database (can be external or in a separate container)
- Git

## Architecture

The application is split into two independent services:
- **Backend**: Spring Boot REST API (Port 8080)
- **Frontend**: Next.js application (Port 3000)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/alanfiscalepro/inventory_management.git
cd inventory_management
```

### 2. Set Up Environment Variables

#### Backend Environment

```bash
cp .env.backend.example .env.backend
```

Edit `.env.backend` and configure:
- Database credentials (`DB_HOST`, `DB_PASSWORD`, etc.)
- JWT secret key (`JWT_SECRET`) - **REQUIRED**
- CORS origins (`CORS_ALLOWED_ORIGINS`)

**Important:** Generate a secure JWT secret key:
```bash
openssl rand -base64 64
```

#### Frontend Environment

```bash
cp .env.frontend.example .env.frontend
```

Edit `.env.frontend` and configure:
- Backend API URL (`NEXT_PUBLIC_API_URL`)

### 3. Deploy Backend

```bash
docker-compose -f docker-compose.backend.yaml --env-file .env.backend up -d
```

Verify backend is running:
```bash
curl http://localhost:8080/actuator/health
```

### 4. Deploy Frontend

```bash
docker-compose -f docker-compose.frontend.yaml --env-file .env.frontend up -d
```

Verify frontend is running:
```bash
curl http://localhost:3000
```

## Backend Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | Database host | `postgres` or `db.example.com` |
| `DB_PORT` | Database port | `5432` |
| `DB_NAME` | Database name | `inventory_db` |
| `DB_USER` | Database username | `postgres` |
| `DB_PASSWORD` | Database password | `your_secure_password` |
| `JWT_SECRET` | JWT signing secret (256+ bits) | Generate with `openssl rand -base64 64` |

### Optional Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `EXTERNAL_PORT` | External port mapping | `8080` |
| `SPRING_PROFILES_ACTIVE` | Spring profile | `prod` |
| `JAVA_OPTS` | JVM options | `-Xms512m -Xmx1024m` |
| `CORS_ALLOWED_ORIGINS` | Allowed CORS origins | `http://localhost:3000` |
| `JPA_DDL_AUTO` | Hibernate DDL mode | `update` |

### Database Setup

The backend requires a PostgreSQL database. You can either:

1. **Use an external database** (recommended for production)
2. **Run PostgreSQL in Docker**:

```bash
docker run -d \
  --name inventory-postgres \
  --network inventory-network \
  -e POSTGRES_DB=inventory_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  postgres:15-alpine
```

## Frontend Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8080` or `https://api.example.com` |

### Optional Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `FRONTEND_PORT` | Frontend port | `3000` |
| `NODE_ENV` | Node environment | `production` |

## Deployment on Coolify

### Backend Deployment

1. Create a new service in Coolify
2. Set the source to your Git repository
3. Set the build pack to `docker-compose`
4. Point to `docker-compose.backend.yaml`
5. Add environment variables from `.env.backend.example`
6. Deploy

### Frontend Deployment

1. Create a new service in Coolify
2. Set the source to your Git repository
3. Set the build pack to `docker-compose`
4. Point to `docker-compose.frontend.yaml`
5. Add environment variables from `.env.frontend.example`
6. Deploy

## Production Considerations

### Security

1. **JWT Secret**: Use a strong, random secret key (256+ bits)
   ```bash
   openssl rand -base64 64
   ```

2. **Database Password**: Use a strong password
   ```bash
   openssl rand -base64 32
   ```

3. **CORS**: Restrict `CORS_ALLOWED_ORIGINS` to your frontend domain only
   ```
   CORS_ALLOWED_ORIGINS=https://inventory.yourdomain.com
   ```

4. **Environment Variables**: Never commit `.env` files to Git

### Performance

1. **Java Memory**: Adjust `JAVA_OPTS` based on your server capacity
   ```
   JAVA_OPTS=-Xms1g -Xmx2g
   ```

2. **Database Pool**: Adjust HikariCP settings for your load
   ```
   HIKARI_MAX_POOL_SIZE=50
   HIKARI_MIN_IDLE=10
   ```

3. **JPA DDL**: Use `validate` or `none` in production
   ```
   JPA_DDL_AUTO=validate
   ```

### Monitoring

1. **Health Check Endpoints**:
   - Backend: `http://localhost:8080/actuator/health`
   - Frontend: `http://localhost:3000`

2. **Logs**:
   ```bash
   # Backend logs
   docker-compose -f docker-compose.backend.yaml logs -f backend

   # Frontend logs
   docker-compose -f docker-compose.frontend.yaml logs -f frontend
   ```

3. **Backend Actuator Endpoints** (if enabled):
   - `/actuator/health` - Health status
   - `/actuator/info` - Application info
   - `/actuator/metrics` - Metrics

## Troubleshooting

### Backend Issues

1. **Database Connection Errors**:
   - Verify database is running and accessible
   - Check `DB_HOST`, `DB_PORT`, `DB_NAME` are correct
   - Ensure network connectivity between containers

2. **Port Already in Use**:
   ```bash
   # Change EXTERNAL_PORT in .env.backend
   EXTERNAL_PORT=8081
   ```

3. **Out of Memory**:
   ```bash
   # Increase Java heap size
   JAVA_OPTS=-Xms1g -Xmx2g
   ```

### Frontend Issues

1. **Cannot Connect to Backend**:
   - Verify `NEXT_PUBLIC_API_URL` is correct
   - Check CORS settings in backend
   - Ensure backend is running and accessible

2. **Build Failures**:
   - Check Node version compatibility
   - Clear build cache: `docker-compose -f docker-compose.frontend.yaml build --no-cache`

## Useful Commands

### View Logs
```bash
# Backend
docker-compose -f docker-compose.backend.yaml logs -f

# Frontend
docker-compose -f docker-compose.frontend.yaml logs -f
```

### Restart Services
```bash
# Backend
docker-compose -f docker-compose.backend.yaml restart

# Frontend
docker-compose -f docker-compose.frontend.yaml restart
```

### Stop Services
```bash
# Backend
docker-compose -f docker-compose.backend.yaml down

# Frontend
docker-compose -f docker-compose.frontend.yaml down
```

### Rebuild and Deploy
```bash
# Backend
docker-compose -f docker-compose.backend.yaml up -d --build

# Frontend
docker-compose -f docker-compose.frontend.yaml up -d --build
```

### Clean Up Everything
```bash
# Stop and remove containers, networks, volumes
docker-compose -f docker-compose.backend.yaml down -v
docker-compose -f docker-compose.frontend.yaml down -v
```

## Support

For issues or questions:
- GitHub Issues: https://github.com/alanfiscalepro/inventory_management/issues
- Check logs for error messages
- Verify all environment variables are set correctly
