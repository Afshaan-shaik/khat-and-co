# UI Fix & Layout Alignment Changelog

**Branch:** `fix/theme-layout-a11y`  
**Date:** September 28, 2026  
**Objective:** Resolve UI bugs, align workspace layout to reference design, fix night-mode contrast, complete tagline, and ensure zero data loss with automated Playwright verification.

---

## 1. Tagline & Brand Lockup
- **Tagline Truncation Fix:** Separated the SVG envelope icon from the HTML text lockup in `src/components/BrandLogo.tsx`.
- The tagline cleanly renders full text across all viewports (mobile, tablet, laptop, desktop):  
  `"खत · letters for the people you miss"` (previously clipped as `"people you m"`).
- Brand title increased to 24px with letter-spacing `0.06em` and SVG logo scaled to 36x36px with `flex-shrink: 0`, preserving crisp sharpness and contrast (>= 3:1 for logo mark, >= 4.5:1 for tagline).
- `src/components/Header.tsx` refactored to a 3-zone flex container (`justify-content: space-between`), eliminating center cell flex compression.

---

## 2. Workspace Layout & Reference Format
- **Aligned Baselines:** Both the left sidebar panel (`#left-panel`) and the right desk stage (`#desk-stage`) are pinned to the bottom of the viewport (`100dvh` shell). Desktop viewport has no outer window scrolling (`<= innerHeight`).
- **Stationery Grid:** Refactored `src/components/TemplatePicker.tsx` into a 2-column compact swatch grid occupying >= 90% of sidebar width, with zero horizontal overflow or nested scrollbars.
- **Desk Completion Actions:** Added 4 completion action buttons below the letter sheet on the desk stage:
  - *Save as picture* (download clean PNG)
  - *See it as your reader will* (open reader preview with wax seal envelope)
  - *Copy share link* (copy `#l=` URL)
  - *Start a new letter* (reset draft with confirmation)
- **Responsive Breakpoint Alignment:** Configured responsive switch at `@media (max-width: 767px)` so tablets (e.g., iPad Air 820px) receive the spacious two-column layout, while mobile displays tab navigation.

---

## 3. Night Mode & High Contrast
- **Stationery Token Isolation:** Letter paper inputs, placeholders, and envelope fields strictly bind to `--paper-bg` and `--paper-ink`.
- Changing desk theme between light and dark no longer flips paper text colors unless the chosen stationery is naturally dark.
- Night mode UI background and surface tokens calibrated for WCAG AA (>= 4.5:1 for body and buttons, >= 7:1 for letter ink).

---

## 4. Data Safety & Storage Contract
- Verified storage keys in `docs/storage-contract.md`:
  - `khat-and-co:draft`: preserves draft payload (schema version 1)
  - `khat-and-co:theme`: preserves user theme choice (`light` / `dark`)
  - `#l=...`: preserves base64 compressed URL hash sharing
- Tested with automated reloads: zero data loss, zero mutation.

---

## 5. Playwright Verification Suite
- Comprehensive suite running across 5 target configurations:
  1. `desktop-light` (1440x900)
  2. `desktop-dark` (1440x900)
  3. `laptop-dark` (1280x720)
  4. `tablet` (820x1180)
  5. `mobile` (390x844)
- **80 / 80 tests passing** (0 skipped, 0 unhandled console errors).
