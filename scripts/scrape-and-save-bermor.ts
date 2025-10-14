import { PrismaClient, Retailer } from '@prisma/client';
import { scrapeBermor } from '../src/scraper/retailers/bermor';
import { normalizeProduct } from '../src/scraper/normalizer';

const prisma = new PrismaClient();

async function scrapeBermorAndSave() {
  console.log('🚀 Starting Bermor Scraper - Save to Database\n');
  console.log('='.repeat(80) + '\n');

  // Configure how many pages to scrape (default: 10 pages = ~300 products)
  // Set to a higher number or remove limit to scrape all 433 pages (~12,990 products)
  const maxPages = parseInt(process.env.MAX_PAGES || '10');

  let itemsScraped = 0;
  let itemsCreated = 0;
  let itemsUpdated = 0;
  let itemsFailed = 0;

  try {
    // Step 1: Scrape products
    console.log(`📡 Scraping Bermor Techzone (max ${maxPages} pages)...`);
    const scrapedProducts = await scrapeBermor(maxPages);
    itemsScraped = scrapedProducts.length;
    console.log(`✅ Scraped ${itemsScraped} products\n`);

    console.log('💾 Saving to database...\n');

    // Step 2: Save each product to database
    for (let i = 0; i < scrapedProducts.length; i++) {
      const item = scrapedProducts[i];

      try {
        console.log(`[${i + 1}/${itemsScraped}] Processing: ${item.name.substring(0, 60)}...`);

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
        const listing = await prisma.productListing.upsert({
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

        itemsCreated++;
        console.log(`  ✓ Saved: ${product.name.substring(0, 50)} - ₱${normalized.price}`);

      } catch (err) {
        itemsFailed++;
        console.error(`  ✗ Failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n📊 SCRAPING SUMMARY:\n');
    console.log(`  Items Scraped:    ${itemsScraped}`);
    console.log(`  Items Saved:      ${itemsCreated}`);
    console.log(`  Items Failed:     ${itemsFailed}`);
    console.log(`  Success Rate:     ${((itemsCreated / itemsScraped) * 100).toFixed(1)}%`);

    // Get database statistics
    console.log('\n📈 DATABASE STATISTICS:\n');
    const totalProducts = await prisma.product.count();
    const totalListings = await prisma.productListing.count();
    const bermorListings = await prisma.productListing.count({
      where: { retailer: Retailer.BERMOR },
    });

    console.log(`  Total Products:        ${totalProducts}`);
    console.log(`  Total Listings:        ${totalListings}`);
    console.log(`  Bermor Listings:       ${bermorListings}`);

    // Show sample products
    console.log('\n✨ SAMPLE SAVED PRODUCTS:\n');
    const sampleProducts = await prisma.product.findMany({
      take: 5,
      include: {
        listings: {
          where: { retailer: Retailer.BERMOR },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    sampleProducts.forEach((product, index) => {
      const listing = product.listings[0];
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Price: ₱${listing?.price || 'N/A'}`);
      console.log(`   Stock: ${listing?.stockStatus || 'N/A'}`);
      console.log(`   URL: ${listing?.retailerUrl.substring(0, 60)}...`);
      console.log();
    });

    console.log('='.repeat(80));
    console.log('\n🎉 SCRAPING COMPLETE!\n');

  } catch (error) {
    console.error('\n❌ Fatal Error:', error);
    if (error instanceof Error) {
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
    }
  } finally {
    await prisma.$disconnect();
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

scrapeBermorAndSave();
