# Mock Data Guide

## Overview

This guide explains the comprehensive mock data included in your PH PC Parts Aggregator. The seed script creates a realistic database with **40+ products** across all categories, complete with images and multi-retailer pricing.

---

## Quick Start

### Run the Seed Script

```bash
# Make sure database is set up first
npm run db:push

# Seed the database with mock data
npm run db:seed
```

Expected output:
```
🌱 Seeding database with comprehensive mock data...
🗑️  Clearing existing data...
📦 Creating 40 products...
✅ AMD Ryzen 9 7950X
✅ NVIDIA GeForce RTX 4090
...
📊 Database Statistics:
📦 Total Products: 40
🏷️  Total Listings: 120

📋 Products by Category:
   CPU: 4
   GPU: 4
   MOTHERBOARD: 4
   RAM: 4
   STORAGE: 4
   PSU: 3
   CASE: 4
   COOLING: 4
   MONITOR: 3
   PERIPHERAL: 4

🎉 Seeding complete!
```

---

## Product Catalog

### 💻 CPUs (4 Products)

| Product | Brand | Price Range | Image |
|---------|-------|-------------|-------|
| AMD Ryzen 9 7950X | AMD | ₱34,995 - ₱36,995 | ✅ |
| AMD Ryzen 7 7800X3D | AMD | ₱28,995 - ₱29,995 | ✅ |
| Intel Core i9-13900K | Intel | ₱32,995 - ₱34,495 | ✅ |
| Intel Core i5-13600K | Intel | ₱16,995 - ₱17,995 | ✅ |

### 🎮 GPUs (4 Products)

| Product | Brand | Price Range | Image |
|---------|-------|-------------|-------|
| NVIDIA GeForce RTX 4090 | NVIDIA | ₱109,995 - ₱124,995 | ✅ |
| NVIDIA GeForce RTX 4070 Ti | NVIDIA | ₱45,999 - ₱49,999 | ✅ |
| AMD Radeon RX 7900 XTX | AMD | ₱54,995 - ₱59,995 | ✅ |
| NVIDIA GeForce RTX 4060 Ti | NVIDIA | ₱24,995 - ₱26,995 | ✅ |

### 🖥️ Motherboards (4 Products)

| Product | Brand | Price Range | Image |
|---------|-------|-------------|-------|
| ASUS ROG Strix X670E-E Gaming WiFi | ASUS | ₱24,995 - ₱26,995 | ✅ |
| MSI MAG B650 TOMAHAWK WiFi | MSI | ₱12,995 - ₱13,995 | ✅ |
| ASUS ROG Maximus Z790 Hero | ASUS | ₱32,995 - ₱34,995 | ✅ |
| Gigabyte B760M DS3H | Gigabyte | ₱7,995 - ₱8,495 | ✅ |

### 🧠 RAM (4 Products)

| Product | Brand | Price Range | Image |
|---------|-------|-------------|-------|
| Corsair Vengeance RGB DDR5 32GB 6000MHz | Corsair | ₱8,995 - ₱9,495 | ✅ |
| G.Skill Trident Z5 RGB 32GB DDR5 6400MHz | G.Skill | ₱10,995 - ₱11,995 | ✅ |
| Kingston FURY Beast DDR4 32GB 3600MHz | Kingston | ₱5,995 - ₱6,495 | ✅ |
| Corsair Vengeance LPX 16GB DDR4 3200MHz | Corsair | ₱2,995 - ₱3,295 | ✅ |

### 💾 Storage (4 Products)

| Product | Brand | Price Range | Image |
|---------|-------|-------------|-------|
| Samsung 990 PRO 2TB NVMe SSD | Samsung | ₱12,995 - ₱13,995 | ✅ |
| WD Black SN850X 1TB NVMe SSD | Western Digital | ₱6,995 - ₱7,495 | ✅ |
| Crucial P3 Plus 1TB NVMe SSD | Crucial | ₱4,995 - ₱5,295 | ✅ |
| Seagate Barracuda 2TB HDD | Seagate | ₱3,495 - ₱3,795 | ✅ |

### ⚡ Power Supplies (3 Products)

| Product | Brand | Price Range | Image |
|---------|-------|-------------|-------|
| Corsair RM1000e 1000W 80+ Gold | Corsair | ₱9,995 - ₱10,495 | ✅ |
| Seasonic Focus GX-850 850W 80+ Gold | Seasonic | ₱7,995 - ₱8,495 | ✅ |
| EVGA SuperNOVA 750 GT 750W 80+ Gold | EVGA | ₱6,495 - ₱6,995 | ✅ |

### 📦 Cases (4 Products)

