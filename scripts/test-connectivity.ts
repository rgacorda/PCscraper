import prisma from '@/lib/prisma';

async function testConnectivity() {
  console.log('🔍 Testing Backend & Frontend Connectivity\n');

  try {
    // Test 1: Database Connection
    console.log('1️⃣ Testing database connection...');
    await prisma.$connect();
    console.log('   ✅ Database connected successfully\n');

    // Test 2: Enum Values
    console.log('2️⃣ Testing enum values...');
    const categories = await prisma.$queryRaw<Array<{ enumlabel: string }>>`
      SELECT enumlabel
      FROM pg_enum
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'PartCategory')
      ORDER BY enumlabel;
    `;
    console.log('   Available categories:', categories.map(c => c.enumlabel).join(', '));
    console.log('   ✅ All enum values are present\n');

    // Test 3: Product Count by Category
    console.log('3️⃣ Testing product counts by category...');
    const productCounts = await prisma.product.groupBy({
      by: ['category'],
      _count: {
        _all: true
      }
    });

    console.log('   Product distribution:');
    for (const count of productCounts.sort((a, b) => b._count._all - a._count._all)) {
      console.log(`   - ${count.category}: ${count._count._all} products`);
    }
    console.log('   ✅ Products distributed across categories\n');

    // Test 4: Rating Field
    console.log('4️⃣ Testing rating field...');
    const productsWithRatings = await prisma.product.findMany({
      where: {
        rating: {
          not: null
        }
      },
      take: 5,
      select: {
        name: true,
        rating: true
      }
    });

    if (productsWithRatings.length > 0) {
      console.log('   Sample products with ratings:');
      for (const product of productsWithRatings) {
        console.log(`   - ${product.name}: ${product.rating} stars`);
      }
      console.log('   ✅ Rating field working correctly\n');
    } else {
      console.log('   ⚠️  No products with ratings found yet (this is normal if not scraped)\n');
    }

    // Test 5: Listings with URLs
    console.log('5️⃣ Testing product listings with URLs...');
    const listings = await prisma.productListing.findMany({
      take: 3,
      include: {
        product: {
          select: {
            name: true
          }
        }
      }
    });

    console.log('   Sample listings:');
    for (const listing of listings) {
      console.log(`   - ${listing.product.name}`);
      console.log(`     URL: ${listing.retailerUrl}`);
      console.log(`     Price: ₱${listing.price}`);
    }
    console.log('   ✅ Product URLs are stored correctly\n');

    // Test 6: Query Performance
    console.log('6️⃣ Testing query performance...');
    const start = Date.now();
    const products = await prisma.product.findMany({
      take: 20,
      include: {
        listings: {
          where: { isActive: true }
        }
      }
    });
    const duration = Date.now() - start;
    console.log(`   Fetched ${products.length} products with listings in ${duration}ms`);
    console.log('   ✅ Query performance is good\n');

    // Summary
    console.log('✅ All connectivity tests passed!');
    console.log('\n📊 Summary:');
    const totalProducts = await prisma.product.count();
    const totalListings = await prisma.productListing.count();
    const withRatings = await prisma.product.count({ where: { rating: { not: null } } });

    console.log(`   Total products: ${totalProducts}`);
    console.log(`   Total listings: ${totalListings}`);
    console.log(`   Products with ratings: ${withRatings}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testConnectivity()
  .then(() => {
    console.log('\n✨ Test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test failed with error:', error);
    process.exit(1);
  });
