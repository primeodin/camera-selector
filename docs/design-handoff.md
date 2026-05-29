# Handoff: PrimeOdin DIY NVR Planner

## Overview
The **PrimeOdin NVR Planner** is a web app that helps people design a DIY network-video-recorder (NVR) system built on the open-source **Frigate** stack. The user places IP cameras on a plan of their property; the app computes, live, the **PoE power budget, storage, switch topology, wired/wireless networking, a costed bill of materials, and a starter Frigate `config.yml`.**

There are two surfaces:
1. **Landing page** (`Home.html`) — public marketing page with a CTA into the planner.
2. **Planner app** (`DIY NVR Planner.html`) — the tool itself: a left configuration rail, a **Site Plan** map for placing cameras, and a **Results** dashboard (topology diagram, stat cards, BOM, Frigate config, guidance).

## About the design files
The files in this bundle are **design references created in HTML/React-via-Babel** — high-fidelity prototypes that demonstrate the intended look, behavior, and (importantly) the **exact business logic**. They are **not** meant to be shipped as-is (they use in-browser Babel, no build step, no persistence, and faked map imagery).

**The task is to recreate these designs in a production codebase.** No production codebase exists yet, so the recommendation below is to build it in **Next.js + TypeScript**. Recreate the UI using a real component architecture and the design tokens provided, and **port the planning engine (`calc.jsx`) verbatim into a typed, unit-tested `planner.ts`** — it is the canonical spec for all calculations.

## Fidelity
**High-fidelity.** Colors, typography, spacing, glass treatment, and interactions are final and follow the **PrimeOdin "Liquid Glass" design system** (light by default, with a dark theme). Recreate the UI faithfully. All design tokens are in `colors_and_type.css` (CSS custom properties) — reuse them directly or map them into your styling solution (Tailwind theme, CSS modules, etc.).

---

## Recommended stack & architecture

| Concern | Recommendation | Notes |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | SEO for the public landing page; API routes to proxy Maps/pricing keys; easy Vercel deploy |
| Styling | Keep `colors_and_type.css` tokens (or map to a Tailwind theme) | Design system is already tokenized |
| Engine | Port `calc.jsx` → `lib/planner.ts` (pure functions, unit-tested) | The heart of the product; no UI deps |
| Maps | **Google Maps JS API** (Places Autocomplete + satellite) or Mapbox GL | Replaces the schematic-lot placeholder; key proxied server-side, referrer-restricted |
| Save/share | Phase 1: **URL-encode plan state** (shareable links, no backend). Phase 2: **Supabase** (Postgres + auth + blueprint storage) | The whole plan is small JSON — encode to the URL for instant sharing |
| Export | print-CSS / `react-pdf` for the plan; client CSV for BOM | BOM CSV export logic already exists in `app.jsx` |
| Hosting | Vercel | — |

**Suggested module layout**
```
app/                      # Next.js routes: / (landing), /planner
lib/planner.ts            # ported calc engine (pure)
lib/planner.types.ts      # the contracts below
lib/frigate.ts            # frigateConfig() generator
components/planner/       # Panel, SitePlan, Topology, Dashboard, Tweaks
components/marketing/     # landing sections
styles/tokens.css         # = colors_and_type.css
```

---

## Surfaces & screens

### A. Landing page (`Home.html`)
- **Layout:** centered, 1200px max container, 96px section rhythm, page-wide pastel "haze" background (fixed radial gradients). Floating glass **nav pill** (sticky, 16px from top). 
- **Sections, in order:**
  1. **Nav** — mark + "PrimeOdin" wordmark + "NVR Planner" tag; links (How it works, Features, FAQ); primary capsule CTA "Open the planner →".
  2. **Hero** — capsule eyebrow ("Built for Frigate · open-source NVR"); display headline `Your camera system,` + spectrum/serif-italic `planned in minutes.`; serif-italic kicker; lede paragraph; primary + secondary CTAs; trust row (3 green-check items); **product-preview glass card** = a browser window (traffic lights + URL pill) containing a schematic lot with camera bubbles + coverage cones, an address chip, and a 3-stat strip (Cameras / PoE budget / Storage).
  3. **How it works** — 4 glass step cards (Map property → Place cameras → Get network → Export build).
  4. **Features** — 6 solid cards with colored icon tiles (PoE budget, Storage, Topology, Wired/wireless, Frigate config, BOM).
  5. **CTA** — large glass panel, logo mark, "Start planning your system", primary CTA.
  6. **FAQ** — 4 cards (real maps?, price accuracy, camera support, data storage).
  7. **Footer** — mark + links + disclaimer.
- **Voice:** PrimeOdin — calm, sentence case, figures with units, no emoji; spectrum gradient text used exactly once (hero word); Instrument Serif italic for the kicker and hero accent.

