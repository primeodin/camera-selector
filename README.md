# PrimeOdin NVR Planner

A production Next.js + TypeScript implementation of the PrimeOdin DIY NVR Planner handoff.

The app helps a homeowner or installer sketch a Frigate-based camera system, place cameras by location, and estimate:

- PoE switch sizing and headroom
- storage and retention
- wired/wireless topology
- NVR and detector class
- local blueprint/floor-plan image upload for camera placement
- visual field-of-view overlays by camera class
- costed bill of materials
- starter Frigate `config.yml`

## Surfaces

- Local `/` — public marketing/landing page
- Local `/planner` — interactive planning app
- GitHub Pages: https://primeodin.github.io/camera-selector/
- GitHub Pages planner: https://primeodin.github.io/camera-selector/planner/

## Tech stack

- Next.js App Router
- TypeScript strict mode
- React client components for planner state
- Pure planning engine in `lib/planner.ts`
- Vitest coverage for the calculation contract
- GitHub Actions CI for typecheck, tests, and production build
- GitHub Pages deployment for the static exported site

## Getting started

```bash
npm install
npm run dev
```

Open:

- http://localhost:3000
- http://localhost:3000/planner

## Verification

```bash
npm run typecheck
npm test
npm run build
```

Or run all gates:

```bash
npm run verify
```

## Project structure

```text
app/
  page.tsx             # landing page
  planner/page.tsx     # interactive planner app
  globals.css          # PrimeOdin liquid-glass tokens and shared styles
lib/
  planner.ts           # typed calculation engine
  planner.types.ts     # data contracts
  planner.test.ts      # handoff-derived unit tests
docs/
  design-handoff.md    # original uploaded handoff/specification
public/assets/         # PrimeOdin logo assets
```

## Planning engine notes

`lib/planner.ts` is a TypeScript port of the uploaded `calc.jsx` planning logic. The tests pin the canonical formulas for:

- camera count and wattage classes
- switch selection and PoE headroom
- storage sizing with event/continuous duty cycle
- topology and wireless bridge guidance
- grouped bill of materials
- Frigate YAML generation

The UI derives clusters from the canonical `Camera[]` array, so map placement and left-rail steppers mutate the same source of truth.

## Production follow-ups

The current implementation is a strong MVP that replaces the prototype's in-browser Babel with a real build pipeline. Before a public launch, wire these items:

1. Google Maps or Mapbox satellite layer with server-side key handling.
2. URL-encoded share links for plan state.
3. Optional account-backed saved plans.
4. Current Frigate schema validation against the installed target version.
5. Dated pricing catalogue and affiliate/disclosure language if monetized.
6. Expanded accessibility and touch/keyboard interactions for drag/rotation.

## Repository policy

The repository is public so GitHub Pages can serve the app at the project URL. Do not commit secrets, private customer data, or account credentials.
