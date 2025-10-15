import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking products with ratings...\n');

  const productsWithRatings = await prisma.product.findMany({
    where: {
      rating: {
        not: null
      }
    },
    select: {
      name: true,
      rating: true,
      brand: true,
      category: true,
    },
    take: 20,
    orderBy: {
      updatedAt: 'desc'
    }
  });

  console.log(`Found ${productsWithRatings.length} products with ratings:\n`);

  productsWithRatings.forEach((product, index) => {
    console.log(`${index + 1}. ${product.name}`);
    console.log(`   Category: ${product.category}`);
    console.log(`   Brand: ${product.brand || 'N/A'}`);
    console.log(`   Rating: ${product.rating} ⭐`);
    console.log('');
  });

  const totalWithRatings = await prisma.product.count({
    where: {
      rating: {
        not: null
      }
    }
  });

  const totalProducts = await prisma.product.count();

  console.log(`\nTotal products with ratings: ${totalWithRatings} out of ${totalProducts}`);
  console.log(`Percentage: ${((totalWithRatings / totalProducts) * 100).toFixed(1)}%`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
