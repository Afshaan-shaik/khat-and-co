import { test, expect } from '@playwright/test';

test.describe('Live Vercel App Verification', () => {
  test('strictly displays closed sealed envelope on live short link with zero workspace preview', async ({ page }) => {
    // Navigate directly to live Vercel app with a test share id
    await page.goto('https://khat-and-co.vercel.app/?id=1eEiq964cu');

    // 1. Envelope modal must be open immediately
    await expect(page.locator('.envelope-modal-backdrop')).toBeVisible();

    // 2. Desk workspace and header must NOT be rendered in recipient mode
    await expect(page.locator('.workspace-layout')).not.toBeVisible();
    await expect(page.locator('.header-brand')).not.toBeVisible();

    // 3. Sealed closed envelope card with pulsing wax seal must be visible
    await expect(page.locator('.envelope-card')).toBeVisible();
    await expect(page.locator('.pulsing-wax-seal')).toBeVisible();

    // 4. Revealed letter container must NOT be visible before tapping wax seal
    await expect(page.locator('.envelope-revealed-container')).not.toBeVisible();

    // Take screenshot of strictly sealed closed envelope
    await page.screenshot({ path: 'test-results/live-sealed-envelope.png' });

    // 5. Tap the pulsing wax seal
    await page.locator('.pulsing-wax-seal').click({ force: true });

    // 6. After unsealing, revealed letter sheet is visible
    await expect(page.locator('.envelope-revealed-container')).toBeVisible({ timeout: 6000 });
    await expect(page.getByText('Write Back (जवाब लिखें)')).toBeVisible();

    // Take screenshot of opened revealed letter
    await page.screenshot({ path: 'test-results/live-opened-letter.png' });
  });

  test('author desk loads normally without query param on live Vercel app', async ({ page }) => {
    await page.goto('https://khat-and-co.vercel.app/');

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
