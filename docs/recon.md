# Phase 0 Reconnaissance: Khat & Co.

## 1. Stack Detection
- **Framework & Core:** React 18.3.1, TypeScript 5.6.3, Vite 5.4.11
- **Styling:** Vanilla CSS design tokens (`src/styles/index.css`) + Bootstrap 5.3.3 utilities
- **Package Manager:** npm
- **Asset/Icon system:** Inline SVGs, SVG files in `/public/`
- **Typography:** Google Fonts (`Instrument Serif`, `Caveat`, `Kalam`, `Amita`, `Dancing Script`, `Reenie Beanie`, `Plus Jakarta Sans`)

## 2. Dev / Build / Preview Commands
- **Dev server:** `npm run dev` (`vite`)
- **Build production bundle:** `npm run build` (`tsc && vite build`)
- **Preview production build:** `npm run preview` (`vite preview`)
- **E2E Tests:** `npm run test:e2e` / `npx playwright test`

## 3. Theme System & Tokens
- **Theme toggle mechanism:** `data-theme` attribute on `document.documentElement` (`<html data-theme="dark">` or `<html data-theme="light">`).
- **Persistence:** LocalStorage key `khat-and-co:theme` with fallback to `'dark'`.
- **Theme tokens:** Defined in `:root` and `[data-theme="dark"]` in `src/styles/index.css`.
- **Identified Theme/Contrast issues:**
  - Letter subtree inherits UI text color tokens or body color, causing invisible/faint text on cream/light stationery papers in dark mode.
  - Paper cards in left panel have very low contrast Hindi labels and pale borders in light mode.
  - "ENVELOPE TO:" label has low opacity and line wrapping.
  - Header tagline "letters for the people you miss" truncates on desktop and mobile viewports.
  - Logo mark contrast against dark/light headers.

## 4. Layout Architecture
- Desktop (`>= 960px`): `workspace-layout` (left sidebar + right editor stage).
- Identified layout issues:
  - Left panel paper list had an awkward nested scroll container.
  - Sticky header / stage heights and action buttons visibility.
  - Sticker drawer docked position and sticker toolbar placement.
  - Viewport-level scroll issues on desktop.

## 5. Storage Contract Summary
- `khat-and-co:draft`: Autosaved `LetterData` JSON.
- `khat-and-co:theme`: `'dark'` | `'light'`.
- URL Hash `#l=...`: LZString compressed minified JSON payload for shared letters.
*(Full schema documented in `docs/storage-contract.md`)*

## 6. Files Expected to Change
- `src/App.tsx` (app-shell structure, data-testids, action bar placement, tabs for mobile)
- `src/components/Header.tsx` (logo contrast, responsive wordmark/tagline layout, action bar buttons, data-testids)
- `src/components/BrandLogo.tsx` (logo contrast, dark/light SVG modes, data-testid)
- `src/components/TemplatePicker.tsx` (2-column compact swatch cards, high-contrast Hindi labels, data-testids)
- `src/components/FontPicker.tsx` (2-column handwriting cards, ink swatches row, ruled lines toggle, data-testids)
- `src/components/StickerDrawer.tsx` (docked sticker tray, categories, data-testids)
- `src/components/StickerCanvas.tsx` (floating controls above sticker, drag/drop, keyboard a11y, data-testids)
- `src/components/LetterEditor.tsx` (letter sheet tokens, strict paper token isolation, data-testids, ENVELOPE TO: label)
- `src/styles/index.css` (chrome vs paper token separation, contrast fixes, app-shell grid, mobile tabs)
- `index.html` (font fallbacks, preloads)
- `playwright.config.ts` (test configuration)
- `tests/e2e/*.spec.ts` (test suite)
