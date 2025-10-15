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
  rating?: number;
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
  rating?: number;
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
    rating: scraped.rating,
  };
}

function categorizeProduct(name: string, hint?: string): PartCategory {
  const nameLower = name.toLowerCase();
  const hintLower = hint?.toLowerCase() || '';

  // Handle category hints from scraper
  if (hint) {
    if (hint === 'CPU') return PartCategory.CPU;
    if (hint === 'MOTHERBOARD') return PartCategory.MOTHERBOARD;
    if (hint === 'RAM') return PartCategory.RAM;
    if (hint === 'HDD' || hint === 'SSD') return PartCategory.STORAGE;
    if (hint === 'GPU') return PartCategory.GPU;
    if (hint === 'CASE') return PartCategory.CASE;
    if (hint === 'MONITOR') return PartCategory.MONITOR;
    if (hint === 'PSU') return PartCategory.PSU;
    if (hint === 'CPU_COOLER_AIR' || hint === 'CPU_COOLER_AIO') return PartCategory.CPU_COOLER;
    if (hint === 'CASE_FAN') return PartCategory.CASE_FAN;
  }

  // Check CPU_COOLER FIRST (before CPU and accessories)
  const cpuCoolerKeywords = [
    'cpu cooler', 'cpu cooling', 'processor cooler',
    'cpu air cooler', 'cpu tower cooler',
    'aio', 'water cooler', 'water cooling', 'liquid cooler', 'liquid cooling',
    'tower cooler', 'air cooler',
    'cpu heatsink', 'cooler for cpu'
  ];
  for (const keyword of cpuCoolerKeywords) {
    if (nameLower.includes(keyword) || hintLower.includes(keyword)) {
      return PartCategory.CPU_COOLER;
    }
  }

  // Check accessories (but be more specific to avoid false positives)
  // Thermal paste & compounds
  if (nameLower.includes('thermal paste') ||
      nameLower.includes('thermal compound') ||
      nameLower.includes('thermal pad') ||
      nameLower.includes('thermal grease')) {
    return PartCategory.ACCESSORY;
  }

  // Cables
  if ((nameLower.includes('cable') || nameLower.includes('sleeved')) &&
      !nameLower.includes('psu') &&
      !nameLower.includes('power supply')) {
    return PartCategory.ACCESSORY;
  }

  // Storage enclosures
  if (nameLower.includes('enclosure') ||
      (nameLower.includes('external') && (nameLower.includes('ssd') || nameLower.includes('hdd')))) {
    return PartCategory.ACCESSORY;
  }

  // GPU brackets and support (accessories, not GPU itself)
  if ((nameLower.includes('gpu bracket') ||
       nameLower.includes('gpu support') ||
       nameLower.includes('graphics card bracket') ||
       nameLower.includes('graphics card support') ||
       nameLower.includes('vga bracket') ||
       nameLower.includes('vga support')) &&
      !nameLower.includes('geforce') &&
      !nameLower.includes('radeon') &&
      !nameLower.includes('rtx') &&
      !nameLower.includes('rx ')) {
    return PartCategory.ACCESSORY;
  }

  // Other accessories
  if (nameLower.includes('adapter') ||
      nameLower.includes('rgb strip') ||
      nameLower.includes('led strip') ||
      nameLower.includes('argb') ||
      nameLower.includes('fan hub') ||
      nameLower.includes('fan controller') ||
      nameLower.includes('cable management') ||
      nameLower.includes('standoff')) {
    return PartCategory.ACCESSORY;
  }

  // Check CPU (exclude coolers, cooling, and thermal-related)
  if ((nameLower.includes('cpu') || nameLower.includes('processor')) &&
      !nameLower.includes('cooler') &&
      !nameLower.includes('cooling') &&
      !nameLower.includes('thermal') &&
      !nameLower.includes('heatsink') &&
      !nameLower.includes('air') &&
      !nameLower.includes('tower') &&
      !nameLower.includes('aio')) {
    return PartCategory.CPU;
  }

  // Check CASE_FAN (case/chassis fans)
  const caseFanKeywords = [
    'case fan', 'chassis fan', 'pwm fan',
    'cooling fan', 'intake fan', 'exhaust fan',
    'mm fan', '120mm', '140mm', '200mm'
  ];
  for (const keyword of caseFanKeywords) {
    if (nameLower.includes(keyword) || hintLower.includes(keyword)) {
      return PartCategory.CASE_FAN;
    }
  }

  // Generic fan/radiator (fallback to CASE_FAN if not caught above)
  if (nameLower.includes('fan') || nameLower.includes('radiator')) {
    return PartCategory.CASE_FAN;
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

  // Check GPU (exclude brackets, mounts, and support accessories)
  if ((nameLower.includes('gpu') ||
       nameLower.includes('graphics card') ||
       nameLower.includes('video card') ||
       nameLower.includes('geforce') ||
       nameLower.includes('radeon') ||
       nameLower.includes('rtx ') ||
       nameLower.includes('gtx ') ||
       nameLower.includes('rx ')) &&
      !nameLower.includes('bracket') &&
      !nameLower.includes('support') &&
      !nameLower.includes('mount') &&
      !nameLower.includes('holder')) {
    return PartCategory.GPU;
  }

  // Other main categories
  const categoryMap: Record<string, PartCategory> = {
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
