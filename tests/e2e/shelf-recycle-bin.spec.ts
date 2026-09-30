import { test, expect } from '@playwright/test';
import { waitForPageReady } from './helpers/setup';

test.describe('Shelf & Recycle Bin Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Seed initial test letter into shelf
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'khath:shelf',
        JSON.stringify([
          {
            id: 'test_letter_123',
            recipient: 'Rukmini',
            sender: 'Kavya',
            date: 'Wednesday, September 30, 2026',
            body: 'This is a test letter sent to verify recycle bin and truncation.',
            city: 'Bengaluru',
            templateId: 'airmail-classic',
            stamp: 1
          }
        ])
      );
      window.localStorage.removeItem('khath:shelf:recycle_bin');
    });

    await page.goto('/');
    await waitForPageReady(page);
  });

  test('should move active shelf letter to recycle bin, restore it, and permanently truncate it', async ({ page }) => {
    // 1. Verify letter is present on the shelf
    const shelfItem = page.locator('.shelf-item').first();
    await expect(shelfItem).toBeVisible();
    await expect(page.locator('.shelf-item b', { hasText: 'To Rukmini' })).toBeVisible();

    // 2. Click the delete button on the shelf item
    const delBtn = page.locator('[data-testid="delete-letter-test_letter_123"]');
    await delBtn.click({ force: true });

    // Toast verification using .khat-toast
    await expect(page.locator('.khat-toast')).toContainText('Letter moved to Recycle Bin');

    // Active shelf should no longer show Rukmini's custom letter
    await expect(page.locator('.shelf-item b', { hasText: 'To Rukmini' })).not.toBeVisible();

    // 3. Switch to Recycle Bin tab
    const binTab = page.locator('#shelf-tab-bin');
    await binTab.click();

    // Verify Recycle Bin shows the letter card
    const binCard = page.locator('[data-testid="bin-card-test_letter_123"]');
    await expect(binCard).toBeVisible();
    await expect(binCard).toContainText('To: Rukmini');
    await expect(binCard).toContainText('This is a test letter');

    // 4. Test Restore flow
    const restoreBtn = page.locator('[data-testid="restore-btn-test_letter_123"]');
    await restoreBtn.click();
    await expect(page.locator('.khat-toast')).toContainText('Restored letter to Rukmini');

    // Verify bin is now empty
    await expect(page.locator('[data-testid="recycle-bin-empty"]')).toBeVisible();

    // Switch back to shelf and verify Rukmini is restored
    await page.locator('#shelf-tab-active').click();
    await expect(page.locator('.shelf-item b', { hasText: 'To Rukmini' })).toBeVisible();

    // 5. Delete again to test permanent truncate flow
    await delBtn.click({ force: true });
    await binTab.click();
    await expect(binCard).toBeVisible();

    // Click Truncate button on the card
    const truncateBtn = page.locator('[data-testid="truncate-btn-test_letter_123"]');
    await truncateBtn.click();

    // Verify confirmation modal appears
    const modal = page.locator('[data-testid="truncate-modal"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Permanently Truncate Letter?');
    await expect(modal).toContainText('Rukmini');

    // Cancel first to verify safety
    await modal.locator('button:has-text("Cancel")').click();
    await expect(modal).not.toBeVisible();
    await expect(binCard).toBeVisible();

    // Reopen and confirm truncation
    await truncateBtn.click();
    await expect(modal).toBeVisible();
    await page.locator('[data-testid="confirm-truncate-btn"]').click();

    // Verify toast & permanent deletion
    await expect(page.locator('.khat-toast')).toContainText('Letter permanently deleted');
    await expect(page.locator('[data-testid="recycle-bin-empty"]')).toBeVisible();
  });

  test('should empty entire recycle bin permanently via toolbar action', async ({ page }) => {
    // Delete letter to recycle bin
    const delBtn = page.locator('[data-testid="delete-letter-test_letter_123"]');
    await delBtn.click({ force: true });

    // Go to bin tab
    await page.locator('#shelf-tab-bin').click();
    const binCard = page.locator('[data-testid="bin-card-test_letter_123"]');
    await expect(binCard).toBeVisible();

    // Click "Empty Bin Permanently" button
    const emptyBtn = page.locator('[data-testid="empty-bin-btn"]');
    await expect(emptyBtn).toBeVisible();
    await emptyBtn.click();

    // Modal verification
    const modal = page.locator('[data-testid="truncate-modal"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Empty Entire Recycle Bin?');

    // Confirm emptying
    await page.locator('[data-testid="confirm-truncate-btn"]').click();
    await expect(page.locator('.khat-toast')).toContainText('Recycle bin emptied permanently');
    await expect(page.locator('[data-testid="recycle-bin-empty"]')).toBeVisible();
  });
});
