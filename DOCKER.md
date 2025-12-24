# 🐳 Docker Deployment Guide

## 🚀 Quick Start

### 1. Prerequisites

- Docker Desktop installed
- Docker Compose v2.0+
- 4GB RAM minimum
- 10GB disk space

### 2. Setup Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your credentials
# Required:
# - SPOTIFY_CLIENT_ID
# - SPOTIFY_CLIENT_SECRET
```

### 3. Build and Run

```bash
# Build and start all services
docker compose up --build

# Or run in detached mode
docker compose up -d --build
```

### 4. Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3000/api/health
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## 📦 Services

### Backend (Node.js)
- **Port**: 3000
- **Health Check**: `/api/health`
- **Logs**: `./logs/`

### PostgreSQL
- **Port**: 5432
- **Database**: `musicmood`
- **User**: `musicmood`
- **Password**: `musicmood`
- **Data**: Persisted in `postgres-data` volume

### Redis
- **Port**: 6379
- **Data**: Persisted in `redis-data` volume
- **Persistence**: AOF enabled

## 🔧 Debug Tools (Optional)

### Start with Debug Tools

```bash
docker compose --profile debug up -d
```

### Redis Commander
- **URL**: http://localhost:8081
- **Purpose**: Browse Redis keys and values

### pgAdmin
- **URL**: http://localhost:8080
- **Email**: admin@musicmood.com
- **Password**: admin
- **Purpose**: Manage PostgreSQL database

## 📝 Common Commands

### Start Services

```bash
# Start all services
docker compose up -d

# Start specific service
docker compose up -d backend

# Start with debug tools
docker compose --profile debug up -d
```

### Stop Services

```bash
# Stop all services
docker compose down

# Stop and remove volumes
docker compose down -v
```

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f postgres
docker compose logs -f redis

# Last 100 lines
docker compose logs --tail=100 backend
```

### Restart Services

```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart backend
```

### Execute Commands

```bash
# Access backend shell
docker compose exec backend sh

# Access PostgreSQL
docker compose exec postgres psql -U musicmood -d musicmood

# Access Redis CLI
docker compose exec redis redis-cli
```

## 🗄️ Database Management

### Initialize Database

Database schema is automatically initialized on first run from `database/schema.sql`.

### Manual Schema Update

```bash
# Copy new schema to container
docker cp database/schema.sql musicmood-postgres:/tmp/schema.sql

# Execute schema
docker compose exec postgres psql -U musicmood -d musicmood -f /tmp/schema.sql
```

### Backup Database

```bash
# Backup
docker compose exec postgres pg_dump -U musicmood musicmood > backup.sql

# Restore
docker compose exec -T postgres psql -U musicmood musicmood < backup.sql
```

### View Database

```bash
# Connect to PostgreSQL
docker compose exec postgres psql -U musicmood -d musicmood

# List tables
\dt

# Query data
SELECT * FROM user_mood_stats LIMIT 10;
```

## 🔴 Redis Management

### View Redis Data

```bash
# Connect to Redis
docker compose exec redis redis-cli

# List all keys
KEYS *

# Get specific key
GET mood:bias:abc123:2025-12-24

# View all keys with pattern
KEYS spotify:*

# Get key TTL
TTL mood:bias:abc123:2025-12-24
```

### Clear Redis Cache

```bash
# Clear all cache
docker compose exec redis redis-cli FLUSHALL

# Clear specific pattern
docker compose exec redis redis-cli --eval "return redis.call('del', unpack(redis.call('keys', ARGV[1])))" , "spotify:*"
```

## 📊 Monitoring

### Health Checks

```bash
# Check all services
docker compose ps

# Check backend health
curl http://localhost:3000/api/health

# Check PostgreSQL
docker compose exec postgres pg_isready -U musicmood

# Check Redis
docker compose exec redis redis-cli ping
```

### Resource Usage

```bash
# View resource usage
docker stats

# View specific container
docker stats musicmood-backend
```

## 🔄 Updates and Rebuilds

### Update Code

```bash
# Pull latest code
git pull

# Rebuild and restart
docker compose up -d --build
```

### Update Dependencies

```bash
# Update package.json
npm update

# Rebuild image
docker compose build --no-cache backend
docker compose up -d backend
```

## 🐛 Troubleshooting

### Backend Won't Start

```bash
# Check logs
docker compose logs backend

# Check environment
docker compose exec backend env

# Restart service
docker compose restart backend
```

### Database Connection Error

```bash
# Check PostgreSQL is running
docker compose ps postgres

# Check connection
docker compose exec backend sh
nc -zv postgres 5432

# View PostgreSQL logs
docker compose logs postgres
```

### Redis Connection Error

```bash
# Check Redis is running
docker compose ps redis

# Test connection
docker compose exec backend sh
nc -zv redis 6379

# View Redis logs
docker compose logs redis
```

### Port Already in Use

```bash
# Find process using port
# Windows
netstat -ano | findstr :3000

# Mac/Linux
lsof -ti:3000

# Change port in docker-compose.yml
ports:
  - "3001:3000"  # Use 3001 instead
```

## 🔐 Security

### Production Recommendations

1. **Change Default Passwords**
```yaml
environment:
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
```

2. **Use Secrets**
```yaml
secrets:
  postgres_password:
    file: ./secrets/postgres_password.txt
```

3. **Limit Exposed Ports**
```yaml
# Don't expose PostgreSQL/Redis in production
# ports:
#   - "5432:5432"
```

4. **Use Environment Variables**
```bash
# Don't commit .env
echo ".env" >> .gitignore
```

## 📈 Scaling

### Horizontal Scaling

```bash
# Scale backend to 3 instances
docker compose up -d --scale backend=3

# Use nginx for load balancing
```

### Resource Limits

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

## 🌐 Production Deployment

### Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml musicmood

# View services
docker service ls

# Scale service
docker service scale musicmood_backend=3
```

### Kubernetes

```bash
# Convert to Kubernetes
kompose convert

# Apply to cluster
kubectl apply -f .
```

## 📋 Checklist

- [ ] Docker Desktop installed
- [ ] `.env` file configured
- [ ] Spotify credentials added
- [ ] `docker compose up --build` successful
- [ ] Health check returns OK
- [ ] PostgreSQL accessible
- [ ] Redis accessible
- [ ] Frontend loads
- [ ] API requests work
- [ ] Database persists after restart
- [ ] Redis cache works

---

**Docker deployment ready!** 🐳✨
