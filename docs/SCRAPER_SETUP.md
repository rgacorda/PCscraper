# Scraper Setup & Configuration

Complete guide for setting up and configuring the web scraping system.

## Overview

The scraper system automatically collects PC part data from Philippine retailers, normalizes it, and stores it in the database.

**Features:**
- Multi-retailer scraping (Bermor Techzone)
- Configurable pagination limits
- Automatic image extraction
- Stock status tracking
- Price monitoring
- Scheduled automated runs
- Job logging and error tracking

## Supported Retailers

| Retailer | Status | Notes |
|----------|--------|-------|
| **Bermor Techzone** | ✅ Active | ~433 pages, configurable pagination |
| **Datablitz** | 🔄 Prepared | Scraper ready, disabled for now |
| **PCWorth** | 🔄 Prepared | Scraper ready, disabled for now |

To enable/disable retailers, edit `src/lib/scheduler.ts`:

```typescript
const ENABLED_RETAILERS: Retailer[] = [
  Retailer.BERMOR,
  // Retailer.DATABLITZ, // Uncomment when ready
  // Retailer.PCWORTH,   // Uncomment when ready
];
```

## Environment Configuration

Add these to your `.env` file:

```bash
# Scraping Configuration
SCRAPER_TIMEOUT=30000           # Request timeout in milliseconds
SCRAPER_MAX_RETRIES=3           # Number of retry attempts
SCRAPER_USER_AGENT="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"

# Bermor pagination limit
BERMOR_MAX_PAGES=50  # Recommended for scheduled runs
```

**Recommended Values:**

| Use Case | Value | Products | Time |
|----------|-------|----------|------|
| Scheduled runs | 50 | ~1,500 | ~1-2 min |
| Weekly full scrape | 100 | ~3,000 | ~3-5 min |
| Complete catalog | 0 or -1 | ~13,000 | ~15-20 min |
| Quick test | 2 | ~60 | ~10 sec |

## File Structure

```
src/scraper/
├── index.ts                    # Scraper orchestrator
├── normalizer.ts              # Data normalization
└── retailers/
    ├── bermor.ts              # Bermor Techzone scraper
    ├── datablitz.ts           # Datablitz scraper
    └── pcworth.ts             # PCWorth scraper
```

## Usage

### Method 1: Via API Endpoint

```bash
# Trigger Bermor scrape
curl -X POST http://localhost:3000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"retailer": "BERMOR"}'
```

### Method 2: Scheduled Automation

The scheduler runs automatically when the app starts (configured in `src/lib/scheduler.ts`):

- **Initial run**: 6 hours after startup
- **Recurring**: Every 6 hours
- **Max pages**: Uses `BERMOR_MAX_PAGES` environment variable

```bash
# Start the development server
npm run dev
```

### Method 3: Direct Script Execution

```bash
# Run CLI script directly
npx tsx src/scraper/cli.ts bermor

# With custom pagination
BERMOR_MAX_PAGES=100 npx tsx src/scraper/cli.ts bermor
```

## Pagination Strategy

The Bermor scraper supports flexible pagination:

```typescript
export async function scrapeBermor(maxPages: number = 5)
```

**How it works:**
- `maxPages > 0`: Scrape up to that many pages
- `maxPages <= 0`: Scrape unlimited pages (all 433)
- Automatically stops when no more pages exist

**Optimization Tips:**
- New products appear first - first 50 pages cover most new inventory
- Run unlimited scrape weekly for complete catalog
- Use 20-50 pages for daily quick updates

## Image Extraction

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
- Direct `src` images
- Lazy-loaded `data-src` images
- Progressive loading formats
- Responsive image sets

## Scheduling

### Production Deployment (Vercel Cron)

For serverless deployment, use Vercel Cron Jobs:

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

## Troubleshooting

### Only few products scraped

**Problem**: Default `maxPages = 5` is too low

**Solution**:
```bash
# Update .env
BERMOR_MAX_PAGES=50

# Or use environment variable
BERMOR_MAX_PAGES=50 npm run dev
```

### Scraping too slow

**Solutions**:
- Reduce `BERMOR_MAX_PAGES` to 20-30 for faster runs
- Increase `SCRAPER_TIMEOUT` if requests are timing out
- 1 second delay between pages is already implemented

### Connection errors

**Solutions**:
1. Check if website is accessible in browser
2. Verify `SCRAPER_USER_AGENT` in `.env`
3. Reduce `BERMOR_MAX_PAGES` to avoid rate limiting
4. Check network connectivity

### Database errors during save

```bash
# Reset database
npx prisma db push --force-reset

# Re-run scraper
npx tsx src/scraper/cli.ts bermor
```

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

  return products;
}
```

### Step 2: Update Database Schema

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

### Step 3: Enable in Scheduler

Edit `src/lib/scheduler.ts`:

```typescript
const ENABLED_RETAILERS: Retailer[] = [
  Retailer.BERMOR,
  Retailer.NEWRETAILER,  // Enable new retailer
];
```

## Monitoring

### View Scrape Jobs

```bash
# Open Prisma Studio
npx prisma studio

# Navigate to ScrapeJob table
```

### Console Logs

```
🛒 Starting Bermor scraper (max 50 pages)...
📄 Scraping page 1: http://bermorzone.com.ph/shop/
   Found 30 products on this page
✅ Scraping complete!
   Total pages scraped: 50
   Total products found: 1,500
```

## Best Practices

### Scraping Etiquette
- Use delays between requests (1 second minimum)
- Set appropriate `SCRAPER_USER_AGENT`
- Don't overwhelm target servers
- Monitor for rate limiting

### Performance Optimization
- Use pagination limits for scheduled runs
- Run full scrapes during off-peak hours
- Use upsert operations (already implemented)
- Log errors for debugging

### Data Quality
- Normalize product names and categories
- Validate prices and stock status
- Extract complete URLs
- Handle missing images gracefully

## Configuration Summary

| Setting | Default | Recommended | Location |
|---------|---------|-------------|----------|
| `BERMOR_MAX_PAGES` | 5 | 50 | `.env` |
| `SCRAPER_TIMEOUT` | 30000ms | 30000ms | `.env` |
| `SCRAPER_MAX_RETRIES` | 3 | 3 | `.env` |
| Scheduler Interval | 6 hours | 6-12 hours | `scheduler.ts` |
| Delay Between Pages | 1000ms | 1000-2000ms | `bermor.ts` |

---

**Last Updated**: 2025-01-16