### B. Planner app (`DIY NVR Planner.html`)
Two-column grid: **340px left rail** + fluid **main**, 16px gap, on the haze backdrop.

- **Left rail (`Panel`)** — glass panel. Brand lockup; **Locations & cameras** = a `ZoneCard` per location with: editable name, total count, remove button, **Uplink Wired/Wireless toggle**, and three camera-type steppers (Standard / PTZ / PoE++). "Add location" button. Then global settings: **Resolution** (2/4/8 MP segmented), **Recording mode** (24/7 vs Frigate events), **Retention** (3–90 day slider), **Quality tier** (Good/Better/Best). Clicking a ZoneCard sets it active (syncs with the map).
- **Main top bar** — breadcrumb eyebrow; dynamic H1 ("{N} cameras across {M} locations"); helper line (topology phrase + estimated total); theme toggle; "Export BOM" (CSV); "Export plan" (print). 
- **View toggle** — segmented "Site plan" / "Results".
- **Site plan view (`SitePlan`)** — toolbar: address field + "Locate", "Upload blueprint", **"Auto-group"**; location chips (active highlit, wireless ones show a wifi icon) + add-location; camera-type **Drop palette** (arm a type, click map to place). The map: schematic lot SVG **or** uploaded blueprint image; each camera = a draggable bubble (type-colored fill, zone-colored ring) with a rotatable **coverage cone**; **hover a bubble → popover** (change type, rotate aim ±20°, reassign location, remove). Address chip + honesty note ("Schematic preview · connect Google Maps for satellite imagery").
- **Results view** — **Topology diagram** (auto-laid-out SVG: NVR → core → access switches → camera groups; LACP doubled lines; **wireless uplinks dashed with a "PtP" label + wifi glyph**); **Stat grid** (Cameras, PoE budget w/ meter + headroom badge, Storage, Topology); **tabs** = Bill of materials (grouped table + total + CSV note), Frigate config (highlighted YAML + copy), Guidance (cards incl. a wireless VLAN card when applicable).
- **Tweaks panel** — Theme (light/dark), Accent (aurora/aether/ember), Density, Corners.

---

## Core data model (contracts)

```ts
// ---- camera & site model (the app's source of truth) ----
type CameraType = 'standard' | 'ptz' | 'highpower';
type LinkType   = 'wired' | 'wireless';

interface Camera {
  id: string;
  zoneId: string;
  type: CameraType;
  x: number;      // 0..1 normalised position on the map
  y: number;      // 0..1
  angle: number;  // degrees, 0 = up/north, clockwise; cone aim
}

interface Zone {        // a physical location / camera cluster
  id: string;
  name: string;
  link: LinkType;       // uplink back to the core
}

interface Settings {
  resolution: '2mp' | '4mp' | '8mp';
  recordMode: 'continuous' | 'event';
  retention: number;    // days, 3..90
  tier: 'good' | 'better' | 'best';
}

// ---- derived input to the engine ----
interface Cluster {     // one per zone, derived from cameras
  name: string;
  link: LinkType;
  standard: number;     // counts by type
  ptz: number;
  highpower: number;
}
interface PlanConfig extends Settings { clusters: Cluster[]; }

// ---- engine output ----
interface BomItem { group: 'Cameras'|'Network'|'Recorder'|'Storage'; name: string; sub: string; qty: number; unit: number; }
interface PlanResult {
  totalCams: number; totalPower: number; clusters: number;
  access: { cluster: Cluster; switches: SwitchPick[]; link: LinkType }[];
  topology: 'single' | 'core-access' | 'backbone';
  multiSwitch: boolean; needBackbone: boolean; lacp: boolean;
  wirelessLinks: number; wirelessMaxMbps: number;
  totalAccessSwitches: number; totalPoeBudget: number; headroomPct: number;
  res: { label: string; mbps: number }; duty: number;
  gbPerCamDay: number; totalGbDay: number; totalTb: number;
  recTb: number; driveSize: number; driveQty: number;
  nvr: NvrTier; nvrNodes: number; detector: Detector; detectorQty: number; tier: string;
  bom: Record<string, BomItem[]>; bomFlat: BomItem[]; total: number;
}
```

**The single source of truth is the `Camera[]` array.** Clusters are derived each render by grouping cameras by `zoneId` and counting types. The left-rail steppers and the map both mutate the same `Camera[]`:
- stepper **+** = add a camera of that type to that zone (auto-placed near a zone anchor);
- stepper **−** = remove the most recently added camera of that type in that zone;
- map drop = add a camera at the clicked normalized position.

---

## Planning engine — canonical logic (port `calc.jsx` → `planner.ts`)

All constants are documented industry averages; keep them in one place and make them easily editable (ideally a data file / CMS for pricing).