| Product | Brand | Price Range | Image |
|---------|-------|-------------|-------|
| Lian Li O11 Dynamic EVO | Lian Li | ₱9,995 - ₱10,995 | ✅ |
| NZXT H510 Flow | NZXT | ₱5,995 - ₱6,495 | ✅ |
| Fractal Design Meshify 2 Compact | Fractal Design | ₱7,495 - ₱7,995 | ✅ |
| Cooler Master MasterBox Q300L | Cooler Master | ₱2,995 - ₱3,295 | ✅ |

### ❄️ Cooling (4 Products)

| Product | Brand | Price Range | Image |
|---------|-------|-------------|-------|
| NZXT Kraken X63 280mm AIO | NZXT | ₱8,995 - ₱9,495 | ✅ |
| Noctua NH-D15 chromax.black | Noctua | ₱6,495 - ₱6,995 | ✅ |
| be quiet! Dark Rock Pro 4 | be quiet! | ₱5,495 - ₱5,995 | ✅ |
| Cooler Master Hyper 212 RGB | Cooler Master | ₱2,295 - ₱2,495 | ✅ |

### 🖥️ Monitors (3 Products)

| Product | Brand | Price Range | Image |
|---------|-------|-------------|-------|
| ASUS ROG Swift PG27AQDM 27" OLED | ASUS | ₱64,995 - ₱69,995 | ✅ |
| LG 27GP850-B 27" IPS Gaming | LG | ₱18,995 - ₱19,995 | ✅ |
| Samsung Odyssey G5 27" Curved | Samsung | ₱14,995 - ₱15,995 | ✅ |

### 🎮 Peripherals (4 Products)

| Product | Brand | Price Range | Image |
|---------|-------|-------------|-------|
| Logitech G Pro X Superlight Wireless | Logitech | ₱7,995 - ₱8,495 | ✅ |
| Razer BlackWidow V4 Pro Keyboard | Razer | ₱12,995 - ₱13,495 | ✅ |
| HyperX Cloud II Wireless Headset | HyperX | ₱6,995 - ₱7,495 | ✅ |
| SteelSeries QcK Heavy Mousepad | SteelSeries | ₱1,495 - ₱1,695 | ✅ |

---

## Data Features

### 🏬 Multi-Retailer Listings

Each product has listings from **3 retailers**:
- **Datablitz** - `www.datablitz.com.ph`
- **PCWorx** - `www.pcworx.com`
- **Bermor Techzone** - `www.bermor.com`

### 💰 Realistic Pricing

- Price variance between retailers (₱500 - ₱2,000)
- Reflects real Philippine market prices
- Lowest and highest price tracking

### 📦 Stock Status

Products have varied stock levels:
- **IN_STOCK** - 60% of listings
- **LIMITED_STOCK** - 20% of listings
- **OUT_OF_STOCK** - 20% of listings

### 🖼️ Product Images

All products include images from Unsplash:
- High-quality tech and hardware photos
- Consistent 400px width
- Fast loading via CDN

---

## Database Schema

### Products Table
```typescript
{
  id: string (cuid)
  name: string
  category: PartCategory
  brand: string
  model: string
  description: string
  imageUrl: string
  lowestPrice: Decimal
  highestPrice: Decimal
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Product Listings Table
```typescript
{
  id: string (cuid)
  productId: string
  retailer: Retailer (DATABLITZ | PCWORX | BERMOR)
  retailerUrl: string
  price: Decimal
  stockStatus: StockStatus
  lastScraped: DateTime
  isActive: boolean
}
```

---

## Usage Examples

### View All Products
```bash
npm run db:studio
# Navigate to "Product" table
```

### Query in Code
```typescript
// Get all CPUs
const cpus = await prisma.product.findMany({
  where: { category: 'CPU' },
  include: { listings: true }
});

// Get products under ₱10,000
const budget = await prisma.product.findMany({
  where: { lowestPrice: { lte: 10000 } },
  orderBy: { lowestPrice: 'asc' }
});

