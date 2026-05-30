# Blueprint Upload and FOV Planner Implementation Plan

**Goal:** Add local blueprint/floor-plan image upload and richer camera field-of-view overlays to make the planner visibly useful as a real placement tool.

**Architecture:** Keep planning calculations untouched. Add a small pure helper module for site-plan presentation math so FOV behavior is testable, then wire local-only image upload and overlay controls into `app/planner/page.tsx`.

**Tech Stack:** Next.js App Router, React client state, TypeScript, SVG overlays, FileReader object URLs, Vitest.

---

### Task 1: Test and implement site-plan visual helpers

**Files:**
- Create: `lib/site-plan.ts`
- Create: `lib/site-plan.test.ts`

- [ ] Add tests for camera-specific FOV settings and safe object URL cleanup.
- [ ] Run `npm test -- lib/site-plan.test.ts` and verify RED because `lib/site-plan.ts` does not exist.
- [ ] Implement `cameraVisionProfile()` and `revokeBlueprintPreview()` in `lib/site-plan.ts`.
- [ ] Run `npm test -- lib/site-plan.test.ts` and verify GREEN.

### Task 2: Wire blueprint upload into planner UI

**Files:**
- Modify: `app/planner/page.tsx`

- [ ] Add `blueprint` React state with `{ name, url } | null`.
- [ ] Add a hidden file input and visible Upload / Clear controls in the site-plan toolbar.
- [ ] Read selected image files into an object URL with `URL.createObjectURL`.
- [ ] Revoke replaced/cleared object URLs.
- [ ] Render uploaded images inside the existing SVG using `<image>` under camera overlays.
- [ ] Replace fallback copy with upload-aware copy.

### Task 3: Upgrade FOV overlays

**Files:**
- Modify: `app/planner/page.tsx`

- [ ] Import `cameraVisionProfile`.
- [ ] Replace the single hardcoded cone shape with camera-type-specific cones/rings.
- [ ] Add a compact legend showing standard, PTZ, and long-range cone meaning.
- [ ] Preserve drag-to-move and angle rotation behavior.

### Task 4: Verify and ship

**Files:**
- Modify: `README.md` if feature notes need updating.

- [ ] Run `npm run typecheck`.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Commit as `feat: add blueprint upload and fov overlays` with primeodin git identity.
- [ ] Push to `origin main`.
- [ ] Check GitHub Actions CI and Pages deploy status.
