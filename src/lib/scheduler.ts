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
// - BERMOR_MAX_PAGES env variable controls how many pages to scrape per cycle (default: 5)
// - Set to 0 or -1 for unlimited pages (will scrape all pages in each cycle)
// - Scraper resumes from last page every 3 hours until all products are scraped
// - Old products not scraped in 30 days are automatically deleted
// - For scheduled runs: Scraper will continuously resume until all pages are complete

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
      results.push(result);
    } catch (error) {
      console.error(`❌ ${retailer} failed:`, error);
      results.push({
        retailer,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  console.log('🎉 Scheduled scraping completed!');
  return results;
}

// Schedule function to run every 3 hours
export function setupScheduler() {
  const THREE_HOURS = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

  console.log('⏰ Scheduler initialized - will run every 3 hours');
  console.log('⏰ First scheduled scrape will run in 3 hours from now');
  console.log(`📋 Enabled retailers: ${ENABLED_RETAILERS.join(', ')}`);

  // Schedule to run every 3 hours
  // Note: Does NOT run immediately on startup, only runs every 3 hours after startup
  setInterval(() => {
    console.log('⏰ Triggered scheduled scrape (every 3 hours)');
    runAllScrapers().catch(console.error);
  }, THREE_HOURS);
}
