import { Retailer } from '@prisma/client';
import { scrapeDatablitz } from './retailers/datablitz';
import { scrapePCWorth } from './retailers/pcworth';
import { scrapeBermor } from './retailers/bermor';
import prisma from '@/lib/prisma';
import { normalizeProduct } from './normalizer';

/**
 * Get all categories for a retailer to track pagination state
 */
function getRetailerCategories(retailer: Retailer): string[] {
  const categoryMap: Record<Retailer, string[]> = {
    [Retailer.BERMOR]: [
      'CPU',
      'MOTHERBOARD',
      'RAM',
      'HDD',
      'SSD',
      'GPU',
      'CASE',
      'MONITOR',
      'PSU',
      'CPU_COOLER_AIR',
      'CPU_COOLER_AIO',
      'CASE_FAN',
      'ACCESSORY',
    ],
    [Retailer.PCWORTH]: [
      'GPU',
      'CPU',
      'MOTHERBOARD',
      'RAM',
      'SSD',
      'HDD',
      'PSU',
      'CASE',
      'CPU_COOLER',
      'CASE_FAN',
      'MONITOR',
      'PERIPHERAL',
      'ACCESSORIES',
    ],
    [Retailer.DATABLITZ]: [''], // Datablitz uses single category
  };
  return categoryMap[retailer] || [];
}

/**
 * Get pagination state for a retailer/category combo
 */
async function getScrapingState(retailer: Retailer, category: string = '') {
  let state = await prisma.scrapingState.findUnique({
    where: {
      retailer_category: {
        retailer,
        category,
      },
    },
  });

  // If no state exists, create one
  if (!state) {
    state = await prisma.scrapingState.create({
      data: {
        retailer,
        category,
        currentPage: 1,
        isComplete: false,
      },
    });
  }

  return state;
}

/**
 * Update pagination state after scraping
 */
async function updateScrapingState(
  retailer: Retailer,
  category: string = '',
  lastScrapedPage: number,
  isComplete: boolean
) {
  // Determine next page
  const nextPage = isComplete ? 1 : lastScrapedPage + 1;

  await prisma.scrapingState.upsert({
    where: {
      retailer_category: {
        retailer,
        category,
      },
    },
    create: {
      retailer,
      category,
      currentPage: nextPage,
      isComplete,
    },
    update: {
      currentPage: nextPage,
      isComplete,
      lastCompletedAt: new Date(),
    },
  });
}

/**
 * Delete products that haven't been scraped in X days (default 30 days)
 */
async function deleteOldProducts(retailer: Retailer, daysOld: number = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  console.log(
    `🗑️  Cleaning up products not scraped since ${cutoffDate.toISOString()}...`
  );

  // Find old listings for this retailer
  const oldListings = await prisma.productListing.findMany({
    where: {
      retailer,
      lastScraped: {
        lt: cutoffDate,
      },
    },
    select: {
      id: true,
      productId: true,
    },
  });

  console.log(`   Found ${oldListings.length} old listings to clean up`);

  // Delete old listings
  const deletedListings = await prisma.productListing.deleteMany({
    where: {
      id: {
        in: oldListings.map((l) => l.id),
      },
    },
  });

  // Find orphaned products (products with no listings)
  const orphanedProducts = await prisma.product.findMany({
    where: {
      listings: {
        none: {},
      },
    },
    select: {
      id: true,
    },
  });

  console.log(`   Found ${orphanedProducts.length} orphaned products to delete`);

  // Delete orphaned products
  const deletedProducts = await prisma.product.deleteMany({
    where: {
      id: {
        in: orphanedProducts.map((p) => p.id),
      },
    },
  });

  console.log(
    `   ✓ Deleted ${deletedListings.count} listings and ${deletedProducts.count} orphaned products`
  );

  return {
    listingsDeleted: deletedListings.count,
    productsDeleted: deletedProducts.count,
  };
}

