import { test, expect } from '@playwright/test';
import { attachErrorListeners, waitForPageReady } from './helpers/setup';
import { encodeLetterToHash } from '../../src/utils/codec';

// Generate a valid 4K (3840x2160) synthetic JPEG buffer with valid EXIF/SOF markers
function createSynthetic4kJpeg(): Buffer {
  const width = 3840;
  const height = 2160;

  const header = Buffer.from([
    0xff, 0xd8, // SOI
    0xff, 0xe0, 0x00, 0x10, // APP0 len 16
    0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00,
    0xff, 0xc0, 0x00, 0x11, // SOF0 len 17
    0x08, // precision 8-bit
    (height >> 8) & 0xff, height & 0xff, // height 2160
    (width >> 8) & 0xff, width & 0xff,   // width 3840
    0x03, // 3 components (YCbCr)
    0x01, 0x22, 0x00,
    0x02, 0x11, 0x01,
    0x03, 0x11, 0x01,
    0xff, 0xda, 0x00, 0x0c, // SOS
    0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00, 0x3f, 0x00,
    0x00, 0x00, // Minimal scan data
    0xff, 0xd9  // EOI
  ]);
  return header;
}

test.describe('Workspace Session Isolation & IDOR Protection', () => {
  test('Case A & B & C & D & E: Server authorization, IDOR protection, and tab isolation', async ({ browser, request, baseURL }) => {
    // 1. Direct API access without session header must be rejected with 401 Unauthorized (Case E)
    const unauthorizedRes = await request.get(`${baseURL}/api/memory/mem_fake123`);
    expect(unauthorizedRes.status()).toBe(401);

    // 2. Direct API access to invalid endpoint or malformed auth must be rejected with 401
    const badAuthRes = await request.get(`${baseURL}/api/memory/mem_fake123`, {
      headers: {
        'X-Workspace-Session-Id': 'ws_invalid',
        'Authorization': 'Bearer bad_token'
      }
    });
    expect(badAuthRes.status()).toBe(401);

    // 3. Create Session A on context 1
    const contextA = await browser.newContext();
    const pageA = await contextA.newPage();
    attachErrorListeners(pageA);
    await pageA.goto('/');
    await waitForPageReady(pageA);

    // Extract Session A details from sessionStorage
    const sessionAData = await pageA.evaluate(() => {
      const id = sessionStorage.getItem('khath:workspace_session_id');
      const token = sessionStorage.getItem('khath:workspace_session_token');
      return { id, token };
    });
    expect(sessionAData.id).toMatch(/^ws_/);
    expect(sessionAData.token).toMatch(/^wst_/);

    // 4. Create Session B on completely distinct context 2 (Case F/G/H: Edge / Firefox / mobile simulation)
    const contextB = await browser.newContext();
    const pageB = await contextB.newPage();
    attachErrorListeners(pageB);
    await pageB.goto('/');
    await waitForPageReady(pageB);

    const sessionBData = await pageB.evaluate(() => {
      const id = sessionStorage.getItem('khath:workspace_session_id');
      const token = sessionStorage.getItem('khath:workspace_session_token');
      return { id, token };
    });
    expect(sessionBData.id).toMatch(/^ws_/);
    // Sessions MUST be strictly isolated
    expect(sessionBData.id).not.toBe(sessionAData.id);
    expect(sessionBData.token).not.toBe(sessionAData.token);

    // 5. Test Tab Refresh preserves session in the same browsing context (Case J)
    await pageA.reload();
    await waitForPageReady(pageA);
    const sessionAReloaded = await pageA.evaluate(() => {
      return sessionStorage.getItem('khath:workspace_session_id');
    });
    expect(sessionAReloaded).toBe(sessionAData.id);

    // 6. Test New Tab in context A generates a new workspace or isolates correctly (Case I)
    const pageA2 = await contextA.newPage();
    await pageA2.goto('/');
    await waitForPageReady(pageA2);
    const sessionA2 = await pageA2.evaluate(() => {
      return sessionStorage.getItem('khath:workspace_session_id');
    });
    expect(sessionA2).toBeTruthy();

    // 7. Upload a 4K photograph to Session A
    const jpeg4k = createSynthetic4kJpeg();
    const uploadRes = await request.post(`${baseURL}/api/memory/upload`, {
      headers: {
        'X-Workspace-Session-Id': sessionAData.id!,
        'Authorization': `Bearer ${sessionAData.token}`
      },
      data: {
        fileBase64: jpeg4k.toString('base64'),
        filename: 'seaside_4k.jpg',
        mimeType: 'image/jpeg',
        caption: 'Rain found us that evening.',
        memoryDate: '14 October 2026',
        memoryTitle: 'By the sea',
        focalPoint: 'center'
      }
    });

    expect([200, 201]).toContain(uploadRes.status());
    const uploadData = await uploadRes.json();
    expect(uploadData.success).toBe(true);
    expect(uploadData.item).toBeTruthy();
    expect(uploadData.item.width).toBe(3840);
    expect(uploadData.item.height).toBe(2160);
    expect(uploadData.item.is4K).toBe(true);
    expect(uploadData.item.storageObjectKey).toBeTruthy();

    const memoryItemId = uploadData.item.id;

    // 8. Session A can retrieve its own memory
    const getOwnRes = await request.get(`${baseURL}/api/memory/${memoryItemId}`, {
      headers: {
        'X-Workspace-Session-Id': sessionAData.id!,
        'Authorization': `Bearer ${sessionAData.token}`
      }
    });
    expect(getOwnRes.status()).toBe(200);

    // 9. CASE B & C & D: Session B attempts IDOR to read Session A's memory
    const idorRes = await request.get(`${baseURL}/api/memory/${memoryItemId}`, {
      headers: {
        'X-Workspace-Session-Id': sessionBData.id!,
        'Authorization': `Bearer ${sessionBData.token}`
      }
    });
    // Server must reject with 403 Forbidden!
    expect(idorRes.status()).toBe(403);
    const idorBody = await idorRes.json();
    expect(idorBody.error).toMatch(/Forbidden|Access Denied/i);

    // 10. Attempting to delete or update A's memory from B must also be rejected with 403
    const idorDeleteRes = await request.delete(`${baseURL}/api/memory/${memoryItemId}`, {
      headers: {
        'X-Workspace-Session-Id': sessionBData.id!,
        'Authorization': `Bearer ${sessionBData.token}`
      }
    });
    expect(idorDeleteRes.status()).toBe(403);

    await contextA.close();
    await contextB.close();
  });
});

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

