# Khat & Co.
> **खत · letters for the people you miss**  
> A free, no-login web app where people write weekly digital letters on tactile stationery and send them as links that open like an animated airmail envelope with a wax seal.

---

## Brand Identity & Aesthetic

- **Name:** Khat & Co. (`khat-and-co`)
- **Logo:** Exact match to the brand lockup — a tilted cream envelope with an airmail-dashed edge (rose dashes on top, navy dashes on bottom), a center rose wax seal stamped with a heart, and three rose hearts floating to the top-right, accompanied by the wordmark in *Instrument Serif* (with the `&` in rose italic) and the tagline *"खत · letters for the people you miss"*.
- **Palette Tokens:**
  - Ink Navy: `#1F2340`
  - Paper Cream: `#F6EFE3`
  - Vintage Rose: `#B4455A`
  - Soft Rose: `#D98A9A` & `#E9B7C1`
  - Airmail Blue: `#3E5C8A`
- **Atmosphere:** Designed to feel like sitting at a warm wooden desk at night with authentic stationery, soft natural shadows, and thoughtful pacing.

---

## Key Features

### 1. Old-School Letter Editor & Ruled Paper Alignment
- Ruled lines mathematically calculated to match each font's exact line-height (e.g., 38px for Caveat, 46px for Kalam, 48px for Amita). Text sits comfortably on top of every rule line without drift.
- Auto-expanding writing surface with date, recipient header, greeting, body, sign-off, and sender name.
- Input font size is strictly clamped to $\ge 16\text{px}$ on mobile devices to prevent automatic iOS Safari viewport zoom.
- Toggle between Ruled lines and Plain blank paper.

### 2. Stationery Paper Gallery (9 Templates)
1. **Airmail Classic (डाक खत):** Cream paper with vintage red & blue airmail borders.
2. **Blush Romance (गुलाबी खत):** Soft rose-tinted vellum with delicate pink ruling.
3. **Midnight Stars (चाँदनी रात):** Deep ink-navy sky paper with golden starlight rulings and automatic moonlight ink swatches.
4. **Pressed Sage (हरी पत्तियाँ):** Botanical leaf paper with muted forest accents.
5. **Lavender Mist (लैवेंडर सुकून):** Lavender stationery with plum ruled lines.
6. **Earthy Kraft (खादी कागज़):** Warm textured raw kraft paper with stitched borders.
7. **Vintage Parchment (पुरानी चिट्ठी):** Antique manuscript paper with deckled borders.
8. **Dusk Airmail (सांझ की चिट्ठी):** Twilight slate paper with ocean blue accents.
9. **Warm Chai (मिट्टी की खुशबू):** Earthen cup hue with cinnamon spice lines.

### 3. Handwriting & Bilingual Devanagari Typography
- Fonts loaded: `Caveat`, `Dancing Script`, `Reenie Beanie`, `Kalam`, and `Amita`.
- **Bilingual Fallback:** `Kalam` is integrated as a fallback in every Latin font stack (`font-family: 'Caveat', 'Kalam', cursive;`), ensuring mixed Hindi-English letters or pure Hindi letters always render in a handwritten style.
- Taller line-heights are specifically provisioned for Devanagari to accommodate matras and vowel markers without clipping.

### 4. 40+ Inline SVG Stickers & Interaction Engine
- Over 40 bespoke inline SVGs across 4 categories:
  - **Hearts & Seals:** Wax seal with heart, botanical wax seal, classic heart, twin hearts, ribbon heart, sparkling heart, Cupid's arrow, airmail envelope.
  - **Stamps & Postmarks:** Airmail dove stamp, Taj Mahal stamp, botanical fern stamp, vintage rose stamp, mountain sunrise stamp, today's date postmark (dynamically formatted), wavy cancellation mark, Par Avion / Priority label, carrier pigeon.
  - **Sky, Garden & Tape:** Golden sparkles, constellation cluster, crescent moon, raincloud, pastel rainbow, sunshine, flutter butterfly, blooming rose, daisy, sunflower, eucalyptus leaf sprig, rose washi tape, airmail washi tape, graph grid washi tape.
  - **Little Things & Words:** Steaming chai cup, antique key, sleeping cat, sweet cherries, ribbon bow, paper plane, and handwritten labels (*"miss you"*, *"write back soon"*, *"with all my love"*, and Hindi labels *"तुम्हारी याद"*, *"प्यार से"*).
- **Interaction Engine:** Drag with Pointer Events (`touch-action: none`, `setPointerCapture`), 60fps direct transform updates during movement, relative coordinates ($1\text{ unit} = 1\%\text{ of letter width}$) so placement is completely responsive across mobile phones, wide desktop monitors, and picture exports.
- **Controls & Accessibility:** Rotate, scale, duplicate, bring to front, delete, and keyboard navigation (Arrow keys nudge, Shift+Arrows for $5\times$, Delete/Backspace removes, Esc deselects).

