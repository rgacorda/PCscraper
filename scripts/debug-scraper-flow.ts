import { scrapeBermor } from '@/scraper/retailers/bermor';
import { normalizeProduct } from '@/scraper/normalizer';
import prisma from '@/lib/prisma';

async function debugScraperFlow() {
  console.log('=== STEP 1: Scraping ===\n');

  // Scrape 1 page
  const scrapedProducts = await scrapeBermor(1);
  const firstProduct = scrapedProducts[0];

  console.log('Scraped Product:');
  console.log('  Name:', firstProduct.name);
  console.log('  Price:', firstProduct.price);
  console.log('  Image URL:', firstProduct.imageUrl);
  console.log('  Image URL length:', firstProduct.imageUrl?.length);

  console.log('\n=== STEP 2: Normalizing ===\n');

  const normalized = normalizeProduct(firstProduct);

  console.log('Normalized Product:');
  console.log('  Name:', normalized.name);
  console.log('  Price:', normalized.price);
  console.log('  Image URL:', normalized.imageUrl);
  console.log('  Image URL length:', normalized.imageUrl?.length);

  console.log('\n=== STEP 3: Creating in Database ===\n');

  // Check if product already exists
  const existingProduct = await prisma.product.findFirst({
    where: {
      name: normalized.name,
    },
  });

  if (existingProduct) {
    console.log('Product already exists:', existingProduct.id);
    console.log('Existing image URL:', existingProduct.imageUrl);
  }

  // Create a test product
  const testProduct = await prisma.product.create({
    data: {
      name: `TEST_DEBUG_${Date.now()}`,
      category: normalized.category,
      brand: normalized.brand,
      model: normalized.model,
      description: normalized.description,
      imageUrl: normalized.imageUrl,
      lowestPrice: normalized.price,
      highestPrice: normalized.price,
    },
  });

  console.log('\nCreated Test Product:');
  console.log('  ID:', testProduct.id);
  console.log('  Name:', testProduct.name);
  console.log('  Image URL:', testProduct.imageUrl);
  console.log('  Image URL length:', testProduct.imageUrl?.length);

  // Read it back
  const readBack = await prisma.product.findUnique({
    where: { id: testProduct.id },
  });

  console.log('\nRead Back from Database:');
  console.log('  Image URL:', readBack?.imageUrl);
  console.log('  Image URL length:', readBack?.imageUrl?.length);

  // Clean up
  await prisma.product.delete({
    where: { id: testProduct.id },
  });

  console.log('\n✓ Test product deleted');
}

debugScraperFlow()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