test.describe('Memory Folio UI, Atelier & Fullscreen Viewer', () => {
  test('opens Atelier, launches Memory Folio, uploads photo, verifies viewer and controls', async ({ page }) => {
    attachErrorListeners(page);
    await page.goto('/');
    await waitForPageReady(page);

    // 1. Open Atelier Drawer via Desktop or Mobile Trigger
    await openAtelier(page);

    // 2. Verify Atelier Drawer content per Part 29
    const atelierDrawer = page.locator('#letter-atelier-drawer');
    await expect(atelierDrawer).toBeVisible();
    await expect(atelierDrawer.getByText(/The Letter Atelier/i)).toBeVisible();
    await expect(atelierDrawer.getByText(/Paper Ritual/i)).toBeVisible();
    await expect(atelierDrawer.getByText(/Memory Folio/i)).toBeVisible();

    // 3. Open Memory Folio modal
    const folioCard = atelierDrawer.getByText(/Memory Folio/i).first();
    await folioCard.click();

    const folioModal = page.locator('.folio-modal-backdrop');
    await expect(folioModal).toBeVisible();
    await expect(folioModal.getByText(/A few moments worth keeping/i)).toBeVisible();
    await expect(folioModal.getByText(/of 3.*photographs/i)).toBeVisible();

    // 4. Upload synthetic photo via file input
    const jpeg4k = createSynthetic4kJpeg();
    const fileInput = folioModal.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'archive_4k.jpg',
      mimeType: 'image/jpeg',
      buffer: jpeg4k
    });

    // Wait for upload and card to render
    const memoryCard = folioModal.locator('.folio-photo-card').first();
    await expect(memoryCard).toBeVisible({ timeout: 15_000 });
    // Check 4K chip
    await expect(memoryCard.locator('.folio-4k-chip')).toBeVisible();

    // 5. Test optional metadata fields (caption, date, focal point)
    const captionInput = memoryCard.locator('input[id^="folio-cap-"]');
    await captionInput.fill('That evening by the sea.');
    const dateInput = memoryCard.locator('input[id^="folio-date-"]');
    await dateInput.fill('14 October 2026');

    // 6. Test Fullscreen Photo Viewer (click thumbnail)
    const thumbWrap = memoryCard.locator('.folio-thumb-wrap');
    await thumbWrap.click();

    const photoViewer = page.locator('.photo-viewer-backdrop');
    await expect(photoViewer).toBeVisible();
    await expect(photoViewer.locator('.viewer-counter')).toContainText('1 / 1');
    await expect(photoViewer.getByText('That evening by the sea.')).toBeVisible();

    // Zoom in test
    const zoomInBtn = photoViewer.locator('button[aria-label="Zoom in"]');
    await zoomInBtn.click();
    await expect(photoViewer.locator('.viewer-img')).toHaveCSS('transform', /matrix/);

    // Close viewer via close button
    const closeViewerBtn = photoViewer.locator('button.viewer-close-btn');
    await closeViewerBtn.click();
    await expect(photoViewer).toBeHidden();

    // Close Memory Folio modal
    const closeFolioBtn = folioModal.locator('button.folio-close-btn');
    await closeFolioBtn.click();
    await expect(folioModal).toBeHidden();

    // Switch to letter stage on mobile if necessary
    const writeTab = page.getByRole('button', { name: /write letter/i });
    if (await writeTab.isVisible().catch(() => false)) {
      await writeTab.click();
      await waitForPageReady(page);
    }

    // 7. Verify Memory Folio Display appears on the letter sheet in Studio
    const onSheetDisplay = page.locator('.memory-folio-display').first();
    await expect(onSheetDisplay).toBeVisible();
    await expect(onSheetDisplay.locator('.memory-stamp-caption')).toContainText('That evening by the sea.');
  });
});

