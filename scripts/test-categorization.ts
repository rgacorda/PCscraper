import { normalizeProduct } from '@/scraper/normalizer';

// Test products with various names
const testProducts = [
  // CPU products (should be CPU, not COOLING)
  { name: 'AMD Ryzen 5 5600X 6-Core 3.7 GHz Processor', price: 5000, url: 'test1' },
  { name: 'Intel Core i7-12700K Desktop Processor', price: 15000, url: 'test2' },

  // CPU Coolers (should be COOLING, not CPU)
  { name: 'Noctua NH-D15 CPU Cooler', price: 3500, url: 'test3' },
  { name: 'Cooler Master Hyper 212 RGB CPU Cooling Fan', price: 1500, url: 'test4' },
  { name: 'Arctic Liquid Freezer II 280 AIO Water Cooler', price: 4500, url: 'test5' },

  // Thermal Paste (should be ACCESSORY, not COOLING)
  { name: 'Thermal Grizzly Kryonaut Thermal Paste 1g', price: 350, url: 'test6' },
  { name: 'Arctic MX-4 Thermal Compound 4g', price: 250, url: 'test7' },

  // Storage (should be STORAGE)
  { name: 'Samsung 980 Pro 1TB NVMe SSD', price: 5000, url: 'test8' },
  { name: 'Western Digital Blue 2TB HDD', price: 3000, url: 'test9' },
  { name: 'Crucial BX500 500GB 2.5" SATA SSD', price: 2000, url: 'test10' },

  // Storage Enclosures (should be ACCESSORY, not STORAGE)
  { name: 'ORICO USB 3.0 External Hard Drive Enclosure', price: 500, url: 'test11' },
  { name: 'Sabrent 2.5" SATA to USB 3.0 Storage Enclosure', price: 450, url: 'test12' },

  // Cables (should be ACCESSORY)
  { name: 'Tecware Black Gray Flex Sleeved Extension Cables', price: 800, url: 'test13' },
  { name: 'CableMod Pro ModMesh Cable Kit', price: 2500, url: 'test14' },

  // RGB/LED (should be ACCESSORY)
  { name: 'Cooler Master RGB LED Strip', price: 600, url: 'test15' },
  { name: 'Phanteks Digital RGB LED Strip Combo Set', price: 1200, url: 'test16' },

  // Regular Fans (should be COOLING)
  { name: 'Noctua NF-A12x25 120mm PWM Fan', price: 1300, url: 'test17' },
  { name: 'Arctic P12 PWM PST 120mm Case Fan', price: 400, url: 'test18' },
];

console.log('Testing Product Categorization\n');
console.log('='.repeat(80));

testProducts.forEach((product, index) => {
  const normalized = normalizeProduct({
    ...product,
    inStock: true,
  });

  console.log(`\n${index + 1}. ${product.name}`);
  console.log(`   Category: ${normalized.category}`);
});

console.log('\n' + '='.repeat(80));
console.log('\nSummary by Category:\n');

const categoryCounts: Record<string, string[]> = {};
testProducts.forEach(product => {
  const normalized = normalizeProduct({ ...product, inStock: true });
  if (!categoryCounts[normalized.category]) {
    categoryCounts[normalized.category] = [];
  }
  categoryCounts[normalized.category].push(product.name);
});

Object.entries(categoryCounts).forEach(([category, names]) => {
  console.log(`${category}: ${names.length} products`);
  names.forEach(name => console.log(`  - ${name}`));
  console.log();
});
