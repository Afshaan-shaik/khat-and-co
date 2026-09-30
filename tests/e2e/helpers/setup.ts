import { Page, expect } from '@playwright/test';

export function attachErrorListeners(page: Page): () => void {
  const errors: string[] = [];

  page.on('pageerror', (err) => {
    errors.push(`Page error: ${err.message}\n${err.stack || ''}`);
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Allowlist harmless favicon 404 if any, and benign html-to-image Google Fonts CORS stylesheet inlining warnings
      if (text.includes('favicon.ico')) return;
      if (text.includes('Cannot access rules') || text.includes('Error inlining remote css file')) return;
      errors.push(`Console error: ${text}`);
    }
  });

  return () => {
    expect(errors, `Expected 0 errors but encountered:\n${errors.join('\n')}`).toEqual([]);
  };
}

export async function waitForPageReady(page: Page): Promise<void> {
  await page.evaluate(() => document.fonts.ready);

  // If the cinematic intro is currently showing, advance through it to allow desk interactions
  const introDialog = page.locator('[role="dialog"][aria-label="Khath & Co. introduction"]');
  if (await introDialog.isVisible().catch(() => false)) {
    const skipBtn = introDialog.getByRole('button', { name: /skip intro/i });
    if (await skipBtn.isVisible().catch(() => false)) {
      await skipBtn.click({ force: true }).catch(() => {});
    }
    const enterBtn = introDialog.getByRole('button', { name: /enter the studio/i });
    await enterBtn.waitFor({ state: 'visible', timeout: 2000 }).catch(() => {});
    if (await enterBtn.isVisible().catch(() => false)) {
      await enterBtn.click({ force: true }).catch(() => {});
    }
    await introDialog.waitFor({ state: 'detached', timeout: 3500 }).catch(() => {});
  }
}
