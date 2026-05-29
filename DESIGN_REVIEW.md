# Design review: PrimeOdin NVR Planner

Reviewed against: `docs/design-handoff.md`, the current implementation, and the Vercel Web Interface Guidelines fetched on 2026-05-29.
Philosophy: PrimeOdin Liquid Glass, light-first, calm technical planning surface with a dark-mode option.
Date: 2026-05-29T15:55:46-04:00

## Screenshots captured

| Screenshot | Breakpoint | Description |
| --- | --- | --- |
| `screenshots/review-home-desktop-1280.png` | Desktop 1280x800 | Landing hero and product preview |
| `screenshots/review-home-tablet-768.png` | Tablet 768x1024 | Landing responsive layout |
| `screenshots/review-home-mobile-375.png` | Mobile 375x812 | Landing mobile hero/nav |
| `screenshots/review-planner-desktop-1280.png` | Desktop 1280x800 | Planner left rail and site plan |
| `screenshots/review-planner-tablet-768.png` | Tablet 768x1024 | Planner tablet stack |
| `screenshots/review-planner-mobile-375.png` | Mobile 375x812 | Planner mobile first screen |

## Summary

The desktop direction is visually promising: the palette, logo treatment, haze background, rounded glass surfaces, and Space Grotesk/Instrument Serif contrast match the handoff. The build is not ready as a design implementation, though. The mobile landing page is broken, the planner's responsive behavior hides the actual planner below an oversized configuration rail, and several copy claims contradict the implemented feature set.

The content also has AI-slop residue: generic marketing abstractions, vague qualifiers, and claims like "Shareable phase-one plan" and "blueprint upload" that are not actually implemented. The review should be treated as a pre-polish QA report, not a launch approval.

## Must fix

1. **Mobile landing hero is broken.** `app/page.tsx:29` keeps a two-column grid with `minmax(360px,.82fr)` and no mobile override. On `screenshots/review-home-mobile-375.png`, the preview column pushes content out of view, the eyebrow wraps into a tall pill, and the hero/kicker is clipped after a few words. _Fix: add mobile-first layout rules: single column, reduce hero clamp, make the product preview stack below the copy, and let the eyebrow size to content instead of becoming a narrow vertical capsule._

2. **Tablet/mobile planner shows only the rail, not the app.** `app/planner/page.tsx:48` switches to one column at 980px, but `app/planner/page.tsx:49` keeps the entire configuration rail above the main work area. On `screenshots/review-planner-tablet-768.png` and `screenshots/review-planner-mobile-375.png`, users cannot see the H1, site plan, results, or export controls without scrolling past the whole rail. _Fix: on tablet/mobile, move global settings into a collapsible drawer or details panel, keep the project summary and Site plan/Results tabs above the rail, and make the rail a secondary panel._

3. **Landing copy promises shareability that does not exist.** `app/page.tsx:37` says "Shareable phase-one plan", and `app/page.tsx:53` says the plan lives in the browser until users "export or share it." There is no URL state, share button, saved link, or encoded plan state. _Fix: either implement URL-encoded plan state or change the copy to "Local browser plan" / "Exportable BOM and config."_

4. **FAQ says blueprint upload exists, but the app has no upload control.** `app/page.tsx:54` says "The production surface has a blueprint upload and a schematic fallback." The handoff asked for Upload blueprint, but the current `SitePlan` toolbar at `app/planner/page.tsx:84` only has an address input and camera-type buttons. _Fix: add the upload flow or rewrite the FAQ to say "Blueprint upload is planned."_

5. **The map is clickable SVG but not keyboard accessible.** `app/planner/page.tsx:86` uses an SVG `onClick` to add cameras; `app/planner/page.tsx:90` uses pointer handlers on SVG groups for drag. Per Web Interface Guidelines, interactive elements need keyboard handlers and semantic controls where possible. _Fix: add keyboard placement controls, a focusable map region with instructions, `tabIndex`, `onKeyDown`, and alternate forms for x/y/angle/type changes._

6. **Zone cards are clickable divs.** `app/planner/page.tsx:53` uses a `<div onClick>` to select a zone. This violates the guideline: use `<button>` for actions, not clickable divs. It is also nested around other buttons/inputs, which creates event conflict risk. _Fix: make the zone card selection a distinct button/header control, or use `fieldset`/radio semantics for active zone._

7. **Camera popover controls render as tiny raw browser buttons.** `app/planner/page.tsx:91` puts `↺`, `↻`, and `Remove` inside an SVG `foreignObject` using unstyled `<button>` elements. On `screenshots/review-planner-desktop-1280.png`, they look like default HTML controls and break the high-fidelity Liquid Glass aesthetic. _Fix: use a real React popover outside the SVG, with styled controls, type selector, zone reassignment, angle controls, and proper keyboard focus._

## Should fix

