const { chromium } = require('playwright');

(async () => {
  console.log('Starting Playwright test...');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  console.log('Navigating to payment page...');
  await page.goto('https://9000-firebase-barangayformdemo-1766126387508.cluster-ejd22kqny5dfowoyipt52.cloudworkstations.dev/payment?type=qrt', {
    waitUntil: 'networkidle',
    timeout: 30000
  });
  
  console.log('Taking initial screenshot...');
  await page.screenshot({ path: 'payment-page-initial.png', fullPage: true });
  console.log('Saved: payment-page-initial.png');
  
  // Get page content for analysis
  const title = await page.title();
  console.log('Page title:', title);
  
  // Check for payment methods
  const pageContent = await page.content();
  console.log('Page loaded, checking for payment options...');
  
  // Look for GCash button
  const gcashButton = await page.$('text=GCash');
  if (gcashButton) {
    console.log('Found GCash option, clicking...');
    await gcashButton.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'payment-gcash-selected.png', fullPage: true });
    console.log('Saved: payment-gcash-selected.png');
  }
  
  // Look for Pay button
  const payButton = await page.$('button:has-text("Pay")');
  if (payButton) {
    console.log('Found Pay button, clicking...');
    await payButton.click();
    
    // Wait for processing
    console.log('Waiting for payment processing...');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'payment-after-pay.png', fullPage: true });
    console.log('Saved: payment-after-pay.png');
  }
  
  // Check console logs
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  // Final screenshot
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'payment-final.png', fullPage: true });
  console.log('Saved: payment-final.png');
  
  // Get current URL
  console.log('Current URL:', page.url());
  
  await browser.close();
  console.log('Test complete!');
})().catch(err => {
  console.error('Test failed:', err.message);
  process.exit(1);
});
