import { chromium, Browser, Page } from 'patchright';
import logger from './logger';

let browserPromise: Promise<Browser> | null = null;

/**
 * Get or create a persistent Patchright browser instance
 * Uses Chrome with stealth mode for undetected automation
 */
export const getPatchrightBrowser = async (): Promise<Browser> => {
  if (!browserPromise) {
    logger.info('Launching Patchright browser (undetected Chromium)');
    browserPromise = chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled',
      ],
      // Use Chrome if available for better stealth
      channel: process.env.USE_CHROME === 'true' ? 'chrome' : undefined,
    });
  }
  return browserPromise;
};

/**
 * Fetch TikTok page using Patchright for anti-bot evasion
 * This is a fallback when direct fetch() methods fail
 */
export const fetchTikTokWithPatchright = async (
  url: string
): Promise<{ html: string; cookies: string[] }> => {
  const browser = await getPatchrightBrowser();
  const context = await browser.newContext({
    viewport: null,
    userAgent:
      'Mozilla/5.0 (X11; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.1',
  });

  const page = await context.newPage();

  try {
    logger.info(`Fetching with Patchright: ${url}`);
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    // Wait for TikTok's rehydration data to load
    await page.waitForSelector('#__UNIVERSAL_DATA_FOR_REHYDRATION__', {
      timeout: 10000,
    });

    const html = await page.content();
    const cookies = await context.cookies();
    const cookieStrings = cookies.map(
      (c: any) => `${c.name}=${c.value}`
    );

    logger.info('Successfully fetched with Patchright');
    return {
      html,
      cookies: cookieStrings,
    };
  } catch (error) {
    console.error('Patchright fetch failed:', error);
    throw error;
  } finally {
    await page.close();
    await context.close();
  }
};

/**
 * Close the browser when shutting down
 */
export const closePatchrightBrowser = async (): Promise<void> => {
  if (browserPromise) {
    const browser = await browserPromise;
    await browser.close();
    browserPromise = null;
    logger.info('Patchright browser closed');
  }
};

// Graceful shutdown
process.on('SIGTERM', closePatchrightBrowser);
process.on('SIGINT', closePatchrightBrowser);
