import { chromium } from '@playwright/test';
import path from 'path';

async function main() {
  const browser = await chromium.launch();
  // Simulate mobile device
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true
  });
  
  const page = await context.newPage();
  
  console.log('Navigating to http://localhost:4321/en/projects/oxygen-gym/...');
  try {
    await page.goto('http://localhost:4321/en/projects/oxygen-gym/', { waitUntil: 'load', timeout: 15000 });
    console.log('Page loaded. Waiting 2 seconds for rendering...');
    await page.waitForTimeout(2000);
    
    // Save to the scratch directory
    const outputPath = 'C:/Users/HP/.gemini/antigravity-ide/brain/62f87f43-84d8-462d-8bf5-d801e48dbb37/scratch/oxygen_gym_mobile.png';
    await page.screenshot({ path: outputPath, fullPage: true });
    console.log(`Screenshot saved to ${outputPath}`);
  } catch (err) {
    console.error('Error during screenshot capture:', err);
  } finally {
    await browser.close();
  }
}

main();
