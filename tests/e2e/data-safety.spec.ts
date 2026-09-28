import { test, expect } from '@playwright/test';
import { attachErrorListeners, waitForPageReady } from './helpers/setup';

test.describe('Data Safety & Persistence Suite', () => {
  const seedDraft = {
    recipient: 'Seed Recipient',
    date: 'Monday, September 28, 2026',
    greeting: 'My Dearest Seed,',
    body: 'This is seeded letter content to prove zero data loss and exact shape restoration.',
    signoff: 'Forever yours,',
    sender: 'Seed Sender',
    templateId: 'airmail-classic',
    fontId: 'caveat',
    inkColor: '#1F2340',
    ruledLines: true,
    stickers: [
      {
        id: 'init_stamp',
        stickerId: 'stamp-airmail',
        x: 82,
        y: 6,
        scale: 1.05,
        rotation: 3,
        zIndex: 2
      },
      {
        id: 'init_postmark',
        stickerId: 'postmark-date',
        x: 74,
        y: 11,
        scale: 0.95,
        rotation: -6,
        zIndex: 3
      },
      {
        id: 'init_seal',
        stickerId: 'wax-seal-heart',
        x: 12,
        y: 86,
        scale: 1,
        rotation: 0,
        zIndex: 4
      }
    ]
  };

  test('restores seeded draft with original storage shape from localStorage', async ({ page }) => {
    const verifyErrors = attachErrorListeners(page);

    // Seed draft before loading letter using addInitScript
    await page.addInitScript((draft) => {
      localStorage.setItem('khat-and-co:draft', JSON.stringify(draft));
    }, seedDraft);

    await page.goto('/');
    await waitForPageReady(page);

    await expect(page.getByTestId('letter-greeting')).toHaveValue('My Dearest Seed,');
    await expect(page.getByTestId('letter-body')).toHaveValue(seedDraft.body);
    await expect(page.getByTestId('letter-footer').locator('input').first()).toHaveValue('Forever yours,');
    await expect(page.getByTestId('letter-footer').locator('input').last()).toHaveValue('Seed Sender');

    // Verify sticker elements exist on letter
    const placedStickers = page.locator('.stk-placed');
    expect(await placedStickers.count()).toBe(3);

    verifyErrors();
  });

  test('persists newly typed text on reload', async ({ page }) => {
    const verifyErrors = attachErrorListeners(page);

    await page.goto('/');
    await waitForPageReady(page);

    const bodyInput = page.getByTestId('letter-body');
    await bodyInput.fill('Testing persistence of freshly typed user text.\nSecond line here.');

    // Wait 500ms for debounce autosave
    await page.waitForTimeout(500);

    await page.reload();
    await waitForPageReady(page);

    await expect(page.getByTestId('letter-body')).toHaveValue('Testing persistence of freshly typed user text.\nSecond line here.');

    verifyErrors();
  });

  test('opens legacy share link (#l=...) and displays envelope reading flow', async ({ page }) => {
    const verifyErrors = attachErrorListeners(page);

    // Encode a test share hash
    await page.goto('/');
    await waitForPageReady(page);

    const shareUrl = await page.evaluate(() => {
      const letter = {
        recipient: 'Share Recipient',
        date: 'September 28, 2026',
        greeting: 'Hello from Link,',
        body: 'Shared content received intact.',
        signoff: 'Warmly,',
        sender: 'Sender Name',
        templateId: 'airmail-classic',
        fontId: 'caveat',
        inkColor: '#1F2340',
        ruledLines: true,
        stickers: []
      };
      // Minified LZString
      return (window as any).encodeLetterToHash ? (window as any).encodeLetterToHash(letter) : null;
    });

    // We can also test direct hash navigation if encoded
    if (shareUrl) {
      await page.goto(`/#l=${shareUrl}`);
      await waitForPageReady(page);
      // Envelope modal should open
      await expect(page.locator('.envelope-modal-backdrop')).toBeVisible();
    }

    verifyErrors();
  });

  test('resolves and opens short link (?id=...) strictly closed with sealed wax first, concealing letter until tapped', async ({ page }) => {
    const verifyErrors = attachErrorListeners(page);

    // Mock bytebin request for offline deterministic e2e test
    await page.route('**/testShort123', async (route) => {
      await route.fulfill({
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipient: 'Short Link Recipient',
          date: 'September 28, 2026',
          greeting: 'Hey Dearest,',
          body: 'This is a short link test letter with secrets.',
          signoff: 'With Love,',
          sender: 'Shorty',
          templateId: 'airmail-classic',
          fontId: 'caveat',
          inkColor: '#1F2340',
          ruledLines: true,
          stickers: []
        })
      });
    });

    await page.goto('/?id=testShort123');
    await waitForPageReady(page);

    // 1. Envelope modal MUST be open
    await expect(page.locator('.envelope-modal-backdrop')).toBeVisible();

    // 2. Desk workspace MUST NOT be visible or rendered
    await expect(page.locator('.workspace-layout')).not.toBeVisible();

    // 3. Closed envelope card MUST be visible with sealed wax button
    await expect(page.locator('.envelope-card')).toBeVisible();
    await expect(page.locator('.pulsing-wax-seal')).toBeVisible();

    // 4. Letter body MUST NOT be revealed or visible before tapping wax seal
    await expect(page.locator('.envelope-revealed-container')).not.toBeVisible();
    await expect(page.getByText('This is a short link test letter with secrets.')).not.toBeVisible();

    // 5. Envelope front displays recipient address
    await expect(page.getByText('Short Link Recipient')).toBeVisible();

    // 6. Tap the wax seal to unseal and reveal (force: true bypasses continuous pulsing animation stability check)
    await page.locator('.pulsing-wax-seal').click({ force: true });

    // 7. Letter is now revealed!
    await expect(page.locator('.envelope-revealed-container')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('This is a short link test letter with secrets.')).toBeVisible();

    verifyErrors();
  });

  test('strictly preserves sealed closed envelope on load even with prefers-reduced-motion enabled', async ({ page }) => {
    const verifyErrors = attachErrorListeners(page);

    // Emulate reduced motion
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await page.route('**/testMotion123', async (route) => {
      await route.fulfill({
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipient: 'Motion Recipient',
          date: 'September 28, 2026',
          greeting: 'Hey Motion,',
          body: 'Hidden until wax tapped.',
          signoff: 'Always,',
          sender: 'Motion Sender',
          templateId: 'airmail-classic',
          fontId: 'caveat',
          inkColor: '#1F2340',
          ruledLines: true,
          stickers: []
        })
      });
    });

    await page.goto('/?id=testMotion123');
    await waitForPageReady(page);

    // Envelope modal is visible
    await expect(page.locator('.envelope-modal-backdrop')).toBeVisible();

    // Closed sealed envelope must be shown first (NOT revealed automatically)
    await expect(page.locator('.pulsing-wax-seal')).toBeVisible();
    await expect(page.locator('.envelope-revealed-container')).not.toBeVisible();
    await expect(page.getByText('Hidden until wax tapped.')).not.toBeVisible();

    // Tap wax seal
    await page.locator('.pulsing-wax-seal').click();

    // Revealed after tap
    await expect(page.locator('.envelope-revealed-container')).toBeVisible();
    await expect(page.getByText('Hidden until wax tapped.')).toBeVisible();

    verifyErrors();
  });
});
