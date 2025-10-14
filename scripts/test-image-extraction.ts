import * as cheerio from 'cheerio';
import { fetchWithRetry } from '@/lib/utils';

async function testImageExtraction() {
  console.log('Fetching Bermor shop page...\n');

  const html = await fetchWithRetry('http://bermorzone.com.ph/shop/');
  const $ = cheerio.load(html);

  // Get first 3 products
  const products = $('.product').slice(0, 3);

  console.log(`Found ${products.length} products to analyze\n`);

  products.each((index, element) => {
    const $el = $(element);
    const $img = $el.find('img').first();

    console.log(`=== Product ${index + 1} ===`);
    console.log('Image src:', $img.attr('src'));
    console.log('Image data-src:', $img.attr('data-src'));
    console.log('Image data-lazy-src:', $img.attr('data-lazy-src'));
    console.log('Image data-original:', $img.attr('data-original'));
    console.log('Image srcset:', $img.attr('srcset'));
    console.log('Image data-srcset:', $img.attr('data-srcset'));
    console.log('Image class:', $img.attr('class'));

    console.log('\nAll img attributes:', $img.attr());
    console.log('\nFull img HTML:');
    console.log($.html($img));
    console.log('\n');
  });
}

testImageExtraction().catch(console.error);
