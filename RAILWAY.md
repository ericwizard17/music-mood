# 🚂 Railway Deployment Guide

## 🎯 Overview

Deploy MusicMood to Railway with PostgreSQL and Redis in minutes.

## 📋 Prerequisites

- Railway account (https://railway.app)
- GitHub account
- Spotify API credentials
- 5 minutes

## 🚀 Deployment Steps

### 1. Prepare Repository

```bash
# Ensure all files are committed
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### 2. Create Railway Project

1. Go to https://railway.app
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `music-mood` repository
5. Railway will auto-detect Node.js

### 3. Add PostgreSQL

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway will provision a PostgreSQL database
4. Copy the `DATABASE_URL` from the **"Connect"** tab

### 4. Add Redis

1. Click **"+ New"** again
2. Select **"Database"** → **"Redis"**
3. Railway will provision a Redis instance
4. Copy the `REDIS_URL` from the **"Connect"** tab

### 5. Configure Environment Variables

In your Railway backend service, go to **"Variables"** tab and add:

```env
# Spotify API
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here

# Database (Auto-filled by Railway)
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}

# Server
NODE_ENV=production
PORT=${{PORT}}

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id_here
```

### 6. Initialize Database

Railway doesn't auto-run SQL files, so we need to initialize manually:

#### Option A: Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# Run SQL
railway run psql $DATABASE_URL < database/schema.sql
```

#### Option B: pgAdmin / TablePlus

1. Get `DATABASE_URL` from Railway
2. Connect with your SQL client
3. Run `database/schema.sql`

### 7. Deploy

Railway auto-deploys on git push:

```bash
git push origin main
```

Or manually trigger deployment in Railway dashboard.

## 🔗 Access Your App

After deployment:

- **App URL**: `https://your-app.up.railway.app`
- **API Health**: `https://your-app.up.railway.app/api/health`

## ⚙️ Railway Configuration

