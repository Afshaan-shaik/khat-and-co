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
}
