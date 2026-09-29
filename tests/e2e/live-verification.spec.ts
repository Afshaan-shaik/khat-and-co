import { test, expect } from '@playwright/test';
import { encodeLetterToHash } from '../../src/utils/codec';
import { createDefaultLetter } from '../../src/utils/storage';
import { LetterData } from '../../src/types/letter';

test.describe('Live Vercel App Verification (khath-and-co.vercel.app)', () => {

  test('strictly displays closed sealed envelope on live share link with custom wax seal', async ({ page }) => {
    // Construct a letter with custom wax seal (Infinity ∞)
    const testLetter: LetterData = {
      ...createDefaultLetter(),
      recipient: 'Anaya',
      sender: 'Afshaan',
      waxSeal: { id: 'infinity', symbol: '∞', isCustom: false, customText: 'A' }
    };

    const hash = encodeLetterToHash(testLetter);

    // Navigate to live Vercel app with hash
    await page.goto(`https://khath-and-co.vercel.app/#l=${hash}`);
    await page.evaluate(() => document.fonts.ready);

    // 1. Envelope modal must be open immediately
    await expect(page.locator('.envelope-modal-backdrop')).toBeVisible();

    // 2. Desk workspace and header must NOT be rendered in recipient mode
    await expect(page.locator('.workspace-layout')).not.toBeVisible();
    await expect(page.locator('.header-brand')).not.toBeVisible();

    // 3. Sealed closed envelope card with pulsing wax seal must be visible
    await expect(page.locator('.envelope-card')).toBeVisible();
    const waxSealBtn = page.getByTestId('envelope-wax-seal');
    await expect(waxSealBtn).toBeVisible();

    // 4. Custom wax seal symbol '∞' MUST be present on the live envelope
    await expect(waxSealBtn).toHaveAttribute('data-seal-symbol', '∞');
    await expect(waxSealBtn).toContainText('∞');

    // 5. Revealed letter container must NOT be visible before tapping wax seal
    await expect(page.locator('.envelope-revealed-container')).not.toBeVisible();

    // Take screenshot of live sealed envelope with custom wax seal
    await page.screenshot({ path: 'test-results/live-sealed-envelope.png' });

    // 6. Tap the wax seal
    await waxSealBtn.click({ force: true });

    // 7. After unsealing, revealed letter sheet is visible
    await expect(page.locator('.envelope-revealed-container')).toBeVisible({ timeout: 6000 });
    await expect(page.getByText('Write Back (जवाब लिखें)')).toBeVisible();

    // Take screenshot of opened revealed letter
    await page.screenshot({ path: 'test-results/live-opened-letter.png' });
  });

  test('author desk loads normally on live Vercel app', async ({ page }) => {
    await page.goto('https://khath-and-co.vercel.app/');
    await page.evaluate(() => document.fonts.ready);

    // Workspace layout and header are visible for the author
    await expect(page.locator('.workspace-layout')).toBeVisible();
    await expect(page.getByTestId('stage')).toBeVisible();
    await expect(page.locator('.app-footer-name')).toBeVisible();

    // Attribution is present
    await expect(page.locator('.app-footer-credit')).toContainText('crafted by -');
    await expect(page.locator('.app-footer-author')).toHaveAttribute('href', 'https://github.com/Afshaan-shaik');

    // Take screenshot of author desk
    await page.screenshot({ path: 'test-results/live-author-desk.png' });
  });

  test('exercises live studio step 3 and opens peek reader modal matching images 1, 2, 3', async ({ page }) => {
    await page.goto('https://khath-and-co.vercel.app/');
    await page.evaluate(() => document.fonts.ready);

    // Scroll to studio
    const studio = page.locator('#studio');
    await studio.scrollIntoViewIfNeeded();

    // Fill in letter text
    const inText = page.locator('#inText');
    await inText.fill('Writing you this weekly note with warm memories and gentle thoughts.');

    // Continue to envelope
    await page.locator('#toSeal').click();
    await page.waitForTimeout(400);

    // Press the seal
    await page.locator('#pressSeal').click();
    // Wait for sealing animation to transition to step 3
    await page.waitForSelector('#sendBody:not([hidden])', { timeout: 10000 });

    // Verify Step 3 buttons
    await expect(page.locator('#waBtn')).toBeVisible();
    await expect(page.locator('#pdfBtn')).toHaveText('Save as PDF');
    await expect(page.locator('#peekBtn')).toHaveText('Open it as they will');

    // Screenshot Step 3 (matching Image 1)
    await page.screenshot({ path: 'test-results/live-step3-send.png' });

    // Click 'Open it as they will'
    await page.locator('#peekBtn').click();

    // Verify Reader modal opens in peek mode (matching Image 2)
    const reader = page.locator('.reader');
    await expect(reader).toBeVisible();
    await expect(page.locator('.reader-msg')).toHaveText('This is how it opens for them. Tap the seal.');
    await page.screenshot({ path: 'test-results/live-reader-peek-sealed.png' });

    // Tap wax seal
    const sealBtn = reader.locator('.env-seal');
    await sealBtn.click({ force: true });

    // Verify Reader letter appears with buttons (matching Image 3)
    await expect(page.locator('.reader-letter')).toBeVisible({ timeout: 6000 });
    await expect(page.locator('#rPdf')).toHaveText('Save as PDF');
    await expect(page.locator('#rBack')).toBeVisible();

    // Screenshot unsealed view (matching Image 3)
    await page.screenshot({ path: 'test-results/live-reader-peek-opened.png' });
  });

  test('verifies live header nav with 4 options (Write, Studio, Shelf, Nudge) and removal of the 4 buttons below logo', async ({ page }) => {
    await page.goto('https://khath-and-co.vercel.app/');
    await page.evaluate(() => document.fonts.ready);

    // 1. Verify the 4 buttons below the logo are completely removed
    await expect(page.getByRole('button', { name: /see it as your reader will/i })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /copy share link/i })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /start a new letter/i })).toHaveCount(0);

    // 2. Verify the 4 header navigation options: Write, Studio, Shelf, Nudge
    const navLinks = page.locator('.nav-links');
    if (await navLinks.isVisible()) {
      const writeLink = navLinks.getByRole('link', { name: 'Write', exact: true });
      await expect(writeLink).toHaveText('Write');

      const studioLink = navLinks.locator('.nav-studio');
      await expect(studioLink).toHaveText('Studio');

      const shelfLink = navLinks.locator('a[href="#shelf"]');
      await expect(shelfLink).toHaveText('Shelf');

      const nudgeLink = navLinks.locator('a[href="#nudge"]');
      await expect(nudgeLink).toHaveText('Nudge');

      // Verify Studio text styling (black in light mode, ivory in dark mode)
      const isDarkTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme') === 'dark');
      const studioColor = await studioLink.evaluate((el) => window.getComputedStyle(el).color);
      if (isDarkTheme) {
        expect(studioColor).toBe('rgb(239, 231, 214)');
      } else {
        expect(studioColor).toBe('rgb(0, 0, 0)');
      }
    }

    // 3. Verify clicking Studio opens Studio customizer
    const studioBtn = page.getByRole('button', { name: /open studio/i }).first();
    if (await studioBtn.isVisible()) {
      await studioBtn.click();
      await expect(page.locator('.studio-backdrop')).toBeVisible();
      await page.locator('.studio-back-btn').click();
    }

      // Scroll to top and screenshot updated header
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(400);
      await page.screenshot({ path: 'test-results/live-updated-header.png' });
    }
  });

  test('verifies live header remains sticky and intact at top: 0 with blur and transparency when user scrolls down', async ({ page }) => {
    await page.goto('https://khath-and-co.vercel.app/');
    await page.evaluate(() => document.fonts.ready);

    const nav = page.locator('header.nav');
    await expect(nav).toBeVisible();

    // Verify initial box at top: 0
    const boxBefore = await nav.boundingBox();
    expect(boxBefore).not.toBeNull();
    expect(boxBefore!.y).toBeLessThanOrEqual(1);

    // Scroll down 600px
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(400);

    // Header must remain intact at top: 0
    const boxAfter = await nav.boundingBox();
    expect(boxAfter).not.toBeNull();
    expect(boxAfter!.y).toBe(0);
    await expect(nav).toBeVisible();

    // Screenshot scrolled header
    await page.screenshot({ path: 'test-results/live-scrolled-header.png' });
  });

});


