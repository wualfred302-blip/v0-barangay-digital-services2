const { chromium } = require('playwright');
const path = require('path');

async function testQRTPaymentWorkflow() {
  console.log('Starting QRT ID Payment Workflow Test...\n');

  const browser = await chromium.launch({
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });

  const page = await context.newPage();

  try {
    const baseUrl = 'https://9000-firebase-barangayformdemo-1766126387508.cluster-ejd22kqny5dfowoyipt52.cloudworkstations.dev';
    const paymentUrl = `${baseUrl}/payment?type=qrt`;

    console.log(`1. Navigating to: ${paymentUrl}`);
    await page.goto(paymentUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // Wait for any dynamic content

    console.log('2. Taking screenshot of initial page state...');
    await page.screenshot({
      path: '/home/user/barangayformdemo/screenshot-initial.png',
      fullPage: true
    });
    console.log('   Screenshot saved: screenshot-initial.png\n');

    // Check page content
    const pageTitle = await page.title();
    console.log(`   Page Title: ${pageTitle}`);

    // Look for payment method buttons
    console.log('\n3. Looking for payment method options...');
    const paymentMethods = await page.$$('[data-payment-method], button:has-text("GCash"), button:has-text("Maya"), button:has-text("Cash")');
    console.log(`   Found ${paymentMethods.length} potential payment method elements`);

    // Try to find and click GCash button
    let paymentMethodSelected = false;
    let selectedMethod = 'Unknown';

    // Method 1: Try data attribute
    const gcashButton = await page.$('[data-payment-method="gcash"]');
    if (gcashButton) {
      console.log('   Found GCash button (via data attribute)');
      await gcashButton.click();
      selectedMethod = 'GCash';
      paymentMethodSelected = true;
    } else {
      // Method 2: Try text content
      const buttons = await page.$$('button');
      for (const button of buttons) {
        const text = await button.textContent();
        if (text && text.toLowerCase().includes('gcash')) {
          console.log('   Found GCash button (via text content)');
          await button.click();
          selectedMethod = 'GCash';
          paymentMethodSelected = true;
          break;
        }
      }
    }

    if (!paymentMethodSelected) {
      // Try Maya as fallback
      const mayaButton = await page.$('[data-payment-method="maya"]');
      if (mayaButton) {
        console.log('   Found Maya button');
        await mayaButton.click();
        selectedMethod = 'Maya';
        paymentMethodSelected = true;
      } else {
        const buttons = await page.$$('button');
        for (const button of buttons) {
          const text = await button.textContent();
          if (text && text.toLowerCase().includes('maya')) {
            console.log('   Found Maya button (via text content)');
            await button.click();
            selectedMethod = 'Maya';
            paymentMethodSelected = true;
            break;
          }
        }
      }
    }

    console.log(`   Selected payment method: ${selectedMethod}`);
    await page.waitForTimeout(1000);

    console.log('\n4. Looking for Pay button...');
    // Try multiple selectors for the pay button
    let payButton = await page.$('button:has-text("Pay")');
    if (!payButton) {
      payButton = await page.$('button:has-text("Proceed")');
    }
    if (!payButton) {
      payButton = await page.$('button[type="submit"]');
    }

    if (payButton) {
      console.log('   Found Pay button, clicking...');
      await payButton.click();
      console.log('   Pay button clicked');
    } else {
      console.log('   WARNING: Could not find Pay button');
      // List all buttons for debugging
      const allButtons = await page.$$('button');
      console.log(`   Found ${allButtons.length} total buttons on page`);
      for (let i = 0; i < Math.min(5, allButtons.length); i++) {
        const btnText = await allButtons[i].textContent();
        console.log(`   Button ${i + 1}: "${btnText}"`);
      }
    }

    console.log('\n5. Waiting for payment processing...');
    await page.waitForTimeout(3000);

    // Check for success indicators
    const successIndicators = [
      'success',
      'complete',
      'confirmed',
      'qrt id',
      'qrt-id',
      'download'
    ];

    let foundSuccess = false;
    for (const indicator of successIndicators) {
      const element = await page.$(`text=${indicator}`);
      if (element) {
        console.log(`   Found success indicator: "${indicator}"`);
        foundSuccess = true;
      }
    }

    // Check for QRT ID images
    console.log('\n6. Checking for QRT ID images...');
    const images = await page.$$('img');
    console.log(`   Found ${images.length} images on page`);

    let qrtImagesFound = 0;
    for (const img of images) {
      const src = await img.getAttribute('src');
      const alt = await img.getAttribute('alt');
      if (src && (src.includes('qrt') || src.includes('blob:') || src.includes('data:image'))) {
        console.log(`   QRT-related image found: ${alt || 'No alt text'}`);
        console.log(`   Source: ${src.substring(0, 100)}...`);
        qrtImagesFound++;
      }
    }

    if (qrtImagesFound > 0) {
      console.log(`   Total QRT ID images found: ${qrtImagesFound}`);
    } else {
      console.log('   No QRT ID images detected');
    }

    // Check for canvas elements (might be used for QR code generation)
    const canvases = await page.$$('canvas');
    console.log(`   Found ${canvases.length} canvas elements`);

    console.log('\n7. Taking screenshot of final state...');
    await page.screenshot({
      path: '/home/user/barangayformdemo/screenshot-final.png',
      fullPage: true
    });
    console.log('   Screenshot saved: screenshot-final.png\n');

    // Get final page content summary
    const finalUrl = page.url();
    console.log('=== FINAL STATE ===');
    console.log(`Final URL: ${finalUrl}`);
    console.log(`Payment method selected: ${selectedMethod}`);
    console.log(`Success indicators found: ${foundSuccess}`);
    console.log(`QRT ID images detected: ${qrtImagesFound}`);
    console.log(`Canvas elements: ${canvases.length}`);

    // Check for any error messages
    const errorElements = await page.$$('[role="alert"], .error, .alert-error');
    if (errorElements.length > 0) {
      console.log(`\nWARNING: Found ${errorElements.length} error elements`);
      for (const error of errorElements) {
        const errorText = await error.textContent();
        console.log(`Error message: ${errorText}`);
      }
    }

    // Get console logs
    console.log('\n=== BROWSER CONSOLE LOGS ===');

  } catch (error) {
    console.error('\n❌ ERROR during test execution:');
    console.error(error.message);
    console.error(error.stack);

    // Take error screenshot
    try {
      await page.screenshot({
        path: '/home/user/barangayformdemo/screenshot-error.png',
        fullPage: true
      });
      console.log('Error screenshot saved: screenshot-error.png');
    } catch (screenshotError) {
      console.error('Could not take error screenshot:', screenshotError.message);
    }
  } finally {
    await browser.close();
    console.log('\n✓ Test completed, browser closed');
  }
}

// Capture console messages
async function setupConsoleListeners(page) {
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      console.log(`[Browser Error] ${text}`);
    } else if (type === 'warning') {
      console.log(`[Browser Warning] ${text}`);
    } else if (text.toLowerCase().includes('qrt') || text.toLowerCase().includes('payment')) {
      console.log(`[Browser Log] ${text}`);
    }
  });
}

// Run the test
testQRTPaymentWorkflow().catch(console.error);
