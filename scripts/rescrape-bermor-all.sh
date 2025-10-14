#!/bin/bash

# Script to rescrape all Bermor products and fix image URLs

echo "🔧 Starting complete Bermor rescrape to fix image URLs..."
echo ""
echo "This will scrape ALL pages from Bermor (may take 10-30 minutes)"
echo ""

# Set max pages to 0 (unlimited) or high number to get all products
export BERMOR_MAX_PAGES=0

# Run the Bermor scraper
echo "📦 Running Bermor scraper..."
npm run scrape:bermor

echo ""
echo "✅ Rescrape complete!"
echo ""
echo "To verify the images were fixed, run:"
echo "  npx tsx scripts/check-db-images.ts"
