# 🖥️ PH PC Parts Aggregator (Full-Stack Next.js)

A full-stack **Next.js** application that aggregates PC part prices and availability from popular Philippine retailers such as **Datablitz**, **PCWorx**, and **Bermor Techzone**.

This platform provides a centralized interface for comparing prices, checking stock, and building PC configurations — built entirely with **Next.js (App Router)** and **TypeScript**.

---

## 🚀 Overview

| Layer | Description |
|--------|--------------|
| 🧠 **Backend (API + Scraper)** | Handles scraping and data aggregation using Next.js API routes |
| 💅 **Frontend (UI)** | Displays aggregated PC parts with filters, search, and a PC builder feature |
| 🧩 **PC Builder** | Lets users assemble a full PC setup and computes total price |
| 💾 **Database** | PostgreSQL (via Prisma) for storing and indexing parts |

---

## 🧩 Features

- 🔍 Scrape PC part data from major PH retailers
- 💾 Cache and normalize brand, price, stock, and categories
- 🧠 Categorized parts (CPU, GPU, Motherboard, PSU, etc.)
- 🧱 Build-a-PC tool that sums total prices dynamically
- 🌐 REST-like API endpoints via Next.js
- 🕓 Background scraping job (Vercel Cron or manual trigger)

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

## ⚙️ Setup

```bash
git clone https://github.com/yourusername/pc-parts-aggregator.git
cd pc-parts-aggregator
npm install
npx prisma migrate dev
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

## 📘 Feature Documentation

| Directory | Description |
|------------|--------------|
| `src/scraper/README.md` | Scraping and normalization strategy |
| `src/pages/api/README.md` | API endpoints and data schema |
| `src/features/ui/README.md` | UI structure and routing |
| `src/features/pc-builder/README.md` | PC Builder logic and total price computation |

---

## 📄 License
MIT License © 2025 — Your Name
