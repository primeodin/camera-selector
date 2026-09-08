# Contributing to camera-selector

Welcome. This repo is a DIY NVR / Frigate camera planner (Next.js + TypeScript). Pure planning math lives in lib/planner.ts. Live on GitHub Pages. Keep that bar in mind.

## Map (fork to PR)

1. **Fork** this repo on GitHub, then clone your fork:

```bash
git clone https://github.com/<you>/camera-selector.git
cd camera-selector
```

2. **Install** deps:

```bash
npm install
```
3. Prove the wiring before you change anything:

Run typecheck, test, and build (or the verify gate). See package scripts in README. No API keys needed.

4. Run locally when you touch the UI: start the Next.js dev server, open / and /planner.

5. Branch for one small change, then open a focused PR back to primeodin/camera-selector.

## Where the engine lives

| Path | Role |
| --- | --- |
| lib/planner.ts | Typed calculation engine (PoE, storage, BOM, Frigate YAML) |
| lib/planner.types.ts | Data contracts |
| lib/planner.test.ts | Handoff-derived unit tests |
| lib/site-plan.ts + lib/site-plan.test.ts | Blueprint / FOV helpers |
| app/planner/page.tsx | Interactive planner UI |
| app/page.tsx | Landing surface |
| docs/design-handoff.md | Original planning handoff |

## GitHub Pages (high level)

Push to main runs .github/workflows/deploy-pages.yml: typecheck, test, build with GITHUB_PAGES=true and NEXT_PUBLIC_BASE_PATH=/camera-selector, then deploys out/.

Live: https://primeodin.github.io/camera-selector/ and .../planner/. First PRs do not need to run Pages locally; local build is enough.

## Good first issues

- #1 start-here walkthrough for first-time Frigate planners
- #2 keyboard + focus visibility on planner controls

Claim one with a comment, then open the PR. Docs and a11y polish count.

## Shop rules

- Keep it small. No maps SDK, accounts, or affiliate wiring in a first PR.
- Formulas are tests. Change PoE/storage/BOM math only with matching Vitest updates.
- No secrets. Public repo + Pages — never commit keys or private customer layouts.
- Teach by running. Prefer a short walkthrough or a failing-to-passing test.
- Match the voice. Short, concrete, honest — shop notes, not marketing.

## PR checklist

- verify gate passes
- Planner still loads at /planner after local dev
- Behavior change has a Vitest (or docs-only PR says so)
- No secrets / private customer data
- One idea — no drive-by refactors

## What to skip

Please do not open PRs that require a live Frigate box or paid map key for the default path, rewrite landing copy for marketing tone, bundle unrelated refactors, or invent storage/PoE formulas without updating handoff-derived tests.

Questions? Comment on the issue you are claiming — that thread is the right place.
