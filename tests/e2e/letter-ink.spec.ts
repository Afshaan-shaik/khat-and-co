import { test, expect } from '@playwright/test';
import { getElementContrastRatio } from './helpers/contrast';
import { attachErrorListeners, waitForPageReady } from './helpers/setup';

test.describe('Letter Ink & Typography Suite', () => {
  test('asserts >= 7:1 contrast on letter fields across paper templates, fonts, and themes', async ({ page }) => {
    test.slow();
    const verifyErrors = attachErrorListeners(page);

    await page.goto('/');
    await waitForPageReady(page);

    // Get count of paper templates and fonts
    const paperPills = page.locator('.template-pill');
    const paperCount = await paperPills.count();

    const fontBtns = page.locator('.font-btn');
    const fontCount = await fontBtns.count();

    const themes = ['dark', 'light'] as const;

    for (const theme of themes) {
      // Toggle theme if necessary
      const currentTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
      if (currentTheme !== theme) {
        await page.getByTestId('theme-toggle').click();
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        await waitForPageReady(page);
      }

      for (let p = 0; p < paperCount; p++) {
        const paperTab = page.getByRole('button', { name: /paper & ink/i });
        if (await paperTab.isVisible()) {
          await paperTab.click();
          await waitForPageReady(page);
        }

        await paperPills.nth(p).click();
        await expect(paperPills.nth(p)).toHaveClass(/active/);
        await waitForPageReady(page);

        for (let f = 0; f < fontCount; f++) {
          if (await paperTab.isVisible()) {
            await paperTab.click();
            await waitForPageReady(page);
          }

          await fontBtns.nth(f).click();
          await expect(fontBtns.nth(f)).toHaveClass(/active/);
          await waitForPageReady(page);

          const writeTab = page.getByRole('button', { name: /write letter/i });
          if (await writeTab.isVisible()) {
            await writeTab.click();
            await waitForPageReady(page);
          }

          // Test Envelope To label (>= 4.5:1, preferably >= 7:1)
          const toLabel = page.getByTestId('letter-to-label');
          const toLabelContrast = await getElementContrastRatio(page, toLabel);
          expect(toLabelContrast, `Envelope To label contrast in ${theme} mode on paper ${p} should be >= 4.5:1`).toBeGreaterThanOrEqual(4.5);

          // Test greeting input
          const greetingInput = page.getByTestId('letter-greeting');
          const greetingContrast = await getElementContrastRatio(page, greetingInput);
          expect(greetingContrast, `Greeting input contrast in ${theme} mode on paper ${p} should be >= 7:1`).toBeGreaterThanOrEqual(7.0);

          // Test body textarea
          const bodyInput = page.getByTestId('letter-body');
          const bodyContrast = await getElementContrastRatio(page, bodyInput);
          expect(bodyContrast, `Body textarea contrast in ${theme} mode on paper ${p} should be >= 7:1`).toBeGreaterThanOrEqual(7.0);

          // Test signoff and sender name
          const footerInputs = page.getByTestId('letter-footer').locator('input');
          const signoffContrast = await getElementContrastRatio(page, footerInputs.first());
          expect(signoffContrast, `Signoff input contrast in ${theme} mode on paper ${p} should be >= 7:1`).toBeGreaterThanOrEqual(7.0);

          const senderContrast = await getElementContrastRatio(page, footerInputs.last());
          expect(senderContrast, `Sender input contrast in ${theme} mode on paper ${p} should be >= 7:1`).toBeGreaterThanOrEqual(7.0);
        }
      }
    }

    verifyErrors();
  });

  test('asserts letter text color does not change on theme toggle unless paper is dark paper', async ({ page }) => {
    const verifyErrors = attachErrorListeners(page);

    await page.goto('/');
    await waitForPageReady(page);

    const paperTab = page.getByRole('button', { name: /paper & ink/i });
    if (await paperTab.isVisible()) {
      await paperTab.click();
      await waitForPageReady(page);
    }

    // Pick first paper (Airmail classic - cream light paper)
    await page.locator('.template-pill').first().click();

    const writeTab = page.getByRole('button', { name: /write letter/i });
    if (await writeTab.isVisible()) {
      await writeTab.click();
      await waitForPageReady(page);
    }

    // In dark mode
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    const darkBodyColor = await page.getByTestId('letter-body').evaluate((el) => window.getComputedStyle(el).color);

    // In light mode
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
    const lightBodyColor = await page.getByTestId('letter-body').evaluate((el) => window.getComputedStyle(el).color);

    expect(darkBodyColor, 'Light paper letter text color must not flip when desk theme changes').toBe(lightBodyColor);

    verifyErrors();
  });
});
