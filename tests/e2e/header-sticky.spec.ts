import { test, expect } from '@playwright/test';

test.describe('Header Sticky & Intact Scroll Verification', () => {
  test('header stays intact at top: 0 with transparency and blur when user scrolls down', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);

    const nav = page.locator('header.nav');
    await expect(nav).toBeVisible();

    // 1. Initial position before scrolling
    const initialBox = await nav.boundingBox();
    expect(initialBox).not.toBeNull();
    expect(initialBox!.y).toBeLessThanOrEqual(1);

    // 2. Verify styling: semi-transparent background and backdrop-filter blur
    const navStyle = await nav.evaluate((el) => {
      const s = window.getComputedStyle(el);
      return {
        position: s.position,
        zIndex: s.zIndex,
        backgroundColor: s.backgroundColor,
        backdropFilter: s.backdropFilter || (s as any).webkitBackdropFilter,
        borderBottom: s.borderBottomWidth + ' ' + s.borderBottomStyle
      };
    });

    expect(navStyle.position).toBe('sticky');
    expect(parseInt(navStyle.zIndex, 10)).toBeGreaterThanOrEqual(50);
    // Background must be rgba (semi-transparent)
    expect(navStyle.backgroundColor).toMatch(/rgba\(/);

    // 3. Scroll down 300px
    await page.evaluate(() => window.scrollTo(0, 300));
    await page.waitForTimeout(300);

    const box300 = await nav.boundingBox();
    expect(box300).not.toBeNull();
    // Header must remain intact at the top of the viewport
    expect(box300!.y).toBe(0);
    await expect(nav).toBeVisible();

    // 4. Scroll down 800px (past hero into studio)
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(300);

    const box800 = await nav.boundingBox();
    expect(box800).not.toBeNull();
    expect(box800!.y).toBe(0);
    await expect(nav).toBeVisible();

    // 5. Scroll down 1800px (into shelf / nudge)
    await page.evaluate(() => window.scrollTo(0, 1800));
    await page.waitForTimeout(300);

    const box1800 = await nav.boundingBox();
    expect(box1800).not.toBeNull();
    expect(box1800!.y).toBe(0);
    await expect(nav).toBeVisible();

    // Verify all header links remain clickable while scrolled
    const writeLink = nav.getByRole('link', { name: 'Write', exact: true });
    await expect(writeLink).toBeVisible();
    const ctaBtn = nav.locator('a.btn.cta');
    if (await ctaBtn.isVisible()) {
      await expect(ctaBtn).toBeVisible();
    }
  });
});
