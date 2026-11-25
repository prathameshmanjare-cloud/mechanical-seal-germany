# Prompt — Interactive "Lost Seal" 404 page (SAP Parts)

Build a full-viewport, highly interactive 404 page for **SAP Parts**, a German webshop for
mechanical seals. It lives inside the existing React + Vite site (`src/pages/NotFound.jsx`),
keeps the site header and footer, and uses the site's own plain CSS design system in
`src/index.css` (no Tailwind, no new libraries). Icons come from `lucide-react`.

The page is the brand version of the "lost fox holding a map" 404 idea. There is **no animal**.
The hero is a **real mechanical seal**: the cartridge seal photo from the catalogue
(`public/img/category/clean/cartridge-mechanical-seals.webp`), cut out of its white background
(floor reflection removed) and saved as `public/img/404/cartridge-seal.webp`. It sits on a compass dial
and turns like a compass needle to point at the mouse. The **map is the whole page**: topographic
contour lines in the background, and a route that runs across the hero between clickable map pins.

---

## Colours (site palette only — do not invent new ones)

| Use | Token | Value |
|---|---|---|
| Background top → bottom | `--accent` → `--accent-soft` → white | `#F9C301` (soft) → `#FFF5D1` → `#FFFFFF` |
| Giant 404 | white | `#FFFFFF` |
| Seal flange, headline, primary button | `--navy` / `--navy-3` / `--chrome` | `#01458E` / `#012D5E` / `#001936` |
| Seal needle, pin hover | `--accent` | `#F9C301` |
| Contour lines, dial ticks | navy, low alpha | `rgba(1,69,142,.16)` |
| Body text | `--text` / `--muted` | `#4C4C4C` / `#646464` |
| Dead-end X and spur only | warning red | `#D92D20` |

Font: Inter (already loaded by `index.html`).

---

## Layout

- Section `.nf` sits between the header and footer: `min-height: calc(100svh - var(--header-h))`,
  `overflow: hidden`, flex column, centred.
- Background: `linear-gradient(180deg, rgba(249,195,1,.55) 0%, #FFF5D1 45%, #FFFFFF 88%)`.

### Background "404"
- Absolutely centred, `pointer-events: none`, white, weight 800, `line-height: .8`,
  `letter-spacing: -.06em`, font size `clamp(220px, 46vw, 760px)`, scaled `scale(1.1, 1.35)`.
- The whole layer has `opacity: .75` and a mask that fades it out towards the bottom:
  `mask-image: linear-gradient(to bottom, #000 35%, transparent 92%)` (+ `-webkit-` prefix).
- Parallax: the layer moves up to 18px **opposite** to the pointer.

### Map (background)
- Full-section SVG (`preserveAspectRatio="xMidYMid slice"`): an 80px map grid plus topographic contour
  lines — closed, wobbly loops around four "hills" (generated in code with sine noise and Catmull-Rom
  smoothing; every 4th line heavier, like an index contour). Colour `rgba(1,69,142,.16)`, fading out
  towards the bottom with a mask. Moves half as much as the 404 layer for depth.

### Stage (route, pins, seal)
- One box with a fixed `1600 / 760` aspect ratio, max 1200px wide and short enough that the copy and
  buttons stay on screen. The route SVG and the pins share the same coordinates.
- **Route** — dotted navy line (`stroke-dasharray: 2 14`, marching) on a white casing, like a trail on a
  hiking map: Home pin (bottom-left) → up and over the seal → Shop pin (top-right) → Engineers pin
  (bottom-right). It draws itself on load (mask path with `pathLength=1`, dashoffset 1 → 0).
- **Dead end** — a red dotted spur leaves the route and ends at a red X in a white circle with a red
  "You are here" chip: the visitor's broken link.
- **Pins** — navy map-marker teardrops with lucide icons (`Home`, `ShoppingBag`, `MessageSquare`) and
  white label chips. They are real links (`/`, `/shop/`, `/contact/`), drop in one after another, and on
  hover lift up and turn signal-yellow.
- **Seal** — centred, 30% of the stage: a frosted compass dial (ring, 144 tick marks, N/E/S/W in navy)
  stays still; inside it the seal photo and a yellow needle triangle rotate together. Soft drop shadow
  under it.

### Copy (below the hero)
- Small pill: `404 · /the/missing/path` (shows the real requested path).
- H1: **"Uh-oh! This page isn't on our map"** — navy-black, `clamp(30px, 4.4vw, 56px)`, weight 700.
- Sub: "Our seal spun off course. We'll guide you back to parts you know."
- Buttons: primary navy pill **"Take me home"** (lucide `ChevronLeft`) → `/`;
  outline pill **"Browse the Shop"** → `/shop/`.
- Help line: "Looking for a part number? **Contact our engineers**" → `/contact/`.

---

## Interaction (the important part)

1. **Compass follow** — on `pointermove` anywhere in the section, compute the angle from the
   seal centre to the pointer (`atan2`, 0° = straight up). Unwrap the angle so the seal always
   turns the short way, then drive the rotation with a damped spring (stiffness ≈ 0.06,
   damping ≈ 0.82) in a `requestAnimationFrame` loop. Moving the mouse clockwise around the seal
   turns it clockwise; anticlockwise turns it back.
2. **3D tilt** — the seal and dial tilt up to 12° (`rotateX/rotateY`, `perspective: 900px`) toward the pointer.
3. **Idle spin** — 2.5 s after the last pointer move (or on touch devices before any touch),
   the seal keeps turning slowly clockwise (~24°/s), like a running shaft.
4. **Click / tap / Enter on the seal** — spins two full turns clockwise with a spring overshoot.
   The seal is a `<button aria-label="Spin the seal">`.
5. **Map pins** — hover lifts the pin and turns it yellow; click navigates.
6. **Entrance** — seal drops in, route draws itself, pins drop one by one, red X pops, copy fades up.
7. **Parallax** — the 404 layer and the contour map shift against the pointer at different depths.
8. All transforms are written to the DOM by ref in the rAF loop (no React re-render per frame).
9. `prefers-reduced-motion: reduce` → no loop, no idle spin, no marching route; the page is static.

---

## Responsive
- ≤ 760px: route and pins are hidden (too small to tap), the seal dial is `min(72vw, 300px)`,
  buttons stack full-width, 404 font `clamp(200px, 70vw, 360px)`. The contour map stays.
- Header and footer stay as on every other page.

## Accessibility
- Decorative SVGs `aria-hidden`, the seal button has a label, focus ring uses the site `:focus-visible`.
- Text contrast: headline and body on the pale yellow/white background meet WCAG AA.
- `document.title = "Page not found | SAP Parts"`.
