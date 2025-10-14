import * as cheerio from 'cheerio';
import { ScrapedProduct } from '../normalizer';
import { fetchWithRetry } from '@/lib/utils';

export async function scrapeBermor(maxPages: number = 5): Promise<ScrapedProduct[]> {
  const products: ScrapedProduct[] = [];
  const baseUrl = 'http://bermorzone.com.ph';
  const shopUrl = `${baseUrl}/shop/`;

  console.log(`🛒 Starting Bermor scraper (max ${maxPages} pages)...`);

  try {
    let currentPage = 1;
    let hasNextPage = true;

    while (hasNextPage && currentPage <= maxPages) {
      const pageUrl = currentPage === 1 ? shopUrl : `${shopUrl}page/${currentPage}/`;

      console.log(`\n📄 Scraping page ${currentPage}: ${pageUrl}`);

      try {
        const html = await fetchWithRetry(pageUrl);
        const $ = cheerio.load(html);

        const productsOnPage = $('.product').length;
        console.log(`   Found ${productsOnPage} products on this page`);

        if (productsOnPage === 0) {
          console.log('   No products found, stopping...');
          hasNextPage = false;
          break;
        }

        // Extract products from current page
        let pageProductCount = 0;
        $('.product').each((_, element) => {
          try {
            const $el = $(element);

            // Extract product name using the correct selector
            const name = $el.find('.woocommerce-loop-product__title').first().text().trim();

            // Extract price - get the main price element and parse first price
            const priceElement = $el.find('.price').first();
            const priceText = priceElement.text().trim();
            const price = parsePrice(priceText);

            // Extract the actual product URL
            const productLink = $el.find('a.woocommerce-LoopProduct-link').first().attr('href') ||
                               $el.find('a').first().attr('href');
            const url = productLink || '';

            // Extract image
            const imageUrl = $el.find('img').first().attr('src') ||
                            $el.find('img').first().attr('data-src') || '';

            // Check stock status - if no "out of stock" text found, assume in stock
            const stockText = $el.text().toLowerCase();
            const inStock = !stockText.includes('out of stock');

            // Only add products with valid name and price
            if (name && price > 0 && url) {
              products.push({
                name,
                price,
                url,
                imageUrl,
                inStock,
              });
              pageProductCount++;
            }
          } catch (err) {
            console.error('   Error parsing product:', err instanceof Error ? err.message : err);
          }
        });

        console.log(`   ✓ Extracted ${pageProductCount} valid products`);

        // Check if there's a next page
        const nextLink = $('a.next.page-numbers').attr('href');
        hasNextPage = !!nextLink;

        if (hasNextPage) {
          console.log(`   → Next page available`);
          currentPage++;

          // Add delay to avoid overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          console.log(`   ✓ Reached last page`);
        }

      } catch (err) {
        console.error(`   ✗ Error scraping page ${currentPage}:`, err instanceof Error ? err.message : err);
        hasNextPage = false;
      }
    }

    console.log(`\n✅ Scraping complete!`);
    console.log(`   Total pages scraped: ${currentPage}`);
    console.log(`   Total products found: ${products.length}`);

  } catch (err) {
    console.error('❌ Fatal error in Bermor scraper:', err);
  }

  return products;
}

function parsePrice(priceText: string): number {
  // Remove all non-numeric characters except dots
  // For price ranges like "₱2,395.00 – ₱2,495.00", extract first price
  const priceMatch = priceText.match(/₱?([\d,]+\.?\d*)/);
  if (priceMatch) {
    const cleaned = priceMatch[1].replace(/,/g, '');
    return parseFloat(cleaned) || 0;
  }
  return 0;
}
