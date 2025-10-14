# 🌱 Seed Data Quick Reference

## One Command Setup

```bash
npm run db:seed
```

## What You Get

- **40 Products** across 10 categories
- **120 Listings** from 3 retailers
- **High-quality images** from Unsplash
- **Realistic prices** in Philippine Pesos
- **Varied stock status** (In Stock, Limited, Out of Stock)

## Product Breakdown

| Category | Count | Price Range |
|----------|-------|-------------|
| 💻 CPU | 4 | ₱16,995 - ₱36,995 |
| 🎮 GPU | 4 | ₱24,995 - ₱124,995 |
| 🖥️ Motherboard | 4 | ₱7,995 - ₱34,995 |
| 🧠 RAM | 4 | ₱2,995 - ₱11,995 |
| 💾 Storage | 4 | ₱3,495 - ₱13,995 |
| ⚡ PSU | 3 | ₱6,495 - ₱10,495 |
| 📦 Case | 4 | ₱2,995 - ₱10,995 |
| ❄️ Cooling | 4 | ₱2,295 - ₱9,495 |
| 🖥️ Monitor | 3 | ₱14,995 - ₱69,995 |
| 🎮 Peripheral | 4 | ₱1,495 - ₱13,495 |

## Featured Products

### Top Tier
- 🔥 AMD Ryzen 9 7950X - ₱34,995
- 🔥 NVIDIA RTX 4090 - ₱109,995
- 🔥 ASUS ROG Swift OLED 27" - ₱64,995

### Best Value
- 💎 Intel Core i5-13600K - ₱16,995
- 💎 NVIDIA RTX 4060 Ti - ₱24,995
- 💎 MSI B650 TOMAHAWK - ₱12,995

### Budget Options
- 💰 Corsair Vengeance LPX 16GB - ₱2,995
- 💰 Crucial P3 Plus 1TB - ₱4,995
- 💰 Cooler Master Hyper 212 - ₱2,295

## Retailers

- **Datablitz** (www.datablitz.com.ph)
- **PCWorth** (www.pcworth.com)
- **Bermor Techzone** (www.bermor.com)

## Commands

```bash
# Seed database
npm run db:seed

# View data
npm run db:studio

# Run app
npm run dev
```

## File Location

[scripts/seed.ts](scripts/seed.ts)

For detailed documentation, see [MOCK_DATA_GUIDE.md](MOCK_DATA_GUIDE.md)
