# Minh Phát - Production Deployment Guide

## 🚀 Deployment Options

### Option 1: Vercel (Recommended for ease)

**Best for:** Quick deployment with automatic CI/CD

#### Frontend & API Deployment:

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy from your project root
vercel --prod
```

#### Vercel Configuration:

Create `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "client/**/*",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist/spa"
      }
    },
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/spa/$1"
    }
  ],
  "env": {
    "DATABASE_URL": "@database_url"
  }
}
```

### Option 2: Railway (Recommended for full-stack)

**Best for:** Full-stack apps with database

#### Steps:

1. Connect your GitHub repo to Railway
2. Railway will auto-detect and deploy
3. Add PostgreSQL database service
4. Set environment variables

### Option 3: Fly.io (Current hosting)

**Best for:** Docker-based deployment

#### Create `Dockerfile`:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data

EXPOSE 8080
CMD ["npm", "start"]
```

#### Create `fly.toml`:

```toml
app = "minhphat-ecommerce"
primary_region = "sjc"

[build]

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 256

[env]
  NODE_ENV = "production"
  PORT = "8080"
```

## 🗄️ Database Options

### Option 1: Neon (Recommended)

**PostgreSQL-compatible, serverless**

```bash
# 1. Sign up at neon.tech
# 2. Create a database
# 3. Get connection string
# 4. Update your app to use PostgreSQL
```

### Option 2: PlanetScale

**MySQL-compatible, serverless**

### Option 3: Railway PostgreSQL

**Integrated with Railway hosting**

### Option 4: Supabase

**PostgreSQL with additional features**

## 🔄 Database Migration (SQLite → PostgreSQL)

### 1. Install PostgreSQL adapter:

```bash
npm install pg @types/pg
```

### 2. Create PostgreSQL database class:

```typescript
// server/database/postgres-db.ts
import { Pool } from "pg";

class PostgreSQLDatabase {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
    });
    this.initializeDatabase();
  }

  async query(text: string, params: any[] = []) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  // Convert all your existing SQLite methods to PostgreSQL
}
```

### 3. Update environment variables:

```bash
# .env.production
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production
PORT=8080
```

## 📝 Pre-Deployment Checklist

### 1. Update package.json scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build",
    "build:server": "vite build --config vite.config.server.ts",
    "start": "node dist/server/node-build.mjs",
    "postinstall": "npm run build"
  }
}
```

### 2. Environment Configuration:

```bash
# Production environment variables needed:
DATABASE_URL=your_database_connection_string
NODE_ENV=production
PORT=8080
JWT_SECRET=your_jwt_secret
ADMIN_SESSION_SECRET=your_session_secret
```

### 3. Update CORS for production:

```typescript
// server/index.ts
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://yourdomain.com", "https://www.yourdomain.com"]
        : true,
    credentials: true,
  }),
);
```

### 4. Secure cookies for production:

```typescript
// server/routes/auth.ts
res.cookie("admin_session", session.id, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 15 * 60 * 1000,
});
```

## 🌐 Domain Setup

### 1. Purchase domain (recommended registrars):

- Namecheap
- Cloudflare
- Google Domains

### 2. Configure DNS:

```
Type: CNAME
Name: www
Value: your-app.vercel.app (or your hosting provider)

Type: A
Name: @
Value: your-hosting-ip
```

### 3. SSL Certificate:

Most modern hosting providers (Vercel, Railway, Fly.io) provide automatic SSL certificates.

## 🔐 Security Considerations

### 1. Environment Variables:

- Never commit `.env` files
- Use hosting provider's secret management
- Rotate secrets regularly

### 2. Database Security:

- Use connection pooling
- Enable SSL connections
- Restrict database access by IP

### 3. API Security:

- Rate limiting
- Input validation
- Authentication middleware
- CORS configuration

## 📊 Monitoring & Analytics

### 1. Error Tracking:

```bash
npm install @sentry/node @sentry/react
```

### 2. Performance Monitoring:

- Vercel Analytics (if using Vercel)
- Google Analytics
- Plausible Analytics

### 3. Uptime Monitoring:

- UptimeRobot
- Pingdom
- Better Uptime

## 🚀 Quick Start Deployment

### Using Vercel (Easiest):

1. Push your code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Using Railway:

1. Connect GitHub repo to Railway
2. Add PostgreSQL service
3. Configure environment variables
4. Deploy

## 📞 Domain Examples:

- `minhphat.com`
- `minhphat.shop`
- `minhphatfresh.com`
- `freshminh.com`

## 💡 Performance Tips:

1. Enable gzip compression
2. Use CDN for static assets
3. Implement caching strategies
4. Optimize images (WebP format)
5. Use lazy loading
6. Minimize bundle size

## 🔧 Post-Deployment:

1. Test all admin functionality
2. Verify database connections
3. Check email notifications (if any)
4. Monitor performance metrics
5. Set up backup strategies

## 📱 Mobile Optimization:

Your site is already responsive, but test on:

- iOS Safari
- Android Chrome
- Different screen sizes
- Touch interactions

Choose the deployment option that best fits your needs and technical comfort level. Vercel is recommended for beginners, while Railway or Fly.io offer more control for advanced users.
