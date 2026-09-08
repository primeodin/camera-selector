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


## Daily builds series

Tiny, tested teaching repos — starter → craft. Ship one, read it, then climb:

| Lane | Repo | Why open it |
| --- | --- | --- |
| Starter | [first-commit-ai](https://github.com/primeodin/first-commit-ai) | Mock-first chat CLI + pytest |
| Starter RAG | [notes-rag](https://github.com/primeodin/notes-rag) | Retrieve, cite, answer over Markdown notes |
| Starter tokenizer | [tiny-bpe-tokenizer](https://github.com/primeodin/tiny-bpe-tokenizer) | Watch text become token IDs — train, encode, decode |
| Mid tool agent | [tiny-tool-agent](https://github.com/primeodin/tiny-tool-agent) | ReAct: Thought, Action, Observation, Final Answer |
| Attention mid | [attention-warrior](https://github.com/primeodin/attention-warrior) | Transformer attention you can hold in one hand |
| Shop skills | [mister-jay](https://github.com/primeodin/mister-jay) | Interactive DIY drills — [live](https://primeodin.github.io/mister-jay/) |
| Literacy (Sinhala) | [jay-ai-sinhala](https://github.com/primeodin/jay-ai-sinhala) | Friends 70+ learning GitHub + AI — [live](https://primeodin.github.io/jay-ai-sinhala/) |
| Systems DIY (this) | [camera-selector](https://github.com/primeodin/camera-selector) | NVR/Frigate camera planning — [live](https://primeodin.github.io/camera-selector/) |

Weekday cadence, in order: chat CLI → RAG → tokenizer → tool agent (shipped) → prompt lab → embeddings → vision → memory → shop-skill explainer. Live demos stay up front on craft repos.

## Help / good first issues

Scoped tickets (now labeled `good first issue`):

- [#1](https://github.com/primeodin/camera-selector/issues/1) — start-here Frigate walkthrough (`docs/`)
- [#2](https://github.com/primeodin/camera-selector/issues/2) — keyboard + focus a11y on planner controls
- [#3](https://github.com/primeodin/camera-selector/issues/3) — `CONTRIBUTING.md` for planner engine + Pages deploy

Claim one in a comment. Profile forge: [github.com/primeodin](https://github.com/primeodin)
