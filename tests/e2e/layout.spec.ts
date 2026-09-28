import { test, expect } from '@playwright/test';
import { attachErrorListeners, waitForPageReady } from './helpers/setup';

test.describe('App-Shell Desktop & Responsive Layout Suite', () => {
  const desktopSizes = [
    { width: 1440, height: 900, name: 'desktop 1440x900' },
    { width: 1280, height: 720, name: 'laptop 1280x720' }
  ];

  for (const { width, height, name } of desktopSizes) {
    test(`asserts aligned column baselines and full visibility on ${name}`, async ({ page }) => {
      const verifyErrors = attachErrorListeners(page);

      await page.setViewportSize({ width, height });
      await page.goto('/');
      await waitForPageReady(page);

      // 1. The page/window itself does not scroll vertically (fixed app-shell)
      const isWindowScrollable = await page.evaluate(() => {
        return document.documentElement.scrollHeight > window.innerHeight;
      });
      expect(isWindowScrollable, 'Page window itself should not have vertical scrollbar on desktop').toBe(false);

      // 2. Left panel and stage both end at the bottom of the viewport (equal within 2px)
      const leftPanelBox = await page.getByTestId('left-panel').boundingBox();
      const stageBox = await page.getByTestId('stage').boundingBox();

      expect(leftPanelBox).not.toBeNull();
      expect(stageBox).not.toBeNull();

      if (leftPanelBox && stageBox) {
        const leftBottom = leftPanelBox.y + leftPanelBox.height;
        const stageBottom = stageBox.y + stageBox.height;

        expect(Math.abs(leftBottom - stageBottom), `Left panel bottom (${leftBottom}) and stage bottom (${stageBottom}) should align`).toBeLessThanOrEqual(2);
        expect(leftBottom, 'Left panel should end at or within viewport height').toBeLessThanOrEqual(height + 1);
        expect(stageBottom, 'Stage should end at or within viewport height').toBeLessThanOrEqual(height + 1);
      }

      // 3. Scroll stage to end and assert letter footer and action bar are fully visible
      const letterFooter = page.getByTestId('letter-footer');
      await letterFooter.scrollIntoViewIfNeeded();
      await expect(letterFooter).toBeVisible();

      // Action bar / buttons must be visible
      const actionBar = page.getByTestId('action-bar');
      await expect(actionBar).toBeVisible();

      // 4. Sticker tray reachable without scrolling the letter
      const stickerTray = page.getByTestId('sticker-tray');
      await expect(stickerTray).toBeVisible();

      verifyErrors();
    });
  }
});
