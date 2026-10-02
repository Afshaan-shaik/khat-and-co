import { test, expect } from '@playwright/test';
import { attachErrorListeners, waitForPageReady } from './helpers/setup';

// Generate synthetic JPEG buffer
function createSyntheticJpeg(width = 1920, height = 1080): Buffer {
  return Buffer.from([
    0xff, 0xd8, // SOI
    0xff, 0xe0, 0x00, 0x10, // APP0
    0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00,
    0xff, 0xc0, 0x00, 0x11, // SOF0
    0x08,
    (height >> 8) & 0xff, height & 0xff,
    (width >> 8) & 0xff, width & 0xff,
    0x03, 0x01, 0x22, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
    0xff, 0xda, 0x00, 0x0c, // SOS
    0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00, 0x3f, 0x00,
    0x00, 0x00,
    0xff, 0xd9 // EOI
  ]);
}

// Generate synthetic PNG buffer
function createSyntheticPng(): Buffer {
  return Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x00,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde,
    0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
  ]);
}

async function openAtelier(page: any): Promise<void> {
  const desktopTrigger = page.locator('#atelier-desktop-trigger');
  if (await desktopTrigger.isVisible().catch(() => false)) {
    await desktopTrigger.click();
  } else {
    const mobileToggle = page.locator('#mobileMenuToggle');
    if (await mobileToggle.isVisible().catch(() => false)) {
      await mobileToggle.click();
      await page.waitForTimeout(350);
      await page.locator('#atelier-mobile-trigger').click();
    }
  }
}

test.describe('Memory Folio End-to-End Photo Upload Flow', () => {
  test('Complete 4-photo upload lifecycle: 0 of 4 -> 1 -> 2 -> 3 -> 4 -> block 5th -> refresh -> remove', async ({ page }) => {
    attachErrorListeners(page);
    await page.goto('/');
    await waitForPageReady(page);

    // Skip intro if present
    const introOverlay = page.locator('[role="dialog"][aria-label="Khath & Co. introduction"]');
    if (await introOverlay.isVisible().catch(() => false)) {
      const skipBtn = introOverlay.locator('button:has-text("Enter")');
      if (await skipBtn.isVisible().catch(() => false)) {
        await skipBtn.click();
      }
    }

    // 1. Open Atelier Drawer via Desktop or Mobile Trigger
    await openAtelier(page);

    // 2. Click Memory Folio option
    const atelierDrawer = page.locator('#letter-atelier-drawer');
    await expect(atelierDrawer).toBeVisible();
    const memoryFolioBtn = atelierDrawer.getByText(/Memory Folio/i).first();
    await expect(memoryFolioBtn).toBeVisible();
    await memoryFolioBtn.click();

    // 3. Verify Memory Folio modal opens with initial counter: 0 of 4
    const folioModal = page.locator('.folio-modal-container');
    await expect(folioModal).toBeVisible();
    const counterText = folioModal.locator('.folio-counter-text');
    await expect(counterText).toContainText('0 of 4');

    // Verify dropzone is visible
    const dropzone = folioModal.locator('.folio-dropzone');
    await expect(dropzone).toBeVisible();
    await expect(dropzone).toContainText('Add a photograph');

    // 4. Upload Photograph 1 (JPEG)
    const fileInput = folioModal.locator('input[type="file"]');
    const jpeg1 = createSyntheticJpeg(1920, 1080);
    await fileInput.setInputFiles({
      name: 'vacation_photo.jpg',
      mimeType: 'image/jpeg',
      buffer: jpeg1
    });

    // Wait for upload completion: counter should become 1 of 4
    await expect(counterText).toContainText('1 of 4', { timeout: 10000 });
    const card0 = folioModal.locator('[data-testid="memory-card-0"]');
    await expect(card0).toBeVisible();

    // 5. Upload Photograph 2 (PNG - e.g. screenshot or saved web image)
    const png2 = createSyntheticPng();
    await fileInput.setInputFiles({
      name: 'screenshot_receipt.png',
      mimeType: 'image/png',
      buffer: png2
    });
    await expect(counterText).toContainText('2 of 4', { timeout: 10000 });
    const card1 = folioModal.locator('[data-testid="memory-card-1"]');
    await expect(card1).toBeVisible();

    // 6. Upload Photograph 3 (JPEG without EXIF)
    const jpeg3 = createSyntheticJpeg(800, 600);
    await fileInput.setInputFiles({
      name: 'downloaded_image.jpg',
      mimeType: 'image/jpeg',
      buffer: jpeg3
    });
    await expect(counterText).toContainText('3 of 4', { timeout: 10000 });
    const card2 = folioModal.locator('[data-testid="memory-card-2"]');
    await expect(card2).toBeVisible();

    // 7. Upload Photograph 4 (4K JPEG 3840x2160)
    const jpeg4k = createSyntheticJpeg(3840, 2160);
    await fileInput.setInputFiles({
      name: 'ultra_hd_moment.jpg',
      mimeType: 'image/jpeg',
      buffer: jpeg4k
    });
    await expect(counterText).toContainText('4 of 4', { timeout: 10000 });
    const card3 = folioModal.locator('[data-testid="memory-card-3"]');
    await expect(card3).toBeVisible();

    // 8. Verify dropzone is now gracefully hidden when collection is full (4 of 4)
    await expect(dropzone).not.toBeVisible();

    // 9. Attempt 5th upload via direct file input (must be blocked gracefully)
    const jpeg5 = createSyntheticJpeg(1280, 720);
    await fileInput.setInputFiles({
      name: 'attempt_fifth.jpg',
      mimeType: 'image/jpeg',
      buffer: jpeg5
    });

    // Verify counter is STILL 4 of 4 and original 4 remain intact
    await expect(counterText).toContainText('4 of 4');
    await expect(folioModal.locator('[data-testid^="memory-card-"]')).toHaveCount(4);

    // 10. Click Done and verify Studio shows 4 photographs
    const doneBtn = folioModal.locator('button:has-text("Done")');
    await doneBtn.click();
    await expect(folioModal).not.toBeVisible();

    // 11. Test Refresh Persistence: reload page and verify memory folio items persist
    await page.reload();
    await waitForPageReady(page);

    // Reopen Memory Folio
    await openAtelier(page);
    const atelierDrawer2 = page.locator('#letter-atelier-drawer');
    await expect(atelierDrawer2).toBeVisible();
    const memoryFolioBtn2 = atelierDrawer2.getByText(/Memory Folio/i).first();
    await memoryFolioBtn2.click();

    // Verify persisted counter is 4 of 4
    const counterAfterReload = page.locator('.folio-counter-text');
    await expect(counterAfterReload).toContainText('4 of 4');
    await expect(page.locator('[data-testid^="memory-card-"]')).toHaveCount(4);

    // 12. Remove one photograph and verify counter decrements to 3 of 4 and dropzone reappears
    const removeBtn = page.locator('[data-testid="memory-card-0"] .folio-remove-btn');
    await removeBtn.click();
    await expect(counterAfterReload).toContainText('3 of 4');
    await expect(page.locator('.folio-dropzone')).toBeVisible();
  });
});
