import { ScrapedProduct } from '../normalizer';
import { fetchWithRetry } from '@/lib/utils';

// Helper function to build API URLs
const buildUrl = (slug: string, category: string, branchId: number) => {
  const base = 'https://apiv4.pcworth.com/api/ecomm/products/available/get';
  const itemsPerPage = process.env.PCWORTH_ITEMS_PER_PAGE || '48';
  const params = [
    `slug=${slug}`,
    `page={PAGE}`,
    category ? `qcategory=${category}` : '',
    `sort_direction=asc`,
    `keyword=`,
    `available_only=0`,
    `limit=${itemsPerPage}`,
    `branch_id=${branchId}`,
  ]
    .filter(Boolean)
    .join('&');
  return `${base}?${params}`;
};

// Helper function to scrape a single branch
async function scrapeBranch(
  branchId: number,
  startPage: number = 1,
  categoryFilter?: string
): Promise<any[]> {
  const allItems: any[] = [];

  // Get configuration from environment variables
  const LIMIT = process.env.PCWORTH_ITEMS_PER_PAGE
    ? parseInt(process.env.PCWORTH_ITEMS_PER_PAGE, 10)
    : 48;
  const MAX_PAGES = process.env.PCWORTH_MAX_PAGES
    ? parseInt(process.env.PCWORTH_MAX_PAGES, 10)
    : 50;

  // Categories to scrape with their slugs and category parameters
  const CATEGORIES = [
    { slug: 'pc-parts', category: 'GPU', key: 'GPU' },
    { slug: 'pc-parts', category: 'CPU', key: 'CPU' },
    { slug: 'pc-parts', category: 'MOTHERBOARD', key: 'MOTHERBOARD' },
    { slug: 'pc-parts', category: 'RAM', key: 'RAM' },
    { slug: 'pc-parts', category: 'SSD', key: 'SSD' },
    { slug: 'pc-parts', category: 'HDD', key: 'HDD' },
    { slug: 'pc-parts', category: 'PSU', key: 'PSU' },
    { slug: 'pc-parts', category: 'Casing', key: 'CASE' },
    { slug: 'pc-parts', category: 'CPU Cooler', key: 'CPU_COOLER' },
    { slug: 'pc-parts', category: 'Fan', key: 'CASE_FAN' },
    { slug: 'peripherals', category: 'Monitor', key: 'MONITOR' },
    { slug: 'peripherals', category: 'Keyboard', key: 'PERIPHERAL' },
    { slug: 'peripherals', category: 'Headset', key: 'PERIPHERAL' },
    { slug: 'peripherals', category: 'WEBCAM', key: 'PERIPHERAL' },
    { slug: 'peripherals', category: 'CONTROLLER', key: 'PERIPHERAL' },
    { slug: 'accessories-and-others', category: '', key: 'ACCESSORIES' },
  ];

  // map scraper category keys to PartCategory enum values used in DB
  const CATEGORY_TO_PART: Record<string, string> = {
    GPU: 'GPU',
    CPU: 'CPU',
    MOTHERBOARD: 'MOTHERBOARD',
    RAM: 'RAM',
    SSD: 'STORAGE',
    HDD: 'STORAGE',
    PSU: 'PSU',
    CASE: 'CASE',
    CPU_COOLER: 'CPU_COOLER',
    CASE_FAN: 'CASE_FAN',
    MONITOR: 'MONITOR',
    PERIPHERAL: 'PERIPHERAL',
    ACCESSORIES: 'ACCESSORY',
  };

  console.log(`  🏪 Scraping branch ${branchId}...`);

  for (const categoryInfo of CATEGORIES) {
    // Skip if category filter is set and doesn't match
    if (categoryFilter && categoryInfo.key !== categoryFilter) {
      continue;
    }

    const template = buildUrl(categoryInfo.slug, categoryInfo.category, branchId);
    let page = startPage;

    while (page <= MAX_PAGES) {
      const apiUrl = template.replace('{PAGE}', String(page));

      try {
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
            const found = Object.values(json || {}).find((v) => Array.isArray(v));
            items = (found as any[]) || [];
          }
        }

        if (!items || items.length === 0) {
          break;
        }

        // tag items with the category and branch
        for (const it of items) {
          (it as any).__scraperCategory = CATEGORY_TO_PART[categoryInfo.key] || 'OTHER';
          (it as any).__branchId = branchId;
        }

        allItems.push(...items);

        if (items.length < LIMIT) {
          break;
        }

        page += 1;
      } catch (err) {
        console.error(
          `    ❌ Error scraping branch ${branchId}, category ${categoryInfo.key}, page ${page}:`,
          err
        );
        break;
      }
    }
  }

  console.log(`  ✓ Branch ${branchId}: Found ${allItems.length} items`);
  return allItems;
}

