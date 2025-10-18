# Vercel Free Deployment Guide (Manual Scraping Only)

This guide shows you how to deploy to Vercel's **free tier** with manual scraping only (no automatic cron jobs).

## 🎯 Overview

Vercel free tier limitations:

- ❌ No Cron Jobs (requires Pro plan)
- ❌ 10-second serverless function timeout
- ✅ Perfect for the web app features
- ✅ Use manual scraping via API or CLI

**This deployment is ideal for:**

- Testing and demos
- Personal use with manual scraping
- Budget-conscious projects

## 📋 Prerequisites

- GitHub account
- Vercel account (free tier)
- PostgreSQL database (free options available)

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Your Repository

1. **Disable automatic scraping:**

```bash
# Update .env file
ENABLE_CRON=false          # Disable cron
ENABLE_SCHEDULER=false     # Disable scheduler
```

2. **Remove or comment out cron configuration in `vercel.json`:**

```json
{
  "_comment": "Cron disabled for free tier deployment",
  "crons": [],
  "env": {
    "DATABASE_URL": "@database-url"
  },
  "regions": ["sin1"],
  "framework": "nextjs"
}
```

3. **Commit changes:**

```bash
git add .
git commit -m "Configure for Vercel free tier deployment"
git push origin main
```

### Step 2: Set Up Database

Choose one of these **FREE** PostgreSQL options:

#### Option A: Neon (Recommended)

- ✅ Free tier: 3 GB storage
- ✅ No credit card required
- 🔗 https://neon.tech

```bash
# Sign up and create a database
# Copy the connection string
```

#### Option B: Supabase

- ✅ Free tier: 500 MB database
- ✅ No credit card required
- 🔗 https://supabase.com

```bash
# Create project → Get connection string
# Use the "Direct connection" string
```

#### Option C: Railway (Limited Free Tier)

- ✅ $5 free credit monthly
- 🔗 https://railway.app

#### Option D: Vercel Postgres

- ⚠️ Requires Pro plan ($20/month)
- Not recommended for free deployment

### Step 3: Deploy to Vercel

1. **Go to Vercel Dashboard:**

   - Visit https://vercel.com/dashboard
   - Click "Add New..." → "Project"

2. **Import Repository:**

   - Select your GitHub repository
   - Click "Import"

3. **Configure Project:**

   - Framework Preset: Next.js (auto-detected)
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: .next

4. **Set Environment Variables:**

Click "Environment Variables" and add:

```bash
# Required
DATABASE_URL=postgresql://user:pass@host/db
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=https://your-app.vercel.app

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Scraping Control (IMPORTANT!)
ENABLE_CRON=false
ENABLE_SCHEDULER=false

# Email (Optional - for user verification)
GMAIL_OAUTH_USER=your-email@gmail.com
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REFRESH_TOKEN=your-refresh-token

# Scraping Configuration
SCRAPER_TIMEOUT=30000
SCRAPER_MAX_RETRIES=3
BERMOR_MAX_PAGES=10
DATABLITZ_MAX_PAGES=10
PCWORTH_MAX_PAGES=10
```

5. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete (~2-3 minutes)

### Step 4: Initialize Database

After deployment, run migrations:

```bash
# Option A: Using Vercel CLI
vercel env pull .env.production
npm run db:migrate

# Option B: Using Prisma Studio
npx prisma migrate deploy --schema=./prisma/schema.prisma
```

Or use the Prisma Data Platform to run migrations directly.

## 🔧 Manual Scraping Options

Since automatic scraping is disabled, use these methods:

### Option 1: API Endpoint (Recommended)

Create a simple script to trigger scraping:

```bash
# scrape.sh
#!/bin/bash
curl -X POST https://your-app.vercel.app/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"retailer": "BERMOR"}'
```

Run manually when needed:

```bash
./scrape.sh
```

### Option 2: Local CLI + Database Connection

Run scraper locally but write to production database:

```bash
# Use production DATABASE_URL
DATABASE_URL="your-production-db-url" npm run scrape
```

### Option 3: GitHub Actions (Scheduled)

Create `.github/workflows/manual-scrape.yml`:

