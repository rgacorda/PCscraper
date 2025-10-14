#!/usr/bin/env node
import { Retailer } from '@prisma/client';
import { runScraperJob } from './index';

async function main() {
  const args = process.argv.slice(2);
  const retailerArg = args[0]?.toUpperCase();

  console.log('🚀 Starting scraper...');

  try {
    if (retailerArg && retailerArg in Retailer) {
      // Run specific retailer
      const retailer = Retailer[retailerArg as keyof typeof Retailer];
      console.log(`📦 Scraping ${retailer}...`);
      const result = await runScraperJob(retailer);
      console.log('✅ Scraping completed:', result);
    } else {
      // Run all retailers
      console.log('📦 Scraping all retailers...');
      const retailers = Object.values(Retailer);

      for (const retailer of retailers) {
        console.log(`\n📦 Scraping ${retailer}...`);
        try {
          const result = await runScraperJob(retailer);
          console.log(`✅ ${retailer} completed:`, result);
        } catch (error) {
          console.error(`❌ ${retailer} failed:`, error);
        }
      }
    }

    console.log('\n🎉 All scraping jobs completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Scraper failed:', error);
    process.exit(1);
  }
}

main();