export async function scrapePCWorth(
  startPage: number = 1,
  categoryFilter?: string
): Promise<ScrapedProduct[]> {
  console.log(
    `🔍 Starting PCWorth scraper for branches 1, 2, and 4 (starting from page ${startPage})...`
  );

  const BRANCH_IDS = [1, 2, 4];
  const products: ScrapedProduct[] = [];

  // Fetch GPU category pages and paginate until last page
  try {
    // Map to store products by their slug (unique identifier)
    // Key: product slug, Value: { item, branches: Set<branchId>, hasStock: boolean }
    const productMap = new Map<
      string,
      {
        item: any;
        branches: Set<number>;
        hasStock: boolean;
        stockByBranch: Map<number, number>;
      }
    >();

    // Scrape all branches
    for (const branchId of BRANCH_IDS) {
      const branchItems = await scrapeBranch(branchId, startPage, categoryFilter);

      // Process items from this branch
      for (const item of branchItems) {
        const slug = item.slug || item.url_slug || item.product_slug;
        if (!slug) continue;

        const stocksLeft = item.stocks_left ?? 0;
        const hasStock = stocksLeft > 0;

        if (productMap.has(slug)) {
          // Product exists from another branch - merge data
          const existing = productMap.get(slug)!;
          existing.branches.add(branchId);
          existing.stockByBranch.set(branchId, stocksLeft);

          // If this branch has stock and previous didn't, update to in stock
          if (hasStock) {
            existing.hasStock = true;
          }

          // Update item data if this branch has more complete information
          if (!existing.item.img_thumbnail && item.img_thumbnail) {
            existing.item.img_thumbnail = item.img_thumbnail;
          }
          if (!existing.item.product_name && item.product_name) {
            existing.item.product_name = item.product_name;
          }
        } else {
          // New product - add to map
          const stockByBranch = new Map<number, number>();
          stockByBranch.set(branchId, stocksLeft);

          productMap.set(slug, {
            item,
            branches: new Set([branchId]),
            hasStock,
            stockByBranch,
          });
        }
      }
    }

    console.log(`✓ Total unique products found: ${productMap.size}`);
    console.log(
      `  📊 Products with stock: ${
        Array.from(productMap.values()).filter((p) => p.hasStock).length
      }`
    );
    console.log(
      `  📊 Products in multiple branches: ${
        Array.from(productMap.values()).filter((p) => p.branches.size > 1).length
      }`
    );

    // Convert merged data to ScrapedProduct format
    const allItems = Array.from(productMap.values());

    const mapped = allItems
      .map(({ item, hasStock, branches, stockByBranch }) => {
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

        // Build availability string with branch info
        const branchList = Array.from(branches).sort().join(', ');
        const stockInfo = Array.from(stockByBranch.entries())
          .filter(([_, stock]) => stock > 0)
          .map(([branch, stock]) => `Branch ${branch}: ${stock}`)
          .join(', ');

        const availability = hasStock
          ? `in stock (${stockInfo || `Branches: ${branchList}`})`
          : `out of stock (Branches: ${branchList})`;

        return {
          name,
          price,
          url,
          imageUrl,
          category: item.__scraperCategory || item.category || 'UNKNOWN',
          raw: {
            ...item,
            __branches: Array.from(branches),
            __stockByBranch: Object.fromEntries(stockByBranch),
          },
          inStock: hasStock,
          availability,
        } as ScrapedProduct;
      })
      .filter((p) => p.name);

    products.push(...mapped);
  } catch (err) {
    console.error('Error fetching PCWorth API:', err);
  }

  console.log(`✅ PCWorth scraper completed: ${products.length} products`);
  return products;
}
