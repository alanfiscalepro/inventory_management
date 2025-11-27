# Deployment Guide - Coolify

This guide will help you deploy the Warehouse Management System to Coolify using Docker Compose.

## Prerequisites

1. **Coolify Instance**: You need a running Coolify instance
2. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, etc.)
3. **Domain** (optional): A domain name for your application

## Deployment Steps

### 1. Prepare Your Repository

Ensure all files are committed:
```bash
git add .
git commit -m "Prepare for Coolify deployment"
git push origin main
```

### 2. Create New Application in Coolify

1. Log into your Coolify dashboard
2. Click **"+ New Resource"**
3. Select **"Application"**
4. Choose **"Public Repository"** (or connect your Git provider)
5. Enter your repository URL
6. Select the branch (e.g., `main`)

### 3. Configure Build Settings

In the application settings:

**Build Pack**: Select `Docker Compose`

**Docker Compose File**: `docker-compose.yml` (default)

### 4. Set Environment Variables

In Coolify, go to **Environment Variables** and add:

#### Required Variables:
```env
# Database Configuration
POSTGRES_DB=warehouse_db
POSTGRES_USER=warehouse_user
POSTGRES_PASSWORD=<strong-random-password>

# Frontend API URL (replace with your domain)
NEXT_PUBLIC_API_URL=https://your-domain.com/api
```

#### Optional Variables:
```env
# Spring Boot Configuration
SPRING_JPA_HIBERNATE_DDL_AUTO=update
SPRING_JPA_SHOW_SQL=false

# Redis Configuration (if using external Redis)
SPRING_REDIS_HOST=redis
SPRING_REDIS_PORT=6379
```

### 5. Configure Domains

#### Single Domain Setup:
If you're using one domain for both frontend and backend:

1. **Frontend**: `yourdomain.com` → Port 3000
2. **Backend**: `yourdomain.com/api` → Port 8080

Configure reverse proxy rules in Coolify:
- Path `/api/*` → backend:8080
- Path `/*` → frontend:3000

#### Separate Domains Setup:
If using separate domains:

1. **Frontend**: `app.yourdomain.com` → Port 3000
2. **Backend**: `api.yourdomain.com` → Port 8080

Update `NEXT_PUBLIC_API_URL`:
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

### 6. Configure Persistent Storage

Coolify automatically handles volumes defined in `docker-compose.yml`:
- `postgres_data` - PostgreSQL database
- `redis_data` - Redis cache

These volumes persist across deployments.

### 7. Deploy

1. Click **"Deploy"** in Coolify
2. Monitor the build logs
3. Wait for all services to start (this may take 2-5 minutes on first deploy)

### 8. Verify Deployment

Check these endpoints:

1. **Health Check**: `https://api.yourdomain.com/actuator/health`
   - Should return: `{"status":"UP"}`

2. **Frontend**: `https://yourdomain.com`
   - Dashboard should load

3. **API**: Test an endpoint like `https://api.yourdomain.com/api/warehouses`

## Post-Deployment Configuration

### 1. Enable HTTPS

Coolify automatically provisions SSL certificates via Let's Encrypt:
1. Go to your application settings
2. Enable **"Generate Let's Encrypt Certificate"**
3. Wait for certificate generation (2-3 minutes)

### 2. Configure Health Checks

Coolify will automatically use the health checks defined in `docker-compose.yml`:

**Backend Health Check**:
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### 3. Set Up Monitoring

In Coolify:
1. Enable **"Application Logs"** to view container logs
2. Set up **"Notifications"** for deployment failures
3. Monitor resource usage in the dashboard

## Environment-Specific Configuration

### Production Settings

Update these for production:

```env
# Database - Use strong passwords
POSTGRES_PASSWORD=<very-strong-password-here>

# Spring Boot - Disable debug features
SPRING_JPA_SHOW_SQL=false
LOG_LEVEL=INFO

# Frontend - Use production API URL
NEXT_PUBLIC_API_URL=https://api.your-production-domain.com/api
```

### Staging/Development

