import * as cheerio from 'cheerio';
import { ScrapedProduct } from '../normalizer';
import { fetchWithRetry } from '@/lib/utils';

export async function scrapeDatablitz(): Promise<ScrapedProduct[]> {
  const products: ScrapedProduct[] = [];
  const baseUrl = 'https://ecommerce.datablitz.com.ph';

  // Get max pages from environment variable (default to 50)
  const maxPages = process.env.DATABLITZ_MAX_PAGES
    ? parseInt(process.env.DATABLITZ_MAX_PAGES, 10)
    : 50;

  // Categories to scrape
  const categories = ['/collections/pc-components', '/collections/pc-peripherals'];

  for (const category of categories) {
    let page = 1;

    // Paginate through each category
    while (page <= maxPages) {
      try {
        const url =
          page === 1 ? `${baseUrl}${category}` : `${baseUrl}${category}?page=${page}`;

        const html = await fetchWithRetry(url);
        const $ = cheerio.load(html);

        const itemsFound = $('.product-item').length;

        // If no items found, we've reached the end
        if (itemsFound === 0) {
          break;
        }

        $('.product-item').each((_, element) => {
          try {
            const $el = $(element);

            const name = $el.find('.product-item__title').text().trim();
            const priceText = $el.find('.price').first().text().trim();
            const price = parsePrice(priceText);
            const url = baseUrl + $el.find('a').first().attr('href');
            const imageUrl = $el.find('img').first().attr('src');
            const inStock = !$el.find('.sold-out').length;

            if (name && price > 0) {
              products.push({
                name,
                price,
                url,
                imageUrl,
                inStock,
              });
            }
          } catch (err) {
            console.error('Error parsing Datablitz product:', err);
          }
        });

        page++;
      } catch (err) {
        console.error(`Error scraping Datablitz category ${category} page ${page}:`, err);
        break;
      }
    }
  }

  return products;
}

function parsePrice(priceText: string): number {
  const cleaned = priceText.replace(/[^\d.]/g, '');
  return parseFloat(cleaned) || 0;
}
