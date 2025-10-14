# Scheduler Configuration

## Overview

The scheduler automatically runs the scraper every 6 hours to keep product data up-to-date.

## Configuration

### Location
- Scheduler setup: [src/lib/scheduler.ts](../src/lib/scheduler.ts)
- Instrumentation hook: [src/instrumentation.ts](../src/instrumentation.ts)

### Behavior

**Current Configuration:**
- ✅ Runs every 6 hours automatically
- ✅ Does NOT run on startup (to avoid slowing down `npm run dev`)
- ✅ First scheduled run happens 6 hours after server starts

**Previous Configuration:**
- ❌ Ran immediately on startup (removed to improve dev experience)

### Enabled Retailers

Configure which retailers to scrape in [src/lib/scheduler.ts](../src/lib/scheduler.ts#L6-L10):

```typescript
const ENABLED_RETAILERS: Retailer[] = [
  Retailer.BERMOR,
  // Retailer.DATABLITZ, // Add when scraper is ready
  // Retailer.PCWORTH,   // Add when scraper is ready
];
```

### Environment Variables

Control scraping behavior with environment variables:

```bash
# Bermor - Maximum pages to scrape per run
BERMOR_MAX_PAGES=50  # Default: scrape 50 pages (~1,500 products)
BERMOR_MAX_PAGES=0   # Scrape ALL pages (unlimited)

# Cron secret for production API calls
CRON_SECRET=your-secret-key
```

## Manual Scraping

### Option 1: CLI Scripts

Run scrapers manually using npm scripts:

```bash
# Scrape specific retailer
npm run scrape:bermor
npm run scrape:datablitz
npm run scrape:pcworth

# Scrape all retailers
npm run scrape:all

# With environment variables
BERMOR_MAX_PAGES=0 npm run scrape:bermor
```

### Option 2: API Endpoint

Trigger scraping via HTTP POST:

**Development:**
```bash
curl -X POST http://localhost:3000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"retailer": "BERMOR"}'
```

**Production:**
```bash
curl -X POST https://your-domain.com/api/scrape \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -d '{"retailer": "BERMOR"}'
```

### Option 3: Direct Script Execution

```bash
# Run CLI script directly
npx tsx src/scraper/cli.ts bermor

# With environment variables
BERMOR_MAX_PAGES=0 npx tsx src/scraper/cli.ts bermor

# Run specific debug scripts
npx tsx scripts/test-scraper-output.ts
npx tsx scripts/check-db-images.ts
```

## How It Works

### 1. Instrumentation Hook

Next.js experimental instrumentation hook is enabled in [next.config.ts](../next.config.ts#L23):

```typescript
experimental: {
  instrumentationHook: true,
}
```

### 2. Register Function

When the Next.js server starts, [src/instrumentation.ts](../src/instrumentation.ts) calls `setupScheduler()`:

```typescript
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { setupScheduler } = await import('./lib/scheduler');
    setupScheduler();
  }
}
```

### 3. Scheduler Setup

The scheduler uses `setInterval` to run every 6 hours:

```typescript
export function setupScheduler() {
  const SIX_HOURS = 6 * 60 * 60 * 1000;

  console.log('⏰ Scheduler initialized - will run every 6 hours');
  console.log('⏰ First scheduled scrape will run in 6 hours from now');

  setInterval(() => {
    console.log('⏰ Triggered scheduled scrape (every 6 hours)');
    runAllScrapers().catch(console.error);
  }, SIX_HOURS);
}
```

### 4. Scraper Execution

Each enabled retailer is scraped sequentially:

```typescript
export async function runAllScrapers() {
  for (const retailer of ENABLED_RETAILERS) {
    const result = await runScraperJob(retailer);
    // ...
  }
}
```

## Timeline Example

If you start the server at **12:00 PM**:

```
12:00 PM - Server starts
12:00 PM - Scheduler initialized
12:00 PM - No scraping (startup scrape removed)
06:00 PM - First scheduled scrape runs
12:00 AM - Second scheduled scrape runs
06:00 AM - Third scheduled scrape runs
...
```

## Disabling the Scheduler

### Option 1: Comment out instrumentation

In [src/instrumentation.ts](../src/instrumentation.ts):

```typescript
export async function register() {
  // Temporarily disable scheduler
  // if (process.env.NEXT_RUNTIME === 'nodejs') {
  //   const { setupScheduler } = await import('./lib/scheduler');
  //   setupScheduler();
  // }
}
```

### Option 2: Environment variable guard

Add a guard in [src/lib/scheduler.ts](../src/lib/scheduler.ts):

```typescript
export function setupScheduler() {
  if (process.env.DISABLE_SCHEDULER === 'true') {
    console.log('⏰ Scheduler disabled via environment variable');
    return;
  }

  // ... rest of setup
}
```

Then in `.env`:
```bash
DISABLE_SCHEDULER=true
```

## Production Deployment

### Vercel / Serverless

**Important:** `setInterval` may not work reliably in serverless environments like Vercel because:
- Functions are short-lived
- No persistent process to maintain intervals

**Recommended approach for serverless:**

1. **Disable the scheduler** in production
2. **Use external cron service** like:
   - Vercel Cron Jobs
   - GitHub Actions scheduled workflows
   - Cron-job.org
   - EasyCron

3. **Configure external cron** to call your API endpoint:
   ```
   */6 * * * *  # Every 6 hours
   ```

   Calls:
   ```bash
   POST https://your-domain.com/api/scrape
   Authorization: Bearer YOUR_CRON_SECRET
   Body: {"retailer": "BERMOR"}
   ```

### VPS / Docker / Traditional Hosting

The scheduler works fine in environments with persistent processes:
- VPS (Digital Ocean, Linode, AWS EC2)
- Docker containers
- Traditional Node.js hosting

## Monitoring

### Console Logs

The scheduler outputs logs:

```
⏰ Scheduler initialized - will run every 6 hours
⏰ First scheduled scrape will run in 6 hours from now
...
⏰ Triggered scheduled scrape (every 6 hours)
🚀 Starting scheduled scraper job...
📋 Enabled retailers: BERMOR
📦 Scraping BERMOR...
✅ BERMOR completed: { success: true, itemsScraped: 60, ... }
🎉 Scheduled scraping completed!
```

### Database Tracking

Check scrape job history in the database:

```typescript
// Get recent scrape jobs
const recentJobs = await prisma.scrapeJob.findMany({
  orderBy: { startedAt: 'desc' },
  take: 10,
});
```

Or use the Prisma Studio:
```bash
npm run db:studio
```

Navigate to the `scrape_jobs` table to see:
- Job status (running, completed, failed)
- Start and completion times
- Items scraped/updated/failed
- Error messages

## Troubleshooting

### Scheduler not running

1. Check if instrumentation hook is enabled in `next.config.ts`
2. Check console for initialization message
3. Verify `NEXT_RUNTIME === 'nodejs'` (not edge runtime)

### Scraping fails

1. Check scrape_jobs table for error messages
2. Run manual scrape to debug: `npm run scrape:bermor`
3. Check network connectivity
4. Verify website structure hasn't changed

### Performance issues

1. Reduce `BERMOR_MAX_PAGES` for faster scrapes
2. Add delays between pages in scraper
3. Monitor database connection pool
4. Consider running scraper in separate process

## Related Files

- [src/lib/scheduler.ts](../src/lib/scheduler.ts) - Scheduler implementation
- [src/instrumentation.ts](../src/instrumentation.ts) - Next.js instrumentation hook
- [src/scraper/index.ts](../src/scraper/index.ts) - Main scraper logic
- [src/scraper/cli.ts](../src/scraper/cli.ts) - CLI interface
- [src/app/api/scrape/route.ts](../src/app/api/scrape/route.ts) - HTTP API endpoint
