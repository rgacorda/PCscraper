import { NextRequest, NextResponse } from 'next/server';
import { runAllScrapers } from '@/lib/scheduler';

// This endpoint is called by Vercel Cron every 3 hours
export async function GET(request: NextRequest) {
  try {
    // Check if cron is enabled
    const cronEnabled = process.env.ENABLE_CRON === 'true';

    if (!cronEnabled) {
      console.log('⏸️  Cron is disabled - skipping scrape');
      return NextResponse.json(
        {
          success: false,
          message: 'Cron is disabled. Set ENABLE_CRON=true to enable automatic scraping.',
        },
        { status: 200 }
      );
    }

    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');

    if (process.env.NODE_ENV === 'production') {
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        console.error('❌ Unauthorized cron attempt');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    console.log('⏰ Cron job triggered - starting scraper');

    // Run all enabled scrapers
    const results = await runAllScrapers();

    return NextResponse.json({
      success: true,
      message: 'Scraping completed',
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Cron job failed:', error);
    return NextResponse.json(
      {
        error: 'Failed to run scraping job',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggering
export async function POST(request: NextRequest) {
  return GET(request);
}
