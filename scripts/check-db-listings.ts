import prisma from '@/lib/prisma';

async function checkListings() {
  const listings = await prisma.productListing.findMany({
    take: 10,
    orderBy: {
      lastScraped: 'desc',
    },
    select: {
      retailer: true,
      retailerUrl: true,
      product: {
        select: {
          name: true,
          imageUrl: true,
        },
      },
    },
  });

  console.log(`Found ${listings.length} listings in database\n`);

  listings.forEach((listing, index) => {
    console.log(`Listing ${index + 1}:`);
    console.log('  Retailer:', listing.retailer);
    console.log('  Product:', listing.product.name);
    console.log('  URL:', listing.retailerUrl);
    console.log('  Image URL (first 100 chars):', listing.product.imageUrl?.substring(0, 100));
    console.log();
  });
}

checkListings()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
