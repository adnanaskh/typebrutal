const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'screenshots');

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 2
  });

  const page = await context.newPage();

  console.log('1. Capturing Hero Preview...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'hero-preview.png') });

  console.log('2. Capturing Dark Mode Preview...');
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('typebrutal_settings_v1') || '{}');
    s.theme = 'neo-dark';
    localStorage.setItem('typebrutal_settings_v1', JSON.stringify(s));
  });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'dark-mode.png') });

  console.log('3. Capturing Analytics Dashboard...');
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('typebrutal_settings_v1') || '{}');
    s.theme = 'cyber-yellow';
    localStorage.setItem('typebrutal_settings_v1', JSON.stringify(s));
    const history = [
      { id: '1', date: new Date(Date.now() - 3600000 * 4).toISOString(), wpm: 72, rawWpm: 76, accuracy: 98, consistency: 91, mistakes: 2, testDuration: 30, mode: 'time', modeValue: '30' },
      { id: '2', date: new Date(Date.now() - 3600000 * 3).toISOString(), wpm: 79, rawWpm: 83, accuracy: 99, consistency: 94, mistakes: 1, testDuration: 30, mode: 'time', modeValue: '30' },
      { id: '3', date: new Date(Date.now() - 3600000 * 2).toISOString(), wpm: 85, rawWpm: 89, accuracy: 97, consistency: 92, mistakes: 3, testDuration: 30, mode: 'time', modeValue: '30' },
      { id: '4', date: new Date(Date.now() - 3600000 * 1).toISOString(), wpm: 91, rawWpm: 94, accuracy: 100, consistency: 96, mistakes: 0, testDuration: 30, mode: 'time', modeValue: '30' }
    ];
    localStorage.setItem('typebrutal_history_v1', JSON.stringify(history));
    localStorage.setItem('typebrutal_streak_v1', JSON.stringify({ currentStreak: 7, maxStreak: 15, lastActiveDate: new Date().toISOString().split('T')[0] }));
  });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  const analyticsBtn = await page.button[title*="Analytics" i], button:has-text("Stats"), button:has-text("Analytics");
  if (analyticsBtn) {
    await analyticsBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'analytics-dashboard.png') });
  }

  console.log('4. Capturing Test Summary Screen...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // Click 10 words
  const wordsTab = await page.button:has-text("Words");
  if (wordsTab) {
    await wordsTab.click();
    await page.waitForTimeout(300);
  }
  const tenWordsBtn = await page.button:has-text("10");
  if (tenWordsBtn) {
    await tenWordsBtn.click();
    await page.waitForTimeout(300);
  }

  // Type characters to finish test
  const focusBox = await page.#typing-focus-container;
  if (focusBox) {
    await focusBox.focus();
    // Get text
    const textToType = await page.evaluate(() => {
      const container = document.getElementById('typing-focus-container');
      if (!container) return '';
      // Extract target characters from child spans or text
      const spans = container.querySelectorAll('span');
      if (spans.length > 0) {
        return Array.from(spans).map(s => s.textContent || '').join('');
      }
      return container.innerText || '';
    });

    console.log('Typing test sequence...');
    if (textToType) {
      for (const ch of textToType) {
        if (ch === ' ') {
          await page.keyboard.press('Space');
        } else {
          await page.keyboard.press(ch);
        }
        await page.waitForTimeout(20);
      }
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(OUTPUT_DIR, 'test-summary.png') });
    }
  }

  await browser.close();
  console.log('🎉 ALL SCREENSHOTS SUCCESSFULLY CAPTURED!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