### railway.json

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install"
  },
  "deploy": {
    "startCommand": "node server.js",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Environment Variable References

Railway allows referencing other services:

```env
# Reference PostgreSQL service
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Reference Redis service
REDIS_URL=${{Redis.REDIS_URL}}

# Railway provides PORT automatically
PORT=${{PORT}}
```

## 📊 Service Architecture

```
┌─────────────────────────────────────────┐
│         Railway Project                 │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────┐  ┌─────────────┐      │
│  │   Backend   │  │  PostgreSQL │      │
│  │  (Node.js)  │──│  Database   │      │
│  │             │  │             │      │
│  │  Port: Auto │  │  Port: 5432 │      │
│  └──────┬──────┘  └─────────────┘      │
│         │                               │
│         │         ┌─────────────┐       │
│         └─────────│    Redis    │       │
│                   │    Cache    │       │
│                   │             │       │
│                   │  Port: 6379 │       │
│                   └─────────────┘       │
│                                         │
└─────────────────────────────────────────┘
```

## 🔧 Troubleshooting

### Build Fails

**Problem**: `npm install` fails

**Solution**:
```bash
# Check package.json is valid
npm install --dry-run

# Ensure all dependencies are listed
npm install
git add package*.json
git commit -m "Update dependencies"
git push
```

### Database Connection Error

**Problem**: `ECONNREFUSED` or `Connection timeout`

**Solution**:
1. Check `DATABASE_URL` is set correctly
2. Ensure PostgreSQL service is running
3. Check Railway service logs

```bash
# View logs
railway logs
```

### Redis Connection Error

**Problem**: Redis connection fails

**Solution**:
1. Check `REDIS_URL` format: `redis://default:password@host:port`
2. Ensure Redis service is running
3. Test connection:

```javascript
// Add to server.js temporarily
redis.ping().then(() => console.log('✅ Redis connected'));
```

### Health Check Fails

**Problem**: Deployment shows "Unhealthy"

**Solution**:
1. Check `/api/health` endpoint works locally
2. Ensure server listens on `process.env.PORT`
3. Increase `healthcheckTimeout` in `railway.json`

### Port Binding Error

**Problem**: `EADDRINUSE` or port already in use

**Solution**:
```javascript
// Ensure server.js uses Railway's PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
```

## 📈 Monitoring

### View Logs

```bash
# Railway CLI
railway logs

# Or in Railway Dashboard
# Go to your service → "Deployments" → Click deployment → "View Logs"
```

### Metrics

Railway provides:
- CPU usage
- Memory usage
- Network traffic
- Request count

Access in: **Service → "Metrics"** tab

### Alerts

Set up alerts in Railway:
1. Go to **"Settings"** → **"Alerts"**
2. Configure for:
   - High CPU usage
   - High memory usage
   - Deployment failures

## 💰 Pricing

### Free Tier
- $5 credit/month
- Enough for small projects
- All services included

### Pro Plan ($20/month)
- $20 credit/month
- Priority support
- Higher resource limits

### Estimated Costs

```
Backend (Node.js):  ~$3-5/month
PostgreSQL:         ~$2-3/month
Redis:              ~$1-2/month
─────────────────────────────────
Total:              ~$6-10/month
```

## 🔐 Security

### Environment Variables

✅ **DO**:
- Use Railway's variable references
- Keep `.env` in `.gitignore`
- Use secrets for sensitive data

❌ **DON'T**:
- Commit `.env` to git
- Hardcode credentials
- Share `DATABASE_URL` publicly

### Database Security

```env
# Railway provides secure URLs
DATABASE_URL=postgresql://user:password@host:5432/db?sslmode=require

# SSL is enforced by default
```

### CORS Configuration

```javascript
// server.js
const allowedOrigins = [
    'https://your-app.up.railway.app',
    'http://localhost:3000' // for development
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));
```

## 🔄 CI/CD

Railway auto-deploys on git push:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Railway automatically:
# 1. Detects push
# 2. Builds new image
# 3. Runs tests (if configured)
# 4. Deploys to production
# 5. Runs health checks
```

### Deployment Branches

Configure in Railway:
- **Production**: `main` branch
- **Staging**: `develop` branch

## 📦 Database Migrations

### Manual Migration

```bash
# Connect to Railway PostgreSQL
railway run psql $DATABASE_URL

# Run migration
\i database/migrations/001_add_column.sql
```

### Automated Migration

Add to `package.json`:

```json
{
  "scripts": {
    "migrate": "node database/migrate.js",
    "postinstall": "npm run migrate"
  }
}
```

Create `database/migrate.js`:

```javascript
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    const sql = fs.readFileSync('database/schema.sql', 'utf8');
    await pool.query(sql);
    console.log('✅ Database migrated');
    await pool.end();
}

migrate().catch(console.error);
```

## 🌐 Custom Domain

### Add Custom Domain

1. Go to **"Settings"** → **"Domains"**
2. Click **"Add Domain"**
3. Enter your domain: `musicmood.com`
4. Add DNS records:

```
Type: CNAME
Name: @
Value: your-app.up.railway.app
```

5. Wait for DNS propagation (5-30 minutes)

### SSL Certificate

Railway automatically provisions SSL certificates for custom domains.

## 📊 Analytics

### Add Logging

```javascript
// server.js
const morgan = require('morgan');

app.use(morgan('combined'));
```

### Error Tracking

```bash
npm install @sentry/node
```

```javascript
const Sentry = require('@sentry/node');

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV
});

app.use(Sentry.Handlers.errorHandler());
```

## ✅ Deployment Checklist

- [ ] Railway account created
- [ ] GitHub repository connected
- [ ] PostgreSQL service added
- [ ] Redis service added
- [ ] Environment variables configured
- [ ] Database schema initialized
- [ ] Spotify credentials added
- [ ] Health check endpoint working
- [ ] Deployment successful
- [ ] App accessible via Railway URL
- [ ] Database persists data
- [ ] Redis cache working
- [ ] Logs show no errors
- [ ] Custom domain configured (optional)

## 🆘 Support

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Railway Status**: https://status.railway.app

---

**Deploy to Railway in minutes!** 🚂✨

## 📝 Quick Commands

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# View logs
railway logs

# Run command in Railway environment
railway run node server.js

# Open app in browser
railway open

# View environment variables
railway variables

# Add variable
railway variables set KEY=value

# Deploy
git push origin main
```
