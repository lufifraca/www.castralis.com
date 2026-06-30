/* ============================================================
   CASTRALIS // SYSTEM DOSSIER — interaction engine
   ============================================================ */
(() => {
  "use strict";
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGSAP = typeof window.gsap !== "undefined";
  if (hasGSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ----------------------------------------------------------
     1. BUILD THE PRAESIDIUM NODE (layered SVG recreation)
     If assets/praesidium.png exists it overlays automatically.
  ---------------------------------------------------------- */
  function buildNode() {
    const svg = $("#nodeSvg");
    if (!svg) return;
    const NS = "http://www.w3.org/2000/svg";
    const cx = 210, cy = 210;

    // --- louver slots: 4 quadrant fans converging to the core ---
    const louvers = [];
    const tri = {
      top:   `M58 58 L362 58 L${cx} ${cy} Z`,
      bottom:`M58 362 L362 362 L${cx} ${cy} Z`,
      left:  `M58 58 L58 362 L${cx} ${cy} Z`,
      right: `M362 58 L362 362 L${cx} ${cy} Z`,
    };
    const clips = Object.entries(tri).map(
      ([k, d]) => `<clipPath id="clip-${k}"><path d="${d}"/></clipPath>`
    ).join("");

    // deep slot (shadow) + top bevel (highlight) per louver, for real cut-vent depth
    const slot = [], bevel = [];
    for (let y = 70; y <= 350; y += 11) {
      slot.push(`<line x1="58" y1="${y}" x2="362" y2="${y}" clip-path="url(#clip-top)"/>`);
      slot.push(`<line x1="58" y1="${y}" x2="362" y2="${y}" clip-path="url(#clip-bottom)"/>`);
      bevel.push(`<line x1="58" y1="${y - 1.4}" x2="362" y2="${y - 1.4}" clip-path="url(#clip-top)"/>`);
      bevel.push(`<line x1="58" y1="${y - 1.4}" x2="362" y2="${y - 1.4}" clip-path="url(#clip-bottom)"/>`);
    }
    for (let x = 70; x <= 350; x += 11) {
      slot.push(`<line x1="${x}" y1="58" x2="${x}" y2="362" clip-path="url(#clip-left)"/>`);
      slot.push(`<line x1="${x}" y1="58" x2="${x}" y2="362" clip-path="url(#clip-right)"/>`);
      bevel.push(`<line x1="${x - 1.4}" y1="58" x2="${x - 1.4}" y2="362" clip-path="url(#clip-left)"/>`);
      bevel.push(`<line x1="${x - 1.4}" y1="58" x2="${x - 1.4}" y2="362" clip-path="url(#clip-right)"/>`);
    }
    louvers.push(`<g stroke="#070d18" stroke-width="3.1" stroke-linecap="round">${slot.join("")}</g>`);
    louvers.push(`<g stroke="#2b3e5e" stroke-width="1" stroke-linecap="round" opacity=".5">${bevel.join("")}</g>`);

    svg.innerHTML = `
      <defs>
        <linearGradient id="encl" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#1b2740"/>
          <stop offset=".5" stop-color="#0d1526"/>
          <stop offset="1" stop-color="#05080f"/>
        </linearGradient>
        <linearGradient id="face" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#0c1526"/>
          <stop offset="1" stop-color="#070b16"/>
        </linearGradient>
        <radialGradient id="coreGlow" cx=".5" cy=".5" r=".5">
          <stop offset="0" stop-color="#f3cd7c" stop-opacity=".9"/>
          <stop offset=".5" stop-color="#e2a33e" stop-opacity=".35"/>
          <stop offset="1" stop-color="#e2a33e" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="crystal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#ffe6ad"/>
          <stop offset=".45" stop-color="#e2a33e"/>
          <stop offset="1" stop-color="#7c4e12"/>
        </linearGradient>
        ${clips}
      </defs>

      <!-- enclosure -->
      <rect x="22" y="22" width="376" height="376" rx="48" fill="url(#encl)" stroke="#26344f" stroke-width="1.5"/>
      <rect x="30" y="30" width="360" height="360" rx="42" fill="none" stroke="#0a0f1c" stroke-width="2"/>
      <!-- recessed face -->
      <rect x="46" y="46" width="328" height="328" rx="34" fill="url(#face)" stroke="#1a2740" stroke-width="1"/>

      <!-- louver vent slots (deep cut + bevel) -->
      <g class="louvers">${louvers.join("")}</g>
      <!-- seam X (the burst diagonals, matching the brand mark) -->
      <path d="M58 58 L362 362 M362 58 L58 362" stroke="#05090f" stroke-width="3" opacity=".9"/>
      <path d="M58 58 L362 362 M362 58 L58 362" stroke="#2b3e5e" stroke-width=".8" opacity=".4"/>

      <!-- core glow + crystal -->
      <circle cx="${cx}" cy="${cy}" r="82" fill="url(#coreGlow)" class="node-glow"/>
      <g class="crystal" id="crystal">
        <rect x="172" y="172" width="76" height="76" rx="6" transform="rotate(45 ${cx} ${cy})" fill="url(#crystal)" stroke="#ffe6ad" stroke-width="1"/>
        <path d="M${cx} 168 L${cx} 252 M168 ${cy} L252 ${cy}" stroke="#7c4e12" stroke-width="1" opacity=".7"/>
        <path d="M${cx} 168 L246 ${cy} L${cy} 252 L174 ${cy} Z" fill="#fff" opacity=".12"/>
        <rect x="198" y="198" width="24" height="24" transform="rotate(45 ${cx} ${cy})" fill="#fff3d6" opacity=".55"/>
      </g>

      <!-- wordmark + interlocking-conduit mark -->
      <g transform="translate(${cx} 332)" text-anchor="middle" class="node-mark">
        <text x="13" y="3" fill="#9fb0c8" font-family="'Space Grotesk',sans-serif" font-size="14" font-weight="700" letter-spacing="3.2">CASTRALIS</text>
        <g transform="translate(-86 -10) scale(.165)" fill="none" stroke="#9fb0c8" stroke-width="7" stroke-linejoin="round">
          <rect x="14" y="14" width="92" height="92" rx="30"/>
          <path d="M60 20 L100 60 L60 100 L20 60 Z"/>
          <path d="M34 34 L86 86 M86 34 L34 86" stroke-width="6" stroke-linecap="round" opacity=".85"/>
        </g>
        <rect x="-80.5" y="-4.5" width="9" height="9" rx="1" transform="rotate(45 -76 0)" fill="#e2a33e"/>
      </g>
    `;
  }
  buildNode();

  /* ----------------------------------------------------------
     2. BOOT / DECRYPT SEQUENCE
  ---------------------------------------------------------- */
  function boot() {
    const boot = $("#boot"), log = $("#bootLog"), fill = $("#bootFill"), pct = $("#bootPct");
    const html = document.documentElement;
    const lines = [
      ["> ESTABLISHING SECURE CHANNEL .......... ", "OK", "g"],
      ["> IDENT 44.092.C // CLEARANCE ........... ", "GRANTED", "g"],
      ["> DECRYPTING DOSSIER v2.6 .............. ", "■■■■■■", "a"],
      ["> CLASSIFICATION: ENTERPRISE INFRA SPEC", "", ""],
      ["> OPERATIONAL STATE .................... ", "DETERMINISTIC", "a"],
      ["> PERIMETER BOUNDARY ................... ", "SECURE", "g"],
    ];
    const finish = () => {
      boot.classList.add("is-done");
      html.setAttribute("data-state", "ready");
      setTimeout(() => boot.remove(), 800);
      if (hasGSAP && window.ScrollTrigger) ScrollTrigger.refresh();
      enterHero();
    };
    if (reduce) { log.textContent = lines.map(l => l[0] + l[1]).join("\n"); fill.style.width = "100%"; pct.textContent = "100"; setTimeout(finish, 350); return; }

    let i = 0, p = 0;
    const tick = () => {
      if (i < lines.length) {
        const [t, tag, cls] = lines[i];
        log.insertAdjacentHTML("beforeend", `${t}${tag ? `<span class="${cls}">${tag}</span>` : ""}\n`);
        i++;
        p = Math.min(100, Math.round((i / lines.length) * 100));
        fill.style.width = p + "%"; pct.textContent = String(p).padStart(2, "0");
        setTimeout(tick, 230 + Math.random() * 120);
      } else {
        fill.style.width = "100%"; pct.textContent = "100";
        setTimeout(finish, 480);
      }
    };
    setTimeout(tick, 320);
  }

  /* ----------------------------------------------------------
     3. HERO ENTRANCE
  ---------------------------------------------------------- */
  function enterHero() {
    // pure CSS transitions (see .hero.is-revealed) — bulletproof, RAF-independent
    const hero = $("#identity .hero");
    if (hero) requestAnimationFrame(() => hero.classList.add("is-revealed"));
  }

  /* ----------------------------------------------------------
     4. THE PINNED STAGE ENGINE  (node holds, info streams)
  ---------------------------------------------------------- */
  function stageEngine() {
    const stage = $("#triad .stage");
    const panels = $$(".panel");
    const leads = $$(".hud__lines .lead");
    const corners = {
      tl: $(".hud__corner--tl"), tr: $(".hud__corner--tr"),
      bl: $(".hud__corner--bl"), br: $(".hud__corner--br"),
    };
    const meter = $("#stageMeter");
    const node = $("#node");
    const opState = $("#opState");
    if (!stage || !panels.length) return;

    // each step lights one constraint + one quadrant
    const steps = [
      { panel: 0, q: "tl", state: "POWER-AWARE" },
      { panel: 1, q: "bl", state: "FOOTPRINT-BOUND" },
      { panel: 2, q: "br", state: "SOVEREIGN" },
    ];
    let current = -1;
    const setStep = (idx) => {
      if (idx === current) return;
      current = idx;
      const s = steps[idx];
      panels.forEach((p, i) => p.classList.toggle("is-active", i === s.panel));
      leads.forEach(l => l.classList.toggle("is-hot", l.dataset.q === s.q));
      Object.entries(corners).forEach(([k, el]) => el && el.classList.toggle("is-hot", k === s.q));
      if (opState) opState.textContent = s.state;
    };
    setStep(0);

    const onProgress = (prog) => {
      if (meter) meter.style.width = (prog * 100).toFixed(1) + "%";
      // map progress → step (thirds, with a lead-in)
      const idx = prog < 0.36 ? 0 : prog < 0.7 ? 1 : 2;
      setStep(idx);
      // node drifts a hair — alive but "not moving"
      if (node && !reduce) {
        const rot = (prog - 0.5) * 8;            // ±4deg
        const ry  = Math.sin(prog * Math.PI) * 6; // subtle yaw
        node.style.transform = `rotateX(8deg) rotateZ(${rot.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
      }
    };

    if (hasGSAP && window.ScrollTrigger) {
      ScrollTrigger.create({
        trigger: stage, start: "top top", end: "bottom bottom",
        scrub: true, onUpdate: (self) => onProgress(self.progress),
      });
    } else {
      // fallback: raw scroll math
      const calc = () => {
        const r = stage.getBoundingClientRect();
        const total = stage.offsetHeight - window.innerHeight;
        const prog = Math.min(1, Math.max(0, -r.top / total));
        onProgress(prog);
      };
      window.addEventListener("scroll", calc, { passive: true });
      window.addEventListener("resize", calc);
      calc();
    }
  }

  /* ----------------------------------------------------------
     5. CHROME / RAIL / STATUS — section awareness
  ---------------------------------------------------------- */
  function chromeAndRail() {
    const chrome = $("#topChrome");
    const ticks = $$(".rail__ticks li");
    const sbSection = $("#sbSection");
    const opState = $("#opState");
    const labels = {
      identity: "01 / IDENTITY", triad: "02 / CONSTRAINTS",
      modules: "03 / ECOSYSTEM", capital: "04 / CAPITAL", gateway: "05 / GATEWAY",
    };

    window.addEventListener("scroll", () => {
      chrome.classList.toggle("is-stuck", window.scrollY > 40);
    }, { passive: true });

    const secs = ["identity", "triad", "modules", "capital", "gateway"].map(id => $("#" + id));
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && e.intersectionRatio > 0.3) {
          const id = e.target.id;
          ticks.forEach(t => t.classList.toggle("is-active", t.dataset.tick === id));
          if (sbSection && labels[id]) sbSection.textContent = labels[id];
          // op-state outside the triad returns to baseline
          if (opState && id !== "triad") opState.textContent = "DETERMINISTIC";
        }
      });
    }, { threshold: [0.3, 0.6] });
    secs.forEach(s => s && io.observe(s));
  }

  /* ----------------------------------------------------------
     6. REVEAL ON SCROLL
  ---------------------------------------------------------- */
  function reveals() {
    const els = $$("[data-reveal]");
    if (reduce) { els.forEach(e => e.classList.add("is-in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
    els.forEach(e => io.observe(e));
  }

  /* ----------------------------------------------------------
     7. LIMES MESH (canvas) + PRINCIPIA telemetry tick
  ---------------------------------------------------------- */
  function meshViz() {
    const host = $("[data-mesh]");
    if (!host || reduce) return;
    const cv = document.createElement("canvas");
    host.appendChild(cv);
    cv.style.cssText = "width:100%;height:100%;display:block";
    const ctx = cv.getContext("2d");
    let nodes = [], raf = null, w = 0, h = 0, dpr = Math.min(2, window.devicePixelRatio || 1);

    const seed = () => {
      const R = host.getBoundingClientRect(); w = R.width; h = R.height;
      cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      nodes = Array.from({ length: 9 }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25,
        p: Math.random() * Math.PI * 2,
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        a.x += a.vx; a.y += a.vy; a.p += .04;
        if (a.x < 0 || a.x > w) a.vx *= -1;
        if (a.y < 0 || a.y > h) a.vy *= -1;
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 70) {
            ctx.strokeStyle = `rgba(226,163,62,${(1 - d / 70) * .5})`;
            ctx.lineWidth = .6;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      nodes.forEach(n => {
        const r = 1.6 + Math.sin(n.p) * .8;
        ctx.fillStyle = "#e2a33e"; ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, 7); ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    const io = new IntersectionObserver((es) => {
      es.forEach(e => {
        if (e.isIntersecting) { if (!raf) { seed(); draw(); } }
        else if (raf) { cancelAnimationFrame(raf); raf = null; }
      });
    }, { threshold: 0.1 });
    io.observe(host);
    window.addEventListener("resize", () => { if (raf) seed(); });
  }

  function telemetryTick() {
    if (reduce) return;
    const rows = $$("[data-tick-val]");
    setInterval(() => {
      rows.forEach(el => {
        const base = parseFloat(el.dataset.tickVal);
        const suffix = el.textContent.replace(/[\d.]/g, "");
        const jitter = base + (Math.random() - .5) * (base > 50 ? 1.4 : 0.06);
        el.textContent = (base > 50 ? Math.round(jitter) : jitter.toFixed(2)) + suffix;
      });
    }, 1400);
  }

  /* ----------------------------------------------------------
     8. SECURE GATEWAY FORM
  ---------------------------------------------------------- */
  function form() {
    const f = $("#dossierForm");
    if (!f) return;
    const status = $("#formStatus"), btn = $(".submit");
    const setErr = (field, msg) => {
      const wrap = field.closest(".field");
      wrap.classList.toggle("is-invalid", !!msg);
      wrap.querySelector("[data-err]").textContent = msg || "";
    };
    const validate = () => {
      let ok = true;
      [["name", v => v.trim().length > 1, "Identification required."],
       ["org", v => v.trim().length > 1, "Institutional entity required."],
       ["classification", v => !!v, "Select an asset classification."],
       ["email", v => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v), "Valid corporate email anchor required."]
      ].forEach(([n, test, msg]) => {
        const field = f.elements[n];
        if (!test(field.value)) { setErr(field, msg); ok = false; }
        else setErr(field, "");
      });
      return ok;
    };
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      status.textContent = ""; status.className = "form__status";
      if (!validate()) {
        status.textContent = "// VALIDATION FAILED — CORRECT FLAGGED FIELDS";
        status.classList.add("is-err");
        const firstBad = f.querySelector(".is-invalid input, .is-invalid select");
        if (firstBad) firstBad.focus();
        return;
      }
      btn.classList.add("is-loading"); btn.disabled = true;
      status.textContent = "// TRANSMITTING OVER SECURE CHANNEL…"; status.classList.remove("is-err");
      setTimeout(() => {
        btn.classList.remove("is-loading");
        $(".submit__label").textContent = "CREDENTIALS QUEUED";
        status.textContent = "✓ CREDENTIALS QUEUED // IDENT LOGGED — AWAITING INSTITUTIONAL VALIDATION";
        status.classList.add("is-ok");
        f.querySelectorAll("input,select").forEach(el => el.setAttribute("readonly", "true"));
      }, 1600);
    });
    f.addEventListener("input", (e) => {
      if (e.target.closest(".field.is-invalid")) setErr(e.target, "");
    });
  }

  /* ----------------------------------------------------------
     9. PRAESIDIUM EXPLODED SCHEMATIC (isometric, scroll-driven)
  ---------------------------------------------------------- */
  function buildSchematic() {
    const svg = $("#schemSvg");
    if (!svg) return;
    const OX = 410, OY = 300, HW = 52, K = 0.866;
    const P = (x, y, z) => [ +(OX + (x - y) * K).toFixed(1), +(OY + (x + y) * 0.5 - z).toFixed(1) ];
    const s = a => a.map(p => p.join(",")).join(" ");
    const polygon = (cls, arr) => `<polygon class="${cls}" points="${s(arr)}"/>`;
    const line = (cls, a, b) => `<line class="${cls}" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/>`;
    const ring = (r, z) => polygon("detail", [P(-HW*r,-HW*r,z), P(HW*r,-HW*r,z), P(HW*r,HW*r,z), P(-HW*r,HW*r,z)]);
    const dia = (fx, fy, z, sz) => polygon("detail", [P(fx-sz,fy,z), P(fx,fy-sz,z), P(fx+sz,fy,z), P(fx,fy+sz,z)]);

    // slab faces for a layer between zb..zt
    const slab = (zb, zt) => {
      const A=P(-HW,-HW,zt),B=P(HW,-HW,zt),C=P(HW,HW,zt),D=P(-HW,HW,zt);
      const Cb=P(HW,HW,zb),Bb=P(HW,-HW,zb),Db=P(-HW,HW,zb);
      return polygon("face-l",[D,C,Cb,Db]) + polygon("face-r",[B,C,Cb,Bb]) + polygon("face-top",[A,B,C,D]);
    };
    const tag = (zt, label) => {
      const a=P(HW,-HW,zt), b=[a[0]+34,a[1]-12];
      return line("tick",a,b) + `<text class="tag" x="${b[0]+6}" y="${b[1]+4}">${label}</text>`;
    };
    const port = (y0,y1,z0,z1) => polygon("port",[P(HW,y0,z0),P(HW,y1,z0),P(HW,y1,z1),P(HW,y0,z1)]);

    // z stack — flatter slabs so the assembled unit reads horizontal
    const bZb=0,bZt=24, cZb=24,cZt=72, kZb=72,kZt=100;

    // --- BASE (thermal) ---
    const base = slab(bZb,bZt) + ring(0.62,bZt) + ring(0.4,bZt) + tag(bZt,"03");
    // --- CORE (bays on top + I/O ports on the right wall) ---
    let core = slab(cZb,cZt);
    core += line("detail", P(0,-HW*0.74,cZt), P(0,HW*0.74,cZt)) + line("detail", P(-HW*0.74,0,cZt), P(HW*0.74,0,cZt));
    core += ring(0.74,cZt);
    [[-26,-26],[26,-26],[26,26],[-26,26]].forEach(([fx,fy]) => core += dia(fx,fy,cZt,7));
    core += port(-44,-26,36,56) + port(-9,9,36,56) + port(26,44,36,56);
    core += tag(cZt,"02");
    // --- CAP (X-flow louver burst + gem) ---
    let cap = slab(kZb,kZt);
    cap += line("detail", P(-HW,-HW,kZt), P(HW,HW,kZt)) + line("detail", P(HW,-HW,kZt), P(-HW,HW,kZt));
    cap += ring(0.72,kZt) + ring(0.5,kZt) + ring(0.28,kZt);
    cap += polygon("gem", [P(-13,0,kZt), P(0,-13,kZt), P(13,0,kZt), P(0,13,kZt)]);
    cap += tag(kZt,"01");

    svg.innerHTML = `
      <defs><linearGradient id="schemGem" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#ffe6ad"/><stop offset=".5" stop-color="#e2a33e"/><stop offset="1" stop-color="#7c4e12"/>
      </linearGradient></defs>
      <g class="lyr" data-layer="base" id="lyr-base">${base}</g>
      <g class="lyr" data-layer="core" id="lyr-core">${core}</g>
      <g class="lyr" data-layer="cap" id="lyr-cap">${cap}</g>`;
  }

  /* horizontal, piece-by-piece disassembly that narrates the triad */
  function triadExplodeEngine() {
    const wrap = $(".xtriad");
    const svg = $("#schemSvg");
    if (!wrap || !svg) return;
    const el = { cap: $("#lyr-cap"), core: $("#lyr-core"), base: $("#lyr-base") };
    const caps = $$(".xcap");
    const meter = $("#xMeter"), hint = $("#xHint");

    // assembled screen-centres (must track buildSchematic OX/OY/HW + z-mids)
    // cap mid≈86, core mid≈48, base mid≈12  →  screenY = OY - z
    // explode target: a horizontal row at rowY, spread S apart
    const rowY = 252, S = 205;
    const T = { cap: [-S, rowY - 214], core: [0, rowY - 252], base: [S, rowY - 288] };
    const order = ["cap", "core", "base"];
    const ranges = { cap: [0.05, 0.32], core: [0.38, 0.64], base: [0.70, 0.97] };
    const smooth = t => t * t * (3 - 2 * t);
    const seg = (p, a, b) => smooth(Math.min(1, Math.max(0, (p - a) / (b - a))));

    const apply = (prog) => {
      if (meter) meter.style.width = (prog * 100).toFixed(1) + "%";
      if (hint) hint.classList.toggle("is-hidden", prog > 0.03);
      order.forEach(k => {
        const t = seg(prog, ranges[k][0], ranges[k][1]);
        const [dx, dy] = T[k];
        if (el[k]) el[k].setAttribute("transform", `translate(${(dx*t).toFixed(1)} ${(dy*t).toFixed(1)})`);
      });
      const active = prog > 0.80 ? "base" : prog > 0.50 ? "core" : "cap";
      caps.forEach(c => c.classList.toggle("is-on", c.dataset.layer === active));
      order.forEach(k => el[k] && el[k].classList.toggle("is-on", k === active));
    };

    const staticState = () => {
      order.forEach(k => { const [dx,dy]=T[k]; el[k] && el[k].setAttribute("transform", `translate(${dx} ${dy})`); el[k] && el[k].classList.add("is-on"); });
      caps.forEach(c => c.classList.add("is-on"));
      if (meter) meter.style.width = "100%";
      if (hint) hint.classList.add("is-hidden");
    };

    if (reduce || window.innerWidth < 820) { staticState(); return; }
    apply(0);

    if (hasGSAP && window.ScrollTrigger) {
      ScrollTrigger.create({ trigger: wrap, start: "top top", end: "bottom bottom", scrub: true,
        onUpdate: self => apply(self.progress) });
    } else {
      const calc = () => {
        const r = wrap.getBoundingClientRect();
        const total = wrap.offsetHeight - window.innerHeight;
        apply(Math.min(1, Math.max(0, -r.top / total)));
      };
      window.addEventListener("scroll", calc, { passive: true });
      window.addEventListener("resize", calc);
      calc();
    }
  }

  /* ----------------------------------------------------------
     10. CASTRUM PLAN (doctrine) — Roman fort blueprint
  ---------------------------------------------------------- */
  function buildCastrum() {
    const svg = $("#castrumSvg");
    if (!svg) return;
    svg.innerHTML = `
      <rect class="wall" x="22" y="22" width="196" height="196" rx="12"/>
      <rect class="wall2" x="33" y="33" width="174" height="174" rx="9"/>
      <!-- via principalis / praetoria (the crossing roads) -->
      <line class="road" x1="22" y1="112" x2="218" y2="112"/>
      <line class="road" x1="22" y1="128" x2="218" y2="128"/>
      <line class="road" x1="112" y1="22" x2="112" y2="218"/>
      <line class="road" x1="128" y1="22" x2="128" y2="218"/>
      <!-- gates -->
      <rect class="tower" x="14" y="110" width="8" height="20"/>
      <rect class="tower" x="218" y="110" width="8" height="20"/>
      <rect class="tower" x="110" y="14" width="20" height="8"/>
      <rect class="tower" x="110" y="218" width="20" height="8"/>
      <!-- corner towers -->
      <rect class="tower" x="22" y="22" width="16" height="16" rx="3"/>
      <rect class="tower" x="202" y="22" width="16" height="16" rx="3"/>
      <rect class="tower" x="22" y="202" width="16" height="16" rx="3"/>
      <rect class="tower" x="202" y="202" width="16" height="16" rx="3"/>
      <!-- principia at the centre -->
      <rect class="blk" x="96" y="96" width="48" height="48"/>
      <rect class="ctr" x="114" y="114" width="12" height="12" transform="rotate(45 120 120)"/>
      <text class="lbl" x="120" y="160" text-anchor="middle">PRINCIPIA</text>`;
  }

  /* ----------------------------------------------------------
     11. PRAESIDIUM — FULL 3D (Three.js, procedural placeholder)
         swap in a real assets/praesidium.glb later via loadGLB()
  ---------------------------------------------------------- */
  function hasWebGL() {
    try { const c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
    } catch (e) { return false; }
  }

  function initPraesidium3D() {
    const T = window.THREE, host = $("#praesidium3d");
    if (!T || !host) return false;
    let renderer;
    try { renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" }); }
    catch (e) { return false; }

    const W = () => host.clientWidth || 800, H = () => host.clientHeight || 460;
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(W(), H());
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.NoToneMapping; // flat blueprint colours, no lighting
    host.appendChild(renderer.domElement);

    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(31, W() / H(), 0.1, 100);
    camera.position.set(3.15, 2.2, 4.05);
    camera.lookAt(0, 0.04, 0);

    // ---- texture helpers ----
    const canvasTex = (size, draw, srgb) => {
      const c = document.createElement("canvas"); c.width = c.height = size;
      draw(c.getContext("2d"), size);
      const tx = new T.CanvasTexture(c); if (srgb) tx.encoding = T.sRGBEncoding; tx.anisotropy = 4; return tx;
    };
    const drawVent = (x, S) => {
      const cx = S / 2; x.fillStyle = "#18222f"; x.fillRect(0, 0, S, S);
      const gap = S * 0.032, lw = S * 0.023;
      const fan = (clip, vertical) => {
        x.save(); x.beginPath(); clip(); x.clip();
        x.lineCap = "round"; x.strokeStyle = "#04080f"; x.lineWidth = lw;
        for (let p = gap; p < S; p += gap) { x.beginPath(); vertical ? (x.moveTo(p, 0), x.lineTo(p, S)) : (x.moveTo(0, p), x.lineTo(S, p)); x.stroke(); }
        x.strokeStyle = "rgba(88,114,152,.45)"; x.lineWidth = lw * 0.28;
        for (let p = gap; p < S; p += gap) { x.beginPath(); vertical ? (x.moveTo(p - 2, 0), x.lineTo(p - 2, S)) : (x.moveTo(0, p - 2), x.lineTo(S, p - 2)); x.stroke(); }
        x.restore();
      };
      const tri = (a, b, c, d) => { x.moveTo(a, b); x.lineTo(c, d); x.lineTo(cx, cx); x.closePath(); };
      fan(() => tri(0, 0, S, 0), false); fan(() => tri(0, S, S, S), false);
      fan(() => tri(0, 0, 0, S), true);  fan(() => tri(S, 0, S, S), true);
      // bold diagonal X-seams (the "kinetic over-under" conduit)
      x.lineCap = "round"; x.strokeStyle = "#02040a"; x.lineWidth = S * 0.022;
      x.beginPath(); x.moveTo(0, 0); x.lineTo(S, S); x.moveTo(S, 0); x.lineTo(0, S); x.stroke();
      x.strokeStyle = "rgba(88,114,152,.32)"; x.lineWidth = S * 0.006;
      x.beginPath(); x.moveTo(0, 0); x.lineTo(S, S); x.moveTo(S, 0); x.lineTo(0, S); x.stroke();
      // central amber-rimmed core socket
      x.save(); x.translate(cx, cx); x.rotate(Math.PI / 4); const g = S * 0.13;
      x.fillStyle = "#090d18"; x.fillRect(-g, -g, 2 * g, 2 * g);
      x.strokeStyle = "rgba(226,163,62,.28)"; x.lineWidth = S * 0.012; x.strokeRect(-g, -g, 2 * g, 2 * g); x.restore();
    };
    const radial = (stops) => (x, S) => { const g = x.createRadialGradient(S/2,S/2,0,S/2,S/2,S/2); stops.forEach(s => g.addColorStop(s[0], s[1])); x.fillStyle = g; x.fillRect(0,0,S,S); };

    // ---- geometry helper: rounded box via extruded rounded-rect ----
    const roundedBox = (w, h, d, r) => {
      const sh = new T.Shape(), x = -w/2, y = -d/2;
      sh.moveTo(x + r, y);
      sh.lineTo(x + w - r, y); sh.quadraticCurveTo(x + w, y, x + w, y + r);
      sh.lineTo(x + w, y + d - r); sh.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
      sh.lineTo(x + r, y + d); sh.quadraticCurveTo(x, y + d, x, y + d - r);
      sh.lineTo(x, y + r); sh.quadraticCurveTo(x, y, x + r, y);
      const bev = Math.min(0.04, h * 0.28);
      const g = new T.ExtrudeGeometry(sh, { depth: h - bev * 2, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 2, curveSegments: 10, steps: 1 });
      g.rotateX(-Math.PI / 2); g.computeBoundingBox();
      const bb = g.boundingBox; g.translate(0, -(bb.min.y + bb.max.y) / 2, 0); g.computeVertexNormals();
      return g;
    };

    // ---- blueprint look: dark flat fills + glowing line edges (matches the dossier HUD) ----
    const STEEL = 0x6481a6, GOLD = 0xe2a33e, ACCENT = 0x5ec6d2;
    const box = (w, h, d) => new T.BoxGeometry(w, h, d);
    const fillMat = () => new T.MeshBasicMaterial({ color: 0x0a1019, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
    const lineMat = (c, o) => new T.LineBasicMaterial({ color: c, transparent: true, opacity: o == null ? 0.92 : o });
    const segGeo = (pts) => { const g = new T.BufferGeometry(); g.setAttribute("position", new T.Float32BufferAttribute(pts, 3)); return g; };
    const ringPts = (s, y, arr) => { const p = [[-s,-s],[s,-s],[s,s],[-s,s]]; for (let i = 0; i < 4; i++) { const a = p[i], b = p[(i+1)%4]; arr.push(a[0],y,a[1], b[0],y,b[1]); } };
    const wireEdges = (geo, c, o) => new T.LineSegments(new T.EdgesGeometry(geo, 18), lineMat(c, o));
    // a solid-but-ghosted volume outlined in glowing lines; returns {group, edgeMat}
    const wire = (geo, c) => {
      const g = new T.Group(); g.add(new T.Mesh(geo, fillMat()));
      const e = wireEdges(geo, c || STEEL); g.add(e); return { group: g, edge: e.material };
    };
    const cylWire = (r, h, seg, c, o) => wireEdges(new T.CylinderGeometry(r, r, h, seg || 18), c, o);

    // ---- BASE: frame + corner M6 mounts + rail channels ----
    const baseG = new T.Group();
    const baseBody = wire(box(1.78, 0.22, 1.78)); baseG.add(baseBody.group);
    { const yT = 0.112, p = []; ringPts(0.66, yT, p); ringPts(0.5, yT, p);
      [-0.34, 0.34].forEach(z => p.push(-0.55, yT, z, 0.55, yT, z));
      baseG.add(new T.LineSegments(segGeo(p), lineMat(STEEL, 0.6)));
      [[-0.62,-0.62],[0.62,-0.62],[0.62,0.62],[-0.62,0.62]].forEach(([x, z]) => { const m = cylWire(0.07, 0.05, 12, STEEL, 0.8); m.position.set(x, 0.12, z); baseG.add(m); }); }
    baseG.position.y = 0.11;

    // ---- CORE: front I/O (2×RJ45, 2×SFP, toggle) + rear connector + wordmark ----
    const coreG = new T.Group();
    const coreBody = wire(box(1.62, 0.5, 1.62)); coreG.add(coreBody.group);
    const fz = 0.815;
    const portWire = (x, w, h, c) => { const p = wireEdges(box(w, h, 0.04), c, 0.85); p.position.set(x, 0.02, fz); coreG.add(p); };
    portWire(-0.5, 0.11, 0.11, ACCENT); portWire(-0.35, 0.11, 0.11, ACCENT);   // 2× RJ45
    portWire(-0.15, 0.16, 0.07, ACCENT); portWire(0.04, 0.16, 0.07, ACCENT);   // 2× SFP
    portWire(0.42, 0.06, 0.12, GOLD);                                          // toggle
    { const wm = new T.Mesh(new T.PlaneGeometry(0.74, 0.16), wordmark()); wm.position.set(0, -0.16, 0.812); coreG.add(wm); }
    { const ring = cylWire(0.14, 0.05, 20, STEEL, 0.85); ring.rotation.x = Math.PI / 2; ring.position.set(0, 0.02, -0.81); coreG.add(ring);
      const inner = cylWire(0.06, 0.06, 14, STEEL, 0.7); inner.rotation.x = Math.PI / 2; inner.position.set(0, 0.02, -0.81); coreG.add(inner); }
    coreG.position.y = 0.47;

    // ---- CAP: conduit grille + amber power core ----
    const capG = new T.Group();
    const capBody = wire(box(1.7, 0.34, 1.7)); capG.add(capBody.group);
    { const y = 0.172, vp = []; [0.2, 0.34, 0.48, 0.62].forEach(s => ringPts(s, y, vp));
      vp.push(-0.66, y, -0.66, 0.66, y, 0.66, 0.66, y, -0.66, -0.66, y, 0.66); // X-seam
      capG.add(new T.LineSegments(segGeo(vp), lineMat(STEEL, 0.7))); }
    const gemGeo = new T.OctahedronGeometry(0.16, 0);
    const gemGroup = new T.Group();
    gemGroup.add(new T.Mesh(gemGeo, new T.MeshBasicMaterial({ color: GOLD })));
    gemGroup.add(wireEdges(gemGeo, 0xffe6ad, 0.95));
    gemGroup.scale.set(1, 0.82, 1); gemGroup.position.y = 0.2; capG.add(gemGroup);
    { const glow = new T.Sprite(new T.SpriteMaterial({ map: canvasTex(128, radial([[0,"rgba(255,235,190,.8)"],[0.4,"rgba(226,163,62,.3)"],[1,"rgba(226,163,62,0)"]]), true), blending: T.AdditiveBlending, transparent: true, depthWrite: false }));
      glow.scale.set(0.7, 0.7, 1); glow.position.y = 0.22; capG.add(glow); }
    capG.position.y = 0.89;

    function wordmark() {
      const c = document.createElement("canvas"); c.width = 512; c.height = 120; const x = c.getContext("2d");
      x.save(); x.translate(58, 60); x.rotate(Math.PI / 4); x.strokeStyle = "#cdd8e8"; x.lineWidth = 5; x.strokeRect(-25, -25, 50, 50); x.fillStyle = "#e2a33e"; x.fillRect(-12, -12, 24, 24); x.restore();
      x.fillStyle = "#cdd8e8"; x.font = "700 58px 'Space Grotesk',system-ui,sans-serif"; x.textBaseline = "middle"; x.fillText("CASTRALIS", 104, 62);
      const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 4;
      return new T.MeshBasicMaterial({ map: t, transparent: true });
    }

    const model = new T.Group(); model.add(baseG, coreG, capG); model.position.y = -0.5; scene.add(model);

    // faint ground glow (keeps the node from floating)
    { const m = new T.MeshBasicMaterial({ map: canvasTex(128, radial([[0,"rgba(100,129,166,.18)"],[0.6,"rgba(100,129,166,.06)"],[1,"rgba(100,129,166,0)"]]), false), transparent: true, depthWrite: false, blending: T.AdditiveBlending });
      const pl = new T.Mesh(new T.PlaneGeometry(3.4, 3.4), m); pl.rotation.x = -Math.PI / 2; pl.position.y = -1.0; scene.add(pl); }

    // ---- scroll-driven disassembly ----
    const caps = $$(".xcap"), meter = $("#xMeter"), hint = $("#xHint");
    const parts = { cap: { g: capG, y0: 0.89, off: 0.40, edge: capBody.edge }, core: { g: coreG, y0: 0.47, off: 0.11, edge: coreBody.edge }, base: { g: baseG, y0: 0.11, off: -0.34, edge: baseBody.edge } };
    const ranges = { cap: [0.05, 0.34], core: [0.40, 0.64], base: [0.70, 0.96] };
    const smooth = t => t * t * (3 - 2 * t);
    const seg = (p, a, b) => smooth(Math.min(1, Math.max(0, (p - a) / (b - a))));
    let lastActive = "";
    const narrate = (p) => {
      if (meter) meter.style.width = (p * 100).toFixed(1) + "%";
      if (hint) hint.classList.toggle("is-hidden", p > 0.03);
      const active = p > 0.80 ? "base" : p > 0.50 ? "core" : "cap";
      if (active !== lastActive) { lastActive = active; caps.forEach(c => c.classList.toggle("is-on", c.dataset.layer === active)); }
      return active;
    };

    let curP = 0, targetP = 0, running = true, last = performance.now();
    const loop = () => {
      if (!running) return;
      const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000); last = now;
      curP += (targetP - curP) * Math.min(1, dt * 6);
      const active = narrate(curP);
      Object.keys(parts).forEach(k => {
        const pt = parts[k]; pt.g.position.y = pt.y0 + pt.off * seg(curP, ranges[k][0], ranges[k][1]);
        pt.edge.color.setHex(k === active ? 0xe2a33e : 0x6481a6);
        pt.edge.opacity = k === active ? 1 : 0.92;
      });
      model.rotation.y += dt * 0.16;
      model.position.y = -0.5 + Math.sin(now * 0.0008) * 0.02;
      gemGroup.rotation.y -= dt * 0.5;
      renderer.render(scene, camera);
      requestAnimationFrame(loop);
    };

    if (hasGSAP && window.ScrollTrigger) {
      ScrollTrigger.create({ trigger: $(".xtriad"), start: "top top", end: "bottom bottom", scrub: true, onUpdate: s => { targetP = s.progress; } });
    } else {
      const calc = () => { const r = $(".xtriad").getBoundingClientRect(); const total = $(".xtriad").offsetHeight - window.innerHeight; targetP = Math.min(1, Math.max(0, -r.top / total)); };
      window.addEventListener("scroll", calc, { passive: true }); window.addEventListener("resize", calc); calc();
    }
    window.addEventListener("resize", () => { renderer.setSize(W(), H()); camera.aspect = W() / H(); camera.updateProjectionMatrix(); });
    // pause render when off-screen
    new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { if (!running) { running = true; last = performance.now(); loop(); } }
      else running = false;
    }), { threshold: 0 }).observe(host);

    loop();
    return true;
  }

  function initTriad() {
    const xbox = $(".xbox"), small = window.innerWidth < 820;
    if (!reduce && !small && hasWebGL() && window.THREE) {
      try { if (initPraesidium3D()) return; } catch (e) { /* fall through to SVG */ }
    }
    if (xbox) xbox.classList.add("show-svg");
    buildSchematic();
    triadExplodeEngine();
  }

  /* ----------------------------------------------------------
     BOOT ALL
  ---------------------------------------------------------- */
  const start = () => {
    document.documentElement.classList.add("js");
    boot();
    initTriad();
    buildCastrum();
    chromeAndRail();
    reveals();
    meshViz();
    telemetryTick();
    form();
    if (hasGSAP && window.ScrollTrigger) setTimeout(() => ScrollTrigger.refresh(), 400);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
