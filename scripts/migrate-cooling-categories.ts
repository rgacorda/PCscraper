import prisma from '@/lib/prisma';

async function migrateCoolingCategories() {
  console.log('Checking for products in COOLING category...\n');

  // Get all products with COOLING category
  const coolingProducts = await prisma.product.findMany({
    where: {
      category: 'COOLING' as any,
    },
    select: {
      id: true,
      name: true,
      category: true,
    },
  });

  console.log(`Found ${coolingProducts.length} products in COOLING category\n`);

  if (coolingProducts.length === 0) {
    console.log('✅ No products need migration');
    return;
  }

  let cpuCoolerCount = 0;
  let caseFanCount = 0;

  for (const product of coolingProducts) {
    const nameLower = product.name.toLowerCase();

    // Determine if it's a CPU cooler or case fan
    const isCpuCooler = nameLower.includes('cpu cooler') ||
                        nameLower.includes('cpu cooling') ||
                        nameLower.includes('aio') ||
                        nameLower.includes('water cool') ||
                        nameLower.includes('liquid cool') ||
                        nameLower.includes('tower cooler');

    const newCategory = isCpuCooler ? 'CPU_COOLER' : 'CASE_FAN';

    console.log(`${product.name.substring(0, 60)}...`);
    console.log(`  COOLING → ${newCategory}\n`);

    // Update using raw SQL since Prisma client doesn't have new enums yet
    await prisma.$executeRaw`
      UPDATE products
      SET category = ${newCategory}::"PartCategory"
      WHERE id = ${product.id}
    `;

    if (isCpuCooler) {
      cpuCoolerCount++;
    } else {
      caseFanCount++;
    }
  }

  console.log('\n✅ Migration complete!');
  console.log(`   CPU_COOLER: ${cpuCoolerCount} products`);
  console.log(`   CASE_FAN: ${caseFanCount} products`);
}

migrateCoolingCategories()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
