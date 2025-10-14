# Image URL Issue - Root Cause and Solution

## Problem
Product images in the database were showing as empty SVG placeholders:
```
data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20300%20300'%3E%3C/svg%3E
```

When decoded, this is:
```html
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'></svg>
```

## Root Cause

### Initial Commit Issue
The first commit (`ff8a41b`) had a Bermor scraper that was:
1. Scraping the **wrong website** (`https://www.bermor.com` instead of `http://bermorzone.com.ph`)
2. Using **incorrect selectors** that extracted empty SVG placeholder images instead of actual product images

### Data Pollution
When this old scraper ran, it saved 1,486+ products with empty SVG placeholders as their `imageUrl`.

## Solution Implemented

### 1. Fixed Scraper Logic (src/scraper/index.ts)

**Problem:** The upsert logic was broken - it tried to match products by ID, which always created duplicates instead of updating existing products.

**Fix:** Changed to match products by `retailerUrl` (unique per retailer):

```typescript
// Build a map of existing listings by retailer URL for faster lookups
const existingListings = await prisma.productListing.findMany({
  where: { retailer },
  include: { product: true },
});

const listingMap = new Map(
  existingListings.map(listing => [listing.retailerUrl, listing])
);

// For each scraped product, check if listing exists
const existingListing = listingMap.get(normalized.url);

if (existingListing) {
  // Update existing product with new data including correct imageUrl
  product = await prisma.product.update({
    where: { id: existingListing.productId },
    data: {
      name: normalized.name,
      brand: normalized.brand,
      model: normalized.model,
      description: normalized.description,
      imageUrl: normalized.imageUrl || existingListing.product.imageUrl,
    },
  });
} else {
  // Create new product
  product = await prisma.product.create({ ... });
}
```

**Benefits:**
- Properly updates existing products instead of creating duplicates
- Much faster (one database query instead of one per product)
- Correctly updates image URLs when scraper finds new images

### 2. Current Scraper Status

The **current Bermor scraper** ([src/scraper/retailers/bermor.ts](../src/scraper/retailers/bermor.ts)) is working correctly:

- ✅ Scrapes from correct website: `http://bermorzone.com.ph`
- ✅ Uses correct selectors
- ✅ Extracts actual product image URLs like:
  ```
  https://bermorzone.com.ph/wp-content/uploads/2021/09/19-113-683-V01-300x300.jpg
  ```

### 3. Database Cleanup

Ran [scripts/fix-bermor-images.ts](../scripts/fix-bermor-images.ts) which:
- Found 1,486 products with empty SVG placeholders
- Set their `imageUrl` to `null`
- Prepared them to be updated by the next scraper run

## How to Fix All Products

### Quick Fix (Recommended)

Run the complete rescrape script:

```bash
./scripts/rescrape-bermor-all.sh
```

Or manually:

```bash
BERMOR_MAX_PAGES=0 npm run scrape:bermor
```

Setting `BERMOR_MAX_PAGES=0` will scrape **unlimited pages** until all products are covered.

### Verify the Fix

After scraping completes, check that images are correct:

```bash
npx tsx scripts/check-db-images.ts
```

You should see actual image URLs like:
```
https://bermorzone.com.ph/wp-content/uploads/...
```

Instead of:
```
data:image/svg+xml,%3Csvg%20xmlns=...
```

## Technical Details

### Why Partial Scrapes Don't Fix Everything

Bermor has ~1,500 products across 50+ pages (30 products per page).

If you scrape only 2 pages:
- ✅ Updates 60 products with correct images
- ❌ Leaves 1,440+ products with empty SVG placeholders

The scraper updates products **only on the pages it scrapes**.

### Environment Variables

Control scraping behavior with environment variables:

```bash
# Scrape unlimited pages (until no more products)
BERMOR_MAX_PAGES=0 npm run scrape:bermor

# Scrape specific number of pages
BERMOR_MAX_PAGES=50 npm run scrape:bermor

# Default (5 pages) if not specified
npm run scrape:bermor
```

The setting is defined in [src/scraper/index.ts](../src/scraper/index.ts#L32-L36).

## Testing Scripts

Several debugging scripts were created to diagnose the issue:

- `scripts/test-image-extraction.ts` - Test image extraction from HTML
- `scripts/test-scraper-output.ts` - Test scraper output
- `scripts/check-db-images.ts` - Check image URLs in database
- `scripts/debug-scraper-flow.ts` - Debug full scraper flow
- `scripts/check-recent-scrape.ts` - Check recently scraped products
- `scripts/fix-bermor-images.ts` - Set empty SVGs to null

## Summary

1. **Root cause:** Old scraper from initial commit scraped wrong website and saved empty SVG placeholders
2. **Current scraper:** Works correctly and extracts proper image URLs
3. **Database fix:** Set all empty SVG placeholders to null (1,486 products)
4. **Update logic:** Fixed to properly match and update existing products by retailer URL
5. **Final step:** Run `BERMOR_MAX_PAGES=0 npm run scrape:bermor` to update all products with correct images

## Files Modified

- [src/scraper/index.ts](../src/scraper/index.ts) - Fixed product upsert logic
- [scripts/fix-bermor-images.ts](../scripts/fix-bermor-images.ts) - Database cleanup script
- [scripts/rescrape-bermor-all.sh](../scripts/rescrape-bermor-all.sh) - Convenient rescrape script
