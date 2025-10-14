import * as cheerio from 'cheerio';
import { ScrapedProduct } from '../normalizer';
import { fetchWithRetry } from '@/lib/utils';

export async function scrapeDatablitz(): Promise<ScrapedProduct[]> {
  const products: ScrapedProduct[] = [];
  const baseUrl = 'https://ecommerce.datablitz.com.ph';

  // Categories to scrape
  const categories = [
    '/collections/pc-components',
    '/collections/pc-peripherals',
  ];

  for (const category of categories) {
    try {
      const html = await fetchWithRetry(`${baseUrl}${category}`);
      const $ = cheerio.load(html);

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
    } catch (err) {
      console.error(`Error scraping Datablitz category ${category}:`, err);
    }
  }

  return products;
}

function parsePrice(priceText: string): number {
  const cleaned = priceText.replace(/[^\d.]/g, '');
  return parseFloat(cleaned) || 0;
}
