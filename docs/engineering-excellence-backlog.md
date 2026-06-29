# Engineering Excellence Backlog

This note captures practical engineering tasks that would make the repo easier
to maintain, safer to deploy, and better covered against user-facing regressions.

## Current Baseline

- Local verification was clean when assessed:
  - `bun test`
  - `bun run lint`
  - `bun run build`
- GitHub Actions currently deploys through `.github/workflows/pages.yml`.
- The app already has useful unit coverage for cube logic, replay state,
  tutorial checkpoints, and some scene-layout behavior.

## Recommended First Batch

1. Harden CI. Done in `1.3.14`/`verify` workflow update.
   - [x] Add `bun run lint` to the Pages workflow.
   - [x] Pin the Bun version instead of using `bun-version: latest`.
   - [x] Add a single local `verify` script that runs tests, lint, and build.

2. Add browser-level smoke coverage.
   - Use Playwright to verify the deployed app shell renders.
   - Cover play, restart, next/previous case controls, and case library
     open/close behavior.
   - Add desktop and mobile canvas checks so WebGL regressions are caught before
     deployment.

3. Improve dialog accessibility.
   - Add Escape-to-close support for the case library.
   - Trap focus while the dialog is open.
   - Restore focus to the triggering button after close.

## Follow-Up Tasks

### Bundle Size

The production build passes, but Vite reports a large JavaScript chunk because
the app ships a Three.js scene. Measure real loading behavior before changing
the architecture. If needed, lazy-load the 3D scene with a clean fallback or set
an intentional chunk-size threshold once the cost is understood.

### App Component Boundaries

`src/App.tsx` is still manageable, but it mixes replay state, case selection,
modal state, controls, and layout markup. A useful split would be:

- `ReplayControls`
- `CaseLibraryDialog`
- `useReducedMotion`

Do this with existing tests in place so the work remains behavior-preserving.

### Tutorial Content Auditability

`src/tutorial.ts` combines lesson data, checkpoint helpers, and content
validation. A later cleanup could separate tutorial data from validation logic
and add clearer invariants for focused targets, camera presets, and algorithm
metadata.

### Interaction Polish

The camera-distance control should be reviewed as a product decision. A bounded
slider may be more ergonomic than a number input, but the right choice depends
on whether the control is meant for learners or for development inspection.

## Priority Order

1. CI hardening - done
2. Playwright smoke tests
3. Case library accessibility
4. Bundle-size decision
5. Component boundary cleanup
6. Tutorial data organization
