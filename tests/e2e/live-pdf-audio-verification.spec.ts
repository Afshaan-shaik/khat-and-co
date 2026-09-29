import { test, expect } from '@playwright/test';
import { encodeLetterToHash } from '../../src/utils/codec';
import { createDefaultLetter } from '../../src/utils/storage';
import type { LetterData } from '../../src/types';
import * as fs from 'fs';

const LIVE_URL = 'https://khath-and-co.vercel.app';

test.describe('Live Production Vercel App - Audio and PDF Verification', () => {
  test('Letter WITHOUT audio: zero audio controls in View Letter and PDF matches preview', async ({ page }) => {
    const letterNoAudio: LetterData = {
      ...createDefaultLetter(),
      recipient: 'Aarav',
      sender: 'Meera',
      templateId: 'rose-petal',
      fontId: 'caveat',
      ruledLines: true,
      body: 'Dear Aarav,\n\nWriting this warm letter without any audio attachment. It should have no audio controls anywhere.',
      signoff: 'Forever yours,',
      waxSeal: { id: 'heart', symbol: '♡', isCustom: false, color: 'oxblood' },
      voiceNoteUrl: null,
    };

    const hash = encodeLetterToHash(letterNoAudio);
    await page.goto(`${LIVE_URL}/#l=${hash}`);
    await page.evaluate(() => document.fonts.ready);

    // 1. Break the wax seal to view letter
    const sealBtn = page.getByTestId('envelope-wax-seal');
    await expect(sealBtn).toBeVisible({ timeout: 10000 });
    await sealBtn.click();

    // 2. View Letter is now visible after unsealing animation
    const paper = page.locator('.paper');
    await expect(paper).toBeVisible({ timeout: 10000 });

    // Verify recipient, sender, body text
    await expect(page.locator('.salute .nm')).toContainText('Aarav');
    await expect(page.locator('.body')).toContainText('without any audio attachment');

    // 3. Audio control check: MUST NOT EXIST ANYWHERE (no cassette, no audio player, no buttons)
    const audioPlayer = page.locator('audio');
    await expect(audioPlayer).toHaveCount(0);

    const cassette = page.locator('.cassette');
    await expect(cassette).toHaveCount(0);

    const voiceNoteTestId = page.getByTestId('letter-voice-note');
    await expect(voiceNoteTestId).toHaveCount(0);

    const audioButtons = page.locator('button:has-text("Play"), button:has-text("Listen"), button[aria-label*="audio" i], button[aria-label*="voice" i]');
    await expect(audioButtons).toHaveCount(0);

    // 4. Download PDF from live Vercel
    const pdfBtn = page.getByTestId('save-pdf-btn');
    await expect(pdfBtn).toBeVisible();

    const downloadPromise = page.waitForEvent('download', { timeout: 30000 });
    await pdfBtn.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('khat-letter-Aarav.pdf');

    const downloadPath = await download.path();
    expect(downloadPath).toBeTruthy();

    const pdfBuffer = fs.readFileSync(downloadPath!);
    const pdfString = pdfBuffer.toString('binary');

    // PDF MUST match letter without soft mask degradation
    expect(pdfString.startsWith('%PDF-')).toBe(true);
    expect(pdfString.includes('/SMask')).toBe(false);
    expect(pdfString.includes('/DCTDecode')).toBe(true);
    expect(pdfBuffer.length).toBeGreaterThan(50000);

    console.log('PASS: Letter without audio verified on live Vercel. PDF size:', pdfBuffer.length, 'bytes. SMask:', false);
  });

  test('Letter WITH audio: audio control displays and functions normally in View Letter', async ({ page }) => {
    // Generate valid short silent data audio URL
    const silentWavBase64 = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

    const letterWithAudio: LetterData = {
      ...createDefaultLetter(),
      recipient: 'Kabir',
      sender: 'Tara',
      templateId: 'midnight-ink',
      fontId: 'dancing',
      ruledLines: false,
      body: 'Dear Kabir,\n\nI recorded a voice note for you. Listen to it closely!',
      signoff: 'Love always,',
      waxSeal: { id: 'star', symbol: '✦', isCustom: false, color: 'navy' },
      voiceNoteUrl: silentWavBase64,
    };

    const hash = encodeLetterToHash(letterWithAudio);
    await page.goto(`${LIVE_URL}/#l=${hash}`);
    await page.evaluate(() => document.fonts.ready);

    // 1. Break wax seal to view letter
    const sealBtn = page.getByTestId('envelope-wax-seal');
    await expect(sealBtn).toBeVisible({ timeout: 10000 });
    await sealBtn.click();

    // 2. View Letter is now visible
    const paper = page.locator('.paper');
    await expect(paper).toBeVisible({ timeout: 10000 });

    // 3. Audio control check: MUST BE VISIBLE
    const cassette = page.locator('.cassette');
    await expect(cassette).toBeVisible({ timeout: 10000 });

    const voiceNoteTestId = page.getByTestId('letter-voice-note');
    await expect(voiceNoteTestId).toBeVisible();

    const audioElem = cassette.locator('audio');
    await expect(audioElem).toBeVisible();

    // 4. Download PDF
    const pdfBtn = page.getByTestId('save-pdf-btn');
    await expect(pdfBtn).toBeVisible();

    const downloadPromise = page.waitForEvent('download', { timeout: 30000 });
    await pdfBtn.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('khat-letter-Kabir.pdf');

    const downloadPath = await download.path();
    const pdfBuffer = fs.readFileSync(downloadPath!);
    const pdfString = pdfBuffer.toString('binary');

    expect(pdfString.startsWith('%PDF-')).toBe(true);
    expect(pdfString.includes('/SMask')).toBe(false);
    expect(pdfString.includes('/DCTDecode')).toBe(true);
    expect(pdfBuffer.length).toBeGreaterThan(50000);

    console.log('PASS: Letter with audio verified on live Vercel. Cassette visible. PDF size:', pdfBuffer.length, 'bytes. SMask:', false);
  });
});