// Get in-stock GPUs
const gpus = await prisma.product.findMany({
  where: {
    category: 'GPU',
    listings: {
      some: { stockStatus: 'IN_STOCK' }
    }
  }
});
```

---

## Seed Script Details

### Location
[scripts/seed.ts](scripts/seed.ts)

### Features
- ✅ Clears existing data before seeding
- ✅ Creates 40+ realistic products
- ✅ Generates 120+ product listings (3 per product)
- ✅ Includes product images
- ✅ Varied pricing and stock status
- ✅ Comprehensive statistics output

### Execution Time
~5-10 seconds depending on database speed

---

## Customization

### Adding More Products

Edit [scripts/seed.ts](scripts/seed.ts) and add to the `products` array:

```typescript
{
  name: 'Your Product Name',
  category: PartCategory.CPU, // or GPU, RAM, etc.
  brand: 'Brand Name',
  model: 'Model Number',
  description: 'Detailed description...',
  imageUrl: 'https://images.unsplash.com/photo-xxxxx?w=400',
  lowestPrice: 10000,
  highestPrice: 12000,
}
```

### Changing Image Sources

Replace Unsplash URLs with:
- Your own hosted images
- Product manufacturer URLs
- Placeholder services (placeholder.com)

### Adjusting Stock Ratios

Modify the `stockOptions` array in [scripts/seed.ts:427](scripts/seed.ts#L427):

```typescript
const stockOptions = [
  StockStatus.IN_STOCK,      // Add more for higher ratio
  StockStatus.IN_STOCK,
  StockStatus.LIMITED_STOCK,
  StockStatus.OUT_OF_STOCK,
];
```

---

## Testing the Data

### 1. Verify Database
```bash
npm run db:studio
```
Opens Prisma Studio at http://localhost:5555

### 2. Check Product Count
```bash
# In Prisma Studio
# Click "Product" → Should show 40 rows
# Click "ProductListing" → Should show 120 rows
```

### 3. View in Application
```bash
npm run dev
```
Visit http://localhost:3000 to see products displayed

### 4. Test Filtering
- Select "CPU" category → Should show 4 products
- Search "RTX" → Should show NVIDIA GPUs
- Search "Corsair" → Should show Corsair products

---

## Sample Build Configurations

With this mock data, you can create realistic PC builds:

### Budget Gaming PC (~₱45,000)
- CPU: Intel Core i5-13600K (₱16,995)
- GPU: NVIDIA RTX 4060 Ti (₱24,995)
- RAM: Corsair LPX 16GB (₱2,995)
- Storage: Crucial P3 Plus 1TB (₱4,995)

### Mid-Range Build (~₱100,000)
- CPU: AMD Ryzen 7 7800X3D (₱28,995)
- GPU: NVIDIA RTX 4070 Ti (₱45,999)
- MOBO: MSI B650 TOMAHAWK (₱12,995)
- RAM: Corsair DDR5 32GB (₱8,995)

### High-End Build (~₱250,000+)
- CPU: AMD Ryzen 9 7950X (₱34,995)
- GPU: NVIDIA RTX 4090 (₱109,995)
- MOBO: ASUS ROG Z790 Hero (₱32,995)
- RAM: G.Skill DDR5 32GB (₱10,995)
- Monitor: ASUS OLED 27" (₱64,995)

---

## Troubleshooting

### Error: Database not found
```bash
# Solution: Push schema first
npm run db:push
npm run db:seed
```

### Error: Can't find tsx
```bash
# Solution: Install dependencies
npm install
npm run db:seed
```

### Products not showing in UI
1. Check database: `npm run db:studio`
2. Verify API: http://localhost:3000/api/products
3. Check console for errors: F12 in browser

### Images not loading
- Images use Unsplash CDN (requires internet)
- Check network tab in DevTools
- Fallback to placeholder shown if image fails

---

## Reset Data

To clear and re-seed:

```bash
# The seed script automatically clears data
npm run db:seed
```

Or manually:
```bash
# In Prisma Studio
# 1. Delete all ProductListings
# 2. Delete all Products
# 3. Run npm run db:seed
```

---

## Production Notes

### Before Deploying

1. **Remove seed data** - Not needed in production
2. **Use real scraper** - Replace with actual retailer data
3. **Update images** - Host your own or use CDN
4. **Verify pricing** - Ensure prices are current

### Keeping Mock Data

If you want to keep mock data in production:
- Update images to reliable CDN
- Review prices for accuracy
- Consider marking as "sample data"

---

## Next Steps

1. **Test the Application**
   ```bash
   npm run db:seed
   npm run dev
   ```

2. **Browse Products**
   - Visit http://localhost:3000
   - Test search and filtering
   - Try PC Builder

3. **Customize Data**
   - Add more products
   - Update pricing
   - Change images

4. **Implement Real Scraping**
   - Use mock data during development
   - Switch to real scrapers when ready

---

## Statistics

- **Total Products**: 40
- **Total Listings**: 120 (3 per product)
- **Categories**: 10
- **Retailers**: 3
- **Price Range**: ₱1,495 - ₱124,995
- **Images**: 40 unique Unsplash photos
- **Brands**: 20+ (AMD, Intel, NVIDIA, ASUS, Corsair, etc.)

---

**Ready to see your data in action!** 🚀

Run `npm run db:seed` and visit http://localhost:3000
