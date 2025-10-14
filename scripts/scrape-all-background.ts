import { PrismaClient, Retailer } from '@prisma/client';
import { scrapeBermor } from '../src/scraper/retailers/bermor';
import { normalizeProduct } from '../src/scraper/normalizer';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();
const logFile = path.join(__dirname, '../scrape-progress.log');

// Helper to log both to console and file
function log(message: string) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;

  console.log(message);
  fs.appendFileSync(logFile, logMessage);
}

async function scrapeAllBermorBackground() {
  const startTime = Date.now();

  log('🚀 Starting FULL Bermor Scraper - Background Mode');
  log('='.repeat(80));
  log('');
  log('📋 Configuration:');
  log('  Max Pages: 433 (ALL PAGES)');
  log('  Expected Products: ~13,000');
  log('  Estimated Time: 10-15 minutes');
  log('  Log File: scrape-progress.log');
  log('');
  log('='.repeat(80));
  log('');

  let itemsScraped = 0;
  let itemsSaved = 0;
  let itemsFailed = 0;

  try {
    // Step 1: Scrape ALL products
    log('📡 Phase 1: Scraping all pages...');
    const scrapedProducts = await scrapeBermor(433);
    itemsScraped = scrapedProducts.length;

    log('');
    log(`✅ Scraping complete! Found ${itemsScraped} products`);
    log('');
    log('='.repeat(80));
    log('');
    log('💾 Phase 2: Saving to database...');
    log('');

    // Step 2: Save products in batches for better progress reporting
    const batchSize = 50;
    const totalBatches = Math.ceil(scrapedProducts.length / batchSize);

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const start = batchIndex * batchSize;
      const end = Math.min(start + batchSize, scrapedProducts.length);
      const batch = scrapedProducts.slice(start, end);

      log(`📦 Processing batch ${batchIndex + 1}/${totalBatches} (items ${start + 1}-${end})`);

      for (let i = 0; i < batch.length; i++) {
        const item = batch[i];
        const globalIndex = start + i + 1;

        try {
          // Normalize the product
          const normalized = normalizeProduct(item);

          // Check if product exists by name
          let product = await prisma.product.findFirst({
            where: { name: normalized.name },
          });

          if (!product) {
            // Create new product
            product = await prisma.product.create({
              data: {
                name: normalized.name,
                category: normalized.category,
                brand: normalized.brand,
                model: normalized.model,
                description: normalized.description,
                imageUrl: normalized.imageUrl,
                lowestPrice: normalized.price,
                highestPrice: normalized.price,
              },
            });
          } else {
            // Update existing product
            product = await prisma.product.update({
              where: { id: product.id },
              data: {
                brand: normalized.brand,
                model: normalized.model,
                description: normalized.description,
                imageUrl: normalized.imageUrl,
              },
            });
          }

          // Create or update product listing for Bermor
          await prisma.productListing.upsert({
            where: {
              productId_retailer: {
                productId: product.id,
                retailer: Retailer.BERMOR,
              },
            },
            create: {
              productId: product.id,
              retailer: Retailer.BERMOR,
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

          itemsSaved++;

        } catch (err) {
          itemsFailed++;
          log(`  ✗ [${globalIndex}/${itemsScraped}] Failed: ${item.name.substring(0, 40)}... - ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }

      // Log batch completion
      const progress = ((end / itemsScraped) * 100).toFixed(1);
      log(`  ✓ Batch ${batchIndex + 1} complete | Progress: ${progress}% | Saved: ${itemsSaved} | Failed: ${itemsFailed}`);
    }

    log('');
    log('='.repeat(80));
    log('');
    log('📊 FINAL SUMMARY:');
    log('─'.repeat(80));
    log(`  Items Scraped:    ${itemsScraped}`);
    log(`  Items Saved:      ${itemsSaved}`);
    log(`  Items Failed:     ${itemsFailed}`);
    log(`  Success Rate:     ${((itemsSaved / itemsScraped) * 100).toFixed(1)}%`);
    log('');

    // Get database statistics
    const totalProducts = await prisma.product.count();
    const totalListings = await prisma.productListing.count();
    const bermorListings = await prisma.productListing.count({
      where: { retailer: Retailer.BERMOR },
    });

    log('📈 DATABASE STATISTICS:');
    log('─'.repeat(80));
    log(`  Total Products:        ${totalProducts}`);
    log(`  Total Listings:        ${totalListings}`);
    log(`  Bermor Listings:       ${bermorListings}`);
    log('');

    const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(2);
    log(`⏱️  Total Time: ${duration} minutes`);
    log('');
    log('='.repeat(80));
    log('');
    log('🎉 SCRAPING COMPLETE!');
    log('');
    log('✅ All products have been saved to the database.');
    log('📄 Full log available at: scrape-progress.log');
    log('');

  } catch (error) {
    log('');
    log('❌ Fatal Error:');
    log(error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      log('Stack trace:');
      log(error.stack);
    }
  } finally {
    await prisma.$disconnect();
    log('✓ Database connection closed');
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

// Clear log file at start
fs.writeFileSync(logFile, '');

scrapeAllBermorBackground();
