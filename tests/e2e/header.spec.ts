import { test, expect } from '@playwright/test';
import { getElementContrastRatio } from './helpers/contrast';
import { attachErrorListeners, waitForPageReady } from './helpers/setup';

test.describe('Header & Responsive Lockup Suite', () => {
  const widths = [320, 390, 768, 1280, 1440];

  for (const w of widths) {
    test(`header elements are not truncated at viewport width ${w}px`, async ({ page }) => {
      const verifyErrors = attachErrorListeners(page);

      await page.setViewportSize({ width: w, height: 800 });
      await page.goto('/');
      await waitForPageReady(page);

      // Verify no horizontal document overflow
      const docOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth <= window.innerWidth;
      });
      expect(docOverflow, `Horizontal scroll detected at width ${w}px`).toBe(true);

      // Verify tagline is not truncated (scrollWidth <= clientWidth + 1)
      const tagline = page.getByTestId('tagline');
      if (await tagline.isVisible()) {
        const isNotTruncated = await tagline.evaluate((el: HTMLElement) => {
          return el.scrollWidth <= el.clientWidth + 1;
        });
        expect(isNotTruncated, `Tagline truncated at width ${w}px`).toBe(true);

        const textContent = await tagline.innerText();
        expect(textContent.toLowerCase()).toContain('letters for the people you miss');
      }

      // Verify logo mark contrast >= 3:1 in both themes
      for (const theme of ['dark', 'light'] as const) {
        await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
        const logo = page.getByTestId('logo');
        const logoContrast = await getElementContrastRatio(page, logo);
        expect(logoContrast, `Logo mark contrast in ${theme} mode at width ${w}px should be >= 3:1`).toBeGreaterThanOrEqual(3.0);
      }

      // Theme toggle always visible
      await expect(page.getByTestId('theme-toggle')).toBeVisible();

      verifyErrors();
    });
  }
});
