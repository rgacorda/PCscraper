import { scrapeBermor } from '@/scraper/retailers/bermor';

async function test3Pages() {
  console.log('Testing scraper with 3 pages...\n');

  const products = await scrapeBermor(3);

  console.log(`\nTotal products scraped: ${products.length}\n`);

  // Check products from each page (assuming 30 per page)
  const page1Products = products.slice(0, 3);
  const page2Products = products.slice(30, 33);
  const page3Products = products.slice(60, 63);

  console.log('=== PAGE 1 SAMPLES ===\n');
  page1Products.forEach((p, i) => {
    console.log(`Product ${i + 1}:`);
    console.log(`  Name: ${p.name.substring(0, 60)}...`);
    console.log(`  Image: ${p.imageUrl}`);
    console.log(`  Has placeholder: ${p.imageUrl?.includes('data:image/svg') ? 'YES ❌' : 'NO ✅'}`);
    console.log();
  });

  console.log('=== PAGE 2 SAMPLES ===\n');
  page2Products.forEach((p, i) => {
    console.log(`Product ${i + 1}:`);
    console.log(`  Name: ${p.name.substring(0, 60)}...`);
    console.log(`  Image: ${p.imageUrl}`);
    console.log(`  Has placeholder: ${p.imageUrl?.includes('data:image/svg') ? 'YES ❌' : 'NO ✅'}`);
    console.log();
  });

  console.log('=== PAGE 3 SAMPLES ===\n');
  page3Products.forEach((p, i) => {
    console.log(`Product ${i + 1}:`);
    console.log(`  Name: ${p.name.substring(0, 60)}...`);
    console.log(`  Image: ${p.imageUrl}`);
    console.log(`  Has placeholder: ${p.imageUrl?.includes('data:image/svg') ? 'YES ❌' : 'NO ✅'}`);
    console.log();
  });

  // Count placeholders
  const placeholderCount = products.filter(p => p.imageUrl?.includes('data:image/svg')).length;
  console.log(`\n📊 Summary:`);
  console.log(`  Total products: ${products.length}`);
  console.log(`  Products with placeholders: ${placeholderCount}`);
  console.log(`  Products with real images: ${products.length - placeholderCount}`);
  console.log(`  Success rate: ${((1 - placeholderCount / products.length) * 100).toFixed(1)}%`);
}

test3Pages().catch(console.error);
