# Playwright Troubleshooting & Failure Mode Handling

This document details known failure modes and explicit resolutions implemented for Khat & Co.'s end-to-end testing suite.

---

## 1. "Executable doesn't exist" / Missing Browser
- **Cause:** Chromium binaries not installed or path with spaces/symbols (`d:\Khat & Co`) causes standard `npx` runner to misparse path arguments on Windows.
- **Resolution:**
  - Execute via Node CLI directly: `node "./node_modules/@playwright/test/cli.js" install chromium`.
  - On Linux CI environments, invoke `npx playwright install --with-deps chromium`.
  - The configuration detects missing browser instances and prompts with explicit rerun instructions.

## 2. Port In Use / webServer Timeout
- **Cause:** Stale preview server processes or collisions on port 4173.
- **Resolution:**
  - Respect `PORT` environment variable (`process.env.PORT || 4173`).
  - Use `reuseExistingServer: true` to attach cleanly to pre-running local preview servers.
  - Set webServer timeout to `120_000ms` to permit clean production build (`npm run build`) before preview launch.

## 3. Timeouts and Flakiness
- **Rules Enforced:**
  - Strict prohibition of arbitrary `waitForTimeout` sleeps and non-deterministic `networkidle`.
  - Always rely on web-first assertions: `await expect(locator).toBeVisible({ timeout: 10_000 })`.
  - Prior to running color contrast checks or taking screenshots, await font readiness explicitly:
    ```ts
    await page.evaluate(() => document.fonts.ready);
    ```

## 4. Strict Mode Violations
- **Cause:** Multiple matching DOM nodes when using ambiguous CSS selectors.
- **Resolution:**
  - Exclusively query via stable locator APIs: `getByTestId('...')` and `getByRole('...', { name: '...' })`.
  - Never use ambiguous class selectors (e.g. `.btn` or `.letter-sheet span`).

## 5. Offline or Blocked Google Fonts
- **Cause:** Network flakiness or offline CI runners causing external Google Fonts to fail to load, resulting in layout shifts or rendering timeouts.
- **Resolution:**
  - Include resilient fallback system font stacks in CSS for each typography family:
    - `'Instrument Serif', Georgia, 'Times New Roman', serif`
    - `'Instrument Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
    - `'Caveat', cursive, sans-serif`
    - `'Kalam', cursive, sans-serif`
    - `'Dancing Script', cursive, sans-serif`
    - `'Amita', cursive, sans-serif`
    - `'Reenie Beanie', cursive, sans-serif`
  - Font readiness checks safely handle loaded or fallback fonts without network stalling.

## 6. Zero Tolerated Errors: Pageerror & Console.error
- **Enforcement:**
  - Every spec attaches event listeners for `pageerror` and `console.error`.
  - Any unhandled exception or console error immediately fails the test.
  - Harmless 3rd party warnings (e.g. browser extension artifacts or known browser engine font warnings) must be explicitly documented and isolated if encountered.
