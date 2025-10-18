import * as cheerio from 'cheerio';
import { ScrapedProduct } from '../normalizer';
import { fetchWithRetry } from '@/lib/utils';

const BASE_URL = 'https://bermorzone.com.ph/product-category';

// Category mappings for Bermor Zone
const CATEGORY_URLS = {
  CPU: [
    `${BASE_URL}/processors/intel-processor/`,
    `${BASE_URL}/processors/amd-processors/`,
  ],
  MOTHERBOARD: [
    `${BASE_URL}/motherboard/intel-motherboards/`,
    `${BASE_URL}/motherboard/amd-motherboards/`,
  ],
  RAM: [`${BASE_URL}/memory-modules/desktop-memory/`],
  HDD: [`${BASE_URL}/storage-devices/hard-drives/`],
  SSD: [`${BASE_URL}/storage-devices/solid-state-drives/`],
  GPU: [
    `${BASE_URL}/video-cards/amd-video-cards/`,
    `${BASE_URL}/video-cards/nvidia-video-cards/`,
  ],
  CASE: [`${BASE_URL}/chassis/`],
  MONITOR: [`${BASE_URL}/monitors/`],
  PSU: [`${BASE_URL}/power-sources/power-supply-unit/`],
  CPU_COOLER_AIR: [`${BASE_URL}/cooling-systems/aircooling-system/`],
  CPU_COOLER_AIO: [`${BASE_URL}/cooling-systems/aio-liquid-cooling-system/`],
  CASE_FAN: [`${BASE_URL}/cooling-systems/fanshubs/`],
  ACCESSORY: [`${BASE_URL}/computer-accessories/`], // Includes keyboards and mice
};

export async function scrapeBermor(
  maxPages: number = parseInt(process.env.BERMOR_MAX_PAGES || '5', 10),
  startPage: number = 1,
  categoryFilter?: string
): Promise<ScrapedProduct[]> {
  const products: ScrapedProduct[] = [];

  // Support unlimited pages when maxPages is 0 or negative
  const isUnlimited = maxPages <= 0;
  const effectiveMaxPages = isUnlimited ? Infinity : maxPages;

  console.log(
    `🛒 Starting Bermor category-based scraper (${
      isUnlimited ? 'unlimited' : `max ${maxPages}`
    } pages per category, starting from page ${startPage})...`
  );

  try {
    // Scrape each category
    for (const [categoryName, urls] of Object.entries(CATEGORY_URLS)) {
      // Skip if category filter is set and doesn't match
      if (categoryFilter && categoryName !== categoryFilter) {
        continue;
      }

      console.log(`\n📦 Scraping category: ${categoryName}`);

      for (const categoryUrl of urls) {
        console.log(`   URL: ${categoryUrl}`);
        const categoryProducts = await scrapeCategoryUrl(
          categoryUrl,
          categoryName,
          effectiveMaxPages,
          startPage
        );
        products.push(...categoryProducts);

        // Add delay between categories to avoid overwhelming the server
        await new Promise((resolve) => setTimeout(resolve, 2000));
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
  maxPages: number,
  startPage: number = 1
): Promise<ScrapedProduct[]> {
  const products: ScrapedProduct[] = [];
  let currentPage = startPage;
  let hasNextPage = true;
  let productsWithoutImages = 0;

  while (hasNextPage && currentPage <= maxPages) {
    const pageUrl =
      currentPage === 1 ? categoryUrl : `${categoryUrl}page/${currentPage}/`;

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
          const productLink =
            $el.find('a.woocommerce-LoopProduct-link').first().attr('href') ||
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
          const imageUrl =
            possibleUrls.find(
              (url) => url && url.trim() !== '' && !url.includes('data:image/svg')
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

            // If scraping the ACCESSORY category, try to refine to PERIPHERAL for keyboards/mice
            let finalCategory = categoryHint;
            if (categoryHint === 'ACCESSORY') {
              const lname = name.toLowerCase();
              if (
                lname.includes('keyboard') ||
                lname.includes('keypad') ||
                lname.includes('mechanical keyboard')
              ) {
                finalCategory = 'PERIPHERAL';
              } else if (lname.includes('mouse') || lname.includes('mice')) {
                finalCategory = 'PERIPHERAL';
              } else {
                finalCategory = 'ACCESSORY';
              }
            }

            products.push({
              name,
              price,
              url,
              imageUrl,
              inStock,
              category: finalCategory,
              rating,
            });
            pageProductCount++;
          }
        } catch (err) {
          console.error(
            '      Error parsing product:',
            err instanceof Error ? err.message : err
          );
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
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } else {
        console.log(`      ✓ Reached last page`);
      }
    } catch (err) {
      console.error(
        `      ✗ Error scraping page ${currentPage}:`,
        err instanceof Error ? err.message : err
      );
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
