# Pagination Resume & Auto-Cleanup Feature

## Overview

The scraper system now has intelligent pagination resume functionality and automatic cleanup of old products.

## Key Features

### 1. **Pagination Resume (Continue from Last Page)**

- The scraper tracks the last page it scraped for each retailer and category
- On the next scheduled run (every 3 hours), it resumes from where it left off
- Once all pages are scraped, it resets to page 1 and starts over
- This ensures **all products are continuously updated**, not just the first N pages

#### How It Works:

```
Run 1 (3 hours):  Scrapes pages 1-50 → Stores state: currentPage=51
Run 2 (3 hours):  Scrapes pages 51-100 → Stores state: currentPage=101
Run 3 (3 hours):  Scrapes pages 101-150 → Stores state: currentPage=1 (reset)
Run 4 (3 hours):  Scrapes pages 1-50 again (cycle restarts)
```

### 2. **Automatic Old Product Deletion**

- Products that haven't been scraped in the last **30 days** are automatically deleted
- When a listing is deleted and a product has no other listings, the product is also deleted
- This keeps the database clean and removes outdated items

#### Cleanup Behavior:

```
Product lastScraped: October 1
Current date: November 15
Days without scraping: 45 days

Result: Product and its listing are deleted ✓
```

### 3. **3-Hour Scheduling**

- Changed from 6-hour to 3-hour intervals
- More frequent updates and faster complete catalog coverage
- Balanced between server load and data freshness

## Database Schema

### New ScrapingState Model

Tracks pagination progress for each retailer/category combination:

```prisma
model ScrapingState {
  id               String   @id @default(cuid())
  retailer         Retailer                    // BERMOR, PCWORTH, DATABLITZ
  category         String                      // Category name or empty
  currentPage      Int      @default(1)        // Current page to scrape
  lastCompletedAt  DateTime @default(now())    // When fully cycled
  isComplete       Boolean  @default(false)    // true = all pages done

  @@unique([retailer, category])
}
```

### Updated ProductListing Model

Already has `lastScraped` field to track when product was last seen.

## Configuration

### Environment Variables

```bash
# Max pages per cycle (controls pagination chunk size)
BERMOR_MAX_PAGES=5          # Scrape 5 pages per 3-hour cycle
DATABLITZ_MAX_PAGES=50      # Scrape 50 pages per cycle
PCWORTH_MAX_PAGES=50        # Scrape 50 pages per cycle

# Set to 0 or -1 for unlimited (scrape ALL pages in single run)
BERMOR_MAX_PAGES=0          # Scrape all pages in one go
```

## Scraper Flow

### Per Cycle (Every 3 Hours)

```
1. Get ScrapingState for each retailer/category
   ├─ If already complete → Reset to page 1
   └─ Else → Use stored currentPage

2. Scrape with resume point
   └─ Pass startPage to scraper

3. Update ScrapingState
   ├─ Update currentPage to next page
   └─ Set isComplete flag if all pages done

4. Process & store products
   └─ Update prices, stock, create new listings

5. Clean old products
   ├─ Find listings not scraped in 30 days
   ├─ Delete those listings
   └─ Delete orphaned products (no listings)
```

## Code Changes

### Scrapers Updated

- **bermor.ts**: Added `startPage` and `categoryFilter` parameters
- **datablitz.ts**: Added `startPage` parameter
- **pcworth.ts**: Added `startPage` and `categoryFilter` parameters

### New Functions in index.ts

- `getRetailerCategories()`: Get all categories for a retailer
- `getScrapingState()`: Fetch or create pagination state
- `updateScrapingState()`: Update pagination progress
- `deleteOldProducts()`: Clean up old products not scraped in X days

### Scheduler Changes

- Changed interval from 6 hours → 3 hours
- Updated console messages

## Example Scraping Cycle

### Scenario: Bermor with 433 pages, max 50 per cycle

```
Day 1, 00:00 - Run 1 (0-50)
├─ Scrape pages 1-50
├─ Find 2,500 products
└─ State: currentPage=51, isComplete=false

Day 1, 03:00 - Run 2 (50-100)
├─ Resume from page 51
├─ Scrape pages 51-100
├─ Find 2,300 products
└─ State: currentPage=101, isComplete=false

... continues every 3 hours ...

Day 4, 12:00 - Run 27 (400-433)
├─ Resume from page 400
├─ Scrape pages 400-433 (last page reached!)
├─ Find 1,800 products
└─ State: currentPage=1, isComplete=true

Day 4, 15:00 - Run 28 (1-50)
├─ Cycle reset! Start from page 1
├─ Scrape pages 1-50 again
├─ Update existing products with new prices
└─ State: currentPage=51, isComplete=false
```

**Result**: All 433 pages covered in ~4 days with continuous updates!

## Benefits

✅ **Complete Coverage**: All products eventually scraped, not just first N pages  
✅ **Continuous Updates**: Price and stock changes detected across entire catalog  
✅ **Auto Cleanup**: Old products automatically removed (prevents stale data)  
✅ **Efficient**: Spreads large catalogs across multiple cycles  
✅ **Resilient**: Can resume after failures or interruptions  
✅ **Database Clean**: Orphaned products automatically deleted

## Monitoring

To check scraping progress:

```sql
-- Check current pagination state
SELECT retailer, category, currentPage, isComplete, lastCompletedAt
FROM scraping_state
ORDER BY retailer, category;

-- Check which products were last scraped
SELECT
  r.category,
  COUNT(*) as count,
  MAX(p.lastScraped) as most_recent,
  MIN(p.lastScraped) as oldest
FROM product_listings p
GROUP BY r.category
ORDER BY most_recent DESC;
```

## Troubleshooting

### Scraper Stuck on Page 1

**Solution**: Check database for ScrapingState with `isComplete=true`, then reset:

```sql
UPDATE scraping_state SET currentPage = 1, isComplete = false;
```

### Products Not Being Deleted

- Check that products haven't been scraped in 30+ days
- Verify `lastScraped` field is being updated in ProductListing
- Check database cleanup logs in ScrapeJob error field

### Resume Not Working

1. Verify ScrapingState table exists: `SELECT * FROM scraping_state;`
2. Check scraper logs for pagination resume messages
3. Verify `startPage` parameter is being used in scraper calls
