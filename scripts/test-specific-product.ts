import { scrapeBermor } from '@/scraper/retailers/bermor';

async function testSpecificProduct() {
  console.log('Scraping first page of Bermor...\n');

  const products = await scrapeBermor(1);

  // Find "AMD Ryzen 7 5800X" product
  const testProduct = products.find(p => p.name.includes('5800X'));

  if (testProduct) {
    console.log('Found test product:');
    console.log('  Name:', testProduct.name);
    console.log('  Price:', testProduct.price);
    console.log('  URL:', testProduct.url);
    console.log('  Image URL:', testProduct.imageUrl);
    console.log('  Image URL length:', testProduct.imageUrl?.length);
    console.log('  In Stock:', testProduct.inStock);
  } else {
    console.log('Product not found. Showing first product instead:\n');
    const firstProduct = products[0];
    console.log('  Name:', firstProduct.name);
    console.log('  Price:', firstProduct.price);
    console.log('  URL:', firstProduct.url);
    console.log('  Image URL:', firstProduct.imageUrl);
    console.log('  Image URL length:', firstProduct.imageUrl?.length);
    console.log('  In Stock:', firstProduct.inStock);
  }
}

testSpecificProduct().catch(console.error);
