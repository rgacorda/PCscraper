import * as cheerio from 'cheerio';
import { ScrapedProduct } from '../normalizer';
import { fetchWithRetry } from '@/lib/utils';

export async function scrapeBermor(): Promise<ScrapedProduct[]> {
  const products: ScrapedProduct[] = [];
  const baseUrl = 'https://www.bermor.com';

  // Categories to scrape
  const categories = [
    '/pc-components',
    '/gaming-peripherals',
  ];

  for (const category of categories) {
    try {
      const html = await fetchWithRetry(`${baseUrl}${category}`);
      const $ = cheerio.load(html);

      $('.item-product').each((_, element) => {
        try {
          const $el = $(element);

          const name = $el.find('.product-title').text().trim();
          const priceText = $el.find('.price-value').text().trim();
          const price = parsePrice(priceText);
          const url = baseUrl + $el.find('a').first().attr('href');
          const imageUrl = $el.find('img').first().attr('src');
          const availabilityText = $el.find('.availability').text().toLowerCase();
          const inStock = availabilityText.includes('available') ||
                         availabilityText.includes('in stock');

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
          console.error('Error parsing Bermor product:', err);
        }
      });
    } catch (err) {
      console.error(`Error scraping Bermor category ${category}:`, err);
    }
  }

  return products;
}

function parsePrice(priceText: string): number {
  const cleaned = priceText.replace(/[^\d.]/g, '');
  return parseFloat(cleaned) || 0;
}
