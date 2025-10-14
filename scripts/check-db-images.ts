import prisma from '@/lib/prisma';

async function checkDatabaseImages() {
  const products = await prisma.product.findMany({
    take: 10,
    orderBy: {
      updatedAt: 'desc',
    },
    select: {
      id: true,
      name: true,
      imageUrl: true,
    },
  });

  console.log(`Found ${products.length} products in database\n`);

  products.forEach((product, index) => {
    console.log(`Product ${index + 1}:`);
    console.log('  ID:', product.id);
    console.log('  Name:', product.name);
    console.log('  Image URL:', product.imageUrl);
    console.log('  Image URL (first 100 chars):', product.imageUrl?.substring(0, 100));
    console.log();
  });
}

checkDatabaseImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
