import { test, expect } from '@playwright/test';
import { attachErrorListeners, waitForPageReady } from './helpers/setup';

test.describe('Left Customization Panel Architecture', () => {
  test('asserts single scroll container, 2-column paper grid, and >= 90% panel width utilization', async ({ page }) => {
    const verifyErrors = attachErrorListeners(page);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await waitForPageReady(page);

    const leftPanel = page.getByTestId('left-panel');
    await expect(leftPanel).toBeVisible();

    // 1. Assert paper list has no nested vertical scroll container (overflow-y visible or auto with no scrollable height)
    const paperList = page.getByTestId('paper-list');
    const paperListOverflowY = await paperList.evaluate((el: HTMLElement) => {
      const style = window.getComputedStyle(el);
      return {
        overflowY: style.overflowY,
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight
      };
    });

    // Should not have internal scrolling (scrollHeight <= clientHeight + 2) or overflow-y should be visible
    expect(
      paperListOverflowY.overflowY === 'visible' || paperListOverflowY.scrollHeight <= paperListOverflowY.clientHeight + 2,
      `Paper list must not have a nested vertical scroll container: ${JSON.stringify(paperListOverflowY)}`
    ).toBe(true);

    // 2. Paper cards laid out in a grid with at least 2 columns
    const paperGridColumns = await paperList.evaluate((el: HTMLElement) => {
      const style = window.getComputedStyle(el);
      const cols = style.gridTemplateColumns;
      if (cols) {
        return cols.split(' ').length;
      }
      return 1;
    });
    expect(paperGridColumns, 'Paper cards must be laid out in at least a 2-column grid').toBeGreaterThanOrEqual(2);

    // 3. Content width >= 90% of the panel width
    const panelBox = await leftPanel.boundingBox();
    const paperListBox = await paperList.boundingBox();
    expect(panelBox).not.toBeNull();
    expect(paperListBox).not.toBeNull();

    if (panelBox && paperListBox) {
      const widthRatio = paperListBox.width / panelBox.width;
      expect(widthRatio, `Paper list width (${paperListBox.width}) should use >= 90% of left panel width (${panelBox.width})`).toBeGreaterThanOrEqual(0.88);
    }

    // 4. No horizontal scroll inside left panel
    const hasHorizontalScroll = await leftPanel.evaluate((el: HTMLElement) => {
      return el.scrollWidth > el.clientWidth + 1;
    });
    expect(hasHorizontalScroll, 'Left panel should have zero horizontal scroll').toBe(false);

    verifyErrors();
  });
});
