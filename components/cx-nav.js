/* ============================================================
   <cx-nav> — CASTRALIS design-system reference component
   docs/ai/design-system.md §4–5

   Fixed top chrome: brand + primary nav + skip link.
   - [stuck]        host attr, set past 40px scroll (frosted bar)
   - aria-current   scroll-spy on slotted #-links (probe line @38vh)
   - mobile         <820px: disclosure menu (button + dropdown),
                    Esc closes + restores focus, outside-click closes
   - variant        <a data-variant="key"> renders as the gold CTA
   - events         cx-nav:section {detail:{href}} on active change

   No-JS story: links live in light DOM, so before/without upgrade
   they render as a plain visible link row (style via
   `cx-nav:not(:defined)` in global CSS).

   Usage:
     <cx-nav skip-target="#dossier" brand-href="#identity">
       <span slot="brand">…logo…</span>
       <a href="#triad">Systems</a>
       <a href="#gateway" data-variant="key">Portal Key</a>
     </cx-nav>
   ============================================================ */
(() => {
  "use strict";
  if (customElements.get("cx-nav")) return;

  const CSS = `
    :host{
      /* token intake — new token → legacy site var → literal (contract §4.3) */
      --_ink:      var(--cx-ink,         var(--ink,         #dde6f2));
      --_muted:    var(--cx-ink-muted,   var(--muted,       #8494ad));
      --_accent:   var(--cx-accent,      var(--gold,        #e2a33e));
      --_on-accent:var(--cx-on-accent,   #0a0a0a);
      --_panel:    var(--cx-surface-2,   var(--panel,       #0c1322));
      --_line0:    var(--cx-line-0,      var(--border-soft, rgba(140,170,210,.10)));
      --_line1:    var(--cx-line-1,      var(--border,      rgba(140,170,210,.16)));
      --_gutter:   var(--cx-gutter,      clamp(20px, 5vw, 64px));
      --_ease:     var(--cx-ease,        cubic-bezier(.22,.61,.36,1));
      --_dur1:     var(--cx-dur-1,       .25s);
      --_dur2:     var(--cx-dur-2,       .4s);
      --_disp:     var(--cx-font-display,"Space Grotesk", system-ui, sans-serif);
      --_mono:     var(--cx-font-mono,   "JetBrains Mono", ui-monospace, monospace);

      position:fixed; top:0; left:0; right:0;
      z-index:var(--cx-z-chrome, 60);
      font-family:var(--_mono); color:var(--_ink);
      display:block;
    }

    /* ---- skip link: first focusable on the page, visible on focus ---- */
    .skip{
      position:absolute; left:var(--_gutter); top:-52px; z-index:2;
      padding:10px 16px; background:var(--_accent); color:var(--_on-accent);
      font:700 12px/1 var(--_mono); letter-spacing:.12em; text-transform:uppercase;
      text-decoration:none; transition:top var(--_dur1) var(--_ease);
    }
    .skip:focus-visible{ top:10px; outline:2px solid var(--_ink); outline-offset:2px; }

    /* ---- bar ---- */
    .bar{
      display:flex; align-items:center; justify-content:space-between; gap:24px;
      padding:18px var(--_gutter);
      border-bottom:1px solid transparent;
      transition:background var(--_dur2) var(--_ease),
                 border-color var(--_dur2), padding var(--_dur2);
    }
    :host([stuck]) .bar{
      background:linear-gradient(180deg, rgba(6,9,18,.92), rgba(6,9,18,.55));
      backdrop-filter:blur(10px);
      border-bottom-color:var(--_line0);
      padding-top:12px; padding-bottom:12px;
    }

    .brand{ display:flex; align-items:center; gap:12px; color:var(--_ink); text-decoration:none; }
    .brand:focus-visible{ outline:2px solid var(--_accent); outline-offset:4px; }
    .brand__type{ font-family:var(--_disp); font-weight:700; letter-spacing:.32em; font-size:16px; }
    ::slotted([slot="brand"]){ display:flex; align-items:center; gap:12px; }

    /* ---- links (slotted) ---- */
    .menu{ display:flex; align-items:center; gap:26px; }
    ::slotted(a){
      color:var(--_muted);
      font-size:12px; letter-spacing:.18em; text-transform:uppercase;
      padding:6px 0;
      text-decoration:underline; text-decoration-color:transparent;
      text-underline-offset:7px; text-decoration-thickness:1px;
      transition:color var(--_dur1), text-decoration-color var(--_dur1);
    }
    ::slotted(a:hover){ color:var(--_ink); text-decoration-color:var(--_accent); }
    ::slotted(a:focus-visible){ outline:2px solid var(--_accent); outline-offset:4px; color:var(--_ink); }
    ::slotted(a[aria-current="true"]){ color:var(--_accent); text-decoration-color:var(--_accent); }

    /* variant: key — the gold CTA */
    ::slotted(a[data-variant="key"]){
      color:var(--_accent); border:1px solid var(--_line1); padding:7px 14px;
      text-decoration:none;
      transition:background var(--_dur1), color var(--_dur1), border-color var(--_dur1);
    }
    ::slotted(a[data-variant="key"]:hover){
      background:var(--_accent); color:var(--_on-accent); border-color:var(--_accent);
    }

    /* ---- mobile disclosure ---- */
    .toggle{
      display:none; align-items:center; gap:10px;
      background:none; border:1px solid var(--_line1); color:var(--_ink);
      font:700 12px/1 var(--_mono); letter-spacing:.18em; text-transform:uppercase;
      padding:9px 14px; cursor:pointer;
    }
    .toggle:focus-visible{ outline:2px solid var(--_accent); outline-offset:3px; }
    .toggle__ico{ position:relative; width:14px; height:10px; }
    .toggle__ico::before, .toggle__ico::after{
      content:""; position:absolute; left:0; right:0; height:2px; background:currentColor;
      transition:transform var(--_dur1) var(--_ease), top var(--_dur1) var(--_ease);
    }
    .toggle__ico::before{ top:0 }
    .toggle__ico::after{ top:8px }
    :host([open]) .toggle__ico::before{ top:4px; transform:rotate(45deg); }
    :host([open]) .toggle__ico::after{ top:4px; transform:rotate(-45deg); }

    @media (max-width:820px){
      .toggle{ display:inline-flex; }
      .menu{
        position:absolute; top:100%; left:0; right:0;
        flex-direction:column; align-items:stretch; gap:0;
        background:var(--_panel); border-bottom:1px solid var(--_line1);
        padding:8px var(--_gutter) 18px;
        visibility:hidden; opacity:0; transform:translateY(-8px);
        transition:opacity var(--_dur2) var(--_ease),
                   transform var(--_dur2) var(--_ease),
                   visibility 0s var(--_dur2);
      }
      :host([open]) .menu{ visibility:visible; opacity:1; transform:none; transition-delay:0s; }
      ::slotted(a){ padding:14px 0; border-bottom:1px solid var(--_line0); }
      ::slotted(a[data-variant="key"]){
        margin-top:14px; text-align:center; border-color:var(--_accent);
      }
    }

    @media (prefers-reduced-motion:reduce){
      .skip, .bar, .menu, .toggle__ico::before, .toggle__ico::after, ::slotted(a){
        transition:none !important;
      }
    }
  `;

  const TEMPLATE = `
    <a class="skip" part="skip" href="#main">Skip to content</a>
    <div class="bar" part="bar">
      <a class="brand" part="brand" href="#">
        <slot name="brand"><span class="brand__type">CASTRALIS</span></slot>
      </a>
      <button class="toggle" part="toggle" type="button"
              aria-expanded="false" aria-controls="menu">
        <span class="toggle__ico" aria-hidden="true"></span>
        <span>Menu</span>
      </button>
      <nav id="menu" class="menu" part="menu" aria-label="Primary">
        <slot></slot>
      </nav>
    </div>
  `;

  class CxNav extends HTMLElement {
    static get observedAttributes() { return ["skip-target", "brand-href"]; }

    constructor() {
      super();
      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = `<style>${CSS}</style>${TEMPLATE}`;
      this._skip = root.querySelector(".skip");
      this._brand = root.querySelector(".brand");
      this._toggle = root.querySelector(".toggle");
      this._raf = 0;
      this._active = null;
      this._onScroll = this._onScroll.bind(this);
      this._onKeydown = this._onKeydown.bind(this);
      this._onOutside = this._onOutside.bind(this);
      this._onBreak = this._onBreak.bind(this);
    }

    connectedCallback() {
      this._syncAttrs();
      // section pairs from slotted fragment links (light DOM = the source of truth)
      this._pairs = Array.from(this.querySelectorAll('a[href^="#"]'))
        .map(a => ({ a, sec: document.getElementById(decodeURIComponent(a.getAttribute("href").slice(1))) }))
        .filter(p => p.sec);

      this._toggle.addEventListener("click", () => { this.open = !this.open; });
      this.addEventListener("click", e => {
        // any slotted link click closes the mobile menu
        if (e.target.closest && e.target.closest("a[href]")) this.open = false;
      });
      window.addEventListener("scroll", this._onScroll, { passive: true });
      window.addEventListener("resize", this._onScroll);
      document.addEventListener("keydown", this._onKeydown);
      document.addEventListener("pointerdown", this._onOutside);
      this._mq = window.matchMedia("(max-width: 820px)");
      this._mq.addEventListener("change", this._onBreak);
      this._update();
    }

    disconnectedCallback() {
      window.removeEventListener("scroll", this._onScroll);
      window.removeEventListener("resize", this._onScroll);
      document.removeEventListener("keydown", this._onKeydown);
      document.removeEventListener("pointerdown", this._onOutside);
      this._mq.removeEventListener("change", this._onBreak);
      if (this._raf) cancelAnimationFrame(this._raf);
    }

    attributeChangedCallback() { if (this.shadowRoot) this._syncAttrs(); }

    get open() { return this.hasAttribute("open"); }
    set open(v) {
      this.toggleAttribute("open", !!v);
      this._toggle.setAttribute("aria-expanded", String(!!v));
    }

    _syncAttrs() {
      this._skip.setAttribute("href", this.getAttribute("skip-target") || "#main");
      this._brand.setAttribute("href", this.getAttribute("brand-href") || "#");
    }

    _onKeydown(e) {
      if (e.key === "Escape" && this.open) { this.open = false; this._toggle.focus(); }
    }

    _onOutside(e) {
      if (this.open && !e.composedPath().includes(this)) this.open = false;
    }

    _onBreak(e) { if (!e.matches) this.open = false; }

    _onScroll() {
      if (this._raf) return;
      this._raf = requestAnimationFrame(() => { this._raf = 0; this._update(); });
    }

    _update() {
      this.toggleAttribute("stuck", window.scrollY > 40);
      // scroll-spy: active = LAST section whose top crossed a probe line 38% down
      // the viewport (height-independent — works for 300vh pinned sections)
      const probe = window.innerHeight * 0.38;
      let active = null;
      for (const p of this._pairs) {
        if (p.sec.getBoundingClientRect().top <= probe) active = p.a;
      }
      if (active === this._active) return;
      this._active = active;
      this._pairs.forEach(p => {
        if (p.a === active) p.a.setAttribute("aria-current", "true");
        else p.a.removeAttribute("aria-current");
      });
      this.dispatchEvent(new CustomEvent("cx-nav:section", {
        detail: { href: active ? active.getAttribute("href") : null },
        bubbles: true,
      }));
    }
  }

  customElements.define("cx-nav", CxNav);
})();
