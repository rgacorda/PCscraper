import axios from 'axios';

export async function fetchWithRetry(
  url: string,
  maxRetries = 3,
  timeout = 30000
): Promise<string> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios.get(url, {
        timeout,
        headers: {
          'User-Agent': process.env.SCRAPER_USER_AGENT ||
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      return response.data;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.warn(`Fetch attempt ${i + 1} failed for ${url}:`, lastError.message);

      if (i < maxRetries - 1) {
        // Exponential backoff
        await sleep(Math.pow(2, i) * 1000);
      }
    }
  }

  throw lastError || new Error('Failed to fetch after retries');
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(price);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}