1. **The desktop hero is too large and sacrifices the product preview.** In `screenshots/review-home-desktop-1280.png`, the H1 dominates, while the preview is cut at the fold and the trust row is not visible. The brief wants hero + preview + trust row. _Fix: reduce desktop max H1 size from 112px (`app/page.tsx:32`) to around 88-96px, tighten hero vertical padding, and align the preview so its stat strip appears above the fold._

2. **The product preview metrics contradict the seeded planner.** `app/page.tsx:47` shows 12 cameras / 184W / 8TB. The actual planner seed at `app/planner/page.tsx:13-18` has 5 cameras and the planner H1 shows 5 cameras. _Fix: either make the hero preview a labeled example plan or sync its numbers with the seeded state._

3. **The CTA says local-first but the trust row says shareable.** `app/page.tsx:37` and `app/page.tsx:53` are internally inconsistent. _Fix: decide the product promise for this version: local-only export, or shareable URL. Do not claim both until both exist._

4. **Icon accessibility is inconsistent.** Decorative Lucide icons do not have `aria-hidden` in `app/page.tsx:37`, `app/page.tsx:52-53`, and `app/planner/page.tsx:70`, `app/planner/page.tsx:85`, `app/planner/page.tsx:101`. Screen readers may announce confusing SVGs. _Fix: add `aria-hidden="true"` for decorative icons and explicit labels where icon meaning is not duplicated by text._

5. **Inputs are under-labeled and under-specified.** Zone name inputs at `app/planner/page.tsx:54` have no label or `aria-label`; the address input at `app/planner/page.tsx:84` lacks `name`, `autocomplete`, and a placeholder with ellipsis per guidelines. _Fix: add accessible labels, names, and `autoComplete="off"` for non-auth planning fields._

6. **Destructive actions are immediate.** `removeZone` and camera remove controls at `app/planner/page.tsx:54`, `app/planner/page.tsx:91` delete data immediately. Guidelines call for confirmation or undo on destructive actions. _Fix: add an undo toast/window for zone and camera deletion._

7. **No visible focus system.** `app/globals.css:79-83` defines `.btn` but no `:focus-visible` style. _Fix: add a global `:focus-visible` ring using `--focus`, and test keyboard navigation._

8. **No reduced-motion or touch handling policy.** `app/globals.css` has smooth scrolling at line 49 and no `prefers-reduced-motion`. `app/planner/page.tsx:90` drag code does not disable text selection during drag. _Fix: add `@media (prefers-reduced-motion: reduce)` and drag-state CSS like `user-select: none` / `touch-action: none` for the map region only._

9. **Dark mode is app-local, not document-level.** `app/planner/page.tsx:47` sets `data-theme` on `<main>`, while guidelines prefer `color-scheme` on `<html>` for native controls/scrollbars. It also only exists on `/planner`, not the landing page. _Fix: lift theme to a provider that sets `document.documentElement.dataset.theme` and persists the setting._

10. **The results grid will likely overflow on mobile.** `app/planner/page.tsx:97` hardcodes `gridTemplateColumns: '1.1fr .9fr'` without a responsive override. _Fix: stack results sections below 980px and order stats before topology on mobile._

11. **Remote Google Fonts via CSS `@import` is render-blocking.** `app/globals.css:1` imports fonts in CSS. _Fix: use `next/font/google` or explicit preconnect/preload and `font-display: swap` handling through Next._

12. **Potential contrast issue on muted text over glass.** `--muted: #6b7591` (`app/globals.css:10`) on translucent glass is low-contrast in some small copy areas, visible in the landing lede and planner helper text. _Fix: test contrast against the actual composite backgrounds; use `--slate` for body copy where needed._

## Could improve

1. **Use a real component structure.** Most UI lives in two long files with heavy inline styles (`app/page.tsx`, `app/planner/page.tsx`). This slows design iteration and causes one-off spacing. Split into `Panel`, `SitePlan`, `Topology`, `StatGrid`, `BomTable`, and shared `Button/Card/SegmentedControl` components as the handoff recommended.

2. **Reduce AI-ish generic copy.** The strongest copy is specific: "PoE budget", "Frigate config", "Cat6", "5 GHz PtP." The weakest copy is generic: "Everything needed before buying hardware" (`app/page.tsx:52`), "A focused step that keeps the plan editable and grounded in equipment constraints" (`app/page.tsx:51`), "ready for refinement" (`app/page.tsx:10`). Replace these with concrete outputs and constraints.

3. **Fix title/case consistency.** The brief says calm sentence case. The fetched web guidelines prefer title case for buttons/headings. The current implementation mixes sentence case and title-ish labels. For this brand, keep sentence case but be consistent: "Open planner", "Export BOM", "Bill of materials", "Frigate config".

4. **Make the NVR/product naming consistent.** The source `calc.jsx` banner says "PRIMEODIN WATCHTOWER", while the repo and UI say "PrimeOdin NVR Planner" / "camera selector." Pick one product name and use it consistently in README, metadata, UI, and repo description.