```yaml
name: Manual Scraper

on:
  workflow_dispatch: # Manual trigger only
    inputs:
      retailer:
        description: 'Retailer to scrape'
        required: true
        type: choice
        options:
          - BERMOR
          - DATABLITZ
          - PCWORTH

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Scraper
        run: |
          curl -X POST ${{ secrets.APP_URL }}/api/scrape \
            -H "Content-Type: application/json" \
            -d '{"retailer": "${{ github.event.inputs.retailer }}"}'
```

Trigger manually from GitHub Actions tab.

### Option 4: Desktop Cron (Mac/Linux)

Set up a local cron job:

```bash
# Edit crontab
crontab -e

# Add this line (runs every 3 hours)
0 */3 * * * curl -X POST https://your-app.vercel.app/api/scrape -H "Content-Type: application/json" -d '{"retailer": "BERMOR"}'
```

## 📊 Monitoring

### Check Application Status

```bash
# Visit your app
https://your-app.vercel.app

# Check Vercel logs
vercel logs --follow
```

### Verify Database Connection

Visit: `https://your-app.vercel.app/api/products`

Should return product data.

## ⚠️ Important Limitations

### Vercel Free Tier Limits:

- ✅ 100 GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Unlimited serverless function executions
- ⚠️ 10-second function timeout
- ❌ No cron jobs
- ❌ No background processes

### Recommended Approach:

1. Use Vercel for hosting the web app
2. Use GitHub Actions (free) for scheduled scraping
3. Or use a free VPS for the scraper (Railway free tier)

## 🐛 Troubleshooting

### Build Fails

**Error: Missing environment variables**

```bash
# Make sure all required env vars are set in Vercel
DATABASE_URL
NEXTAUTH_SECRET
NEXTAUTH_URL
```

### Database Connection Issues

**Error: Can't reach database**

- Check if your database allows connections from Vercel IPs
- Neon/Supabase: Should work by default
- Self-hosted: Add Vercel IPs to allowlist

### Function Timeout

**Error: Function exceeded 10s timeout**

- This is expected for scraping on free tier
- Solution: Use external scraping (GitHub Actions or local)

## 🎓 Alternative Free Hosting Options

If you need automatic scraping without paying:

### Option A: Railway

```bash
# Railway allows background processes
# Free $5/month credit
railway login
railway init
railway up
```

### Option B: Render

```bash
# Free tier with 750 hours/month
# Supports background workers
```

### Option C: Fly.io

```bash
# Free tier includes 3GB RAM
# Supports long-running processes
```

## 📝 Cost Comparison

| Platform    | Cost      | Cron Support | Background Jobs |
| ----------- | --------- | ------------ | --------------- |
| Vercel Free | $0        | ❌           | ❌              |
| Vercel Pro  | $20/mo    | ✅           | ⚠️ Limited      |
| Railway     | $5 credit | ✅           | ✅              |
| Render      | Free      | ✅           | ✅              |
| Fly.io      | Free      | ✅           | ✅              |

## ✅ Deployment Checklist

- [ ] Set `ENABLE_CRON=false` and `ENABLE_SCHEDULER=false`
- [ ] Remove/disable cron config in `vercel.json`
- [ ] Set up free PostgreSQL database
- [ ] Add all environment variables in Vercel
- [ ] Deploy to Vercel
- [ ] Run database migrations
- [ ] Test the web app features
- [ ] Set up manual scraping method (API, GitHub Actions, or local)
- [ ] Create a scraping schedule reminder

## 🚀 Next Steps After Deployment

1. **Test all features:**

   - User registration/login ✅
   - PC builder ✅
   - Browse products ✅
   - Save builds ✅

2. **Manual scraping:**

   - Run scraper weekly or as needed
   - Use GitHub Actions for automation

3. **Monitor usage:**

   - Check Vercel analytics
   - Stay within free tier limits

4. **Consider upgrade:**
   - If you need automatic scraping → Vercel Pro ($20/mo)
   - Or migrate scraper to Railway (background job)

---

**You now have a fully functional PC parts aggregator on Vercel free tier! 🎉**

For automatic scraping, consider upgrading to Vercel Pro or using GitHub Actions for scheduled runs.
