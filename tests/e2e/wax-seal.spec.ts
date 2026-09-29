import { test, expect } from '@playwright/test';
import { attachErrorListeners, waitForPageReady } from './helpers/setup';
import { encodeLetterToHash, decodeLetterFromHash } from '../../src/utils/codec';
import { createDefaultLetter, sanitizeLoadedLetter } from '../../src/utils/storage';
import { resolveWaxSeal, DEFAULT_WAX_SEAL } from '../../src/constants/waxSeal';
import { LetterData } from '../../src/types/letter';

test.describe('Wax Seal Deterministic Persistence & Lifecycle', () => {

  test('Unit: codec correctly serializes, minifies and deserializes all wax seals', async () => {
    const base = createDefaultLetter();

    // 1. Default seal
    const encDefault = encodeLetterToHash(base);
    const decDefault = decodeLetterFromHash(encDefault);
    expect(decDefault?.waxSeal?.id).toBe('heart');
    expect(decDefault?.waxSeal?.symbol).toBe('♡');

    // 2. Predefined custom seal (e.g. infinity)
    const letterInfinity: LetterData = {
      ...base,
      waxSeal: { id: 'infinity', symbol: '∞', isCustom: false, customText: 'A' }
    };
    const encInf = encodeLetterToHash(letterInfinity);
    const decInf = decodeLetterFromHash(encInf);
    expect(decInf?.waxSeal?.id).toBe('infinity');
    expect(decInf?.waxSeal?.symbol).toBe('∞');

    // 3. Predefined star seal
    const letterStar: LetterData = {
      ...base,
      waxSeal: { id: 'star', symbol: '✦', isCustom: false, customText: 'A' }
    };
    const encStar = encodeLetterToHash(letterStar);
    const decStar = decodeLetterFromHash(encStar);
    expect(decStar?.waxSeal?.id).toBe('star');
    expect(decStar?.waxSeal?.symbol).toBe('✦');

    // 4. Custom monogram seal
    const letterMonogram: LetterData = {
      ...base,
      waxSeal: { id: 'custom', symbol: 'AS', isCustom: true, customText: 'AS' }
    };
    const encMono = encodeLetterToHash(letterMonogram);
    const decMono = decodeLetterFromHash(encMono);
    expect(decMono?.waxSeal?.id).toBe('custom');
    expect(decMono?.waxSeal?.symbol).toBe('AS');
    expect(decMono?.waxSeal?.isCustom).toBe(true);
    expect(decMono?.waxSeal?.customText).toBe('AS');

    // 5. Legacy letter without waxSeal
    const legacyRaw = {
      r: 'Friend',
      d: 'Today',
      g: 'Hello',
      b: 'Legacy message',
      s: 'Best',
      n: 'Old Author',
      t: 'airmail-classic',
      f: 'caveat',
      i: '#1F2340',
      rl: 1
    };
    const sanitizedLegacy = sanitizeLoadedLetter(legacyRaw);
    expect(sanitizedLegacy.waxSeal).toBeDefined();
    expect(sanitizedLegacy.waxSeal?.id).toBe('heart');
    expect(sanitizedLegacy.waxSeal?.symbol).toBe('♡');

    // 6. Invalid wax seal fallback
    const resolvedInvalid = resolveWaxSeal({ waxSeal: null as any } as any);
    expect(resolvedInvalid.id).toBe(DEFAULT_WAX_SEAL.id);
    expect(resolvedInvalid.symbol).toBe(DEFAULT_WAX_SEAL.symbol);
  });

  test('TEST 1 & 2 & 3: Selection in Studio immediately updates preview & envelope modal', async ({ page }) => {
    const verifyErrors = attachErrorListeners(page);
    await page.goto('/');
    await waitForPageReady(page);

    // Open Studio
    const openStudioBtn = page.getByRole('button', { name: /open studio/i }).first();
    await expect(openStudioBtn).toBeVisible();
    await openStudioBtn.click();

    // Verify Studio is open
    const studioBackdrop = page.locator('.studio-backdrop');
    await expect(studioBackdrop).toBeVisible();

    // Open Wax Seal accordion in Studio
    const waxSealAccordion = page.locator('details.studio-accordion').filter({ hasText: /wax seal/i });
    await waxSealAccordion.locator('summary').click();

    // Select Star (✦)
    const starBtn = page.getByTestId('seal-option-star');
    await expect(starBtn).toBeVisible();
    await starBtn.click();

    // Verify preview in Studio updates to Star
    const studioPreviewSeal = page.getByTestId('studio-preview-wax-seal');
    if (await studioPreviewSeal.isVisible()) {
      await expect(studioPreviewSeal).toContainText('✦');
    }

    // Switch to Infinity (∞)
    const infinityBtn = page.getByTestId('seal-option-infinity');
    await infinityBtn.click();

    // Studio active preview in picker must show ∞
    const pickerActivePreview = page.getByTestId('wax-seal-active-preview');
    await expect(pickerActivePreview).toContainText('∞');

    // Open reader preview modal from Studio header
    const previewHeaderBtn = page.locator('.studio-header-actions').getByRole('button', { name: /preview/i });
    await previewHeaderBtn.click();

    // Envelope modal should display the ∞ wax seal
    const envelopeWaxSeal = page.getByTestId('envelope-wax-seal');
    await expect(envelopeWaxSeal).toBeVisible();
    await expect(envelopeWaxSeal).toHaveAttribute('data-seal-id', 'infinity');
    await expect(envelopeWaxSeal).toHaveAttribute('data-seal-symbol', '∞');
    await expect(envelopeWaxSeal).toContainText('∞');

    verifyErrors();
  });

  test('TEST 4 & 10: Custom seal persists on page reload and through letter editing', async ({ page }) => {
    const verifyErrors = attachErrorListeners(page);
    await page.goto('/');
    await waitForPageReady(page);

    // Open Studio
    await page.getByRole('button', { name: /open studio/i }).first().click();

    // Open Wax Seal accordion
    const waxSealAccordion = page.locator('details.studio-accordion').filter({ hasText: /wax seal/i });
    await waxSealAccordion.locator('summary').click();

    // Click Custom option
    const customBtn = page.getByTestId('seal-option-custom');
    await customBtn.click();

    // Fill custom monogram input with 'K'
    const customInput = page.getByTestId('wax-seal-custom-input');
    await expect(customInput).toBeVisible();
    await customInput.fill('K');

    // Close Studio to return to editor
    await page.locator('.studio-back-btn').click();

    // Edit letter body text
    const letterBody = page.getByTestId('letter-body');
    await letterBody.fill('This is a test letter with custom monogram seal K.');

    // Wait for debounced autosave
    await page.waitForTimeout(600);

    // Reload page
    await page.reload();
    await waitForPageReady(page);

    // Reopen preview envelope via Studio
    await page.getByRole('button', { name: /open studio/i }).first().click();
    await page.locator('.studio-header-actions').getByRole('button', { name: /preview/i }).click();

    // Envelope must still have 'K' wax seal
    const envelopeWaxSeal = page.getByTestId('envelope-wax-seal');
    await expect(envelopeWaxSeal).toBeVisible();
    await expect(envelopeWaxSeal).toHaveAttribute('data-seal-id', 'custom');
    await expect(envelopeWaxSeal).toHaveAttribute('data-seal-symbol', 'K');
    await expect(envelopeWaxSeal).toContainText('K');

    verifyErrors();
  });

  test('TEST 5 & 6 & 7: User A shares letter with custom seal, User B opens and receives EXACT seal', async ({ browser, page }) => {
    const verifyErrors = attachErrorListeners(page);
    await page.goto('/');
    await waitForPageReady(page);

    // Open Studio
    await page.getByRole('button', { name: /open studio/i }).first().click();

    // Open Wax Seal accordion
    const waxSealAccordion = page.locator('details.studio-accordion').filter({ hasText: /wax seal/i });
    await waxSealAccordion.locator('summary').click();

    // Select Crown (♔)
    const crownBtn = page.getByTestId('seal-option-crown');
    await crownBtn.click();

    // Close Studio
    await page.locator('.studio-back-btn').click();

    // Wait for debounced autosave to write to localStorage
    await page.waitForTimeout(600);

    // Read current draft from localStorage to get the exact letter with waxSeal
    const draftJson = await page.evaluate(() => localStorage.getItem('khat-and-co:draft'));
    expect(draftJson).toBeTruthy();
    const draftObj = JSON.parse(draftJson!);
    expect(draftObj.waxSeal).toBeDefined();
    expect(draftObj.waxSeal.symbol).toBe('♔');

    // Generate standalone hash link with this letter
    const shareHash = encodeLetterToHash(draftObj);
    expect(shareHash).toBeTruthy();

    // Open User B fresh page context (isolated incognito browser context)
    const contextB = await browser.newContext();
    const pageB = await contextB.newPage();
    const verifyErrorsB = attachErrorListeners(pageB);

    // User B visits the shared URL with hash
    await pageB.goto(`/#l=${shareHash}`);
    await waitForPageReady(pageB);

    // User B must immediately see the sealed envelope with the EXACT ♔ seal!
    const recipientEnvelopeSeal = pageB.getByTestId('envelope-wax-seal');
    await expect(recipientEnvelopeSeal).toBeVisible();
    await expect(recipientEnvelopeSeal).toHaveAttribute('data-seal-symbol', '♔');
    await expect(recipientEnvelopeSeal).toContainText('♔');

    // TEST 7: User B refreshes shared page
    await pageB.reload();
    await waitForPageReady(pageB);

    const refreshedSeal = pageB.getByTestId('envelope-wax-seal');
    await expect(refreshedSeal).toBeVisible();
    await expect(refreshedSeal).toHaveAttribute('data-seal-symbol', '♔');
    await expect(refreshedSeal).toContainText('♔');

    await contextB.close();
    verifyErrors();
  });

  test('TEST 8: Legacy letter hash without waxSeal renders default seal gracefully', async ({ page }) => {
    const verifyErrors = attachErrorListeners(page);

    // Create legacy letter without waxSeal
    const base = createDefaultLetter();
    const { waxSeal: _, ...legacyLetter } = base;
    const legacyHash = encodeLetterToHash(legacyLetter as LetterData);

    await page.goto(`/#l=${legacyHash}`);
    await waitForPageReady(page);

    // Envelope must render default heart seal without crashing
    const envelopeWaxSeal = page.getByTestId('envelope-wax-seal');
    await expect(envelopeWaxSeal).toBeVisible();
    await expect(envelopeWaxSeal).toHaveAttribute('data-seal-id', 'heart');

    verifyErrors();
  });

  test('TEST 11: Switching template preserves selected custom wax seal', async ({ page }) => {
    const verifyErrors = attachErrorListeners(page);
    await page.goto('/');
    await waitForPageReady(page);

    // Open Studio
    await page.getByRole('button', { name: /open studio/i }).first().click();

    // Select Moon (☽)
    const waxSealAccordion = page.locator('details.studio-accordion').filter({ hasText: /wax seal/i });
    await waxSealAccordion.locator('summary').click();
    await page.getByTestId('seal-option-moon').click();

    // Switch Paper template (Paper accordion is open by default in Studio)
    const secondTemplate = page.locator('.studio-left-panel .template-pill').nth(1);
    await secondTemplate.click();

    // Check envelope preview: seal must still be ☽
    const previewHeaderBtn = page.locator('.studio-header-actions').getByRole('button', { name: /preview/i });
    await previewHeaderBtn.click();

    const envelopeWaxSeal = page.getByTestId('envelope-wax-seal');
    await expect(envelopeWaxSeal).toBeVisible();
    await expect(envelopeWaxSeal).toHaveAttribute('data-seal-symbol', '☽');
    await expect(envelopeWaxSeal).toContainText('☽');

    verifyErrors();
  });

  test('TEST 15: Rapidly switching seals A -> B -> C -> A -> B saves final seal', async ({ page }) => {
    const verifyErrors = attachErrorListeners(page);
    await page.goto('/');
    await waitForPageReady(page);

    // Open Studio
    await page.getByRole('button', { name: /open studio/i }).first().click();

    const waxSealAccordion = page.locator('details.studio-accordion').filter({ hasText: /wax seal/i });
    await waxSealAccordion.locator('summary').click();

    // Rapid switches
    await page.getByTestId('seal-option-heart').click();
    await page.getByTestId('seal-option-star').click();
    await page.getByTestId('seal-option-infinity').click();
    await page.getByTestId('seal-option-fleur').click();
    await page.getByTestId('seal-option-star').click();

    // Final selected must be star
    const pickerActivePreview = page.getByTestId('wax-seal-active-preview');
    await expect(pickerActivePreview).toContainText('✦');

    // Wait for autosave
    await page.waitForTimeout(500);

    // Verify localStorage has Star
    const draftJson = await page.evaluate(() => localStorage.getItem('khat-and-co:draft'));
    const draftObj = JSON.parse(draftJson!);
    expect(draftObj.waxSeal?.id).toBe('star');
    expect(draftObj.waxSeal?.symbol).toBe('✦');

    verifyErrors();
  });

});