5. **Add empty and extreme states.** There is no visual empty state for zero cameras, many zones, long zone names, or 50+ cameras. Add test fixtures or Storybook-style demo states to catch overflow.

## Content audit: AI slop and contradictions

### Contradictions / overclaims

- `app/page.tsx:37` - "Shareable phase-one plan" is false until URL state/share links exist.
- `app/page.tsx:53` - "until you export or share it" repeats the share claim without an implemented share action.
- `app/page.tsx:54` - "blueprint upload" is claimed in FAQ but absent from `/planner`.
- `app/page.tsx:54` - "production surface" suggests something more finished than the current MVP. It also blurs current vs planned functionality.
- `README.md:85` - "strong MVP" is self-congratulatory and not useful to an engineer. Replace with factual scope: "This version ports the prototype to Next.js and implements the planning engine, landing page, and local export flows."
- `README.md:88` - URL-encoded share links are listed as a follow-up, which conflicts with the landing page trust row claiming shareability now.

### AI-slop / generic copy

- `app/page.tsx:8` - "Plan remote barns, gates, shops, and outbuildings honestly." The word "honestly" sounds like a filler value judgment. Try: "Model remote barns, gates, shops, and outbuildings with PtP wireless uplinks."
- `app/page.tsx:10` - "ready for refinement" is vague. Try: "Export a grouped CSV with quantities, unit costs, and totals."
- `app/page.tsx:33` - "A calm planning surface" is on-brand but a little abstract. Keep if the brand wants editorial tone; otherwise use: "Sketch a Frigate build before you buy switches, drives, or cameras."
- `app/page.tsx:51` - "A focused step that keeps the plan editable and grounded in equipment constraints" is generic AI filler. Replace each card with specific action/result copy.
- `app/page.tsx:52` - "Everything needed before buying hardware" overstates the feature set because real maps, blueprint upload, schema validation, and dated pricing are still absent. Try: "First-pass hardware estimates before you buy."

## Web Interface Guidelines findings

### app/page.tsx

- `app/page.tsx:37` - decorative `CheckCircle2` icons need `aria-hidden="true"`.
- `app/page.tsx:52` - feature icons need `aria-hidden="true"` or text labels if exposed.
- `app/page.tsx:53` - `ShieldCheck` icon needs `aria-hidden="true"`.
- `app/page.tsx:29` - two-column hero lacks mobile override; mobile screenshot shows broken layout.
- `app/page.tsx:54` - FAQ text claims unimplemented upload feature.

### app/planner/page.tsx

- `app/planner/page.tsx:53` - clickable `<div>` should be a semantic button or separate control.
- `app/planner/page.tsx:54` - zone name input lacks label/aria-label/name/autocomplete.
- `app/planner/page.tsx:54` - remove zone is destructive with no undo/confirmation.
- `app/planner/page.tsx:56` - minus buttons can be destructive and are not labeled for screen readers.
- `app/planner/page.tsx:70` - decorative icons need `aria-hidden="true"`.
- `app/planner/page.tsx:84` - address input needs name/autocomplete; placeholder should communicate example or end with ellipsis if used as prompt.
- `app/planner/page.tsx:86` - interactive SVG map lacks keyboard support and accessible instructions.
- `app/planner/page.tsx:90` - draggable SVG groups lack keyboard/touch alternatives and text-selection handling.
- `app/planner/page.tsx:91` - raw `foreignObject` controls are visually inconsistent and lack labels for arrow controls.
- `app/planner/page.tsx:97` - results grid lacks responsive column override.
- `app/planner/page.tsx:101` - heading contains icon without `aria-hidden`; code block needs copy button if the brief promises copy.

### app/globals.css

- `app/globals.css:49` - smooth scrolling lacks `prefers-reduced-motion` fallback.
- `app/globals.css:79-83` - buttons lack explicit hover/active/focus-visible states.
- `app/globals.css:1` - CSS `@import` for fonts is less robust than `next/font` or explicit preload/preconnect.
- `app/globals.css:90` - responsive handling only hides nav items; core layout breakpoints are missing for landing hero, section grids, and planner results.

## What works well

- Desktop visual direction is recognizably aligned with the handoff: haze background, glass panels, rounded nav, spectrum accent, Space Grotesk display type, and Instrument Serif accent all land in the intended territory.
- The planner engine is separated from UI, typed, and tested. That is the right foundation for trustworthy estimates.
- The left rail mirrors the requested domain model: locations, wired/wireless, camera type steppers, resolution, recording mode, retention, and tier.
- The desktop planner has a useful first-pass hierarchy: current camera/location count, estimate, view toggle, toolbar, site plan.

## Recommended next pass

1. Fix mobile landing layout.
2. Reorder planner mobile/tablet so the app summary and Site plan/Results appear before the configuration rail.
3. Remove or implement all contradictory share/upload claims.
4. Replace raw SVG camera popovers with a proper positioned popover.
5. Add focus-visible, labels, icon hiding, and keyboard fallbacks.
6. Split files into real components before further polishing.
