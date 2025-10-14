import { PartCategory, StockStatus } from '@prisma/client';

export interface ScrapedProduct {
  name: string;
  price: number;
  url: string;
  imageUrl?: string;
  brand?: string;
  model?: string;
  description?: string;
  category?: string;
  inStock?: boolean;
}

export interface NormalizedProduct {
  productId?: string;
  name: string;
  category: PartCategory;
  brand?: string;
  model?: string;
  description?: string;
  imageUrl?: string;
  price: number;
  url: string;
  stockStatus: StockStatus;
}

export function normalizeProduct(scraped: ScrapedProduct): NormalizedProduct {
  const category = categorizeProduct(scraped.name, scraped.category);
  const brand = extractBrand(scraped.name, scraped.brand);
  const stockStatus = scraped.inStock ? StockStatus.IN_STOCK : StockStatus.OUT_OF_STOCK;

  return {
    name: cleanProductName(scraped.name),
    category,
    brand,
    model: scraped.model,
    description: scraped.description,
    imageUrl: scraped.imageUrl,
    price: scraped.price,
    url: scraped.url,
    stockStatus,
  };
}

function categorizeProduct(name: string, hint?: string): PartCategory {
  const nameLower = name.toLowerCase();
  const hintLower = hint?.toLowerCase() || '';

  // Check accessories FIRST (more specific matches)
  const accessoryKeywords = [
    'thermal paste', 'thermal compound', 'thermal pad',
    'cable', 'extension cable', 'sleeved cable',
    'enclosure', 'storage enclosure', 'external enclosure',
    'adapter', 'bracket', 'mounting',
    'rgb strip', 'led strip', 'argb',
    'fan hub', 'fan controller',
    'cable management', 'cable tie',
    'screw', 'standoff',
  ];

  for (const keyword of accessoryKeywords) {
    if (nameLower.includes(keyword) || hintLower.includes(keyword)) {
      return PartCategory.ACCESSORY;
    }
  }

  // Check CPU but exclude coolers
  if ((nameLower.includes('cpu') || nameLower.includes('processor')) &&
      !nameLower.includes('cooler') &&
      !nameLower.includes('cooling') &&
      !nameLower.includes('thermal')) {
    return PartCategory.CPU;
  }

  // Check COOLING category (coolers and fans, but NOT thermal paste)
  const coolingKeywords = ['cooler', 'cooling', 'fan', 'radiator', 'water cool', 'aio'];
  for (const keyword of coolingKeywords) {
    if (nameLower.includes(keyword) || hintLower.includes(keyword)) {
      return PartCategory.COOLING;
    }
  }

  // Check STORAGE but exclude enclosures
  if ((nameLower.includes('ssd') ||
       nameLower.includes('hdd') ||
       nameLower.includes('hard drive') ||
       nameLower.includes('nvme') ||
       nameLower.includes('m.2')) &&
      !nameLower.includes('enclosure') &&
      !nameLower.includes('external')) {
    return PartCategory.STORAGE;
  }

  // Other main categories
  const categoryMap: Record<string, PartCategory> = {
    gpu: PartCategory.GPU,
    'graphics card': PartCategory.GPU,
    'video card': PartCategory.GPU,
    motherboard: PartCategory.MOTHERBOARD,
    mobo: PartCategory.MOTHERBOARD,
    ram: PartCategory.RAM,
    memory: PartCategory.RAM,
    psu: PartCategory.PSU,
    'power supply': PartCategory.PSU,
    case: PartCategory.CASE,
    chassis: PartCategory.CASE,
    monitor: PartCategory.MONITOR,
    display: PartCategory.MONITOR,
    keyboard: PartCategory.PERIPHERAL,
    mouse: PartCategory.PERIPHERAL,
    headset: PartCategory.PERIPHERAL,
    speaker: PartCategory.PERIPHERAL,
    webcam: PartCategory.PERIPHERAL,
    microphone: PartCategory.PERIPHERAL,
  };

  for (const [keyword, category] of Object.entries(categoryMap)) {
    if (nameLower.includes(keyword) || hintLower.includes(keyword)) {
      return category;
    }
  }

  return PartCategory.OTHER;
}

function extractBrand(name: string, hint?: string): string | undefined {
  if (hint) return hint;

  const brands = [
    'AMD', 'Intel', 'NVIDIA', 'ASUS', 'MSI', 'Gigabyte', 'ASRock',
    'Corsair', 'G.Skill', 'Kingston', 'Samsung', 'Western Digital',
    'Seagate', 'EVGA', 'Cooler Master', 'NZXT', 'Thermaltake',
    'Fractal Design', 'be quiet!', 'Lian Li', 'Razer', 'Logitech',
    'SteelSeries', 'HyperX', 'LG', 'Dell', 'BenQ', 'AOC', 'ViewSonic',
  ];

  const nameLower = name.toLowerCase();
  for (const brand of brands) {
    if (nameLower.includes(brand.toLowerCase())) {
      return brand;
    }
  }

  return undefined;
}

function cleanProductName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s\-().]/g, '');
}
