import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { getElementContrastRatio } from './helpers/contrast';
import { attachErrorListeners, waitForPageReady } from './helpers/setup';

test.describe('Theme Contrast & A11y Suite', () => {
  for (const theme of ['light', 'dark'] as const) {
    test(`meets WCAG AA contrast in ${theme} mode`, async ({ page }) => {
      const verifyErrors = attachErrorListeners(page);

      await page.goto('/');
      await waitForPageReady(page);

      // Ensure theme matches
      const currentTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
      if (currentTheme !== theme) {
        await page.getByTestId('theme-toggle').click();
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        await waitForPageReady(page);
      }

      // 1. Run Axe color-contrast check on the page
      const axeResults = await new AxeBuilder({ page })
        .withRules(['color-contrast'])
        .analyze();
      expect(axeResults.violations, `Axe color-contrast violations in ${theme} mode: ${JSON.stringify(axeResults.violations, null, 2)}`).toEqual([]);

      // 2. Explicit contrast helper assertions for critical UI elements
      // Tagline
      const tagline = page.getByTestId('tagline');
      if (await tagline.isVisible()) {
        const taglineContrast = await getElementContrastRatio(page, tagline);
        expect(taglineContrast).toBeGreaterThanOrEqual(4.5);
      }

      // Section headings (Paper, Handwriting, Ink, Stickers...)
      const sectionLabels = page.locator('.section-label span, h2, h3');
      const count = await sectionLabels.count();
      for (let i = 0; i < count; i++) {
        const label = sectionLabels.nth(i);
        if (await label.isVisible()) {
          const ratio = await getElementContrastRatio(page, label);
          expect(ratio, `Section label "${await label.innerText()}" in ${theme} mode should have >= 4.5:1 contrast`).toBeGreaterThanOrEqual(4.5);
        }
      }

      // Every paper card name AND its Hindi sub-label
      const paperPills = page.locator('.template-pill');
      const pillCount = await paperPills.count();
      for (let i = 0; i < pillCount; i++) {
        const pill = paperPills.nth(i);
        const nameEl = pill.locator('.template-pill-name');
        const hindiEl = pill.locator('.template-pill-hindi');

        if (await nameEl.isVisible()) {
          const nameRatio = await getElementContrastRatio(page, nameEl);
          expect(nameRatio, `Paper name "${await nameEl.innerText()}" in ${theme} mode should have >= 4.5:1 contrast`).toBeGreaterThanOrEqual(4.5);
        }

        if (await hindiEl.isVisible()) {
          const hindiRatio = await getElementContrastRatio(page, hindiEl);
          expect(hindiRatio, `Paper Hindi label "${await hindiEl.innerText()}" in ${theme} mode should have >= 4.5:1 contrast`).toBeGreaterThanOrEqual(4.5);
        }
      }

      // Action-bar buttons
      const actionButtons = page.getByTestId('action-bar').locator('button');
      const actionCount = await actionButtons.count();
      for (let i = 0; i < actionCount; i++) {
        const btn = actionButtons.nth(i);
        if (await btn.isVisible()) {
          const btnRatio = await getElementContrastRatio(page, btn);
          expect(btnRatio, `Action button ${i} in ${theme} mode should have >= 4.5:1 contrast`).toBeGreaterThanOrEqual(4.5);
        }
      }

      verifyErrors();
    });
  }
});
