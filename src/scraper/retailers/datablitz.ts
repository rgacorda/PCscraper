import { ScrapedProduct } from '../normalizer';
import { fetchWithRetry } from '@/lib/utils';

interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  price?: string;
  variants?: Array<{
    price: string;
    available?: boolean;
  }>;
  featured_image?: {
    src: string;
  };
  images?: Array<{
    src: string;
    position?: number;
  }>;
  available: boolean;
}

interface ShopifyCollectionResponse {
  products: ShopifyProduct[];
}

export async function scrapeDatablitz(): Promise<ScrapedProduct[]> {
  const products: ScrapedProduct[] = [];
  const seenUrls = new Set<string>(); // Track duplicates

  const baseUrl = 'https://ecommerce.datablitz.com.ph';
  const collectionApiUrl =
    'https://ecommerce.datablitz.com.ph/collections/pc-parts-and-components/products.json';

  const pageSize = 250; // Shopify max limit per request
  let hasMore = true;
  let pageNum = 1;
  let pagesDuplicated = 0; // Track consecutive pages with all duplicates

  while (hasMore) {
    try {
      // Use page parameter instead of since for proper pagination
      const url = `${collectionApiUrl}?limit=${pageSize}&page=${pageNum}`;

      console.log(`Fetching page ${pageNum} from Datablitz API...`);

      const response = await fetchWithRetry(url);

      // axios automatically parses JSON, so response might already be an object
      const data: ShopifyCollectionResponse =
        typeof response === 'string' ? JSON.parse(response) : response;

      if (!data.products || data.products.length === 0) {
        console.log(`No more products found at page ${pageNum}`);
        hasMore = false;
        break;
      }

      let pageNewProducts = 0;
      let pageDuplicates = 0;

      data.products.forEach((product: ShopifyProduct) => {
        try {
          // Only include products that have at least one variant in stock
          const hasAvailableVariant =
            product.variants && product.variants.some((v) => v.available === true);
          if (!hasAvailableVariant) {
            return;
          }

          const name = product.title?.trim();
          // Get price from first variant or product price
          let price = 0;
          if (product.variants && product.variants.length > 0) {
            price = parseFloat(product.variants[0].price || '0');
          } else if (product.price) {
            price = parseFloat(product.price);
          }

          const productUrl = `${baseUrl}/products/${product.handle}`;

          // Skip if we've already seen this product URL (deduplication)
          if (seenUrls.has(productUrl)) {
            pageDuplicates++;
            return;
          }
          seenUrls.add(productUrl);
          pageNewProducts++;

          // Prefer featured_image, fall back to first image from images array
          let imageUrl = product.featured_image?.src;
          if (!imageUrl && product.images && product.images.length > 0) {
            imageUrl = product.images[0].src;
          }

          const inStock = hasAvailableVariant;

          if (name && price > 0) {
            products.push({
              name,
              price,
              url: productUrl,
              imageUrl,
              inStock,
            });
          }
        } catch (err) {
          console.error('Error parsing product:', err);
        }
      });

      console.log(
        `✓ Page ${pageNum}: ${pageNewProducts} new products, ${pageDuplicates} duplicates (total: ${products.length})`
      );

      // If all products on this page were duplicates, increment counter
      if (pageNewProducts === 0 && data.products.length > 0) {
        pagesDuplicated++;
        console.log(
          `  ⚠️  All products duplicated. Consecutive duplicate pages: ${pagesDuplicated}`
        );
        // Stop if we see 3 consecutive pages of all duplicates (likely reached end)
        if (pagesDuplicated >= 3) {
          console.log('Reached end of collection (3 consecutive all-duplicate pages).');
          hasMore = false;
        }
      } else {
        pagesDuplicated = 0; // Reset counter if we found new products
      }

      pageNum++;
    } catch (err) {
      console.error(`Error scraping page ${pageNum}:`, err);
      hasMore = false;
    }
  }

  return products;
}
