# www.castralis.com

**CASTRALIS // SYSTEM DOSSIER** — an immersive single-page site for a grid-edge
distributed-compute infrastructure company.

## The concept

A classified **system dossier**. The signature interaction: the **Praesidium compute
node pins dead-center and stays perfectly still** — breathing with a core glow and a
scan sweep — while the dossier *information* streams and reconfigures around it
(the constraint triad, HUD leader-lines, live telemetry). *The frame holds; the data moves.*

- **Style:** Blueprint Dossier / Tactical HUD — OLED-dark navy, blueprint grid, gold
  crystal accent (matched to the product), boot/decrypt sequence, corner HUD readouts.
- **Type:** Single page — `01` Identity · **Doctrine** (the name's meaning) · `02` Constraints
  (the exploded triad) · `03` Specifications · `04` Capital · `05` Secure Gateway.
- **Exploded triad (signature):** a real **Three.js 3D Praesidium** — dark PBR metal,
  environment reflections, a glowing gold crystal, and slow idle rotation. It starts whole,
  then **disassembles piece-by-piece as you scroll** — Cap → Core → Base — each separating
  layer narrating one physical constraint (Power → Land → Latency). The model is procedural
  (built in code); a real `.glb` can be swapped in. Falls back to an isometric SVG if WebGL
  is unavailable.
- **Doctrine section:** the Roman *castra / limes* etymology behind the name, with a castrum
  fort-plan blueprint and a Latin lexicon mapping each term to a product (Castra → the fabric,
  Praesidium → the node, Limes → the mesh, Principia → the command interface).
- **Fonts:** Space Grotesk (display) + JetBrains Mono (telemetry/body).

## Run it

It's a static site — no build step.

- **Quickest:** double-click `index.html` (needs internet for the Google Fonts + GSAP CDNs).
- **Local server (recommended):**
  ```bash
  npx serve .          # or: python -m http.server 8000
  ```

## Swap in a real 3D model (optional)

The Praesidium in Section 02 is a **procedural Three.js model** built in code. To use a real
model instead, export a **`.glb`** (glTF 2.0) with the three components as separate named
nodes — `Cap`, `Core`, `Base` (+ `Gem`) — then wire it into `initPraesidium3D()` via a
`GLTFLoader` (the part-separation + scroll logic already exists; only the geometry changes).
See the build spec in the project notes. Target: PBR metallic-roughness, ≤2K textures,
< ~200k tris, Draco-compressed, < ~5 MB.

## Structure

```
index.html        markup + Three.js / GSAP CDN scripts
css/styles.css    design system (tokens, HUD, exploded-triad stage, responsive, reduced-motion)
js/main.js        3D Praesidium (Three.js) · boot · scroll engines · castrum · form
assets/           drop praesidium.glb here (optional, for the real model)
```

## Notes

- **Accessibility:** respects `prefers-reduced-motion` (animations off, panels shown
  statically), keyboard-focusable form with inline validation, semantic headings.
- **Resilience:** if GSAP fails to load, the scroll engine falls back to raw scroll math;
  the hero reveal is pure CSS so the fold is never blank.
- Built with the `ui-ux-pro-max` design intelligence skill.

© 2026 Castralis Infrastructure Systems. Bound by the laws of thermodynamics.
