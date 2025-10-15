import * as cheerio from 'cheerio';
import { ScrapedProduct } from '../normalizer';
import { fetchWithRetry } from '@/lib/utils';

// Category mappings for Bermor Zone
const CATEGORY_URLS = {
  CPU: [
    'https://bermorzone.com.ph/product-category/processors/intel-processor/',
    'https://bermorzone.com.ph/product-category/processors/amd-processors/'
  ],
  MOTHERBOARD: [
    'https://bermorzone.com.ph/product-category/motherboard/intel-motherboards/',
    'https://bermorzone.com.ph/product-category/motherboard/amd-motherboards/'
  ],
  RAM: [
    'https://bermorzone.com.ph/product-category/memory-modules/desktop-memory/'
  ],
  HDD: [
    'https://bermorzone.com.ph/product-category/storage-devices/hard-drives/'
  ],
  SSD: [
    'https://bermorzone.com.ph/product-category/storage-devices/solid-state-drives/'
  ],
  GPU: [
    'https://bermorzone.com.ph/product-category/video-cards/amd-video-cards/',
    'https://bermorzone.com.ph/product-category/video-cards/nvidia-video-cards/'
  ],
  CASE: [
    'https://bermorzone.com.ph/product-category/chassis/'
  ],
  MONITOR: [
    'https://bermorzone.com.ph/product-category/monitors/'
  ],
  PSU: [
    'https://bermorzone.com.ph/product-category/power-sources/power-supply-unit/'
  ],
  CPU_COOLER_AIR: [
    'https://bermorzone.com.ph/product-category/cooling-systems/aircooling-system/'
  ],
  CPU_COOLER_AIO: [
    'https://bermorzone.com.ph/product-category/cooling-systems/aio-liquid-cooling-system/'
  ],
  CASE_FAN: [
    'https://bermorzone.com.ph/product-category/cooling-systems/fanshubs/'
  ]
};

export async function scrapeBermor(maxPages: number = 5): Promise<ScrapedProduct[]> {
  const products: ScrapedProduct[] = [];

  // Support unlimited pages when maxPages is 0 or negative
  const isUnlimited = maxPages <= 0;
  const effectiveMaxPages = isUnlimited ? Infinity : maxPages;

  console.log(`🛒 Starting Bermor category-based scraper (${isUnlimited ? 'unlimited' : `max ${maxPages}`} pages per category)...`);

  try {
    // Scrape each category
    for (const [categoryName, urls] of Object.entries(CATEGORY_URLS)) {
      console.log(`\n📦 Scraping category: ${categoryName}`);

      for (const categoryUrl of urls) {
        console.log(`   URL: ${categoryUrl}`);
        const categoryProducts = await scrapeCategoryUrl(categoryUrl, categoryName, effectiveMaxPages);
        products.push(...categoryProducts);

        // Add delay between categories to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`\n✅ Scraping complete!`);
    console.log(`   Total products found: ${products.length}`);

  } catch (err) {
    console.error('❌ Fatal error in Bermor scraper:', err);
  }

  return products;
}

async function scrapeCategoryUrl(
  categoryUrl: string,
  categoryHint: string,
  maxPages: number
): Promise<ScrapedProduct[]> {
  const products: ScrapedProduct[] = [];
  let currentPage = 1;
  let hasNextPage = true;
  let productsWithoutImages = 0;

  while (hasNextPage && currentPage <= maxPages) {
    const pageUrl = currentPage === 1 ? categoryUrl : `${categoryUrl}page/${currentPage}/`;

    console.log(`   📄 Page ${currentPage}: ${pageUrl}`);

    try {
      const html = await fetchWithRetry(pageUrl);
      const $ = cheerio.load(html);

      const productsOnPage = $('.product').length;
      console.log(`      Found ${productsOnPage} products on this page`);

      if (productsOnPage === 0) {
        console.log('      No products found, stopping...');
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

          // Extract image - try multiple attributes for lazy-loaded images
          const $img = $el.find('img').first();
          const possibleUrls = [
            $img.attr('data-lazy-src'),
            $img.attr('data-src'),
            $img.attr('data-original'),
            $img.attr('data-srcset')?.split(',')[0]?.trim().split(' ')[0],
            $img.attr('src'),
          ];

          // Find first non-empty URL that isn't an SVG placeholder
          const imageUrl = possibleUrls.find(url =>
            url &&
            url.trim() !== '' &&
            !url.includes('data:image/svg')
          ) || '';

          // Extract rating from star rating element
          // The rating is in a nested structure: <div class="star-rating"><span style="width:XX%"><strong class="rating">X.X</strong>...</span></div>
          const ratingElement = $el.find('.star-rating');
          let rating: number | undefined;

          if (ratingElement.length > 0) {
            // Try to get rating from aria-label first (e.g., "Rated 4.9 out of 5")
            const ariaLabel = ratingElement.attr('aria-label') || '';
            const ariaMatch = ariaLabel.match(/Rated\s+([\d.]+)\s+out\s+of/i);

            if (ariaMatch) {
              rating = parseFloat(ariaMatch[1]);
            } else {
              // Fallback: Try to extract from <strong class="rating"> tag
              const ratingText = ratingElement.find('strong.rating').text().trim();
              if (ratingText) {
                const ratingValue = parseFloat(ratingText);
                if (!isNaN(ratingValue) && ratingValue > 0) {
                  rating = ratingValue;
                }
              }
            }
          }

          // Check stock status - if no "out of stock" text found, assume in stock
          const stockText = $el.text().toLowerCase();
          const inStock = !stockText.includes('out of stock');

          // Only add products with valid name and price
          if (name && price > 0 && url) {
            // Track products without images
            if (!imageUrl) {
              productsWithoutImages++;
            }

            products.push({
              name,
              price,
              url,
              imageUrl,
              inStock,
              category: categoryHint,
              rating,
            });
            pageProductCount++;
          }
        } catch (err) {
          console.error('      Error parsing product:', err instanceof Error ? err.message : err);
        }
      });

      console.log(`      ✓ Extracted ${pageProductCount} valid products`);

      // Check if there's a next page
      const nextLink = $('a.next.page-numbers').attr('href');
      hasNextPage = !!nextLink;

      if (hasNextPage) {
        console.log(`      → Next page available`);
        currentPage++;

        // Add delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.log(`      ✓ Reached last page`);
      }

    } catch (err) {
      console.error(`      ✗ Error scraping page ${currentPage}:`, err instanceof Error ? err.message : err);
      hasNextPage = false;
    }
  }

  if (productsWithoutImages > 0) {
    console.log(`   ⚠️  Products without images: ${productsWithoutImages}`);
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
