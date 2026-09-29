import { test, expect } from '@playwright/test';
import { encodeLetterToHash } from '../../src/utils/codec';
import { createDefaultLetter } from '../../src/utils/storage';
import { LetterData } from '../../src/types/letter';
import * as fs from 'fs';

test.describe('Letter PDF Export', () => {
  test('downloads high-fidelity PDF from ReaderModal when opened', async ({ page }) => {
    const testLetter: LetterData = {
      ...createDefaultLetter(),
      recipient: 'Anaya',
      sender: 'Afshaan',
      templateId: 'airmail-classic',
      fontId: 'caveat',
      ruledLines: true,
      body: 'This is a test letter to verify that the PDF downloads with exact colors, borders, and lines.',
      signoff: 'Forever yours,',
      waxSeal: { id: 'heart', symbol: '♡', isCustom: false, color: 'oxblood' },
      ps: 'Always thinking of you.'
    };

    const hash = encodeLetterToHash(testLetter);
    await page.goto(`http://localhost:4173/#l=${hash}`);
    await page.evaluate(() => document.fonts.ready);

    // Envelope modal should be visible
    const sealBtn = page.getByTestId('envelope-wax-seal');
    await expect(sealBtn).toBeVisible();

    // Tap seal to open
    await sealBtn.click();

    // Wait for opened letter sheet to appear
    const pdfBtn = page.getByTestId('save-pdf-btn');
    await expect(pdfBtn).toBeVisible({ timeout: 6000 });

    // Click "Save as PDF" and verify download occurs
    const downloadPromise = page.waitForEvent('download', { timeout: 30000 });
    await pdfBtn.click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('khat-letter-Anaya.pdf');

    // Save download to disk and verify size > 0
    const filePath = await download.path();
    expect(filePath).toBeTruthy();
    if (filePath) {
      const stats = fs.statSync(filePath);
      expect(stats.size).toBeGreaterThan(10000); // Valid non-empty PDF
    }
  });

  test('downloads PDF from Studio Step 3 (Send)', async ({ page }) => {
    await page.goto('http://localhost:4173/');
    await page.evaluate(() => document.fonts.ready);

    // Fill in recipient and letter body using proper inputs
    const recInput = page.locator('#inTo');
    await expect(recInput).toBeVisible();
    await recInput.fill('Kabir');

    const bodyInput = page.locator('#inText');
    await expect(bodyInput).toBeVisible();
    await bodyInput.fill('Writing from the studio. Testing step 3 PDF export with full colors and ruled lines.');
    
    // Go to Step 2 (Seal)
    const toSealBtn = page.locator('#toSeal');
    await toSealBtn.click();

    const pressSealBtn = page.locator('#pressSeal');
    await expect(pressSealBtn).toBeVisible();

    // Press Seal to complete envelope sealing and reach Step 3
    await pressSealBtn.click();

    // Reaches Step 3 (Send)
    const pdfBtn = page.locator('#pdfBtn');
    await expect(pdfBtn).toBeVisible({ timeout: 10000 });

    // Click "Save as PDF" and verify download
    const downloadPromise = page.waitForEvent('download', { timeout: 30000 });
    await pdfBtn.click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('khat-letter-Kabir.pdf');

    const filePath = await download.path();
    expect(filePath).toBeTruthy();
    if (filePath) {
      const stats = fs.statSync(filePath);
      expect(stats.size).toBeGreaterThan(10000);
    }
  });
});
