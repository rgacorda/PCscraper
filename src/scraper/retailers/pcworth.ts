import { ScrapedProduct } from '../normalizer';
import { fetchWithRetry } from '@/lib/utils';

// Helper function to build API URLs
const buildUrl = (slug: string, category: string) => {
  const base = 'https://apiv4.pcworth.com/api/ecomm/products/available/get';
  const params = [
    `slug=${slug}`,
    `page={PAGE}`,
    category ? `qcategory=${category}` : '',
    `sort_direction=asc`,
    `keyword=`,
    `available_only=0`,
    `limit=48`,
    `branch_id=1`,
  ]
    .filter(Boolean)
    .join('&');
  return `${base}?${params}`;
};

export async function scrapePCWorth(): Promise<ScrapedProduct[]> {
  const products: ScrapedProduct[] = [];

  // Categories to scrape
  const CATEGORY_URLS = {
    GPU: buildUrl('pc-parts', 'GPU'),
    CPU: buildUrl('pc-parts', 'CPU'),
    MOTHERBOARD: buildUrl('pc-parts', 'MOTHERBOARD'),
    RAM: buildUrl('pc-parts', 'RAM'),
    SSD: buildUrl('pc-parts', 'SSD'),
    HDD: buildUrl('pc-parts', 'HDD'),
    PSU: buildUrl('pc-parts', 'PSU'),
    CASE: buildUrl('pc-parts', 'Casing'),
    CPU_COOLER: buildUrl('pc-parts', 'CPU Cooler'),
    CASE_FAN: buildUrl('pc-parts', 'Fan'),
    MONITOR: buildUrl('peripherals', 'Monitor'),
    PERIPHERAL: [
      buildUrl('peripherals', 'Keyboard'),
      buildUrl('peripherals', 'Headset'),
      buildUrl('peripherals', 'WEBCAM'),
      buildUrl('peripherals', 'CONTROLLER'),
    ],
    ACCESSORIES: buildUrl('accessories-and-others', ''),
  };

  // Fetch GPU category pages and paginate until last page
  try {
    const LIMIT = 48;
    const MAX_PAGES = 50; // safety cap to avoid infinite loops
    const allItems: any[] = [];

    // Iterate every category URL in CATEGORY_URLS and paginate each one
    // map scraper category keys to PartCategory enum values used in DB
    const CATEGORY_TO_PART: Record<string, string> = {
      GPU: 'GPU',
      CPU: 'CPU',
      MOTHERBOARD: 'MOTHERBOARD',
      RAM: 'RAM',
      SSD: 'STORAGE', // map SSD -> STORAGE
      HDD: 'STORAGE', // map HDD -> STORAGE
      PSU: 'PSU',
      CASE: 'CASE',
      CPU_COOLER: 'CPU_COOLER',
      CASE_FAN: 'CASE_FAN',
      MONITOR: 'MONITOR',
      PERIPHERAL: 'PERIPHERAL',
      ACCESSORIES: 'ACCESSORY',
    };

    for (const [categoryKey, urlTemplate] of Object.entries(CATEGORY_URLS)) {
      // support either a single template string or an array of templates (e.g. PERIPHERAL)
      const templates = Array.isArray(urlTemplate) ? urlTemplate : [urlTemplate];

      for (const template of templates) {
        let page = 1;
        while (page <= MAX_PAGES) {
          const apiUrl = template.replace('{PAGE}', String(page));
          const res: any = await fetchWithRetry(apiUrl);
          let json: any;

          if (typeof res === 'string') {
            json = JSON.parse(res);
          } else if (res && typeof res.json === 'function') {
            json = await res.json();
          } else {
            json = res;
          }

          // Accept responses that are arrays or contain arrays in common keys
          let items: any[] = [];
          if (Array.isArray(json)) {
            items = json;
          } else {
            items =
              json?.data?.items ||
              json?.data?.products ||
              json?.products ||
              json?.items ||
              (Array.isArray(json?.data) ? json.data : undefined) ||
              [];
            if (!Array.isArray(items) || items.length === 0) {
              // fallback: find the first array value in the response object
              const found = Object.values(json || {}).find((v) => Array.isArray(v));
              items = (found as any[]) || [];
            }
          }

          if (!items || items.length === 0) {
            // no more items -> break pagination for this template
            break;
          }

          // tag items with the category we scraped from (mapped to PartCategory)
          for (const it of items) {
            (it as any).__scraperCategory = CATEGORY_TO_PART[categoryKey] || 'OTHER';
          }

          allItems.push(...items);

          // If returned items fewer than limit, we reached last page for this template
          if (items.length < LIMIT) {
            break;
          }

          page += 1;
        }
      }
    }

    const mapped = (allItems as any[])
      .map((item) => {
        // Adjusted to match the JSON fields returned by the API
        const name =
          item.product_name || item.name || item.title || item.productTitle || '';
        const priceRaw =
          item.amount ??
          item.standard_amount ??
          item.discounted_amount ??
          item.price ??
          item.selling_price ??
          item.final_price ??
          0;
        const price =
          typeof priceRaw === 'number'
            ? priceRaw
            : typeof priceRaw === 'string'
            ? parseFloat(priceRaw.replace(/[^\d.]/g, '')) || 0
            : 0;
        const slug = item.slug || item.url_slug || item.product_slug;
        const url = item.url || (slug ? `https://www.pcworth.com/product/${slug}` : '');
        const imageUrl =
          item.img_thumbnail ||
          item.image ||
          item.thumbnail ||
          (item.images && item.images[0]) ||
          item.mfr_logo ||
          '';

        // set product as in stock when stocks_left > 0
        const inStock = (item.stocks_left ?? 0) > 0;

        return {
          name,
          price,
          url,
          imageUrl,
          category: item.__scraperCategory || item.category || 'UNKNOWN',
          raw: item,
          inStock,
          availability: inStock ? 'in stock' : 'out of stock',
        } as ScrapedProduct;
      })
      .filter((p) => p.name);

    products.push(...mapped);
  } catch (err) {
    console.error('Error fetching PCWorth API:', err);
  }

  return products;
}