export async function runScraperJob(retailer: Retailer) {
  const job = await prisma.scrapeJob.create({
    data: {
      retailer,
      status: 'running',
    },
  });

  let itemsScraped = 0;
  let itemsUpdated = 0;
  let itemsFailed = 0;
  let itemsDeleted = 0;
  let error: string | null = null;

  try {
    // Get all categories for this retailer
    const categories = getRetailerCategories(retailer);

    // Track total scraped products
    const allScrapedProducts: any[] = [];
    let allCategoriesComplete = true;

    // Scrape each category, resuming from where we left off
    for (const category of categories) {
      const scrapingState = await getScrapingState(retailer, category);
      const startPage = scrapingState.currentPage;
      const isAlreadyComplete = scrapingState.isComplete;

      if (isAlreadyComplete) {
        console.log(
          `⏭️  Category "${category || 'default'}" already complete, resetting to page 1`
        );
        await updateScrapingState(retailer, category, 1, false);
      } else {
        console.log(
          `📄 Resuming category "${category || 'default'}" from page ${startPage}...`
        );
      }

      let scrapedData;
      let isScrapingComplete = false;

      const maxPages =
        retailer === Retailer.BERMOR
          ? parseInt(process.env.BERMOR_MAX_PAGES || '5', 10)
          : retailer === Retailer.DATABLITZ
          ? parseInt(process.env.DATABLITZ_MAX_PAGES || '50', 10)
          : parseInt(process.env.PCWORTH_MAX_PAGES || '50', 10);

      switch (retailer) {
        case Retailer.DATABLITZ:
          scrapedData = await scrapeDatablitz(maxPages, startPage);
          isScrapingComplete = startPage === 1 || scrapedData.length === 0;
          break;
        case Retailer.PCWORTH:
          scrapedData = await scrapePCWorth(startPage, category);
          isScrapingComplete = startPage === 1 || scrapedData.length === 0;
          break;
        case Retailer.BERMOR:
          scrapedData = await scrapeBermor(maxPages, startPage, category);
          isScrapingComplete = startPage === 1 || scrapedData.length === 0;
          break;
        default:
          throw new Error(`Unknown retailer: ${retailer}`);
      }

      allScrapedProducts.push(...scrapedData);
      allCategoriesComplete = allCategoriesComplete && isScrapingComplete;

      // Update scraping state for this category
      await updateScrapingState(retailer, category, startPage, isScrapingComplete);
    }

    itemsScraped = allScrapedProducts.length;

    console.log(`📥 Processing ${itemsScraped} scraped products...`);

    // Build a map of existing listings by retailer URL for faster lookups
    console.log('📊 Building map of existing listings...');
    const existingListings = await prisma.productListing.findMany({
      where: {
        retailer,
      },
      include: {
        product: true,
      },
    });

    const listingMap = new Map(
      existingListings.map((listing) => [listing.retailerUrl, listing])
    );
    console.log(`   Found ${listingMap.size} existing listings for ${retailer}`);

    // Process each scraped item
    for (const item of allScrapedProducts) {
      try {
        const normalized = normalizeProduct(item);

        // Check if a listing already exists for this retailer URL
        const existingListing = listingMap.get(normalized.url);

        let product;

        if (existingListing) {
          // Update existing product
          product = await prisma.product.update({
            where: {
              id: existingListing.productId,
            },
            data: {
              name: normalized.name,
              brand: normalized.brand,
              model: normalized.model,
              description: normalized.description,
              imageUrl: normalized.imageUrl || existingListing.product.imageUrl,
              rating: normalized.rating,
            },
          });
        } else {
          // Create new product
          product = await prisma.product.create({
            data: {
              name: normalized.name,
              category: normalized.category,
              brand: normalized.brand,
              model: normalized.model,
              description: normalized.description,
              imageUrl: normalized.imageUrl,
              rating: normalized.rating,
              lowestPrice: normalized.price,
              highestPrice: normalized.price,
            },
          });
        }

        // Upsert listing
        await prisma.productListing.upsert({
          where: {
            productId_retailer: {
              productId: product.id,
              retailer,
            },
          },
          create: {
            productId: product.id,
            retailer,
            retailerUrl: normalized.url,
            price: normalized.price,
            stockStatus: normalized.stockStatus,
          },
          update: {
            price: normalized.price,
            stockStatus: normalized.stockStatus,
            retailerUrl: normalized.url,
            lastScraped: new Date(),
          },
        });

        // Update product price range
        await updateProductPriceRange(product.id);

        itemsUpdated++;
      } catch (err) {
        console.error('Error processing item:', err);
        itemsFailed++;
      }
    }

    // Clean up old products that haven't been scraped in 30 days
    console.log('\n🧹 Cleaning up old products...');
    const cleanupResult = await deleteOldProducts(retailer, 30);
    itemsDeleted = cleanupResult.listingsDeleted;

    console.log(`\n✅ Scraping job completed for ${retailer}`);
    console.log(`   Scraped: ${itemsScraped}`);
    console.log(`   Updated/Created: ${itemsUpdated}`);
    console.log(`   Failed: ${itemsFailed}`);
    console.log(`   Deleted (old): ${itemsDeleted}`);

    await prisma.scrapeJob.update({
      where: { id: job.id },
      data: {
        status: 'completed',
        itemsScraped,
        itemsUpdated,
        itemsFailed,
        completedAt: new Date(),
      },
    });

    return {
      success: true,
      retailer,
      itemsScraped,
      itemsUpdated,
      itemsFailed,
      itemsDeleted,
    };
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unknown error';
    console.error('Scraper job failed:', error);

    await prisma.scrapeJob.update({
      where: { id: job.id },
      data: {
        status: 'failed',
        error,
        itemsScraped,
        itemsUpdated,
        itemsFailed,
        completedAt: new Date(),
      },
    });

    throw err;
  }
}

async function updateProductPriceRange(productId: string) {
  const listings = await prisma.productListing.findMany({
    where: {
      productId,
      isActive: true,
    },
    select: {
      price: true,
    },
  });

  if (listings.length === 0) return;

  const prices = listings.map((l) => Number(l.price));
  const lowestPrice = Math.min(...prices);
  const highestPrice = Math.max(...prices);

  await prisma.product.update({
    where: { id: productId },
    data: {
      lowestPrice,
      highestPrice,
    },
  });
}
