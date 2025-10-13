# 🕸️ Scraper Module

The scraper module extracts and normalizes PC part data from multiple PH retailers.

---

## 🏬 Supported Stores
- Datablitz
- PCWorx
- Bermor Techzone

---

## ⚙️ Technologies
- **Cheerio** for HTML parsing
- **Playwright** for dynamic content
- **Next.js API Routes** for scraper endpoints

---

## 📦 Output Format
```ts
interface PCPart {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  stock: boolean;
  store: 'Datablitz' | 'PCWorx' | 'Bermor';
  url: string;
}
```

---

## 🔄 Trigger Scraper
```bash
curl -X POST http://localhost:3000/api/scrape
```
or scheduled via **Vercel Cron**.
