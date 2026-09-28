# Pre-Fix Test Baseline Results (`docs/before.md`)

Date: September 28, 2026
Test Command: `node "./node_modules/@playwright/test/cli.js" test`

## 1. Summary of Baseline Results Before Fixes
The initial pre-fix test suite execution confirmed all critical bugs reported by the user:

1. **Header Truncation & Overflows (`header.spec.ts`):**
   - **320px viewport:** Fails due to horizontal document overflow (`document.documentElement.scrollWidth > window.innerWidth`) and logo/tagline truncation ("letters for the people you m").
   - **390px viewport (Mobile):** Fails due to header action bar overflow and truncated tagline text.
   - **768px viewport (Tablet):** Fails due to fixed header action layout overflowing viewport width.
   - **1280px & 1440px viewports (Desktop):** Tagline lockup fails truncation assertion (`scrollWidth > clientWidth + 1`).

2. **Contrast & Theme A11y (`theme-contrast.spec.ts`):**
   - Light mode paper cards Hindi sub-labels (`.template-pill-hindi`) fail the 4.5:1 WCAG AA contrast requirement due to pale muted colors and opacity styling.
   - "ENVELOPE TO:" label on paper sheet fails contrast in dark mode (inheriting low opacity light-grey against cream paper).

3. **Letter Ink Isolation (`letter-ink.spec.ts`):**
   - In dark mode, inputs on light/cream stationery paper inherit dark mode styles (`color: var(--ui-text)` or light text), resulting in invisible or faint text on cream stationery.
   - Contrast between letter text and paper falls far below 7:1.

4. **App-Shell Layout & Aligned Baselines (`layout.spec.ts`):**
   - Desktop viewports suffer from full-page vertical scrolling instead of a fixed app-shell viewport.
   - Left customization sidebar and stage editor column do not end on the same baseline.

5. **Left Panel Architecture (`left-panel.spec.ts`):**
   - Paper template selector has a nested vertical scrollbar with a single column of wide pills instead of a 2-column compact swatch grid utilizing >= 90% panel width.
