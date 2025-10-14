import * as cheerio from 'cheerio';
import { fetchWithRetry } from '@/lib/utils';

async function inspectPage2Images() {
  console.log('Inspecting image attributes on page 2...\n');

  const pageUrl = 'http://bermorzone.com.ph/shop/page/2/';
  const html = await fetchWithRetry(pageUrl);
  const $ = cheerio.load(html);

  const products = $('.product').slice(0, 3);

  products.each((index, element) => {
    const $el = $(element);
    const name = $el.find('.woocommerce-loop-product__title').first().text().trim();
    const $img = $el.find('img').first();

    console.log(`\n${'='.repeat(60)}`);
    console.log(`Product ${index + 1}: ${name.substring(0, 50)}...`);
    console.log('='.repeat(60));

    // Get ALL attributes
    const attrs = $img.attr();
    console.log('\nAll image attributes:');
    for (const [key, value] of Object.entries(attrs || {})) {
      console.log(`  ${key}: ${typeof value === 'string' ? value.substring(0, 100) : value}`);
    }

    // Get parent link
    const $link = $el.find('a.woocommerce-LoopProduct-link').first();
    console.log('\nProduct URL:', $link.attr('href'));

    console.log('\nFull img HTML:');
    console.log($.html($img).substring(0, 500));
  });
}

inspectPage2Images().catch(console.error);
