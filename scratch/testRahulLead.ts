import { chromium } from '@playwright/test';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  console.log('Navigating to login...');
  await page.goto(`${process.env.BASE_URL}/login`);
  await page.fill('input#email', process.env.USER_RAHUL_EMAIL || '');
  await page.fill('input#password', process.env.USER_RAHUL_PASSWORD || '');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 20000 });
  console.log('Logged in, current URL:', page.url());

  // Check Other status DOM
  const otherStatusItems = await page.$$eval('div:has(> span:has-text("Other status")) ~ div, div:has-text("Other status") ~ *', els => 
    els.map(el => ({ tag: el.tagName, html: el.outerHTML, text: el.textContent }))
  );
  console.log('Other status items count:', otherStatusItems.length);
  if (otherStatusItems.length > 0) {
    console.log('Sample item:', otherStatusItems[0]);
  }

  // Check sidebar links
  const links = await page.$$eval('a[href]', els => els.map(el => ({ href: el.getAttribute('href'), text: el.textContent?.trim() })));
  console.log('Sidebar links for Rahul Sharma:');
  console.log(links.filter(l => l.href && !l.href.startsWith('#')));

  // Try going to /mylead
  console.log('Navigating to /mylead...');
  const res = await page.goto(`${process.env.BASE_URL}/mylead`);
  console.log('Status code for /mylead:', res?.status());
  console.log('Current URL after /mylead goto:', page.url());
  await page.waitForTimeout(2000);
  console.log('Current URL after wait:', page.url());

  const tableExists = await page.locator('table').count();
  console.log('Table count on current page:', tableExists);
  const rows = await page.locator('tbody tr').count();
  console.log('tbody tr count:', rows);
  if (rows > 0) {
    const rowTexts = await page.locator('tbody tr').allInnerTexts();
    console.log('Rows texts:', rowTexts.slice(0, 3));
  }

  await browser.close();
})();