**Camera classes** (`watts`, est. `price` USD): standard `8W / $58`, ptz `15W / $185`, highpower (PoE++) `25W / $265`.

**Resolution → main-stream bitrate (Mbps):** 2MP `4`, 4MP `8`, 8MP `16`.

**Storage:** `1 Mbps sustained = 10.8 GB/day`. Event mode keeps `duty = 0.18` (≈18% of wall-clock); continuous `duty = 1`.
- `gbPerCamDay = res.mbps * 10.8 * duty`
- `totalTb = gbPerCamDay * totalCams * retention / 1000`
- `recTb = max(2, ceil(totalTb * 1.2))` (20% slack); pick from drive sizes `[4,6,8,12,16,20]TB`, stacking 20TB drives beyond.

**PoE switch catalogue** (`ports`, `poe` budget W, `price`): 8-port PoE+ `8 / 65W / $120`; 16-port PoE+ `16 / 150W / $210`; 24-port PoE+ `24 / 195W / $340`; 48-port PoE++ `48 / 600W / $720`. Aggregation (no PoE): 8-port 10GbE `$360`.

**Switch selection per cluster:** need to cover `cameras` (reserve 1 port for uplink) **and** `power × 1.25` (25% headroom). Pick the smallest single switch that satisfies both; if none, stack the largest switch (qty = max(by-ports, by-power)).

**Topology decision:** `multiSwitch = (totalAccessSwitches > 1 || clusters > 1)`. `needBackbone = totalCams >= 48`. `topology = !multiSwitch ? 'single' : needBackbone ? 'backbone' : 'core-access'`. `lacp = multiSwitch`.

**PoE budget:** sum of selected switches' budgets; `headroomPct = round((budget - load)/budget * 100)`. Healthy ≥ 20%.

**Wired vs wireless (per zone `link`):**
- Wired zones route Cat6 to the core (`Cat6 drops + keystones`, qty = totalCams, $14 ea).
- Wireless zones (only meaningful when `multiSwitch`): still get a local PoE switch (cameras need power), but the **uplink is a 5GHz point-to-point bridge** instead of a cable run. Add BOM `Wireless bridge kit (PtP)` qty = number of wireless zones, $190 ea. Expose `wirelessLinks` and `wirelessMaxMbps = max over wireless zones of (zoneCams × res.mbps)` for the bandwidth-check guidance.
- Topology renders wireless core→access edges **dashed** with a "PtP" label; wired edges may show "LACP".

**NVR tier by total cameras:** ≤8 Mini PC N100 `$180`; ≤20 NUC i5/Ryzen5 `$420`; ≤40 Custom i7/Ryzen7 `$780`; ≤64 Tower Xeon/Ryzen9 `$1450`. `nvrNodes = totalCams>64 ? ceil(totalCams/64) : 1`.

**AI detector by streams/node:** ≤12 Coral USB `$60`; ≤30 Hailo-8L `$70`; ≤64 Hailo-8 `$120`. qty = nvrNodes.

**Pricing tier multiplier** applied to cameras + NVR: good `×0.82`, better `×1.0`, best `×1.35`.

**BOM** groups: Cameras (per type qty), Network (switches + core/aggregation + Cat6 + wireless bridges), Recorder (NVR ×nodes + detector ×qty), Storage (HDDs ≈ `$21/TB`). `total = Σ qty×unit`.

**Frigate `config.yml`** (`frigateConfig(config, plan)`): emits `mqtt`, `detectors` (coral→`edgetpu`/usb else `hailo8l`/PCIe), `record` (retain days = retention; mode `all` continuous / `motion` event), `objects`, and one `cameras:` entry per camera (slug from zone name + index) with a `detect` sub-stream (640×360@5) and a `record` main-stream RTSP path. **Validate against the current Frigate schema version before shipping.**

---

## Component contracts (props)

- **`<Panel>`** — `zones, settings, setSettings(partial), countType(zoneId,type), countInZone(zoneId), addCamera(zoneId,type,x?,y?,angle?), removeCameraOfType(zoneId,type), renameZone(id,name), addZone(), removeZone(id), setZoneLink(id,link), activeZone, setActiveZone(id), RES, CAM, density`
- **`<SitePlan>`** — `zones, cameras, addCamera, updateCamera(id,patch), removeCamera(id), addZone, removeZone, renameZone, setZoneLink, onAutoGroup(), activeZone, setActiveZone, CAM, countInZone`
- **`<Topology>`** — `p: PlanResult, config, accent` (renders the SVG diagram; reads `p.access[i].link` for wireless dashing)
- **`<StatGrid>`** — `p: PlanResult`
- **`<BomTable>`** — `p: PlanResult`; **`<FrigateBlock>`** — `yaml: string`; **`<Guidance>`** — `p: PlanResult`
- **Tweaks** — theme (`light`/`dark` via `data-theme`), accent (sets `--accent` + `--focus`), density (paddings), radius (overrides `--radius-*`).

