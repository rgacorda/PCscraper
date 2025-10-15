import { Retailer } from '@prisma/client';
import { scrapeDatablitz } from './retailers/datablitz';
import { scrapePCWorth } from './retailers/pcworth';
import { scrapeBermor } from './retailers/bermor';
import prisma from '@/lib/prisma';
import { normalizeProduct } from './normalizer';

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
  let error: string | null = null;

  try {
    let scrapedData;

    switch (retailer) {
      case Retailer.DATABLITZ:
        scrapedData = await scrapeDatablitz();
        break;
      case Retailer.PCWORTH:
        scrapedData = await scrapePCWorth();
        break;
      case Retailer.BERMOR:
        // Get max pages from environment variable (default to 5 if not set)
        const bermorMaxPages = process.env.BERMOR_MAX_PAGES
          ? parseInt(process.env.BERMOR_MAX_PAGES, 10)
          : 5;
        scrapedData = await scrapeBermor(bermorMaxPages);
        break;
      default:
        throw new Error(`Unknown retailer: ${retailer}`);
    }

    itemsScraped = scrapedData.length;

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
      existingListings.map(listing => [listing.retailerUrl, listing])
    );
    console.log(`   Found ${listingMap.size} existing listings for ${retailer}`);

    // Process each scraped item
    for (const item of scrapedData) {
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
