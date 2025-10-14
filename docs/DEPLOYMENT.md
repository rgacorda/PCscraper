# Deployment Guide

## Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL database
- Vercel account (for Vercel deployment) or Docker (for containerized deployment)

## Local Development

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd PCscraper
   npm install
   ```

2. **Set Up Environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and configure your database URL and other settings.

3. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   Visit [http://localhost:3000](http://localhost:3000)

## Production Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Set Environment Variables**
   - Log in to [Vercel Dashboard](https://vercel.com/dashboard)
   - Add your project
   - Set environment variables:
     - `DATABASE_URL`: Your PostgreSQL connection string
     - `CRON_SECRET`: Random secret for cron job authentication
     - `SCRAPER_USER_AGENT`: Custom user agent string

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Configure Database**
   - Use [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
   - Or external PostgreSQL (Railway, Supabase, etc.)

5. **Cron Jobs**
   - Cron jobs are automatically configured via `vercel.json`
   - Scraping runs daily at 2 AM (configurable)

### Option 2: Docker

1. **Build and Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **Run Database Migrations**
   ```bash
   docker-compose exec app npx prisma db push
   ```

3. **Access Application**
   - Application: [http://localhost:3000](http://localhost:3000)
   - Database: localhost:5432

### Option 3: Railway

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Initialize Project**
   ```bash
   railway init
   ```

3. **Add PostgreSQL**
   ```bash
   railway add postgresql
   ```

4. **Deploy**
   ```bash
   railway up
   ```

## Post-Deployment

### Initialize Database

Run Prisma migrations:
```bash
npx prisma db push
```

### Trigger First Scrape

Manually trigger scraping via API:

```bash
curl -X POST https://your-domain.com/api/scrape \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -d '{"retailer": "DATABLITZ"}'
```

Retailers: `DATABLITZ`, `PCWORTH`, `BERMOR`

### Monitoring

- Check scraping job status in database: `ScrapeJob` table
- Monitor application logs
- Set up error tracking (e.g., Sentry)

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NODE_ENV` | Environment (development/production) | Yes |
| `NEXT_PUBLIC_APP_URL` | Public app URL | Yes |
| `CRON_SECRET` | Secret for cron authentication | Production only |
| `SCRAPER_TIMEOUT` | Scraper timeout (ms) | No |
| `SCRAPER_MAX_RETRIES` | Max retry attempts | No |
| `SCRAPER_USER_AGENT` | Custom user agent | No |

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` format
- Check database firewall rules
- Ensure Prisma client is generated: `npx prisma generate`

### Scraping Failures
- Check target website availability
- Verify selectors in scraper files
- Review rate limiting configuration

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Clear node_modules: `rm -rf node_modules && npm install`
- Regenerate Prisma client: `npx prisma generate`

## Performance Optimization

1. **Database Indexing**: Already configured in Prisma schema
2. **Caching**: Consider adding Redis for API responses
3. **Image Optimization**: Use Next.js Image component
4. **CDN**: Enable on Vercel or CloudFlare

## Security Checklist

- [ ] Set strong `CRON_SECRET`
- [ ] Enable HTTPS in production
- [ ] Configure CORS appropriately
- [ ] Set rate limiting for API routes
- [ ] Regular security updates: `npm audit fix`
- [ ] Database backups configured

## Maintenance

### Update Dependencies
```bash
npm update
npm audit fix
```

### Database Migrations
```bash
npx prisma migrate dev
npx prisma migrate deploy
```

### Monitor Scraping Jobs
```bash
# Via Prisma Studio
npx prisma studio
```

## Support

For issues and questions:
- Check logs in Vercel/Railway dashboard
- Review GitHub issues
- Consult documentation in `/src` subdirectories