```env
# Less strict settings for staging
SPRING_JPA_SHOW_SQL=true
LOG_LEVEL=DEBUG
```

## Scaling Considerations

### Horizontal Scaling

To scale services in Coolify:
1. Edit `docker-compose.yml` to add `deploy.replicas`
2. Configure load balancer in Coolify
3. Ensure session management is stateless

Example:
```yaml
backend:
  deploy:
    replicas: 3
```

### Resource Limits

Add resource limits to prevent issues:

```yaml
backend:
  deploy:
    resources:
      limits:
        cpus: '1.0'
        memory: 2048M
      reservations:
        cpus: '0.5'
        memory: 512M
```

## Troubleshooting

### Backend Not Starting

**Check logs**:
```bash
# In Coolify, view application logs
# Or if you have shell access:
docker-compose logs backend
```

**Common issues**:
- Database not ready: Wait for PostgreSQL health check
- Port conflicts: Ensure ports 3000, 8080, 5432, 6379 are available
- Environment variables: Verify all required variables are set

### Frontend Build Fails

**Common issues**:
- Missing environment variables during build
- Node.js out of memory: Increase Docker memory limit
- Dependency issues: Clear node_modules and rebuild

**Solution**:
```yaml
frontend:
  build:
    args:
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
```

### Database Connection Issues

**Check**:
1. PostgreSQL is healthy: `docker-compose ps`
2. Connection string is correct
3. Database credentials match

**Test connection**:
```bash
docker-compose exec postgres psql -U warehouse_user -d warehouse_db
```

### Redis Connection Issues

**Check Redis**:
```bash
docker-compose exec redis redis-cli ping
# Should return: PONG
```

## Backup Strategy

### Database Backups

Create automated backups in Coolify:

1. Go to PostgreSQL service settings
2. Enable **"Scheduled Backups"**
3. Set backup frequency (daily recommended)
4. Configure backup retention

**Manual backup**:
```bash
docker-compose exec postgres pg_dump -U warehouse_user warehouse_db > backup.sql
```

**Restore**:
```bash
docker-compose exec -T postgres psql -U warehouse_user warehouse_db < backup.sql
```

### Volume Backups

Coolify can backup Docker volumes:
1. Go to application settings
2. Enable **"Volume Backups"**
3. Configure backup schedule

## Rolling Updates

Coolify supports zero-downtime deployments:

1. **Enable Health Checks**: Ensure all services have health checks
2. **Configure Update Strategy**:
   ```yaml
   deploy:
     update_config:
       parallelism: 1
       delay: 10s
       order: start-first
   ```
3. **Deploy**: Coolify will gradually update containers

## Monitoring & Logs

### Application Logs

View logs in Coolify:
- Real-time log streaming
- Historical log search
- Download logs for analysis

### Performance Monitoring

Monitor these metrics:
- **CPU Usage**: Should stay below 80%
- **Memory Usage**: Watch for memory leaks
- **Disk Usage**: Monitor PostgreSQL growth
- **Response Times**: API latency

### Alerts

Set up alerts in Coolify for:
- Service down
- High resource usage
- Deployment failures
- Health check failures

## Security Best Practices

1. **Environment Variables**: Never commit secrets to Git
2. **SSL/TLS**: Always use HTTPS in production
3. **Database**: Use strong passwords
4. **CORS**: Configure allowed origins properly
5. **Rate Limiting**: Implement API rate limiting
6. **Updates**: Keep dependencies updated

## Cost Optimization

1. **Resource Limits**: Set appropriate CPU/memory limits
2. **Caching**: Redis reduces database load
3. **Static Assets**: Use CDN for frontend assets
4. **Database**: Regular VACUUM and ANALYZE
5. **Logs**: Set log retention policies

## Support

For Coolify-specific issues:
- [Coolify Documentation](https://coolify.io/docs)
- [Coolify Discord](https://discord.gg/coolify)
- [GitHub Issues](https://github.com/coollabsio/coolify/issues)

For application issues:
- Check application logs
- Review this repository's README.md
- Create an issue in the project repository
