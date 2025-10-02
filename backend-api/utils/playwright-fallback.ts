import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Browser } from 'playwright';

// Add the stealth plugin to playwright-extra
chromium.use(StealthPlugin());

let _browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (_browser) return _browser;

  // Launch a single shared browser instance with stealth plugin enabled
  _browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
    ],
  });

  return _browser;
}

export const fetchPageWithPlaywright = async (url: string, opts?: { timeoutMs?: number }): Promise<{ html: string; finalUrl: string; cookies: string }> => {
  const browser = await getBrowser();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'en-US',
    timezoneId: 'America/New_York',
  });

  const page = await context.newPage();

  try {
    const timeout = opts?.timeoutMs ?? 30000;
    await page.goto(url, { waitUntil: 'networkidle', timeout });

    // wait a short moment for any late-rendered content
    await page.waitForTimeout(500);

    const finalUrl = page.url();
    const html = await page.content();
    
    // Get cookies from the browser context
    const cookiesArray = await context.cookies();
    const cookies = cookiesArray
      .map((cookie: { name: string; value: string }) => `${cookie.name}=${cookie.value}`)
      .join('; ');

    return { html, finalUrl, cookies };
  } finally {
    try {
      await page.close();
    } catch (e) {
      // ignore
    }
    try {
      await context.close();
    } catch (e) {
      // ignore
    }
  }
};

export async function closePlaywrightBrowser() {
  if (_browser) {
    try {
      await _browser.close();
    } catch (e) {
      // ignore
    }
    _browser = null;
  }
}
