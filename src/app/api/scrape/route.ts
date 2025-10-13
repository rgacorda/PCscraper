import { NextRequest, NextResponse } from 'next/server';
import { runScraperJob } from '@/scraper';
import { Retailer } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for production
    const authHeader = request.headers.get('authorization');
    if (process.env.NODE_ENV === 'production') {
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    const body = await request.json();
    const { retailer } = body;

    if (!retailer || !Object.values(Retailer).includes(retailer)) {
      return NextResponse.json(
        { error: 'Invalid retailer specified' },
        { status: 400 }
      );
    }

    // Run scraper job (don't await in production for long-running tasks)
    const jobPromise = runScraperJob(retailer as Retailer);

    // In development, wait for completion
    if (process.env.NODE_ENV === 'development') {
      const result = await jobPromise;
      return NextResponse.json(result);
    }

    // In production, return immediately
    return NextResponse.json({
      message: 'Scraping job started',
      retailer,
    });
  } catch (error) {
    console.error('Error starting scrape job:', error);
    return NextResponse.json(
      { error: 'Failed to start scraping job' },
      { status: 500 }
    );
  }
}
