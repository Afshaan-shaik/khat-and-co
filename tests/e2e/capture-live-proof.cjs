const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 950 } });
  const page = await context.newPage();

  // Test Letter 1: Without Audio
  const letterNoAudio = {
    sender: 'Meera',
    recipient: 'Aarav',
    body: 'Dear Aarav,\n\nWriting this warm letter without any audio attachment. Note that there are zero audio controls or empty placeholders on this stationery.',
    signoff: 'Forever yours,',
    templateId: 'rose-petal',
    fontId: 'caveat',
    fontSize: 'm',
    waxColor: 'oxblood',
    waxMono: '♡',
    waxSeal: { id: 'heart', symbol: '♡', isCustom: false, color: 'oxblood' },
    ruledLines: true,
    voiceNoteUrl: null,
    stamp: 0,
    created: Date.now()
  };

  const hashNoAudio = Buffer.from(JSON.stringify(letterNoAudio)).toString('base64url');
  await page.goto(`https://khath-and-co.vercel.app/#l=${hashNoAudio}`);
  await page.waitForSelector('[data-testid="envelope-wax-seal"]', { timeout: 15000 });
  await page.click('[data-testid="envelope-wax-seal"]');
  await page.waitForSelector('.paper', { timeout: 15000 });
  await page.waitForTimeout(1500);

  const outDir = path.resolve('test-results');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  
  await page.screenshot({ path: path.join(outDir, 'live-view-without-audio.png') });
  console.log('Saved: live-view-without-audio.png');

  // Also download the PDF from live Vercel to inspect it
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 30000 }),
    page.click('[data-testid="save-pdf-btn"]')
  ]);
  const pdfSavedPath = path.join(outDir, 'live-letter-downloaded.pdf');
  await download.saveAs(pdfSavedPath);
  console.log('Saved live PDF to:', pdfSavedPath, 'Size:', fs.statSync(pdfSavedPath).size, 'bytes');

  // Test Letter 2: With Audio
  const silentWavBase64 = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
  const letterWithAudio = {
    sender: 'Tara',
    recipient: 'Kabir',
    body: 'Dear Kabir,\n\nI recorded a voice note for you. Notice the vintage cassette audio player attached below.',
    signoff: 'Love always,',
    templateId: 'midnight-ink',
    fontId: 'dancing',
    fontSize: 'm',
    waxColor: 'navy',
    waxMono: '✦',
    waxSeal: { id: 'star', symbol: '✦', isCustom: false, color: 'navy' },
    ruledLines: false,
    voiceNoteUrl: silentWavBase64,
    vnu: silentWavBase64,
    stamp: 1,
    created: Date.now()
  };

  const hashWithAudio = Buffer.from(JSON.stringify(letterWithAudio)).toString('base64url');
  await page.goto(`https://khath-and-co.vercel.app/#l=${hashWithAudio}`);
  await page.waitForSelector('[data-testid="envelope-wax-seal"]', { timeout: 15000 });
  await page.click('[data-testid="envelope-wax-seal"]');
  await page.waitForSelector('.paper', { timeout: 15000 });
  await page.waitForTimeout(1500);

  await page.screenshot({ path: path.join(outDir, 'live-view-with-audio.png') });
  console.log('Saved: live-view-with-audio.png');

  await browser.close();
})();
