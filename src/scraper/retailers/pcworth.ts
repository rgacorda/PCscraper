import { ScrapedProduct } from '../normalizer';
import { fetchWithRetry } from '@/lib/utils';
export async function scrapePCWorth(): Promise<ScrapedProduct[]> {
  const products: ScrapedProduct[] = [];

  // Categories to scrape
  const CATEGORY_URLS = {
    GPU: 'https://apiv4.pcworth.com/api/ecomm/products/available/get?slug=pc-parts&page={PAGE}&qcategory=GPU&sort_direction=asc&keyword=&available_only=0&limit=48&branch_id=1',
    CPU: 'https://apiv4.pcworth.com/api/ecomm/products/available/get?slug=pc-parts&page={PAGE}&qcategory=CPU&sort_direction=asc&keyword=&available_only=0&limit=48&branch_id=1',
    MOTHERBOARD:
      'https://apiv4.pcworth.com/api/ecomm/products/available/get?slug=pc-parts&page={PAGE}&qcategory=MOTHERBOARD&sort_direction=asc&keyword=&available_only=0&limit=48&branch_id=1',
    RAM: 'https://apiv4.pcworth.com/api/ecomm/products/available/get?slug=pc-parts&page={PAGE}&qcategory=RAM&sort_direction=asc&keyword=&available_only=0&limit=48&branch_id=1',
    SSD: 'https://apiv4.pcworth.com/api/ecomm/products/available/get?slug=pc-parts&page={PAGE}&qcategory=SSD&sort_direction=asc&keyword=&available_only=0&limit=48&branch_id=1',
    HDD: 'https://apiv4.pcworth.com/api/ecomm/products/available/get?slug=pc-parts&page={PAGE}&qcategory=HDD&sort_direction=asc&keyword=&available_only=0&limit=48&branch_id=1',
    PSU: 'https://apiv4.pcworth.com/api/ecomm/products/available/get?slug=pc-parts&page={PAGE}&qcategory=PSU&sort_direction=asc&keyword=&available_only=0&limit=48&branch_id=1',
    CASE: 'https://apiv4.pcworth.com/api/ecomm/products/available/get?limit=48&sort_direction=asc&slug=pc-parts&page={PAGE}&qcategory=Casing&keyword=&available_only=0&branch_id=1',
    CPU_COOLER:
      'https://apiv4.pcworth.com/api/ecomm/products/available/get?limit=48&sort_direction=asc&slug=pc-parts&page={PAGE}&qcategory=CPU+Cooler&keyword=&available_only=0&branch_id=1',
    CASE_FAN:
      'https://apiv4.pcworth.com/api/ecomm/products/available/get?limit=48&sort_direction=asc&slug=pc-parts&page={PAGE}&qcategory=Fan&keyword=&available_only=0&branch_id=1',
    MONITOR:
      'https://apiv4.pcworth.com/api/ecomm/products/available/get?slug=peripherals&page={PAGE}&qcategory=Monitor&sort_direction=asc&keyword=&available_only=0&limit=48&branch_id=1',
    PERIPHERAL: [
      'https://apiv4.pcworth.com/api/ecomm/products/available/get?slug=peripherals&page={PAGE}&qcategory=Monitor&sort_direction=asc&keyword=&available_only=0&limit=48&branch_id=1',
      'https://apiv4.pcworth.com/api/ecomm/products/available/get?slug=peripherals&page={PAGE}&qcategory=Keyboard&sort_direction=asc&keyword=&available_only=0&limit=48&branch_id=1',
      'https://apiv4.pcworth.com/api/ecomm/products/available/get?slug=peripherals&page={PAGE}&qcategory=Keyboard&sort_direction=asc&keyword=&available_only=0&limit=48&branch_id=1',
      'https://apiv4.pcworth.com/api/ecomm/products/available/get?slug=peripherals&page={PAGE}&qcategory=Headset&sort_direction=asc&keyword=&available_only=0&limit=48&branch_id=1',
      'https://apiv4.pcworth.com/api/ecomm/products/available/get?slug=peripherals&page={PAGE}&qcategory=WEBCAM&sort_direction=asc&keyword=&available_only=0&limit=48&branch_id=1',
      'https://apiv4.pcworth.com/api/ecomm/products/available/get?slug=peripherals&page={PAGE}&qcategory=CONTROLLER&sort_direction=asc&keyword=&available_only=0&limit=48&branch_id=1',
    ],
    ACCESSORIES:
      'https://apiv4.pcworth.com/api/ecomm/products/available/get?slug=accessories-and-others&page={PAGE}&keyword=&sort_direction=asc&available_only=0&limit=48&branch_id=1',
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
