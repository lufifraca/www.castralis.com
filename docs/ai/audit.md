# Castralis Site Audit — 2026-07-04

**Scope:** full read-only audit of `index.html`, `css/styles.css` (537 lines), `js/main.js` (897 lines), `assets/`, `README.md`. No changes made.

## Framework / build setup

- **No framework, no build step, no package manager.** Hand-authored static site: one HTML page, one CSS file, one vanilla-JS IIFE. No `package.json`, no lockfile, no bundler, no CI.
- **Hosting:** GitHub Pages with `CNAME` → apex `castralis.com` (repo named `www.castralis.com`). No server config possible → no real HTTP security headers, only `<meta>`-level mitigations.
- **Runtime dependencies (all CDN, jsdelivr):** `three@0.146.0`, `three/examples/js/environments/RoomEnvironment.js`, `gsap@3.12.5`, `ScrollTrigger`. Fonts from Google Fonts.
- **Graceful-degradation design:** GSAP-optional scroll engines with raw-scroll fallbacks, WebGL → SVG-schematic fallback, extensive `prefers-reduced-motion` handling. These are genuine strengths — but they don't cover the no-JS / JS-crash case (finding #1).

---

## Prioritized findings

### 1. [structure] HIGH — Site is a black screen if JS fails or is disabled
- **Files:** `index.html:2,18` · `css/styles.css:47,100-104` · `js/main.js:108,124-133`
- **Impact:** The opaque fixed boot overlay (`.boot`, z-index 1000) and `html[data-state="boot"]{overflow:hidden}` are only removed by JS; with JS off, blocked, or any uncaught exception at module scope (e.g. inside `buildNode()` at `main.js:108`, which runs before `start()`), the entire page is an unscrollable black void. README's "the fold is never blank" claim only covers GSAP failure, not this. Single point of failure for the whole site.

### 2. [structure] HIGH — The primary CTA form submits nowhere; data is silently discarded
- **Files:** `js/main.js:372-391` · `index.html:330-363`
- **Impact:** `#dossierForm` has no `action`/endpoint; submit is `preventDefault` + a 1.6 s `setTimeout` that fakes "TRANSMITTING OVER SECURE CHANNEL…" then "CREDENTIALS QUEUED". Every lead the site exists to capture is lost, and the "SECURE CHANNEL // ENCRYPTION ACTIVE" copy asserts security properties that don't exist.

