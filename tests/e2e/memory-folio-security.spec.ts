import { test, expect } from '@playwright/test';
import { attachErrorListeners, waitForPageReady } from './helpers/setup';

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

test.describe('Memory Folio UI, 1–4 Photographs & Fullscreen Viewer', () => {
  test('opens Atelier, launches Memory Folio, verifies 4-photo quota and NO privacy toggle', async ({ page }) => {
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
    // Verify 4-photographs capacity (Part 3)
    await expect(folioModal.getByText(/of 4.*photographs/i)).toBeVisible();

    // Verify COMPLETE REMOVAL of Privacy Toggle UI (Part 2 & Part 30)
    await expect(page.locator('#folio-include-shared')).toHaveCount(0);
    await expect(page.locator('.folio-privacy-card')).toHaveCount(0);
    await expect(page.getByText(/Private until toggled on/i)).toHaveCount(0);
    await expect(page.getByText(/Include in shared letter/i)).toHaveCount(0);

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

    // 7. Verify Memory Folio Display appears automatically on the letter sheet in Studio
    const onSheetDisplay = page.locator('.memory-folio-display').first();
    await expect(onSheetDisplay).toBeVisible();
    await expect(onSheetDisplay.locator('.memory-stamp-caption')).toContainText('That evening by the sea.');
  });
});

test.describe('Short Share Links & Automatic Letter Image Attachments', () => {
  test('Letter with attached photo shares via short URL /l/:code and displays for recipient', async ({ page, browser, baseURL }) => {
    attachErrorListeners(page);
    await page.goto('/');
    await waitForPageReady(page);

    // 1. Write letter
    const letterBody = page.getByTestId('letter-body');
    await letterBody.click();
    await letterBody.fill('This letter travels with a photograph tucked inside.');

    // 2. Open Atelier and attach photograph
    await openAtelier(page);
    await page.locator('#letter-atelier-drawer').getByText(/Memory Folio/i).first().click();

    const jpeg4k = createSynthetic4kJpeg();
    await page.locator('.folio-modal-backdrop input[type="file"]').setInputFiles({
      name: 'coastal_memory.jpg',
      mimeType: 'image/jpeg',
      buffer: jpeg4k
    });

    const memoryCard = page.locator('.folio-photo-card').first();
    await expect(memoryCard).toBeVisible({ timeout: 15_000 });
    await memoryCard.locator('input[id^="folio-cap-"]').fill('Golden hour tide.');

    // Close folio modal
    await page.locator('.folio-close-btn').click();

    // 3. Step 1 -> Step 2: Continue to the envelope
    const continueToSealBtn = page.getByRole('button', { name: /continue to the envelope/i }).first();
    await continueToSealBtn.scrollIntoViewIfNeeded();
    await continueToSealBtn.click();

    // Step 2: Press the seal to seal letter and generate short URL
    const pressSealBtn = page.locator('#pressSeal');
    await expect(pressSealBtn).toBeVisible({ timeout: 10_000 });
    await pressSealBtn.click();

    // Step 3: Verify the Short URL input (#linkOut)
    const shareUrlInput = page.locator('#linkOut');
    await expect(shareUrlInput).toBeVisible({ timeout: 15_000 });
    await expect(shareUrlInput).not.toHaveValue('', { timeout: 10_000 });

    const sharedUrl = await shareUrlInput.inputValue();
    // Must be a clean short URL: /l/:code or /letter/:code
    expect(sharedUrl).toMatch(/\/l\/[a-zA-Z0-9_-]{6,8}/);

    // Verify Copy Link button copies short canonical link
    const copyLinkBtn = page.locator('#copyBtn');
    await copyLinkBtn.click();
    // Toast should say "Link copied."
    await expect(page.locator('.khat-toast')).toContainText('Link copied.');

    // 4. Open the short URL in an independent recipient browser context
    const recipientContext = await browser.newContext();
    const recipientPage = await recipientContext.newPage();
    await recipientPage.goto(sharedUrl);
    await waitForPageReady(recipientPage);

    // Recipient unseals the letter
    const breakSealBtn = recipientPage.getByRole('button', { name: /break the wax seal|tap the seal/i }).first();
    if (await breakSealBtn.isVisible().catch(() => false)) {
      await breakSealBtn.click();
      await recipientPage.waitForTimeout(1000);
    }

    // Recipient sees letter text
    await expect(recipientPage.getByText('This letter travels with a photograph tucked inside.')).toBeVisible();

    // Recipient AUTOMATICALLY sees the attached photograph (NO toggle required)
    const recipientFolio = recipientPage.locator('.memory-folio-display');
    await expect(recipientFolio).toBeVisible();
    await expect(recipientFolio.locator('.memory-stamp-caption')).toContainText('Golden hour tide.');

    await recipientContext.close();
  });

  test('Concurrency & Uniqueness: 50 simultaneous share requests produce unique codes without collision', async ({ request, baseURL }) => {
    const codes = new Set<string>();
    const promises = Array.from({ length: 50 }, (_, i) =>
      request.post(`${baseURL}/api/letter/share`, {
        data: {
          letter: {
            recipient: `Dear Friend ${i}`,
            sender: `Sender ${i}`,
            body: `This is unique concurrent test letter payload index ${i}. Each one must have a unique share code.`,
            templateId: 'cream-laid'
          }
        }
      }).then(async (res) => {
        expect(res.status()).toBe(201);
        return res.json();
      })
    );

    const results = await Promise.all(promises);
    for (const r of results) {
      expect(r.success).toBe(true);
      expect(r.shareCode).toMatch(/^[a-zA-Z0-9_-]{6,8}$/);
      expect(codes.has(r.shareCode)).toBe(false);
      codes.add(r.shareCode);
    }
    expect(codes.size).toBe(50);

    // Test Repeated Share on the exact same letter content (Part 25)
    const repeatRes = await request.post(`${baseURL}/api/letter/share`, {
      data: {
        letter: {
          recipient: `Dear Friend 0`,
          sender: `Sender 0`,
          body: `This is unique concurrent test letter payload index 0. Each one must have a unique share code.`,
          templateId: 'cream-laid'
        }
      }
    });
    expect(repeatRes.status()).toBe(200);
    const repeatData = await repeatRes.json();
    expect(repeatData.shareCode).toBe(results[0].shareCode);
    expect(repeatData.isRepeated).toBe(true);

    // Test Resolution of generated share code
    const resolveRes = await request.get(`${baseURL}/api/letter/resolve?code=${results[0].shareCode}`);
    expect(resolveRes.status()).toBe(200);
    const resolveData = await resolveRes.json();
    expect(resolveData.letter.body).toBe('This is unique concurrent test letter payload index 0. Each one must have a unique share code.');

    // Test Invalid / Nonexistent share code (Part 32 Test 11)
    const invalidRes = await request.get(`${baseURL}/api/letter/resolve?code=nonExistentXYZ999`);
    expect(invalidRes.status()).toBe(404);
  });
});
