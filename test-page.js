const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    
    await page.goto('http://localhost:3001/customize/test-product', { waitUntil: 'networkidle0' });
    console.log('Page loaded successfully');
    await browser.close();
  } catch (error) {
    console.error('Script Error:', error);
  }
})();