### Key interactions
- **Drop:** arm a type in the palette → click map → `addCamera(activeZone, type, x, y, aimAtCenter)`.
- **Drag:** pointer-drag a bubble updates normalized `x,y` (clamp 0.02–0.98).
- **Hover popover:** type switch, rotate aim ±20°, reassign zone (`<select>`), remove.
- **Auto-group:** greedy proximity clustering of camera positions (distance threshold ≈0.19 normalized); creates compass-named zones (North/South/East/West/Central, de-duped) and reassigns every camera; preserves all cameras. Implement keyboard/touch fallbacks for production.
- **Aim helper:** `aimAt(x,y) = atan2(0.5 - x, -(0.5 - y)) in degrees` (points toward map center).

---

## Design tokens
All in `colors_and_type.css`. Highlights:
- **Surfaces (light):** pearl `#FBFCFE`, white `#FFFFFF`, frost `#F2F5FB`, mist `#E6EBF3`. **Dark:** obsidian `#070912`, midnight `#0E1424`, slate `#1A2238`.
- **Text:** `#0E1424 / #404B66 / #6B7591 / #A6B0C8`.
- **Accents:** aurora `#0E8FCC` (cyan, primary), aether `#6B4DEB` (violet), ember `#E5680A` (orange). Bright variants for dark mode (`#5EE6FF / #A78BFA / #FB923C`). Success `#0F9D6B`, danger `#D6353F`.
- **Camera-type colors:** standard = aurora, PTZ = aether, PoE++ = ember.
- **Spectrum gradient** (one moment/page): `linear-gradient(95deg,#38BDF8,#7C5CF5,#F97316)`.
- **Type:** display **Space Grotesk** (600, tight tracking), body **Geist**, mono **JetBrains Mono**, editorial **Instrument Serif italic**. Scale, radii (6/10/14/20/28/999), spacing (4px base), glass blur/tint, shadows, and motion easings are all tokenized.
- **Glass:** near-opaque white + `blur(22–30px) saturate(140%)` + 1px hairline border + inset top-highlight `rgba(255,255,255,1)`. Dark mode flips to tinted dark.

## Assets
- `assets/logo-mark.svg` — spectrum-ringed prism "eye" mark (theme-independent).
- `assets/logo-mark-light.svg`, `logo-wordmark-light.svg`, `logo-wordmark-dark.svg` — additional logo variants.
- Icons are inline SVG in the prototype; in production use **Lucide** (the design system's icon set, 1.5px stroke) for parity.
- The schematic lot and camera bubbles/cones are drawn with SVG (no raster assets). Replace the schematic with a real map tile layer in production.

## Production gaps (must address before launch)
1. **Real maps** — replace the schematic lot with Google Maps/Mapbox (address autocomplete + satellite), key proxied server-side.
2. **Build pipeline** — remove in-browser Babel; compile/minify.
3. **Persistence/sharing** — URL-encode plan state (phase 1) → accounts + saved plans + blueprint storage (phase 2).
4. **Mobile/tablet** + **accessibility (WCAG AA)** — current layout is desktop-fixed; drag is pointer-only. Add responsive layout, keyboard/touch interactions, focus management, ARIA.
5. **Pricing** — externalize the catalogue into a maintained, dated data source; add "prices updated {date}" + FTC/affiliate disclosure if monetizing links.
6. **Frigate config** — validate against current schema; **engine unit tests**.
7. **Ops** — error monitoring (Sentry), analytics, SEO/OG, privacy policy + terms.

### Suggested phasing
- **MVP:** Next.js port, real maps, pricing JSON, shareable links, mobile pass, public landing page. No accounts.
- **V1:** accounts + saved plans, PDF export, affiliate links, advanced mode (campus / 10GbE / multi-NVR).

## Files in this bundle (`prototype/`)
- `DIY NVR Planner.html` — app shell (script load order, glass/atmos/button/badge CSS, cache-busting).
- `Home.html` — landing page.
- `calc.jsx` — **the planning engine (canonical logic).**
- `topology.jsx` — SVG topology diagram.
- `siteplan.jsx` — Site Plan map, camera bubbles/cones, hover popover.
- `panel.jsx` — left configuration rail.
- `dashboard.jsx` — stat grid, BOM table, Frigate config block.
- `app.jsx` — state model (cameras-as-truth), derived clusters, auto-group, exports, tweaks wiring.
- `tweaks-panel.jsx` — tweak controls shell.
- `colors_and_type.css` — **design tokens.**
- `assets/` — logos.

To run the prototype as a reference: open `Home.html` or `DIY NVR Planner.html` in a browser (no build needed).
