# 🖥️ PH PC Parts Aggregator

A full-stack **Next.js** application that aggregates PC part prices and availability from popular Philippine retailers such as **Datablitz**, **PCWorth**, and **Bermor Techzone**.

This platform provides a centralized interface for comparing prices, checking stock, and building PC configurations — built entirely with **Next.js 15 (App Router)** and **TypeScript**.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-blue)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-green)](https://www.prisma.io/)

---

## 🚀 Overview

| Layer | Description |
|--------|--------------|
| 🧠 **Backend (API + Scraper)** | Handles scraping and data aggregation using Next.js API routes |
| 💅 **Frontend (UI)** | Displays aggregated PC parts with filters, search, and a PC builder feature |
| 🧩 **PC Builder** | Lets users assemble a full PC setup and computes total price |
| 💾 **Database** | PostgreSQL (via Prisma) for storing and indexing parts |

---

## ✨ Features

### 🕸️ Web Scraping
- **Multi-retailer support** with configurable pagination
- **Automatic data normalization** and categorization
- **Smart image extraction** with multiple fallbacks
- **Stock status tracking** across retailers
- **Scheduled automation** with 6-hour intervals
- **Job logging** for monitoring and debugging

### 💾 Data Management
- **PostgreSQL database** with Prisma ORM
- **Efficient upsert operations** for data consistency
- **Price range tracking** (lowest/highest prices)
- **Product categorization** (CPU, GPU, Motherboard, RAM, etc.)
- **Brand and model extraction** from product names

### 🛠️ PC Builder
- **Component selection** by category
- **Real-time price calculation** from multiple retailers
- **Build persistence** in database
- **Price comparison** across stores

### 🌐 API & UI
- **RESTful API endpoints** for products and scraping
- **Responsive design** with Tailwind CSS
- **Search and filtering** capabilities
- **Mobile-optimized interface**

---

## 🏗️ Tech Stack

| Category | Technology |
|-----------|-------------|
| **Framework** | Next.js 15 (App Router, Full Stack) |
| **Language** | TypeScript |
| **Database** | PostgreSQL + Prisma |
| **Scraping** | Cheerio / Playwright |
| **Styling** | Tailwind CSS |
| **Deployment** | Vercel / Railway |

---

## 📂 Structure

```
/pc-parts-aggregator/
├── prisma/
├── src/
│   ├── app/              # Next.js UI
│   ├── pages/api/        # API routes
│   ├── scraper/          # Scraping logic
│   ├── features/
│   │   ├── pc-builder/   # Build PC feature
│   │   ├── api/          # API docs
│   │   └── ui/           # UI docs
│   └── lib/              # DB + utilities
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ ([Download](https://nodejs.org/))
- PostgreSQL 15+ ([Download](https://www.postgresql.org/download/))

### Installation

```bash
# 1. Clone repository
git clone https://github.com/yourusername/pc-parts-aggregator.git
cd pc-parts-aggregator

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your database credentials

# 4. Setup database
npx prisma generate
npx prisma db push

# 5. Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Optional: Seed Sample Data

```bash
npx tsx scripts/seed.ts
```

For detailed setup instructions, see [📘 Quick Start Guide](docs/QUICKSTART.md).

---

## 📚 Documentation

| Guide | Description |
|-------|-------------|
| [🚀 Quick Start](docs/QUICKSTART.md) | Get started in minutes with step-by-step setup |
| [🕸️ Scraper Setup](docs/SCRAPER_SETUP.md) | Complete scraping configuration & troubleshooting |
| [🏗️ Project Structure](docs/PROJECT_STRUCTURE.md) | Architecture and file organization reference |
| [🚀 Deployment](docs/DEPLOYMENT.md) | Deploy to Vercel, Railway, or Docker |

## 🔧 Common Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server

# Database
npx prisma studio        # Open database GUI
npx prisma db push       # Push schema changes
npx tsx scripts/seed.ts  # Seed sample data

# Scraping
npx tsx scripts/scrape-and-save-bermor.ts  # Run Bermor scraper
MAX_PAGES=50 npx tsx scripts/scrape-and-save-bermor.ts  # Custom pagination

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # TypeScript check
```

## 🕸️ Web Scraping

### Currently Supported Retailers

- ✅ **Bermor Techzone** (433 pages, ~13,000 products)
- 🔄 **Datablitz** (prepared, currently disabled)
- 🔄 **PCWorth** (prepared, currently disabled)

### Quick Scraper Usage

```bash
# Manual scrape (recommended for testing)
MAX_PAGES=2 npx tsx scripts/scrape-and-save-bermor.ts

# Via API
curl -X POST http://localhost:3000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"retailer": "BERMOR"}'

# Automatic (runs every 6 hours when app starts)
npm run dev
```

### Configuration

Edit `.env`:
```bash
# Scraper settings
BERMOR_MAX_PAGES=50        # 50 pages = ~1,500 products (recommended)
SCRAPER_TIMEOUT=30000      # 30 second timeout
SCRAPER_MAX_RETRIES=3      # Retry failed requests 3 times
```

**For complete scraper documentation**, see [📘 Scraper Setup Guide](docs/SCRAPER_SETUP.md)

---

## 🗂️ Project Structure

```
PCscraper/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes (products, scrape)
│   │   ├── builder/           # PC Builder page
│   │   └── page.tsx           # Home page
│   ├── scraper/               # Web scraping system
│   │   ├── retailers/         # Retailer-specific scrapers
│   │   ├── index.ts           # Scraper orchestrator
│   │   └── normalizer.ts      # Data normalization
│   ├── lib/                   # Shared utilities
│   │   ├── prisma.ts          # Database client
│   │   ├── scheduler.ts       # Scraping scheduler
│   │   └── utils.ts           # Helper functions
│   └── features/              # Feature modules
│       ├── ui/                # UI components
│       └── pc-builder/        # PC Builder components
├── prisma/
│   └── schema.prisma          # Database schema
├── scripts/                   # Utility scripts
├── docs/                      # Documentation
└── .env                       # Environment config
```

For detailed architecture, see [🏗️ Project Structure Guide](docs/PROJECT_STRUCTURE.md)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

MIT License © 2025

---

## 🙏 Acknowledgments

- Retailer websites for providing product data
- Next.js team for the amazing framework
- Prisma team for the excellent ORM
- Open source community

---

**Built with ❤️ for the Philippine PC building community**
