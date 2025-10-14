import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('📊 DATABASE STATUS CHECK\n');
  console.log('='.repeat(80) + '\n');

  try {
    // Get total counts
    const totalProducts = await prisma.product.count();
    const totalListings = await prisma.productListing.count();
    const bermorListings = await prisma.productListing.count({
      where: { retailer: 'BERMOR' },
    });

    console.log('📈 OVERALL STATISTICS:');
    console.log('─'.repeat(80));
    console.log(`  Total Products:        ${totalProducts}`);
    console.log(`  Total Listings:        ${totalListings}`);
    console.log(`  Bermor Listings:       ${bermorListings}`);
    console.log();

    // Get products by category
    const productsByCategory = await prisma.product.groupBy({
      by: ['category'],
      _count: { category: true },
    });

    console.log('📦 PRODUCTS BY CATEGORY:');
    console.log('─'.repeat(80));
    productsByCategory.forEach(cat => {
      console.log(`  ${cat.category.padEnd(15)} ${cat._count.category} products`);
    });
    console.log();

    // Get price statistics
    const priceStats = await prisma.product.aggregate({
      _avg: { lowestPrice: true },
      _min: { lowestPrice: true },
      _max: { highestPrice: true },
    });

    console.log('💰 PRICE STATISTICS:');
    console.log('─'.repeat(80));
    console.log(`  Average Price:   ₱${Number(priceStats._avg.lowestPrice || 0).toFixed(2)}`);
    console.log(`  Lowest Price:    ₱${Number(priceStats._min.lowestPrice || 0).toFixed(2)}`);
    console.log(`  Highest Price:   ₱${Number(priceStats._max.highestPrice || 0).toFixed(2)}`);
    console.log();

    // Sample products from each category
    console.log('✨ SAMPLE PRODUCTS FROM EACH CATEGORY:\n');

    const categories = ['CPU', 'GPU', 'MOTHERBOARD', 'RAM', 'STORAGE'];

    for (const category of categories) {
      const products = await prisma.product.findMany({
        where: { category },
        take: 3,
        include: {
          listings: {
            where: { retailer: 'BERMOR' },
          },
        },
      });

      if (products.length > 0) {
        console.log(`📦 ${category}:`);
        console.log('─'.repeat(80));
        products.forEach(product => {
          const listing = product.listings[0];
          console.log(`  • ${product.name.substring(0, 60)}`);
          console.log(`    Price: ₱${listing?.price || 'N/A'} | Stock: ${listing?.stockStatus || 'N/A'}`);
        });
        console.log();
      }
    }

    console.log('='.repeat(80));
    console.log('\n✅ DATABASE CHECK COMPLETE!\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
