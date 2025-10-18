# Cron Setup Guide

This project now uses **Vercel Cron** to automatically scrape data every 3 hours.

## 🎯 How It Works

### Vercel Cron (Production)

- **Schedule**: Every 3 hours (0 _/3 _ \* \*)
- **Endpoint**: `/api/cron/scrape`
- **Authentication**: Uses `CRON_SECRET` for security
- **Configuration**: `vercel.json`

### Local Scheduler (Development)

- **Schedule**: Every 3 hours using `setInterval`
- **Control**: Set `ENABLE_SCHEDULER=true` in `.env`
- **File**: `src/lib/scheduler.ts`

## 📋 Setup Instructions

### 1. Vercel Deployment (Recommended for Production)

#### Step 1: Set Environment Variables in Vercel

```bash
# Required environment variables
ENABLE_CRON=true                     # Enable cron endpoint
CRON_SECRET=<your-strong-random-secret>
DATABASE_URL=<your-database-url>
NEXTAUTH_SECRET=<your-nextauth-secret>
```

**To generate a strong CRON_SECRET:**

```bash
openssl rand -base64 32
```

#### Step 2: Deploy to Vercel

```bash
vercel deploy --prod
```

#### Step 3: Verify Cron Setup

1. Go to Vercel Dashboard → Your Project → Settings → Cron Jobs
2. You should see: `Every 3 hours` → `/api/cron/scrape`
3. Check logs to verify it's running

### 2. Local Development

For local testing, you have two options:

#### Option A: Use the Built-in Scheduler

```bash
# In .env file
ENABLE_SCHEDULER=true
```

Then start your dev server:

```bash
npm run dev
```

The scheduler will run every 3 hours automatically.

#### Option B: Manual Cron Testing

Test the cron endpoint locally:

```bash
curl -X GET http://localhost:3000/api/cron/scrape \
  -H "Authorization: Bearer your-secret-key-here"
```

### 3. Alternative: GitHub Actions Cron

If you prefer GitHub Actions instead of Vercel Cron, create `.github/workflows/scraper-cron.yml`:

```yaml
name: Scheduled Scraper

on:
  schedule:
    # Runs every 3 hours
    - cron: '0 */3 * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Scraper
        run: |
          curl -X POST ${{ secrets.APP_URL }}/api/cron/scrape \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

## 🔒 Security

### Authentication

The cron endpoint is protected by a secret token:

```typescript
// Only authenticated requests are allowed
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return 401 Unauthorized
}
```

### Best Practices

1. ✅ Use a strong, random CRON_SECRET
2. ✅ Never commit secrets to git
3. ✅ Rotate secrets regularly
4. ✅ Use different secrets for dev/staging/production

## 📊 Monitoring

### Check Cron Logs (Vercel)

```bash
vercel logs --follow
```

### Manual Trigger (for testing)

```bash
# Production
curl -X POST https://yourapp.vercel.app/api/cron/scrape \
  -H "Authorization: Bearer ${CRON_SECRET}"

# Local
curl -X POST http://localhost:3000/api/cron/scrape \
  -H "Authorization: Bearer your-secret-key-here"
```

### Expected Response

```json
{
  "success": true,
  "message": "Scraping completed",
  "results": [
    {
      "retailer": "BERMOR",
      "success": true,
      "productsScraped": 150,
      "pagesScraped": 5
    }
  ],
  "timestamp": "2025-10-18T12:00:00.000Z"
}
```

## ⚙️ Configuration

### Adjust Cron Schedule

Edit `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/scrape",
      "schedule": "0 */3 * * *" // Every 3 hours
    }
  ]
}
```

**Common Cron Expressions:**

- `0 */3 * * *` - Every 3 hours
- `0 */6 * * *` - Every 6 hours
- `0 0 * * *` - Daily at midnight
- `0 */1 * * *` - Every hour
- `*/30 * * * *` - Every 30 minutes (Vercel Pro only)

### Control Which Retailers to Scrape

Edit `src/lib/scheduler.ts`:

```typescript
const ENABLED_RETAILERS: Retailer[] = [
  Retailer.BERMOR,
  // Retailer.DATABLITZ, // Uncomment to enable
  // Retailer.PCWORTH,   // Uncomment to enable
];
```

### Scraping Limits

Edit `.env`:

```bash
# Enable/Disable Cron (Production)
ENABLE_CRON=true  # Set to false to disable cron endpoint

