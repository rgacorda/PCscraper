import { scrapeBermor } from '@/scraper/retailers/bermor';

async function testScraper() {
  console.log('Running Bermor scraper with max 1 page...\n');

  const products = await scrapeBermor(1);

  console.log('\n=== First 5 Products ===\n');

  products.slice(0, 5).forEach((product, index) => {
    console.log(`Product ${index + 1}:`);
    console.log('  Name:', product.name);
    console.log('  Price:', product.price);
    console.log('  URL:', product.url);
    console.log('  Image URL:', product.imageUrl);
    console.log('  Image URL length:', product.imageUrl?.length || 0);
    console.log('  In Stock:', product.inStock);
    console.log();
  });
}

testScraper().catch(console.error);
