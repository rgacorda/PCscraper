import { normalizeProduct } from '@/scraper/normalizer';

// Test products that were being mis-categorized
const testProducts = [
  // CPU Air Coolers - should be CPU_COOLER, not CPU
  { name: 'Noctua NH-D15 CPU Air Cooler', price: 3500, url: 'test1' },
  { name: 'Cooler Master Hyper 212 EVO CPU Tower Cooler', price: 1500, url: 'test2' },
  { name: 'be quiet! Dark Rock Pro 4 CPU Air Cooler', price: 4000, url: 'test3' },
  { name: 'Deepcool AK400 CPU Air Cooler', price: 1200, url: 'test4' },

  // Actual CPUs - should be CPU
  { name: 'AMD Ryzen 5 5600X 6-Core 3.7 GHz Processor', price: 5000, url: 'test5' },
  { name: 'Intel Core i7-12700K Desktop Processor', price: 15000, url: 'test6' },

  // GPU Brackets - should be ACCESSORY, not GPU
  { name: 'Cooler Master GPU Bracket Support', price: 350, url: 'test7' },
  { name: 'Graphics Card Support Bracket Anti-Sag', price: 400, url: 'test8' },
  { name: 'Lian Li GPU Support Bracket', price: 500, url: 'test9' },

  // Actual GPUs - should be GPU
  { name: 'ASUS ROG Strix GeForce RTX 4070 Ti', price: 45000, url: 'test10' },
  { name: 'MSI Radeon RX 6700 XT Gaming X', price: 25000, url: 'test11' },
  { name: 'Gigabyte GeForce GTX 1660 Super', price: 15000, url: 'test12' },

  // Thermal Paste - should be ACCESSORY
  { name: 'Thermal Grizzly Kryonaut Thermal Paste', price: 350, url: 'test13' },

  // Storage Enclosures - should be ACCESSORY
  { name: 'ORICO USB 3.0 External Hard Drive Enclosure', price: 500, url: 'test14' },

  // Case Fans - should be CASE_FAN
  { name: 'Noctua NF-A12x25 120mm PWM Fan', price: 1300, url: 'test15' },
];

console.log('Testing Categorization Fixes\n');
console.log('='.repeat(80));

let correctCount = 0;
let incorrectCount = 0;

const expectedCategories: Record<string, string> = {
  'Noctua NH-D15 CPU Air Cooler': 'CPU_COOLER',
  'Cooler Master Hyper 212 EVO CPU Tower Cooler': 'CPU_COOLER',
  'be quiet! Dark Rock Pro 4 CPU Air Cooler': 'CPU_COOLER',
  'Deepcool AK400 CPU Air Cooler': 'CPU_COOLER',
  'AMD Ryzen 5 5600X 6-Core 3.7 GHz Processor': 'CPU',
  'Intel Core i7-12700K Desktop Processor': 'CPU',
  'Cooler Master GPU Bracket Support': 'ACCESSORY',
  'Graphics Card Support Bracket Anti-Sag': 'ACCESSORY',
  'Lian Li GPU Support Bracket': 'ACCESSORY',
  'ASUS ROG Strix GeForce RTX 4070 Ti': 'GPU',
  'MSI Radeon RX 6700 XT Gaming X': 'GPU',
  'Gigabyte GeForce GTX 1660 Super': 'GPU',
  'Thermal Grizzly Kryonaut Thermal Paste': 'ACCESSORY',
  'ORICO USB 3.0 External Hard Drive Enclosure': 'ACCESSORY',
  'Noctua NF-A12x25 120mm PWM Fan': 'CASE_FAN',
};

testProducts.forEach((product) => {
  const normalized = normalizeProduct({ ...product, inStock: true });
  const expected = expectedCategories[product.name];
  const isCorrect = normalized.category === expected;

  if (isCorrect) {
    correctCount++;
  } else {
    incorrectCount++;
  }

  const status = isCorrect ? '✅' : '❌';
  console.log(`\n${status} ${product.name}`);
  console.log(`   Expected: ${expected}`);
  console.log(`   Got:      ${normalized.category}`);
});

console.log('\n' + '='.repeat(80));
console.log(`\n📊 Results:`);
console.log(`   Correct:   ${correctCount}/${testProducts.length}`);
console.log(`   Incorrect: ${incorrectCount}/${testProducts.length}`);
console.log(`   Success Rate: ${((correctCount / testProducts.length) * 100).toFixed(1)}%\n`);

if (incorrectCount === 0) {
  console.log('🎉 All categorizations are correct!');
} else {
  console.log('⚠️  Some categorizations need fixing.');
}
