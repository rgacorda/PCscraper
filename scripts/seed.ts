import { PrismaClient, PartCategory, Retailer, StockStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with comprehensive mock data...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  try {
    await prisma.productListing.deleteMany();
    await prisma.pCBuildItem.deleteMany();
    await prisma.pCBuild.deleteMany();
    await prisma.product.deleteMany();
  } catch (error) {
    console.log('Note: Clearing data (tables might be empty)');
  }

  // Comprehensive product catalog with images
  const products = [
    // CPUs
    {
      name: 'AMD Ryzen 9 7950X',
      category: PartCategory.CPU,
      brand: 'AMD',
      model: '7950X',
      description: '16-Core, 32-Thread Desktop Processor with 5.7 GHz Max Boost, Socket AM5, 170W TDP',
      imageUrl: 'https://images.unsplash.com/photo-1555680202-c45f27c1e5d8?w=400',
      lowestPrice: 34995,
      highestPrice: 36995,
    },
    {
      name: 'AMD Ryzen 7 7800X3D',
      category: PartCategory.CPU,
      brand: 'AMD',
      model: '7800X3D',
      description: '8-Core, 16-Thread Gaming Processor with 3D V-Cache, 5.0 GHz Max Boost',
      imageUrl: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400',
      lowestPrice: 28995,
      highestPrice: 29995,
    },
    {
      name: 'Intel Core i9-13900K',
      category: PartCategory.CPU,
      brand: 'Intel',
      model: 'i9-13900K',
      description: '24-Core (8P+16E) Desktop Processor, 5.8 GHz Max Turbo, LGA 1700',
      imageUrl: 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=400',
      lowestPrice: 32995,
      highestPrice: 34495,
    },
    {
      name: 'Intel Core i5-13600K',
      category: PartCategory.CPU,
      brand: 'Intel',
      model: 'i5-13600K',
      description: '14-Core (6P+8E) Gaming Processor, 5.1 GHz Max Turbo, Excellent Value',
      imageUrl: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400',
      lowestPrice: 16995,
      highestPrice: 17995,
    },

    // GPUs
    {
      name: 'NVIDIA GeForce RTX 4090',
      category: PartCategory.GPU,
      brand: 'NVIDIA',
      model: 'RTX 4090',
      description: '24GB GDDR6X, Ultimate 4K Gaming Performance, Ray Tracing, DLSS 3',
      imageUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400',
      lowestPrice: 109995,
      highestPrice: 124995,
    },
    {
      name: 'NVIDIA GeForce RTX 4070 Ti',
      category: PartCategory.GPU,
      brand: 'NVIDIA',
      model: 'RTX 4070 Ti',
      description: '12GB GDDR6X, High-Performance 1440p/4K Gaming, Ray Tracing',
      imageUrl: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400',
      lowestPrice: 45999,
      highestPrice: 49999,
    },
    {
      name: 'AMD Radeon RX 7900 XTX',
      category: PartCategory.GPU,
      brand: 'AMD',
      model: 'RX 7900 XTX',
      description: '24GB GDDR6, RDNA 3 Architecture, Excellent 4K Performance',
      imageUrl: 'https://images.unsplash.com/photo-1591405351990-4726e331f141?w=400',
      lowestPrice: 54995,
      highestPrice: 59995,
    },
    {
      name: 'NVIDIA GeForce RTX 4060 Ti',
      category: PartCategory.GPU,
      brand: 'NVIDIA',
      model: 'RTX 4060 Ti',
      description: '8GB GDDR6, Perfect for 1080p/1440p Gaming, DLSS 3 Support',
      imageUrl: 'https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=400',
      lowestPrice: 24995,
      highestPrice: 26995,
    },

    // Motherboards
    {
      name: 'ASUS ROG Strix X670E-E Gaming WiFi',
      category: PartCategory.MOTHERBOARD,
      brand: 'ASUS',
      model: 'X670E-E',
      description: 'AMD X670E Chipset, Socket AM5, PCIe 5.0, WiFi 6E, ATX',
      imageUrl: 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=400',
      lowestPrice: 24995,
      highestPrice: 26995,
    },
    {
      name: 'MSI MAG B650 TOMAHAWK WiFi',
      category: PartCategory.MOTHERBOARD,
      brand: 'MSI',
      model: 'B650 TOMAHAWK',
      description: 'AMD B650 Chipset, Socket AM5, PCIe 4.0, WiFi 6E, Great Value',
      imageUrl: 'https://images.unsplash.com/photo-1591405351990-4726e331f141?w=400',
      lowestPrice: 12995,
      highestPrice: 13995,
    },
    {
      name: 'ASUS ROG Maximus Z790 Hero',
      category: PartCategory.MOTHERBOARD,
      brand: 'ASUS',
      model: 'Z790 Hero',
      description: 'Intel Z790 Chipset, LGA 1700, PCIe 5.0, DDR5, Premium Features',
      imageUrl: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400',
      lowestPrice: 32995,
      highestPrice: 34995,
    },
    {
      name: 'Gigabyte B760M DS3H',
      category: PartCategory.MOTHERBOARD,
      brand: 'Gigabyte',
      model: 'B760M DS3H',
      description: 'Intel B760 Chipset, LGA 1700, Micro-ATX, Budget-Friendly',
      imageUrl: 'https://images.unsplash.com/photo-1555680202-c45f27c1e5d8?w=400',
      lowestPrice: 7995,
      highestPrice: 8495,
    },

    // RAM
    {
      name: 'Corsair Vengeance RGB DDR5 32GB (2x16GB) 6000MHz',
      category: PartCategory.RAM,
      brand: 'Corsair',
      model: 'Vengeance RGB DDR5',
      description: 'DDR5-6000 CL36, RGB Lighting, High Performance, AMD EXPO',
      imageUrl: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400',
      lowestPrice: 8995,
      highestPrice: 9495,
    },
    {
      name: 'G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5 6400MHz',
      category: PartCategory.RAM,
      brand: 'G.Skill',
      model: 'Trident Z5 RGB',
      description: 'DDR5-6400 CL32, Premium RGB, Extreme Performance, Intel XMP 3.0',
      imageUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400',
      lowestPrice: 10995,
      highestPrice: 11995,
    },
    {
      name: 'Kingston FURY Beast DDR4 32GB (2x16GB) 3600MHz',
      category: PartCategory.RAM,
      brand: 'Kingston',
      model: 'FURY Beast DDR4',
      description: 'DDR4-3600 CL18, Great Value, Plug N Play, Black Heat Spreader',
      imageUrl: 'https://images.unsplash.com/photo-1591405351990-4726e331f141?w=400',
      lowestPrice: 5995,
      highestPrice: 6495,
    },
    {
      name: 'Corsair Vengeance LPX 16GB (2x8GB) DDR4 3200MHz',
      category: PartCategory.RAM,
      brand: 'Corsair',
      model: 'Vengeance LPX',
      description: 'DDR4-3200 CL16, Low Profile Design, Budget Gaming Memory',
      imageUrl: 'https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=400',
      lowestPrice: 2995,
      highestPrice: 3295,
    },

    // Storage
    {
      name: 'Samsung 990 PRO 2TB NVMe SSD',
      category: PartCategory.STORAGE,
      brand: 'Samsung',
      model: '990 PRO',
      description: 'PCIe 4.0 NVMe M.2, 7450 MB/s Read, Flagship Performance',
      imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400',
      lowestPrice: 12995,
      highestPrice: 13995,
    },
    {
      name: 'WD Black SN850X 1TB NVMe SSD',
      category: PartCategory.STORAGE,
      brand: 'Western Digital',
      model: 'SN850X',
      description: 'PCIe 4.0 NVMe M.2, 7300 MB/s Read, Gaming Optimized',
      imageUrl: 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=400',
      lowestPrice: 6995,
      highestPrice: 7495,
    },
    {
      name: 'Crucial P3 Plus 1TB NVMe SSD',
      category: PartCategory.STORAGE,
      brand: 'Crucial',
      model: 'P3 Plus',
      description: 'PCIe 4.0 NVMe M.2, 5000 MB/s Read, Excellent Value',
      imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400',
      lowestPrice: 4995,
      highestPrice: 5295,
    },
    {
      name: 'Seagate Barracuda 2TB HDD',
      category: PartCategory.STORAGE,
      brand: 'Seagate',
      model: 'Barracuda',
      description: '7200 RPM, 3.5", SATA 6Gb/s, Mass Storage Solution',
      imageUrl: 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=400',
      lowestPrice: 3495,
      highestPrice: 3795,
    },

    // Power Supplies
    {
      name: 'Corsair RM1000e 1000W 80+ Gold Fully Modular',
      category: PartCategory.PSU,
      brand: 'Corsair',
      model: 'RM1000e',
      description: '1000W, 80 PLUS Gold, Fully Modular, ATX 3.0, PCIe 5.0 Ready',
      imageUrl: 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=400',
      lowestPrice: 9995,
      highestPrice: 10495,
    },
    {
      name: 'Seasonic Focus GX-850 850W 80+ Gold Fully Modular',
      category: PartCategory.PSU,
      brand: 'Seasonic',
      model: 'Focus GX-850',
      description: '850W, 80 PLUS Gold, Fully Modular, 10 Year Warranty',
      imageUrl: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400',
      lowestPrice: 7995,
      highestPrice: 8495,
    },
    {
      name: 'EVGA SuperNOVA 750 GT 750W 80+ Gold Fully Modular',
      category: PartCategory.PSU,
      brand: 'EVGA',
      model: 'SuperNOVA 750 GT',
      description: '750W, 80 PLUS Gold, Fully Modular, Compact Design',
      imageUrl: 'https://images.unsplash.com/photo-1555680202-c45f27c1e5d8?w=400',
      lowestPrice: 6495,
      highestPrice: 6995,
    },

    // Cases
    {
      name: 'Lian Li O11 Dynamic EVO',
      category: PartCategory.CASE,
      brand: 'Lian Li',
      model: 'O11 Dynamic EVO',
      description: 'Mid-Tower, Tempered Glass, Excellent Airflow, Premium Build',
      imageUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400',
      lowestPrice: 9995,
      highestPrice: 10995,
    },
    {
      name: 'NZXT H510 Flow',
      category: PartCategory.CASE,
      brand: 'NZXT',
      model: 'H510 Flow',
      description: 'Mid-Tower ATX, Tempered Glass, Optimized Airflow, Cable Management',
      imageUrl: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400',
      lowestPrice: 5995,
      highestPrice: 6495,
    },
    {
      name: 'Fractal Design Meshify 2 Compact',
      category: PartCategory.CASE,
      brand: 'Fractal Design',
      model: 'Meshify 2 Compact',
      description: 'Compact ATX, Full Mesh Front, Silent & Cool, Nexus Fan Hub',
      imageUrl: 'https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=400',
      lowestPrice: 7495,
      highestPrice: 7995,
    },
    {
      name: 'Cooler Master MasterBox Q300L',
      category: PartCategory.CASE,
      brand: 'Cooler Master',
      model: 'Q300L',
      description: 'Micro-ATX, Compact, Magnetic Dust Filters, Budget Friendly',
      imageUrl: 'https://images.unsplash.com/photo-1591405351990-4726e331f141?w=400',
      lowestPrice: 2995,
      highestPrice: 3295,
    },

    // Cooling
    {
      name: 'NZXT Kraken X63 280mm AIO Liquid Cooler',
      category: PartCategory.COOLING,
      brand: 'NZXT',
      model: 'Kraken X63',
      description: '280mm Radiator, RGB Pump, CAM Software, Silent Performance',
      imageUrl: 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=400',
      lowestPrice: 8995,
      highestPrice: 9495,
    },
    {
      name: 'Noctua NH-D15 chromax.black',
      category: PartCategory.COOLING,
      brand: 'Noctua',
      model: 'NH-D15',
      description: 'Dual Tower CPU Cooler, Premium Fans, Exceptional Cooling, Silent',
      imageUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400',
      lowestPrice: 6495,
      highestPrice: 6995,
    },
    {
      name: 'be quiet! Dark Rock Pro 4',
      category: PartCategory.COOLING,
      brand: 'be quiet!',
      model: 'Dark Rock Pro 4',
      description: 'Dual Tower, Silent Wings Fans, 250W TDP, Premium Quality',
      imageUrl: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400',
      lowestPrice: 5495,
      highestPrice: 5995,
    },
    {
      name: 'Cooler Master Hyper 212 RGB Black Edition',
      category: PartCategory.COOLING,
      brand: 'Cooler Master',
      model: 'Hyper 212',
      description: 'Tower CPU Cooler, RGB Fan, Budget-Friendly, Reliable',
      imageUrl: 'https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=400',
      lowestPrice: 2295,
      highestPrice: 2495,
    },

    // Monitors
    {
      name: 'ASUS ROG Swift PG27AQDM 27" OLED',
      category: PartCategory.MONITOR,
      brand: 'ASUS',
      model: 'PG27AQDM',
      description: '27" 1440p OLED, 240Hz, 0.03ms, HDR, Perfect Blacks',
      imageUrl: 'https://images.unsplash.com/photo-1527443195645-1133f7f28990?w=400',
      lowestPrice: 64995,
      highestPrice: 69995,
    },
    {
      name: 'LG 27GP850-B 27" IPS Gaming',
      category: PartCategory.MONITOR,
      brand: 'LG',
      model: '27GP850-B',
      description: '27" 1440p IPS, 165Hz, 1ms, HDR10, Excellent Color',
      imageUrl: 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=400',
      lowestPrice: 18995,
      highestPrice: 19995,
    },
    {
      name: 'Samsung Odyssey G5 27" Curved',
      category: PartCategory.MONITOR,
      brand: 'Samsung',
      model: 'Odyssey G5',
      description: '27" 1440p VA Curved, 144Hz, 1ms, 1000R Curve, Immersive',
      imageUrl: 'https://images.unsplash.com/photo-1527443195645-1133f7f28990?w=400',
      lowestPrice: 14995,
      highestPrice: 15995,
    },

    // Peripherals
    {
      name: 'Logitech G Pro X Superlight Wireless',
      category: PartCategory.PERIPHERAL,
      brand: 'Logitech',
      model: 'G Pro X Superlight',
      description: 'Wireless Gaming Mouse, 25K Sensor, 63g Lightweight, Pro-Grade',
      imageUrl: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400',
      lowestPrice: 7995,
      highestPrice: 8495,
    },
    {
      name: 'Razer BlackWidow V4 Pro Mechanical Keyboard',
      category: PartCategory.PERIPHERAL,
      brand: 'Razer',
      model: 'BlackWidow V4 Pro',
      description: 'Mechanical Gaming Keyboard, Green Switches, RGB, Command Dial',
      imageUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=400',
      lowestPrice: 12995,
      highestPrice: 13495,
    },
    {
      name: 'HyperX Cloud II Wireless Gaming Headset',
      category: PartCategory.PERIPHERAL,
      brand: 'HyperX',
      model: 'Cloud II Wireless',
      description: '7.1 Surround Sound, 30hr Battery, Memory Foam, Durable',
      imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400',
      lowestPrice: 6995,
      highestPrice: 7495,
    },
    {
      name: 'SteelSeries QcK Heavy Gaming Mousepad',
      category: PartCategory.PERIPHERAL,
      brand: 'SteelSeries',
      model: 'QcK Heavy',
      description: 'XL Gaming Mousepad, Thick Cloth, Non-Slip Base, 450x400mm',
      imageUrl: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400',
      lowestPrice: 1495,
      highestPrice: 1695,
    },
  ];

  console.log(`📦 Creating ${products.length} products...`);

  for (const productData of products) {
    const product = await prisma.product.create({
      data: productData,
    });

    // Create listings for each retailer with realistic variations
    const retailers = [Retailer.DATABLITZ, Retailer.PCWORTH, Retailer.BERMOR];
    const stockOptions = [
      StockStatus.IN_STOCK,
      StockStatus.IN_STOCK,
      StockStatus.IN_STOCK,
      StockStatus.LIMITED_STOCK,
      StockStatus.OUT_OF_STOCK,
    ];

    for (const retailer of retailers) {
      // Price variance between retailers
      const priceRange = Number(productData.highestPrice) - Number(productData.lowestPrice);
      const priceVariance = Math.random() * priceRange;
      const price = Number(productData.lowestPrice) + priceVariance;

      // Random stock status
      const stockStatus = stockOptions[Math.floor(Math.random() * stockOptions.length)];

      // Realistic retailer URLs
      const retailerUrls = {
        [Retailer.DATABLITZ]: `https://www.datablitz.com.ph/products/${product.id}`,
        [Retailer.PCWORTH]: `https://www.pcworth.com/product/${product.id}`,
        [Retailer.BERMOR]: `https://www.bermor.com/item/${product.id}`,
      };

      await prisma.productListing.create({
        data: {
          productId: product.id,
          retailer,
          retailerUrl: retailerUrls[retailer],
          price: Math.round(price),
          stockStatus,
        },
      });
    }

    console.log(`✅ ${productData.name}`);
  }

  console.log('\n📊 Database Statistics:');
  const stats = {
    products: await prisma.product.count(),
    listings: await prisma.productListing.count(),
    byCateogry: {
      CPU: await prisma.product.count({ where: { category: PartCategory.CPU } }),
      GPU: await prisma.product.count({ where: { category: PartCategory.GPU } }),
      MOTHERBOARD: await prisma.product.count({ where: { category: PartCategory.MOTHERBOARD } }),
      RAM: await prisma.product.count({ where: { category: PartCategory.RAM } }),
      STORAGE: await prisma.product.count({ where: { category: PartCategory.STORAGE } }),
      PSU: await prisma.product.count({ where: { category: PartCategory.PSU } }),
      CASE: await prisma.product.count({ where: { category: PartCategory.CASE } }),
      COOLING: await prisma.product.count({ where: { category: PartCategory.COOLING } }),
      MONITOR: await prisma.product.count({ where: { category: PartCategory.MONITOR } }),
      PERIPHERAL: await prisma.product.count({ where: { category: PartCategory.PERIPHERAL } }),
    },
  };

  console.log(`📦 Total Products: ${stats.products}`);
  console.log(`🏷️  Total Listings: ${stats.listings}`);
  console.log('\n📋 Products by Category:');
  Object.entries(stats.byCateogry).forEach(([category, count]) => {
    console.log(`   ${category}: ${count}`);
  });

  console.log('\n🎉 Seeding complete!');
  console.log('\n💡 Next steps:');
  console.log('   1. Run: npm run dev');
  console.log('   2. Visit: http://localhost:3000');
  console.log('   3. View database: npx prisma studio');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
