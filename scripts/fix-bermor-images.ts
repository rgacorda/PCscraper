import prisma from '@/lib/prisma';
import { Retailer } from '@prisma/client';

async function fixBermorImages() {
  console.log('Checking for products with empty SVG placeholders...\n');

  const emptyImagePattern = 'data:image/svg+xml,%3Csvg%20xmlns';

  // Find all products with empty SVG placeholders
  const productsWithEmptyImages = await prisma.product.findMany({
    where: {
      imageUrl: {
        startsWith: emptyImagePattern,
      },
      listings: {
        some: {
          retailer: Retailer.BERMOR,
        },
      },
    },
    include: {
      listings: {
        where: {
          retailer: Retailer.BERMOR,
        },
      },
    },
  });

  console.log(`Found ${productsWithEmptyImages.length} products with empty image placeholders\n`);

  if (productsWithEmptyImages.length === 0) {
    console.log('No products to fix!');
    return;
  }

  console.log('Options:');
  console.log('1. Delete these products (they will be re-scraped with correct images)');
  console.log('2. Set imageUrl to null (remove placeholder, but keep product data)');
  console.log('\nThis script will set imageUrl to null.\n');

  // Set imageUrl to null for all products with empty placeholders
  const result = await prisma.product.updateMany({
    where: {
      imageUrl: {
        startsWith: emptyImagePattern,
      },
    },
    data: {
      imageUrl: null,
    },
  });

  console.log(`✓ Updated ${result.count} products`);
  console.log('\nTo get the correct images, run the Bermor scraper again:');
  console.log('  npm run scrape:bermor');
  console.log('\nThe scraper will update existing products with the correct image URLs.');
}

fixBermorImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
