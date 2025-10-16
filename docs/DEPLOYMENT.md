# Deployment Guide

## Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL database
- Vercel account (for Vercel deployment) or Docker (for containerized deployment)

## Quick Deploy to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Deploy on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables (see below)
5. Click "Deploy"

### 3. Set Environment Variables

Add these in Vercel Project Settings → Environment Variables:

```bash
# Database
DATABASE_URL=your_postgresql_connection_string

# NextAuth
NEXTAUTH_SECRET=generate_random_string_here
NEXTAUTH_URL=https://your-domain.vercel.app

# App
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app

# Optional - Scraping
SCRAPER_TIMEOUT=30000
SCRAPER_MAX_RETRIES=3
BERMOR_MAX_PAGES=50
```

### 4. Database Options

**Option A: Vercel Postgres (Recommended)**
- Easy integration with Vercel
- Automatic connection string
- [Setup Guide](https://vercel.com/docs/storage/vercel-postgres)

**Option B: External PostgreSQL**
- [Railway](https://railway.app/) - Free tier available
- [Supabase](https://supabase.com/) - Free PostgreSQL hosting
- [Neon](https://neon.tech/) - Serverless Postgres

### 5. Run Database Migrations

After deployment, run migrations:

```bash
# Install Vercel CLI
npm install -g vercel

# Link to your project
vercel link

# Run migration
vercel env pull .env.local
npx prisma db push
```

## Docker Deployment

### Using Docker Compose

```bash
# Build and start
docker-compose up -d

# Run migrations
docker-compose exec app npx prisma db push

# View logs
docker-compose logs -f app

# Stop
docker-compose down
```

### Custom Docker Setup

```bash
# Build image
docker build -t pc-parts-aggregator .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="your_db_url" \
  -e NEXTAUTH_SECRET="your_secret" \
  pc-parts-aggregator
```

## Railway Deployment

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add PostgreSQL
railway add

# Set environment variables
railway variables set NEXTAUTH_SECRET=your_secret
railway variables set NODE_ENV=production

# Deploy
railway up
```

## Post-Deployment

### 1. Verify Deployment

Check these endpoints:
- `https://your-domain.com` - Homepage
- `https://your-domain.com/api/products` - Products API
- `https://your-domain.com/builder` - PC Builder

### 2. Create First User

Visit `/auth/register` to create an admin account

### 3. Test Features

- [ ] User registration and login
- [ ] Browse products
- [ ] Build PC configuration
- [ ] Save and share builds
- [ ] Rate and comment on builds

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_SECRET` | NextAuth encryption key | Yes |
| `NEXTAUTH_URL` | Full app URL | Yes |
| `NODE_ENV` | Environment (production) | Yes |
| `NEXT_PUBLIC_APP_URL` | Public app URL | Yes |
| `SCRAPER_TIMEOUT` | Scraper timeout (ms) | No |
| `SCRAPER_MAX_RETRIES` | Max retry attempts | No |
| `BERMOR_MAX_PAGES` | Pages to scrape | No |

## Troubleshooting

### Build Failures

```bash
# Clear cache and rebuild locally
rm -rf .next node_modules
npm install
npm run build
```

### Database Connection Issues

1. Verify `DATABASE_URL` format
2. Check SSL requirements (add `?sslmode=require` if needed)
3. Ensure database is accessible from deployment platform

### NextAuth Errors

1. Set strong `NEXTAUTH_SECRET` (min 32 characters)
2. Verify `NEXTAUTH_URL` matches your domain
3. Check callback URLs in auth providers

## Performance Optimization

1. **Enable CDN**: Automatic on Vercel
2. **Image Optimization**: Using Next.js Image component
3. **Database Indexing**: Already configured in Prisma schema
4. **Caching**: Consider adding Redis for API responses

## Security Checklist

- [ ] Strong `NEXTAUTH_SECRET` generated
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Database SSL enabled
- [ ] CORS configured appropriately
- [ ] Regular dependency updates

## Monitoring

- **Vercel**: Built-in analytics and logs
- **Railway**: Dashboard monitoring
- **Sentry**: Error tracking (optional)
- **Database**: Monitor connection pool usage

## Backup Strategy

1. **Database Backups**
   - Vercel Postgres: Automatic daily backups
   - Railway: Automatic backups on Pro plan
   - External: Configure backup schedule

2. **Code Backups**
   - Git repository serves as code backup
   - Tag releases: `git tag v1.0.0`

## Maintenance

### Update Dependencies

```bash
npm update
npm audit fix
```

### Database Migrations

```bash
npx prisma migrate deploy
```

## Support Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [NextAuth.js Deployment](https://next-auth.js.org/deployment)