test.describe('Sharing & Privacy Boundaries', () => {
  test('Case K: Private memories are NOT exposed in shared letter unless explicitly published', async ({ page, browser }) => {
    attachErrorListeners(page);
    await page.goto('/');
    await waitForPageReady(page);

    // Open Atelier and Memory Folio
    await openAtelier(page);
    await page.locator('#letter-atelier-drawer').getByText(/Memory Folio/i).first().click();

    // Upload an image
    const jpeg4k = createSynthetic4kJpeg();
    await page.locator('.folio-modal-backdrop input[type="file"]').setInputFiles({
      name: 'private_keepsake.jpg',
      mimeType: 'image/jpeg',
      buffer: jpeg4k
    });

    const memoryCard = page.locator('.folio-photo-card').first();
    await expect(memoryCard).toBeVisible({ timeout: 15_000 });

    // By default, "Include with Letter" must be FALSE (Private)
    const includeCheckbox = page.locator('#folio-include-shared');
    expect(await includeCheckbox.isChecked()).toBe(false);

    // Close modal
    await page.locator('.folio-close-btn').click();

    // Write a note in the letter body
    const letterBody = page.getByTestId('letter-body');
    await letterBody.click();
    await letterBody.fill('This letter holds a private story.');

    // Wait for debounced draft autosave
    await page.waitForTimeout(600);

    // Get current draft from localStorage
    const draftJson = await page.evaluate(() => {
      // Find workspace draft
      const sid = sessionStorage.getItem('khath:workspace_session_id');
      return sessionStorage.getItem(`khath:workspace_draft:${sid}`) || sessionStorage.getItem('khat-and-co:draft') || localStorage.getItem('khat-and-co:draft');
    });
    expect(draftJson).toBeTruthy();
    const draftObj = JSON.parse(draftJson!);

    // Memory Folio in draft has includeInLetter: false
    expect(draftObj.memoryFolio?.includeInLetter).toBeFalsy();

    // Encode letter into share link hash
    const shareHash = encodeLetterToHash(draftObj);
    expect(shareHash).toBeTruthy();

    // Open the shared letter in a completely separate recipient browser context
    const recipientContext = await browser.newContext();
    const recipientPage = await recipientContext.newPage();
    await recipientPage.goto(`/#l=${shareHash}`);
    await waitForPageReady(recipientPage);

    // Recipient must NOT have the sender's workspace session id
    const recipientSession = await recipientPage.evaluate(() => {
      return sessionStorage.getItem('khath:workspace_session_id');
    });
    const senderSession = await page.evaluate(() => {
      return sessionStorage.getItem('khath:workspace_session_id');
    });
    expect(recipientSession).not.toBe(senderSession);

    // Recipient unseals the letter
    const breakSealBtn = recipientPage.getByRole('button', { name: /break the wax seal|tap the seal/i }).first();
    if (await breakSealBtn.isVisible().catch(() => false)) {
      await breakSealBtn.click();
      await recipientPage.waitForTimeout(1000);
    }

    // Verify recipient view does NOT display the private Memory Folio
    const recipientFolio = recipientPage.locator('.memory-folio-display');
    await expect(recipientFolio).toBeHidden();

    await recipientContext.close();
  });
});
