import * as cheerio from 'cheerio';
import { ScrapedProduct } from '../normalizer';
import { fetchWithRetry } from '@/lib/utils';

export async function scrapePCWorth(): Promise<ScrapedProduct[]> {
  const products: ScrapedProduct[] = [];
  const baseUrl = 'https://www.pcworth.com';

  // Categories to scrape
  const categories = [
    '/products/components',
    '/products/peripherals',
  ];

  for (const category of categories) {
    try {
      const html = await fetchWithRetry(`${baseUrl}${category}`);
      const $ = cheerio.load(html);

      $('.product-card').each((_, element) => {
        try {
          const $el = $(element);

          const name = $el.find('.product-name').text().trim();
          const priceText = $el.find('.product-price').text().trim();
          const price = parsePrice(priceText);
          const url = baseUrl + $el.find('a').first().attr('href');
          const imageUrl = $el.find('img').first().attr('src');
          const stockText = $el.find('.stock-status').text().toLowerCase();
          const inStock = stockText.includes('in stock') || !stockText.includes('out');

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
          console.error('Error parsing PCWorth product:', err);
        }
      });
    } catch (err) {
      console.error(`Error scraping PCWorth category ${category}:`, err);
    }
  }

  return products;
}

function parsePrice(priceText: string): number {
  const cleaned = priceText.replace(/[^\d.]/g, '');
  return parseFloat(cleaned) || 0;
}
