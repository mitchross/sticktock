import { getBrowser } from '../legacy/puppeteer';

export const fetchPageWithPuppeteer = async (url: string): Promise<{ html: string; finalUrl: string }> => {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.1');
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    const finalUrl = page.url();
    const html = await page.content();
    await page.close();
    return { html, finalUrl };
  } catch (err) {
    try {
      await page.close();
    } catch (_) {
      // ignore
    }
    throw err;
  }
};
