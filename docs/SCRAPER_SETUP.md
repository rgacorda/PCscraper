# 🕸️ Scraper Setup & Configuration Guide

Complete guide for setting up and configuring the web scraping system for the PH PC Parts Aggregator.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Supported Retailers](#supported-retailers)
- [Environment Configuration](#environment-configuration)
- [Scraper Architecture](#scraper-architecture)
- [Usage Guide](#usage-guide)
- [Pagination & Image Handling](#pagination--image-handling)
- [Scheduling & Automation](#scheduling--automation)
- [Troubleshooting](#troubleshooting)
- [Adding New Retailers](#adding-new-retailers)

---

## Overview

The scraper system automatically collects PC part data from Philippine retailers, normalizes it, and stores it in the database. It supports:

- **Multi-retailer scraping** (Datablitz, PCWorth, Bermor)
- **Configurable pagination** limits
- **Automatic image extraction** with multiple fallbacks
- **Stock status tracking**
- **Price monitoring**
- **Scheduled automated runs**
- **Job logging and error tracking**

---

## Supported Retailers

### ✅ Currently Active

| Retailer | Status | Products | Pagination |
|----------|--------|----------|------------|
| **Bermor Techzone** | ✅ Active | 433 pages | Configurable |

### 🚧 Coming Soon

| Retailer | Status | Notes |
|----------|--------|-------|
| **Datablitz** | 🔄 Prepared | Scraper ready, disabled for now |
| **PCWorth** | 🔄 Prepared | Scraper ready, disabled for now |

To enable/disable retailers, edit [`src/lib/scheduler.ts`](../src/lib/scheduler.ts):

```typescript
const ENABLED_RETAILERS: Retailer[] = [
  Retailer.BERMOR,
  // Retailer.DATABLITZ, // Uncomment when ready
  // Retailer.PCWORTH,   // Uncomment when ready
];
```

---

## Environment Configuration

### 1. Core Scraper Settings

Add these to your `.env` file:

```bash
# Scraping Configuration
SCRAPER_TIMEOUT=30000           # Request timeout in milliseconds
SCRAPER_MAX_RETRIES=3           # Number of retry attempts
SCRAPER_USER_AGENT="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
```

### 2. Retailer-Specific Settings

#### Bermor Techzone

```bash
# Bermor pagination limit
# - Set to 50 for scheduled runs (recommended)
# - Set to 0 or -1 for unlimited (scrapes all ~433 pages)
# - Higher numbers = longer scraping time but more products
BERMOR_MAX_PAGES=50
```

**Recommended Values:**

| Use Case | Value | Products Scraped | Time |
|----------|-------|------------------|------|
| Scheduled runs | 50 | ~1,500 | ~1-2 min |
| Weekly full scrape | 100 | ~3,000 | ~3-5 min |
| Complete catalog | 0 or -1 | ~13,000 | ~15-20 min |
| Quick test | 2 | ~60 | ~10 sec |

---

## Scraper Architecture

### File Structure

```
src/scraper/
├── index.ts                    # Scraper orchestrator & job runner
├── normalizer.ts              # Data normalization & categorization
└── retailers/
    ├── bermor.ts              # Bermor Techzone scraper
    ├── datablitz.ts           # Datablitz scraper (prepared)
    └── pcworth.ts             # PCWorth scraper (prepared)
```

### Data Flow

```
1. Trigger Scrape → 2. Fetch HTML → 3. Parse Products → 4. Normalize Data → 5. Save to DB
         ↓                ↓               ↓                  ↓                 ↓
    [API/Cron]      [fetchWithRetry]  [Cheerio]       [normalizer.ts]   [Prisma]
```

### How It Works

1. **Job Creation**: Creates a `ScrapeJob` record with status `running`
2. **HTML Fetching**: Uses `fetchWithRetry` with exponential backoff
3. **Parsing**: Extracts product data using Cheerio selectors
4. **Normalization**: Categorizes products and extracts brand/model
5. **Database Storage**: Upserts products and listings
6. **Job Completion**: Updates job record with results

---

## Usage Guide

### Method 1: Manual Script (Recommended for Testing)

```bash
# Scrape with default settings (uses BERMOR_MAX_PAGES from .env)
npx tsx scripts/scrape-and-save-bermor.ts

# Scrape specific number of pages
MAX_PAGES=2 npx tsx scripts/scrape-and-save-bermor.ts

# Scrape all pages (unlimited)
MAX_PAGES=0 npx tsx scripts/scrape-and-save-bermor.ts

# Full scrape with verbose output
MAX_PAGES=433 npx tsx scripts/scrape-and-save-bermor.ts
```

### Method 2: Via API Endpoint

```bash
# Trigger Bermor scrape
curl -X POST http://localhost:3000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"retailer": "BERMOR"}'
```

### Method 3: Scheduled Automation

The scheduler runs automatically when the app starts:

```bash
# Start the development server (scraper runs on startup)
npm run dev
```

Configuration in [`src/lib/scheduler.ts`](../src/lib/scheduler.ts):
- **Initial run**: Immediately on startup
- **Recurring**: Every 6 hours
- **Max pages**: Uses `BERMOR_MAX_PAGES` environment variable

---

## Pagination & Image Handling

### Pagination Strategy

The Bermor scraper supports flexible pagination:

```typescript
// In src/scraper/retailers/bermor.ts
export async function scrapeBermor(maxPages: number = 5)
```

**How it works:**
- `maxPages > 0`: Scrape up to that many pages
- `maxPages <= 0`: Scrape unlimited pages (all 433)
- Automatically stops when no more pages exist

**Optimization Tips:**
- **New products appear first**: First 50 pages cover most new inventory
- **Full scrape weekly**: Run unlimited once a week for complete catalog
- **Daily updates**: Run 20-50 pages for quick updates

### Image Extraction

The scraper tries multiple image sources (in order):

```typescript
const imageUrl = $img.attr('src') ||
                $img.attr('data-src') ||
                $img.attr('data-lazy-src') ||
                $img.attr('data-original') ||
                $img.attr('data-srcset')?.split(',')[0]?.trim().split(' ')[0] ||
                '';
```

This handles:
- ✅ Direct `src` images
- ✅ Lazy-loaded `data-src` images
- ✅ Progressive loading formats
- ✅ Responsive image sets

**Image logging:**
- Products without images are counted
- Warning displayed in console after scraping
- Empty `imageUrl` string stored if no image found

---

## Scheduling & Automation

### Scheduler Configuration

File: [`src/lib/scheduler.ts`](../src/lib/scheduler.ts)

```typescript
// Schedule interval (default: 6 hours)
const SIX_HOURS = 6 * 60 * 60 * 1000;
```

### Customization Options

**Change interval:**
```typescript
// Every 12 hours
const TWELVE_HOURS = 12 * 60 * 60 * 1000;
setInterval(() => runAllScrapers(), TWELVE_HOURS);

// Every 24 hours (daily)
const ONE_DAY = 24 * 60 * 60 * 1000;
setInterval(() => runAllScrapers(), ONE_DAY);
```

**Disable initial run:**
```typescript
export function setupScheduler() {
  // Comment out this line to skip initial run
  // runAllScrapers().catch(console.error);

  setInterval(() => runAllScrapers(), SIX_HOURS);
}
```

### Production Deployment (Vercel Cron)

For serverless deployment, use Vercel Cron:

**File: `vercel.json`**
```json
{
  "crons": [{
    "path": "/api/cron/scrape",
    "schedule": "0 */6 * * *"
  }]
}
```

**Create cron endpoint: `src/app/api/cron/scrape/route.ts`**
```typescript
import { runAllScrapers } from '@/lib/scheduler';

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const results = await runAllScrapers();
  return Response.json({ success: true, results });
}
```

---

## Troubleshooting

### Common Issues

#### ❌ Only 150 products scraped (should be more)

**Problem**: Default `maxPages = 5` is too low

**Solution**:
```bash
# Update .env
BERMOR_MAX_PAGES=50

# Or use script with MAX_PAGES
MAX_PAGES=50 npx tsx scripts/scrape-and-save-bermor.ts
```

#### ❌ Products missing images

**Problem**: Image selectors not matching

**Solution**: The scraper now tries multiple image attributes automatically. If still missing:
1. Check console for "⚠️ Products without images" count
2. Inspect website HTML to find correct selector
3. Update image extraction in [`bermor.ts`](../src/scraper/retailers/bermor.ts)

#### ❌ Scraping too slow

**Problem**: Too many pages or network latency

**Solutions**:
- Reduce `BERMOR_MAX_PAGES` to 20-30 for faster runs
- Increase `SCRAPER_TIMEOUT` if requests are timing out
- Add delay between pages (already implemented: 1 second)

#### ❌ "Connection refused" errors

**Problem**: Target website is down or blocking

**Solutions**:
1. Check if website is accessible in browser
2. Verify `SCRAPER_USER_AGENT` in `.env`
3. Reduce `BERMOR_MAX_PAGES` to avoid rate limiting
4. Add longer delays between requests

#### ❌ Database errors during save

**Problem**: Data format mismatch or constraint violations

**Solution**:
```bash
# Reset database
npx prisma db push --force-reset

# Re-run scraper
npx tsx scripts/scrape-and-save-bermor.ts
```

---

## Adding New Retailers

### Step 1: Create Scraper File

Create `src/scraper/retailers/newretailer.ts`:

```typescript
import * as cheerio from 'cheerio';
import { ScrapedProduct } from '../normalizer';
import { fetchWithRetry } from '@/lib/utils';

export async function scrapeNewRetailer(maxPages: number = 5): Promise<ScrapedProduct[]> {
  const products: ScrapedProduct[] = [];
  const baseUrl = 'https://newretailer.com';

  // Your scraping logic here
  // Follow the pattern from bermor.ts

  return products;
}
```

### Step 2: Update Scraper Index

Edit [`src/scraper/index.ts`](../src/scraper/index.ts):

```typescript
import { scrapeNewRetailer } from './retailers/newretailer';

export async function runScraperJob(retailer: Retailer) {
  // ... existing code ...

  switch (retailer) {
    case Retailer.NEWRETAILER:
      const maxPages = process.env.NEWRETAILER_MAX_PAGES
        ? parseInt(process.env.NEWRETAILER_MAX_PAGES, 10)
        : 5;
      scrapedData = await scrapeNewRetailer(maxPages);
      break;
    // ... other cases ...
  }
}
```

### Step 3: Update Database Schema

Edit `prisma/schema.prisma`:

```prisma
enum Retailer {
  DATABLITZ
  PCWORTH
  BERMOR
  NEWRETAILER  // Add new retailer
}
```

Then run:
```bash
npx prisma db push
```

### Step 4: Enable in Scheduler

Edit [`src/lib/scheduler.ts`](../src/lib/scheduler.ts):

```typescript
const ENABLED_RETAILERS: Retailer[] = [
  Retailer.BERMOR,
  Retailer.NEWRETAILER,  // Enable new retailer
];
```

### Step 5: Add Environment Variable

Add to `.env`:
```bash
NEWRETAILER_MAX_PAGES=50
```

---

## Best Practices

### 1. Scraping Etiquette

- ✅ Use delays between requests (1 second minimum)
- ✅ Set appropriate `SCRAPER_USER_AGENT`
- ✅ Respect `robots.txt` files
- ✅ Monitor for rate limiting
- ✅ Don't overwhelm target servers

### 2. Performance Optimization

- ✅ Use pagination limits for scheduled runs
- ✅ Run full scrapes during off-peak hours
- ✅ Index database properly (already configured)
- ✅ Use upsert operations (already implemented)
- ✅ Log errors for debugging

### 3. Data Quality

- ✅ Normalize product names and categories
- ✅ Validate prices and stock status
- ✅ Extract complete URLs
- ✅ Handle missing images gracefully
- ✅ Track scraping jobs for monitoring

### 4. Error Handling

- ✅ Retry failed requests (configured with `SCRAPER_MAX_RETRIES`)
- ✅ Log errors without stopping entire job
- ✅ Continue scraping if one product fails
- ✅ Record job status in database
- ✅ Monitor error rates over time

---

## Monitoring & Logging

### View Scrape Jobs

```bash
# Open Prisma Studio
npx prisma studio

# Navigate to ScrapeJob table
# Check status, itemsScraped, errors, etc.
```

### Console Logs

The scraper provides detailed logging:

```
🛒 Starting Bermor scraper (max 50 pages)...

📄 Scraping page 1: http://bermorzone.com.ph/shop/
   Found 30 products on this page
   ✓ Extracted 30 valid products
   → Next page available

📄 Scraping page 2: http://bermorzone.com.ph/shop/page/2/
   Found 30 products on this page
   ✓ Extracted 30 valid products
   → Next page available

✅ Scraping complete!
   Total pages scraped: 50
   Total products found: 1,500
   ⚠️  Products without images: 5
```

### Database Statistics

Check scraping effectiveness:

```typescript
// In a script or API endpoint
const jobs = await prisma.scrapeJob.findMany({
  where: { retailer: 'BERMOR' },
  orderBy: { createdAt: 'desc' },
  take: 10,
});

jobs.forEach(job => {
  console.log(`${job.createdAt}: ${job.itemsScraped} items, ${job.itemsFailed} failed`);
});
```

---

## Configuration Summary

### Quick Reference

| Setting | Default | Recommended | Location |
|---------|---------|-------------|----------|
| `BERMOR_MAX_PAGES` | 5 | 50 | `.env` |
| `SCRAPER_TIMEOUT` | 30000ms | 30000ms | `.env` |
| `SCRAPER_MAX_RETRIES` | 3 | 3 | `.env` |
| Scheduler Interval | 6 hours | 6-12 hours | `scheduler.ts` |
| Delay Between Pages | 1000ms | 1000-2000ms | `bermor.ts` |

### Environment Template

```bash
# Scraping Configuration
SCRAPER_TIMEOUT=30000
SCRAPER_MAX_RETRIES=3
SCRAPER_USER_AGENT="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"

# Retailer-specific scraping limits (0 or -1 for unlimited)
BERMOR_MAX_PAGES=50
```

---

## Additional Resources

- [Bermor Scraper Source](../src/scraper/retailers/bermor.ts)
- [Scraper Index](../src/scraper/index.ts)
- [Normalizer Logic](../src/scraper/normalizer.ts)
- [Scheduler Configuration](../src/lib/scheduler.ts)
- [Database Schema](../prisma/schema.prisma)

---

**Last Updated**: 2025-01-14

**Need Help?** Check the troubleshooting section or review inline code comments in the scraper files.
