import { test, expect } from '@playwright/test';
import { attachErrorListeners, waitForPageReady } from './helpers/setup';

test.describe('End-to-End User Smoke Flows', () => {
  test('exercises paper selection, font selection, sticker interactions, prompt, reader, and picture save', async ({ page }) => {
    const verifyErrors = attachErrorListeners(page);

    await page.goto('/');
    await waitForPageReady(page);

    // 1. Switch every paper template
    const paperTab = page.getByRole('button', { name: /paper & ink/i });
    if (await paperTab.isVisible()) {
      await paperTab.click();
      await waitForPageReady(page);
    }

    const paperPills = page.locator('.template-pill');
    const paperCount = await paperPills.count();
    for (let i = 0; i < paperCount; i++) {
      await paperPills.nth(i).click();
      await waitForPageReady(page);
    }

    // 2. Switch every handwriting font
    const fontBtns = page.locator('.font-btn');
    const fontCount = await fontBtns.count();
    for (let i = 0; i < fontCount; i++) {
      await fontBtns.nth(i).click();
      await waitForPageReady(page);
    }

    // 3. Add a sticker
    const stickerTab = page.getByRole('button', { name: /stickers/i });
    if (await stickerTab.isVisible()) {
      await stickerTab.click();
      await waitForPageReady(page);
    }

    const addStickerBtn = page.locator('.sticker-preview-btn').first();
    if (await addStickerBtn.isVisible()) {
      await addStickerBtn.click();
    }

    // On mobile, switch to letter stage to view/interact with placed sticker
    const writeTab = page.getByRole('button', { name: /write letter/i });
    if (await writeTab.isVisible()) {
      await writeTab.click();
      await waitForPageReady(page);
    }

    // 4. Select a placed sticker and test controls
    const firstSticker = page.locator('.stk-placed').first();
    await expect(firstSticker).toBeVisible();
    await firstSticker.click({ force: true });

    // Verify sticker controls appear
    const stickerToolbar = page.locator('.sticker-toolbar, [aria-label="Sticker adjustment tools"]');
    await expect(stickerToolbar).toBeVisible();

    // Test resize (bigger button)
    const biggerBtn = page.getByRole('button', { name: /bigger|\+/i });
    if (await biggerBtn.isVisible()) {
      await biggerBtn.click();
    }

    // Test deselect via Done button or outside click
    const doneBtn = page.getByRole('button', { name: /done|✓/i });
    if (await doneBtn.isVisible()) {
      await doneBtn.click();
    } else {
      await page.getByTestId('letter-sheet').click({ position: { x: 10, y: 10 } });
    }

    // 5. Toggle theme
    const themeToggle = page.getByTestId('theme-toggle');
    await themeToggle.click();
    await waitForPageReady(page);
    await themeToggle.click();
    await waitForPageReady(page);

    // 6. Weekly prompt modal
    const promptBtn = page.getByRole('button', { name: /weekly prompt|prompt/i });
    await promptBtn.click();
    const promptModal = page.locator('[role="dialog"]');
    await expect(promptModal).toBeVisible();
    // Close modal
    const closeBtn = promptModal.locator('.btn-close, button:has-text("Close")').first();
    await closeBtn.click();

    // 7. Reader Preview modal & wax seal opening
    const previewBtn = page.getByRole('button', { name: /reader preview|preview/i });
    await previewBtn.click();
    const envelopeModal = page.locator('.envelope-modal-backdrop');
    await expect(envelopeModal).toBeVisible();

    // Tap wax seal to open envelope
    const waxSeal = page.locator('.wax-seal-container, [aria-label*="open" i]').first();
    if (await waxSeal.isVisible()) {
      await waxSeal.click({ force: true });
      await page.waitForTimeout(600);
    }

    // Close preview via Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // 8. Save Picture triggers 0 console errors
    const savePictureBtn = page.getByRole('button', { name: /save as picture|save picture/i }).first();
    if (await savePictureBtn.isVisible()) {
      await savePictureBtn.click();
      await page.waitForTimeout(1000);
    }

    verifyErrors();
  });
});
