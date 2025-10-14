import { Retailer } from '@prisma/client';
import { runScraperJob } from '@/scraper/index';

// Configure which retailers to scrape
// Add or remove retailers from this array as needed
const ENABLED_RETAILERS: Retailer[] = [
  Retailer.BERMOR,
  // Retailer.DATABLITZ, // Add when scraper is ready
  // Retailer.PCWORTH,   // Add when scraper is ready
];

// Scraping Configuration Notes:
// - BERMOR_MAX_PAGES env variable controls how many pages to scrape (default: 50)
// - Set to 0 or -1 for unlimited pages (will scrape all 433+ pages)
// - For scheduled runs: Use 50-100 pages for faster updates (new products appear first)
// - For manual full scrapes: Set to 0 in .env or pass directly to scrapeBermor(0)

// Run scraper for all enabled retailers
export async function runAllScrapers() {
  console.log('🚀 Starting scheduled scraper job...');
  console.log(`📋 Enabled retailers: ${ENABLED_RETAILERS.join(', ')}`);
  const results = [];

  for (const retailer of ENABLED_RETAILERS) {
    try {
      console.log(`📦 Scraping ${retailer}...`);
      const result = await runScraperJob(retailer);
      console.log(`✅ ${retailer} completed:`, result);
      results.push({ retailer, ...result });
    } catch (error) {
      console.error(`❌ ${retailer} failed:`, error);
      results.push({
        retailer,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  console.log('🎉 Scheduled scraping completed!');
  return results;
}

// Schedule function to run every 6 hours
export function setupScheduler() {
  const SIX_HOURS = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

  console.log('⏰ Scheduler initialized - will run every 6 hours');
  console.log('⏰ First scheduled scrape will run in 6 hours from now');

  // Schedule to run every 6 hours
  // Note: Does NOT run immediately on startup, only runs every 6 hours after startup
  setInterval(() => {
    console.log('⏰ Triggered scheduled scrape (every 6 hours)');
    runAllScrapers().catch(console.error);
  }, SIX_HOURS);
}
