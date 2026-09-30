import { test, expect } from '@playwright/test';
import { attachErrorListeners } from './helpers/setup';

test.describe('Khath & Co. Cinematic Intro', () => {
  test('mounts above homepage on load with dark theme by default', async ({ page }) => {
    const verifyErrors = attachErrorListeners(page);

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Verify intro dialog is visible
    const introDialog = page.locator('[role="dialog"][aria-label="Khath & Co. introduction"]');
    await expect(introDialog).toBeVisible();

    // Verify dark theme is active by default
    const htmlTheme = await page.locator('html').getAttribute('data-theme');
    expect(htmlTheme).toBe('dark');

    // Verify brand lockup
    await expect(introDialog.locator('div[class*="brand"]')).toBeVisible();

    // Verify wax seal button with infinity symbol is visible and beat animation is ready
    const seal = introDialog.getByRole('button', { name: 'Break the seal' });
    await expect(seal).toBeVisible();
    await expect(seal).toHaveText('∞');

    // Verify body scroll is locked
    const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
    expect(bodyOverflow).toBe('hidden');

    verifyErrors();
  });

  test('toggles theme day/night inside intro and preserves choice in sessionStorage across refresh', async ({ page }) => {
    const verifyErrors = attachErrorListeners(page);

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const introDialog = page.locator('[role="dialog"][aria-label="Khath & Co. introduction"]');
    await expect(introDialog).toBeVisible();

    const themeBtn = introDialog.getByRole('button', { name: /switch between day and night mode/i });
    await expect(themeBtn).toBeVisible();
    await expect(themeBtn).toHaveText('☀'); // Shows sun in dark mode to switch to day

    // Toggle to light mode
    await themeBtn.click();
    await page.waitForTimeout(300);

    // Verify theme changed to light
    const htmlThemeLight = await page.locator('html').getAttribute('data-theme');
    expect(htmlThemeLight).toBe('light');
    await expect(themeBtn).toHaveText('☾'); // Shows moon in light mode to switch to night

    // Verify sessionStorage has 'light'
    const storedTheme = await page.evaluate(() => sessionStorage.getItem('khath-theme'));
    expect(storedTheme).toBe('light');

    // Refresh page in same session
    await page.reload();
    await expect(introDialog).toBeVisible();

    // Verify preserved theme on reload
    const reloadedTheme = await page.locator('html').getAttribute('data-theme');
    expect(reloadedTheme).toBe('light');

    verifyErrors();
  });

  test('tapping the wax seal opens the envelope, types the note, and reveals chips', async ({ page }) => {
    const verifyErrors = attachErrorListeners(page);

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const introDialog = page.locator('[role="dialog"][aria-label="Khath & Co. introduction"]');
    await expect(introDialog).toBeVisible();

    const seal = introDialog.getByRole('button', { name: 'Break the seal' });
    await seal.click();

    // Verify envelope gets open class
    const env = introDialog.locator('div[class*="env"]');
    await expect(env.first()).toHaveClass(/open/);

    // Wait for typewriter text to populate
    await page.waitForTimeout(2500);
    const toText = introDialog.locator('div[class*="letterTo"]');
    await expect(toText).toContainText('Dear you,');

    // Verify "Dear you," is completely visible within viewport
    const toBox = await toText.boundingBox();
    expect(toBox).not.toBeNull();
    expect(toBox!.y).toBeGreaterThanOrEqual(40);

    const bodyText = introDialog.locator('div[class*="letterTxt"]');
    await expect(bodyText).toContainText('I read your last note');

    // Wait for chips to animate in
    await page.waitForTimeout(5000);
    const chips = introDialog.locator('span[class*="chip"]');
    await expect(chips.first()).toHaveText(/Write on warm paper/);

    verifyErrors();
  });

  test('Skip intro jumps straight to finale and Enter the studio reveals homepage', async ({ page }) => {
    const verifyErrors = attachErrorListeners(page);

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const introDialog = page.locator('[role="dialog"][aria-label="Khath & Co. introduction"]');
    await expect(introDialog).toBeVisible();

    const skipBtn = introDialog.getByRole('button', { name: /skip intro/i });
    await skipBtn.click();

    // Verify finale screen elements appear
    const finale = introDialog.locator('div[class*="finale"]');
    await expect(finale).toHaveClass(/show/);
    await expect(introDialog.locator('text=खत · letters for the people you miss')).toBeVisible();

    const enterBtn = introDialog.getByRole('button', { name: /enter the studio/i });
    await expect(enterBtn).toBeVisible();

    // Click Enter the studio
    await enterBtn.click();

    // Wait for dissolve and unmount (1200ms)
    await introDialog.waitFor({ state: 'detached', timeout: 3500 });

    // Verify body scroll is restored
    const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
    expect(bodyOverflow).toBe('');

    // Verify homepage top header and studio are accessible
    const studioSection = page.locator('#studio, #top');
    await expect(studioSection.first()).toBeVisible();

    verifyErrors();
  });

  test('plays on hard refresh 5 consecutive times without error', async ({ page }) => {
    const verifyErrors = attachErrorListeners(page);

    for (let i = 0; i < 5; i++) {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      const introDialog = page.locator('[role="dialog"][aria-label="Khath & Co. introduction"]');
      await expect(introDialog).toBeVisible();
      // Skip intro to enter studio cleanly
      const skipBtn = introDialog.getByRole('button', { name: /skip intro/i });
      await skipBtn.click();
      const enterBtn = introDialog.getByRole('button', { name: /enter the studio/i });
      await enterBtn.click();
      await introDialog.waitFor({ state: 'detached', timeout: 3000 });
    }

    verifyErrors();
  });

  test('Escape key skips to finale and then enters studio', async ({ page }) => {
    const verifyErrors = attachErrorListeners(page);

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const introDialog = page.locator('[role="dialog"][aria-label="Khath & Co. introduction"]');
    await expect(introDialog).toBeVisible();

    // Press Escape once -> jumps to finale
    await page.keyboard.press('Escape');
    const finale = introDialog.locator('div[class*="finale"]');
    await expect(finale).toHaveClass(/show/);

    // Press Escape second time -> enters studio
    await page.keyboard.press('Escape');
    await introDialog.waitFor({ state: 'detached', timeout: 3000 });

    verifyErrors();
  });
});