### 3. [security] HIGH — CDN scripts loaded without Subresource Integrity or CSP
- **Files:** `index.html:382-385`
- **Impact:** Four third-party `<script>` tags (three.js ×2, GSAP ×2) have no `integrity`/`crossorigin` attributes and there is no CSP `<meta>`; a jsdelivr/package compromise executes arbitrary script on castralis.com (supply-chain risk, and the form collects PII in finding #2's eventual real implementation).

### 4. [perf] MEDIUM — ~700 KB of JS always downloaded, much of it never used
- **Files:** `index.html:382-385` · `js/main.js:797-805`
- **Impact:** three.min.js (~600 KB) + GSAP load unconditionally, but `initTriad()` skips 3D entirely on `<820px` viewports, reduced-motion, or no-WebGL — mobile users pay the full download for nothing; `RoomEnvironment.js` is loaded and **never referenced anywhere** in `main.js` (pure dead weight).

### 5. [structure] MEDIUM — Large dead/orphaned code layer: JS and CSS target markup that no longer exists
- **Files:** `js/main.js:16-108` (`buildNode` → `#nodeSvg`, absent), `js/main.js:164-225` (`stageEngine` — **defined, never called**) · `css/styles.css:188-294` (`.stage__*`, `.rig`, `.node`, `.hud__*`, `.readout`, `.panel`, `.schem__sticky`, `.schem__steps`, `.call` — no matching HTML)
- **Impact:** ~250 lines of stale code from a replaced "pinned stage/schematic" design invite divergent edits and mask real bugs; HTML/CSS/JS have already drifted (fragile by accretion). Also cosmetic: duplicated `ACT 03 — MODULES` comment header at `styles.css:374-379`.

### 6. [a11y] MEDIUM — Form errors not programmatically associated with inputs
- **Files:** `index.html:332-356` · `js/main.js:354-370`
- **Impact:** Validation messages live in bare `.field__err` spans — no `aria-invalid`, no `id`/`aria-describedby` link — so screen-reader users hear only "VALIDATION FAILED" via the status region, never which field is wrong or why.

### 7. [a11y] MEDIUM — Pervasive tiny, low-contrast text
- **Files:** `css/styles.css:24-25` (`--muted:#6a7c97`, `--faint:#46566f`) used at 9–11 px throughout (`.ident`, `.statusbar`, `.rail__ticks`, `.schem__hint`, `.foot`, `.hud__corner`, tags/kickers)
- **Impact:** `--faint` on `#060912` is ≈2.7:1 and `--muted` ≈4.9:1 at sub-12px sizes — fails WCAG 1.4.3 for the HUD chrome, footer, and status bar (much of it is `aria-hidden` decoration, but visible-low-vision users still read it).

### 8. [seo] MEDIUM — No social/canonical/discovery metadata at all
- **Files:** `index.html:3-14` · repo root
- **Impact:** Missing Open Graph + Twitter card tags (shares render as bare links), no `rel=canonical` (www vs apex ambiguity with the CNAME), no `robots.txt`, no `sitemap.xml`, no JSON-LD Organization schema — weak SERP/share presentation for a company whose site *is* its credibility.

### 9. [a11y] LOW — Decrypt effect rewrites heading text with random cipher characters
- **Files:** `js/main.js:848-877`
- **Impact:** `decryptText()` replaces `innerHTML` of every h2/eyebrow per animation frame with garbage glyphs (`#%<>*+=·`); screen readers without reduced-motion set can announce scrambled text, and mid-animation DOM churn kills text selection. (Reduced-motion is respected — the gap is AT users who don't set that OS flag.)

### 10. [perf] LOW — Always-on animation work on every page view
- **Files:** `js/main.js:810-843` (`gridFx` full-viewport canvas rAF, only paused on tab-hide) · `js/main.js:334-345` (`telemetryTick` 1.4 s interval, forever) · `css/styles.css:126-130,471` (`backdrop-filter: blur` on two fixed bars)
- **Impact:** Continuous compositing + script work regardless of scroll position drains battery on laptops/phones; the 3D loop and mesh canvas are correctly IO-gated but these are not.

### 11. [a11y] LOW — No skip link; keyboard/AT boot experience unpolished
- **Files:** `index.html:15-74`
- **Impact:** No skip-to-content link before the fixed header; the boot overlay is `aria-hidden="true"` while being the only visible content for ~2 s (AT users get silence, sighted users get a progress bar).

### 12. [structure] LOW — Assorted small correctness frays
- **Files:** `js/main.js:389` (`readonly` set on a `<select>` — has no effect, field stays editable after "submit"), `js/main.js:490,798` (`window.innerWidth < 820` sampled once at init — rotate/resize never re-evaluates the 3D-vs-static choice), `js/main.js:464` (explode geometry constants coupled to `buildSchematic` only by a "must track" comment — magic-number duplication also mirrored in `initPraesidium3D` ranges at `:749`)
- **Impact:** Each is minor alone; together they are the places a future edit breaks something silently.

### 13. [structure] LOW — Pinned legacy three.js with removed-upstream module path
- **Files:** `index.html:382-383`
- **Impact:** `three@0.146.0` (Nov 2022) uses the `examples/js/` UMD builds that were deleted from three r148+; `renderer.outputEncoding` (`main.js:624`) is likewise removed in modern three — any dependency bump requires a rewrite, so the pin is load-bearing and undocumented.

### 14. [seo] LOW — Favicon is SVG-data-URI only; no touch icons
- **Files:** `index.html:13`
- **Impact:** Older Safari and some crawlers/share surfaces ignore SVG data-URI favicons; no `favicon.ico` fallback or `apple-touch-icon` → blank icons in bookmarks/home-screen/SERP.

### 15. [security] LOW — Third-party requests leak visitor data (fonts + CDN)
- **Files:** `index.html:9-11,382-385`
- **Impact:** Every visit pings Google Fonts and jsdelivr (IP + referrer) — a GDPR nicety and a resilience issue (fonts/JS die if either CDN is blocked, e.g. corporate networks of the exact "institutional" audience the site targets). Self-hosting removes both.

---

## Structural-fragility summary

1. **JS is a single point of total failure** (finding #1) — the boot overlay makes the site's availability contingent on one IIFE executing cleanly to `boot()`.
2. **Three copies of the "explode" choreography** (3D engine, SVG fallback engine, CSS static states) share constants only by convention — finding #12 — so visual changes must be made in 2–3 places.
3. **HTML has already drifted from JS/CSS once** (finding #5) and the dead layer was left behind; the next redesign will compound it.
4. **The dependency pin is load-bearing** (finding #13); there is no lockfile or vendored copy, so the site's behavior depends on jsdelivr continuing to serve a 2022 build.
5. **The form is scaffolding, not a feature** (finding #2) — the site's one conversion path needs a backend (Formspree/worker/etc.) before launch messaging can honestly say "secure channel".

## What's already good (don't regress)

- Real `prefers-reduced-motion` handling across every effect, with static equivalents.
- WebGL → SVG fallback and GSAP → raw-scroll fallback paths.
- Semantic landmarks (`header/nav/main/section/footer`), labeled form fields, `role="status"`/`aria-live` on form feedback, single `h1`, sane heading order.
- All meaningful content is server-rendered HTML — crawlable and indexable despite the heavy JS presentation layer.