# Enable/Disable Scheduler (Local Development)
ENABLE_SCHEDULER=false  # Set to true for local development

# Pages to scrape per cycle
BERMOR_MAX_PAGES=50
DATABLITZ_MAX_PAGES=50
PCWORTH_MAX_PAGES=50

# Set to 0 or -1 for unlimited
```

### Environment Variable Reference

| Variable           | Options        | Description                                            |
| ------------------ | -------------- | ------------------------------------------------------ |
| `ENABLE_CRON`      | `true`/`false` | Enable/disable cron endpoint (for Vercel production)   |
| `ENABLE_SCHEDULER` | `true`/`false` | Enable/disable in-app scheduler (for local dev or VPS) |
| `CRON_SECRET`      | string         | Secret token for authenticating cron requests          |
| `BERMOR_MAX_PAGES` | number         | Max pages to scrape per cycle (0 = unlimited)          |

**Recommended Configuration:**

| Environment       | `ENABLE_CRON` | `ENABLE_SCHEDULER` | Why                             |
| ----------------- | ------------- | ------------------ | ------------------------------- |
| Local Dev         | `false`       | `true`             | Use scheduler for local testing |
| Vercel Production | `true`        | `false`            | Serverless requires cron        |
| VPS/Railway       | `false`       | `true`             | Persistent process works        |

## 🚀 Deployment Checklist

Before deploying with cron:

- [ ] Set `ENABLE_CRON=true` in Vercel environment variables
- [ ] Set `CRON_SECRET` in Vercel environment variables
- [ ] Verify database connection in production
- [ ] Set `ENABLE_SCHEDULER=false` (cron replaces scheduler)
- [ ] Test cron endpoint manually first
- [ ] Deploy to Vercel
- [ ] Check Vercel dashboard for cron job
- [ ] Monitor first few runs in logs
- [ ] Set up error notifications (optional)

## 🐛 Troubleshooting

### Cron Not Running

1. Check Vercel Dashboard → Cron Jobs
2. Verify `ENABLE_CRON=true` in environment variables
3. Verify `CRON_SECRET` is set correctly
4. Check deployment logs for errors
5. Ensure `vercel.json` is in root directory

### Cron is Disabled Message

If you see "Cron is disabled" in the response:

- Set `ENABLE_CRON=true` in your environment variables
- Redeploy your application

### 401 Unauthorized

- CRON_SECRET mismatch
- Check environment variables in Vercel

### 500 Internal Server Error

- Database connection issue
- Check scraper configuration
- Review error logs in Vercel

### Timeout Errors

- Scraping taking too long (Vercel has 10s hobby, 60s pro timeout)
- Consider reducing pages per cycle
- Or upgrade to Vercel Pro

## 📝 Notes

### Vercel Cron Limits

- **Hobby Plan**: 10-second execution limit
- **Pro Plan**: 60-second execution limit
- **Enterprise**: Custom limits

### Recommendations

1. Keep `BERMOR_MAX_PAGES` low (5-10) to avoid timeouts
2. Let the scraper resume on next cron run
3. Enable multiple retailers gradually
4. Monitor database growth

## 🔄 Migration from Scheduler to Cron

If you were using the built-in scheduler:

1. Set `ENABLE_SCHEDULER=false` in production `.env`
2. Set `ENABLE_CRON=true` in production `.env`
3. Deploy with cron configuration
4. Cron will take over scheduling
5. Keep scheduler enabled for local dev

Both can coexist for different environments!

## 🎛️ Quick Configuration Guide

**Want to disable automatic scraping completely?**

```bash
ENABLE_CRON=false
ENABLE_SCHEDULER=false
```

**Want to use only cron (Vercel)?**

```bash
ENABLE_CRON=true
ENABLE_SCHEDULER=false
```

**Want to use only scheduler (VPS/local)?**

```bash
ENABLE_CRON=false
ENABLE_SCHEDULER=true
```

**Want to test both?**

```bash
ENABLE_CRON=true
ENABLE_SCHEDULER=true
# Not recommended - will run twice!
```
