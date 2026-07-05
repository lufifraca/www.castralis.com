# Castralis Design System — v0.1 (proposal)

Derived from the shipped site (`css/styles.css`, `js/main.js`) — this codifies what already
exists, fixes the audit findings at the token level, and defines the contract every
componentized piece must meet. Namespace: **`cx-`** (custom properties `--cx-*`, custom
elements `<cx-*>`).

Status: proposal. Nothing in the live site has been changed. One reference component exists:
[`components/cx-nav.js`](../../components/cx-nav.js).

---

## 1. Design tokens

Tokens are CSS custom properties declared on `:root` in a future `css/tokens.css`. Until that
file exists, components consume tokens through a **three-step fallback chain** so they work in
the current site unmodified:

```css
color: var(--cx-ink, var(--ink, #dde6f2));  /* new token → legacy var → literal */
```

### 1.1 Color

| Token | Value | Legacy alias | Role |
|---|---|---|---|
| `--cx-surface-void` | `#03060d` | `--void` | Deepest layer: boot, statusbar wells |
| `--cx-surface-0` | `#060912` | `--bg` | Page background |
| `--cx-surface-1` | `#0a1020` | `--bg-2` | Section alternation |
| `--cx-surface-2` | `#0c1322` | `--panel` | Cards, panels, form shell |
| `--cx-surface-3` | `#101a2e` | `--panel-2` | Hover/linked panel state |
| `--cx-surface-4` | `#13203a` | `--elev` | Highest elevation |
| `--cx-line-0` | `rgba(140,170,210,.10)` | `--border-soft` | Hairlines, card borders at rest |
| `--cx-line-1` | `rgba(140,170,210,.16)` | `--border` | Emphasized borders, hover |
| `--cx-line-grid` | `rgba(122,162,214,.07)` | `--grid` | Blueprint grid |
| `--cx-ink` | `#dde6f2` | `--ink` | Primary text |
| `--cx-ink-2` | `#9fb0c8` | `--ink-2` | Body/secondary text |
| `--cx-ink-muted` | `#7d8fa8` → **`#8494ad`** | `--muted` | Labels, chrome text — **lightened** to pass 4.5:1 at ≤12px (audit #7) |
| `--cx-ink-faint` | `#46566f` | `--faint` | **Decoration only.** Never on readable text; allowed only inside `aria-hidden` ornament |
| `--cx-accent` | `#e2a33e` | `--gold` | The crystal. CTAs, active states, keywords |
| `--cx-accent-hi` | `#f3cd7c` | `--gold-hi` | Accent highlight/gradient end |
| `--cx-accent-deep` | `#a96f1c` | `--gold-deep` | Accent gradient start |
| `--cx-accent-glow` | `rgba(226,163,62,.45)` | `--gold-glow` | Glows/shadows only |
| `--cx-on-accent` | `#0a0a0a` | *(hardcoded)* | Text on gold fills |
| `--cx-status-ok` | `#63c98a` | `--ok` | OK/live |
| `--cx-status-alert` | `#d9542b` | `--alert` | Errors, validation |
| `--cx-status-info` | `#5ec6d2` | `--cyan` | Secondary telemetry accent |

Rules: color literals are **banned in component CSS** — tokens only. Gold is scarce: one
accent element per composition (active nav item, one CTA, one keyword).

### 1.2 Spacing

4px base scale + two fluid tokens (already the site's de-facto rhythm):

| Token | Value | Token | Value |
|---|---|---|---|
| `--cx-s1` | `4px` | `--cx-s6` | `32px` |
| `--cx-s2` | `8px` | `--cx-s7` | `48px` |
| `--cx-s3` | `12px` | `--cx-s8` | `64px` |
| `--cx-s4` | `16px` | `--cx-s9` | `96px` |
| `--cx-s5` | `24px` | `--cx-s10` | `128px` |

| Fluid token | Value | Use |
|---|---|---|
| `--cx-gutter` | `clamp(20px, 5vw, 64px)` | Horizontal page inset (used 12× today) |
| `--cx-section-pad` | `clamp(90px, 14vh, 180px)` | Vertical rhythm between acts |
| `--cx-maxw` | `1280px` | Content max width |

### 1.3 Typography

| Token | Value |
|---|---|
| `--cx-font-display` | `"Space Grotesk", system-ui, sans-serif` |
| `--cx-font-mono` | `"JetBrains Mono", ui-monospace, monospace` |

Type roles (clamp values taken from the live site; **12px floor** is new — audit #7):

| Role | Font | Size | Tracking | Use |
|---|---|---|---|---|
| `display-1` | display 600 | `clamp(46px, 9vw, 150px)`, lh .96 | `-.02em` | Hero only |
| `heading-1` | display 600 | `clamp(26px, 4vw, 48px)`, lh 1.04 | `-.01em` | Section h2 |
| `heading-2` | display 700 | `clamp(28px, 3.2vw, 40px)` | `.04em` | Module names, xcap titles |
| `heading-3` | display 600 | `19px` | — | Card h3 |
| `body` | mono 400 | `14px`, lh 1.65 | — | Paragraphs |
| `body-sm` | mono 400 | `12.5–13.5px` | — | Card body, spec dd |
| `label` | mono 400 | `12px` min | `.16–.22em` | Eyebrows, form labels, chrome |
| `micro` | mono 400 | `12px` min, `--cx-ink-muted`+ | `.14em` | Statusbar, ident, captions — **9–11px sizes are deprecated**; below 12px only inside `aria-hidden` ornament |

Casing: author text in sentence case in HTML; apply `text-transform: uppercase` in CSS
(screen-reader friendliness; today the caps are hardcoded in markup).

### 1.4 Motion

| Token | Value | Use |
|---|---|---|
| `--cx-ease` | `cubic-bezier(.22,.61,.36,1)` | The only easing curve |
| `--cx-dur-1` | `.25s` | Hovers, color/border |
| `--cx-dur-2` | `.4s` | State changes (stuck, hot, linked) |
| `--cx-dur-3` | `.7s` | Reveals |
| `--cx-dur-4` | `.95s` | Hero entrance |

**Reduced-motion contract:** every component ships a `prefers-reduced-motion: reduce` block
that disables its transitions/animations and renders its final/static state. This is already
the site's strength — it becomes mandatory per component rather than one global override.

### 1.5 Z-index scale

| Token | Value | Layer |
|---|---|---|
| `--cx-z-fx` | `3` | Background canvases (gridfx) |
| `--cx-z-content` | `2 (relative)` | Acts |
| `--cx-z-scanline` | `40` | Global vignette/scanline overlay |
| `--cx-z-hud` | `50–55` | Ident, rail |
| `--cx-z-chrome` | `60` | Nav, statusbar |
| `--cx-z-modal` | `1000` | Boot overlay |

### 1.6 Breakpoints

| Token | Value | Meaning |
|---|---|---|
| `--bp-sm` | `520px` | Phone tweaks |
| `--bp-md` | `820px` | Pinned engines un-pin; nav collapses; grids → 1col |
| `--bp-lg` | `1024px` | HUD (rail/ident) hidden; grids → 2col |

---

## 2. Core components & variants

### Primitives

| Component | Variants | States | Notes / a11y contract |
|---|---|---|---|
| **Button / CTA** (`.submit`, `.nav__key`) | `key` (gold outline→fill), `solid` (gold fill→outline), `link` (underline) | hover (scan-sweep), focus-visible, loading (spinner), disabled | Focus ring `2px --cx-accent`, offset 3px. Loading sets `aria-busy` |
| **Eyebrow** (`.sec-head__sub`) | gold / muted | — | `label` role type; always paired with a heading |
| **SectionHead** | default, centered | — | Eyebrow + h2; h2 max-width `24ch` |
| **StatusDot** (`.dot`, `.statusbar__live`) | ok, accent, alert | pulsing / static (reduced-motion) | `aria-hidden` always — pure ornament |
| **Meter** (`.stage__meter`) | — | 0–100% fill | `aria-hidden`; driven by scroll engines |
| **Field** (`.field`) | text, email, select | focus, invalid, readonly | Label `for`+`id`; error span gets `id`, input gets `aria-describedby` + `aria-invalid` (fixes audit #6) |
| **Card** (`.mod`, `.aud`) | `module` (spec card w/ header rule), `audience` (letter badge) | rest, hover (lift + top gold rule), revealed | `<article>` + h3; hover lift disabled under reduced-motion |
| **SpecList** (`.spec`, `.lexicon`) | spec (dt/dd stack), lexicon (2-col linked grid) | `is-linked` (lexicon) | Always a real `<dl>` |
| **TelemetryPanel** (`.telem`) | — | ticking / static | Jitter loop is decorative; values must also read correctly frozen |

### Composites

| Component | Variants | States | Notes |
|---|---|---|---|
| **Nav / Chrome** → `<cx-nav>` | desktop row, mobile disclosure | `stuck`, `open`, per-link `aria-current` | **Reference implementation — see §4** |
| **Rail** (`.rail`) | — | active tick | `aria-hidden`; mirrors nav's section events (`cx-nav:section`) instead of running its own scroll probe |
| **Statusbar** | — | live | `aria-hidden`; hidden < 820px unless content fits |
| **BootOverlay** | full, reduced-motion (instant) | booting, done | **Must fail open** (audit #1): overlay only renders when JS runs — inject it from JS, never ship it in static HTML |
| **Hero** | — | pre-reveal, revealed | CSS-only entrance gated on `.js` class (keep) |
| **DoctrineSplit** | plan-left / plan-right | drawn / static | Castrum SVG is `aria-hidden` |
| **TriadStage** | webgl, svg-fallback, static (<820px / reduced-motion) | scroll progress 0–1 | One source of truth for explode ranges — shared constants module (audit #12) |
| **Ledger** | — | — | Compare rows; arrows `aria-hidden`, add visually-hidden "versus" text |
| **GatewayForm** | — | idle, validating, submitting, success, error | Needs a real endpoint before "secure channel" copy is honest (audit #2) |
| **Footer** | — | — | — |

---

## 3. Information architecture

Single-page dossier. Section ids are the URL contract (deep-linkable, used by nav, rail,
statusbar — do not rename without redirect mapping):

```
/                     castralis.com  (CNAME apex)
└── index.html
    ├── #identity   01 IDENTITY   — hero manifesto            (h1)
    ├── #doctrine   —  DOCTRINE   — etymology, castrum plan   (h2)   * not in nav; rail-only? today: neither
    ├── #triad      02 CONSTRAINTS — exploded triad: Power/Land/Latency (h2 → h3×3)
    ├── #modules    03 ECOSYSTEM  — Praesidium / Limes / Principia cards (h2 → h3×3)
    ├── #capital    04 CAPITAL    — ledger + audiences A/B/C  (h2 → h3×3)
    └── #gateway    05 GATEWAY    — request form              (h2)
```

- **Nav exposes:** Systems `#triad` · Infrastructure Capital `#capital` · Specifications
  `#modules` · **Portal Key** `#gateway` (CTA variant). Note nav order today ≠ page order
  (capital before modules) — keep or fix consciously; the system doesn't care, the IA doc
  should record the decision.
- **Rail exposes:** all five numbered sections. Doctrine intentionally unnumbered (interstitial).
- **Heading outline:** exactly one `h1` (hero); every section one `h2`; cards `h3`. No skips.
- **Future pages** (when they exist): `/dossier/…` white papers gated behind the portal;
  keep the flat fragment IA until then — no need for a router.

### Target file architecture (rollout, no build step required)

```
css/tokens.css          :root --cx-* declarations (single source of truth)
css/base.css            reset, body, selection, grid-bg, utilities
components/cx-nav.js    ✅ reference (this proposal)
components/cx-card.js   module/audience card
components/cx-field.js  form field + validation wiring
components/cx-boot.js   JS-injected boot overlay (fail-open)
js/engines/…            scroll/3D engines (not components — page-level behavior)
index.html              markup + <script type="module"> per component
```

Rollout order: **nav → tokens.css → boot (fail-open) → field/form → cards → engines.**
Each step is one component file + a small index.html swap; the legacy CSS keeps working
throughout because components fall back to legacy vars.

---

## 4. Component standard (the contract)

Every `cx-*` component:

1. **One file** under `components/`, self-registering custom element, no dependencies.
2. **Shadow DOM** for structure/skin; **light DOM (slots) for content** — so content is
   server-rendered, crawlable, and visible even if the component never upgrades
   (progressive enhancement; complements fixing audit #1).
3. **Tokens only**, consumed via the fallback chain (`--cx-*` → legacy var → literal).
4. **States as host attributes** (`[stuck]`, `[open]`) — stylable and inspectable.
5. **`part=` on every structural node** for outside theming.
6. **Events** namespaced `cx-<name>:<event>` with `detail`, `bubbles: true`.
7. **A11y checklist:** focus-visible ring on every interactive; `aria-expanded`/
   `aria-controls`/`aria-current` where applicable; Escape closes overlays and restores
   focus; reduced-motion block; no text below 12px.
8. **No-JS story documented** in the file header (what renders before/without upgrade).

Recommended global rule once components roll out:

```css
/* pre-upgrade: slotted nav links render as a plain visible link row */
cx-nav:not(:defined) { display: block; padding: 18px var(--cx-gutter, 24px); }
cx-nav:not(:defined) a { margin-right: 20px; color: inherit; }
```

---

## 5. Reference component: `<cx-nav>`

`components/cx-nav.js` — chosen because it's the hardest small surface: fixed chrome +
stuck state, scroll-spy with `aria-current`, a **mobile disclosure menu (the current site
simply hides nav links below 820px)**, skip-to-content link (audit #11), CTA variant, full
keyboard/reduced-motion support.

Usage (what the eventual index.html swap looks like — **not applied**):

```html
<cx-nav skip-target="#dossier" brand-href="#identity">
  <span slot="brand"><!-- existing brand SVG + wordmark --></span>
  <a href="#triad">Systems</a>
  <a href="#capital">Infrastructure Capital</a>
  <a href="#modules">Specifications</a>
  <a href="#gateway" data-variant="key">Portal Key</a>
</cx-nav>
<script src="components/cx-nav.js" defer></script>
```

The rail and statusbar can then subscribe to its `cx-nav:section` event instead of running
their own scroll probes (one scroll listener for the whole chrome).
