import { Retailer } from '@prisma/client';
import { scrapeDatablitz } from './retailers/datablitz';
import { scrapePCWorx } from './retailers/pcworx';
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
      case Retailer.PCWORX:
        scrapedData = await scrapePCWorx();
        break;
      case Retailer.BERMOR:
        scrapedData = await scrapeBermor();
        break;
      default:
        throw new Error(`Unknown retailer: ${retailer}`);
    }

    itemsScraped = scrapedData.length;

    // Process each scraped item
    for (const item of scrapedData) {
      try {
        const normalized = normalizeProduct(item);

        // Upsert product
        const product = await prisma.product.upsert({
          where: {
            id: normalized.productId || 'new',
          },
          create: {
            name: normalized.name,
            category: normalized.category,
            brand: normalized.brand,
            model: normalized.model,
            description: normalized.description,
            imageUrl: normalized.imageUrl,
            lowestPrice: normalized.price,
            highestPrice: normalized.price,
          },
          update: {
            name: normalized.name,
            brand: normalized.brand,
            model: normalized.model,
            description: normalized.description,
            imageUrl: normalized.imageUrl,
          },
        });

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
