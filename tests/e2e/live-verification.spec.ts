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

});