### 5. Animated Envelope Reading View (Recipient Flow)
- Full-screen airmail envelope addressed *"For &lt;recipient&gt;"* and *"from &lt;sender&gt;"*.
- Pulsing rose wax seal with heart motif.
- 3D flap opening animation (`perspective: 1200px`, `rotateX(-180deg)`), letter card slide-out, and smooth transition to the full read-only stationery sheet.
- Respects `prefers-reduced-motion` for instant accessibility.
- Recipient actions:
  - **Write Back:** Prepares a reply addressed to the sender on matching stationery and clears the URL hash.
  - **Read Again:** Folds back and replays the opening sequence.
  - **Save Picture:** High-resolution 3x PNG download.
  - **Draft Safety:** Opening a received link *never* overwrites the recipient's own local draft; drafts are only replaced if the recipient confirms "Write Back".

### 6. Sharing & Security
- URL hash encoding: `#l=<compressed_string>` using LZString compression.
- Security-first sanitization:
  - All text content rendered via React JSX text children (strictly no `dangerouslySetInnerHTML`).
  - Ink colors validated against a hex regex (`#^[0-9A-Fa-f]{3,8}$`).
  - Sticker IDs strictly whitelisted against the SVG registry.
  - Coordinates clamped $[0, 100]$, scale clamped $[0.4, 3.0]$, rotation clamped $[-360, 360]$.
  - Text lengths capped (body: 6,000 chars; headers: 100 chars; stickers: max 40).

### 7. Bilingual Weekly Writing Prompts
- Inspiration drawer featuring 10 curated weekly prompts for long-distance partners, friends, and family in both English and Hindi.
- Shuffle button to cycle through prompts. Prompts never inject unwanted text into the user's letter.

---

## Project Structure

```
d:/Khat & Co/
├── public/
│   ├── khat-logo.svg       # Full brand lockup (envelope + wordmark + tagline)
│   └── khat-mark.svg       # Brand icon only (tilted envelope with wax seal & hearts)
├── src/
│   ├── components/
│   │   ├── EnvelopeModal.tsx   # 3D flap envelope unsealing and recipient reader
│   │   ├── FontPicker.tsx      # Handwriting font selector & ink swatches
│   │   ├── Header.tsx          # Brand header with logo on left and actions on right
│   │   ├── LetterEditor.tsx    # Stationery sheet, ruled line math, and autosaving inputs
│   │   ├── PromptModal.tsx     # Bilingual English & Hindi writing prompts
│   │   ├── StickerCanvas.tsx   # Draggable relative sticker engine with floating toolbar
│   │   ├── StickerDrawer.tsx   # Categorized stamp & sticker collection
│   │   └── TemplatePicker.tsx  # Paper stationery gallery
│   ├── constants/
│   │   ├── fonts.ts            # Font configurations, Devanagari fallbacks, ink palettes
│   │   ├── prompts.ts          # Bilingual prompt registry
│   │   ├── stickers.tsx        # 40+ inline SVG sticker definitions
│   │   └── templates.ts        # 9 paper templates and styling tokens
│   ├── styles/
│   │   └── index.css           # Bootstrap overrides, design tokens, responsive typography
│   ├── types/
│   │   └── letter.ts           # TypeScript interfaces for letters, stickers, templates
│   ├── utils/
│   │   ├── codec.ts            # LZString URL hash encoder/decoder with strict validation
│   │   ├── export.ts           # Dynamic high-res PNG export with html-to-image
│   │   └── storage.ts          # LocalStorage draft autosave (khat-and-co:draft)
│   ├── App.tsx                 # Root application controller
│   └── main.tsx                # React 18 entrypoint
├── index.html                  # HTML5 semantic structure, font preconnects, SEO metadata
├── package.json                # Project dependencies & scripts
├── tsconfig.json               # TypeScript configuration
├── vercel.json                 # Vercel deployment configuration
├── vite.config.ts              # Vite configuration
└── README.md                   # Documentation
```

---

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Preview production build:**
   ```bash
   npm run preview
   ```

---

## Deploying to Vercel

### Option 1: Vercel CLI
```bash
npm install -g vercel
vercel
```
Select the default settings. Vite is automatically detected, using `dist` as the output directory.

### Option 2: Git Integration
1. Push this repository to GitHub or GitLab.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import the repository.
4. Verify:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Click **"Deploy"**.

---

## Design Decisions & Tradeoffs

1. **Vite + React + TypeScript over Next.js SSR:**  
   Because Khat & Co. is a 100% client-side, zero-database application utilizing URL hash fragments (`#l=...`) and localStorage autosave, Vite with pure client-side React provides instant load times, zero hydration mismatch issues with window/localStorage, and a lightweight deployment bundle with no server overhead.
2. **LZString Hash Compression vs Server Database:**  
   By compressing the minified letter state into the URL hash, users can send permanent letters without creating an account or storing sensitive personal correspondence in an external database. Letters remain strictly peer-to-peer and private.
3. **Dynamic Import for Image Export:**  
   The `html-to-image` library is dynamically imported only when the user taps "Save as picture", reducing the initial bundle size and ensuring fast Lighthouse performance.
4. **Relative (Percentage-Based) Sticker Coordinates:**  
   Storing coordinates as percentage units ($1\text{ unit} = 1\%\text{ of letter width}$) ensures that stickers placed on a wide desktop screen render in the identical relative position when opened on a narrow mobile device or rendered in a 3x picture export.
