import prisma from '@/lib/prisma';

async function checkRecentScrape() {
  // Get products that were scraped very recently (last 5 minutes)
  const recentProducts = await prisma.product.findMany({
    where: {
      updatedAt: {
        gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
      },
    },
    select: {
      id: true,
      name: true,
      imageUrl: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    take: 20,
  });

  console.log(`Found ${recentProducts.length} products updated in the last 5 minutes\n`);

  recentProducts.forEach((product, index) => {
    console.log(`Product ${index + 1}:`);
    console.log('  Name:', product.name.substring(0, 80));
    console.log('  Updated:', product.updatedAt.toISOString());
    console.log('  Image URL:', product.imageUrl?.substring(0, 100) || 'null');
    console.log();
  });
}

checkRecentScrape()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
