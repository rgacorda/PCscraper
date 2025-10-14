import * as cheerio from 'cheerio';
import { fetchWithRetry } from '@/lib/utils';

async function testMultiPageImages() {
  console.log('Testing image extraction across multiple pages...\n');

  for (let page = 1; page <= 3; page++) {
    const pageUrl = page === 1
      ? 'http://bermorzone.com.ph/shop/'
      : `http://bermorzone.com.ph/shop/page/${page}/`;

    console.log(`\n${'='.repeat(60)}`);
    console.log(`PAGE ${page}: ${pageUrl}`);
    console.log('='.repeat(60));

    try {
      const html = await fetchWithRetry(pageUrl);
      const $ = cheerio.load(html);

      const products = $('.product').slice(0, 3); // First 3 products per page

      console.log(`Found ${products.length} products to test\n`);

      products.each((index, element) => {
        const $el = $(element);
        const name = $el.find('.woocommerce-loop-product__title').first().text().trim();
        const $img = $el.find('img').first();

        const imageUrl = $img.attr('src') ||
                        $img.attr('data-src') ||
                        $img.attr('data-lazy-src') ||
                        '';

        console.log(`Product ${index + 1}:`);
        console.log(`  Name: ${name.substring(0, 60)}...`);
        console.log(`  Image URL: ${imageUrl}`);
        console.log(`  Image length: ${imageUrl?.length || 0}`);
        console.log(`  Is placeholder: ${imageUrl?.includes('data:image/svg') ? 'YES ❌' : 'NO ✅'}`);
        console.log();
      });

      // Add delay between pages
      if (page < 3) {
        console.log(`Waiting 1 second before next page...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } catch (err) {
      console.error(`Error on page ${page}:`, err);
    }
  }
}

testMultiPageImages().catch(console.error);
