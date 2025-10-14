import { scrapeBermor } from '@/scraper/retailers/bermor';
import { normalizeProduct } from '@/scraper/normalizer';
import prisma from '@/lib/prisma';
import { Retailer } from '@prisma/client';

async function debugUpdateLogic() {
  console.log('=== Step 1: Scrape first product ===\n');

  const products = await scrapeBermor(1);
  const firstProduct = products[0];

  console.log('Scraped:');
  console.log('  Name:', firstProduct.name);
  console.log('  URL:', firstProduct.url);
  console.log('  Image:', firstProduct.imageUrl);

  console.log('\n=== Step 2: Normalize ===\n');

  const normalized = normalizeProduct(firstProduct);
  console.log('Normalized:');
  console.log('  Name:', normalized.name);
  console.log('  URL:', normalized.url);
  console.log('  Image:', normalized.imageUrl);

  console.log('\n=== Step 3: Check existing listing ===\n');

  const existingListings = await prisma.productListing.findMany({
    where: {
      retailer: Retailer.BERMOR,
    },
    include: {
      product: true,
    },
  });

  const listingMap = new Map(
    existingListings.map(listing => [listing.retailerUrl, listing])
  );

  const existingListing = listingMap.get(normalized.url);

  if (existingListing) {
    console.log('Found existing listing:');
    console.log('  Product ID:', existingListing.productId);
    console.log('  Existing product image:', existingListing.product.imageUrl?.substring(0, 100));
    console.log('  New image from scraper:', normalized.imageUrl);
    console.log('  Will use:', normalized.imageUrl || existingListing.product.imageUrl);
  } else {
    console.log('No existing listing found - will create new product');
  }

  await prisma.$disconnect();
}

debugUpdateLogic().catch(console.error);
