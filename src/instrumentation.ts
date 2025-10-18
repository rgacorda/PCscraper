export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const enableScheduler = process.env.ENABLE_SCHEDULER === 'true';

    if (enableScheduler) {
      console.log('✅ Scheduler is ENABLED - automatic scraping every 3 hours');
      const { setupScheduler } = await import('./lib/scheduler');
      setupScheduler();
    } else {
      console.log('⏸️  Scheduler is DISABLED - no automatic scraping');
      console.log('💡 To enable, set ENABLE_SCHEDULER=true in your .env file');
    }
  }
}
