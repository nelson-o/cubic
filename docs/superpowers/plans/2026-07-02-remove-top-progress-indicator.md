# Remove Top Progress Indicator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the segmented top-center progress indicator while preserving its layer and stage text.

**Architecture:** Keep the existing `stage-progress` header container and accessibility label. Remove the decorative `stage-dots` markup and all selectors that exist only to style it, with a server-render test guarding both the removal and retained text.

**Tech Stack:** React 19, TypeScript, CSS, Bun test

---

### Task 1: Guard and remove the decorative indicator

**Files:**
- Modify: `src/App.test.tsx:5-16`
- Modify: `src/App.tsx:63-70`
- Modify: `src/App.css:62-82,234-238`

- [ ] **Step 1: Write the failing render assertions**

Add these assertions after the existing visible-content assertions in `src/App.test.tsx`:

```tsx
expect(html).toContain('Layer 1')
expect(html).toContain('White cross')
expect(html).not.toContain('stage-dots')
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `bun test src/App.test.tsx`

Expected: FAIL because the server-rendered HTML still contains `class="stage-dots"`.

- [ ] **Step 3: Remove the indicator markup and styles**

Replace the `stage-progress` markup in `src/App.tsx` with:

```tsx
<div className="stage-progress" aria-label={`Stage ${stageIndex + 1} of ${tutorialStages.length}`}>
  <span>Layer {stage.layer}</span>
  <strong>{stage.label}</strong>
</div>
```

Delete these desktop selectors from `src/App.css`:

```css
.stage-dots { display: flex; gap: 5px; }
.stage-dots i { width: 22px; height: 3px; border-radius: 9px; background: rgba(17, 24, 39, .13); }
.stage-dots i.active { background: #2563eb; }
```

Delete this mobile selector from `src/App.css`:

```css
.stage-dots i { width: clamp(11px, 3.8vw, 18px); }
```

- [ ] **Step 4: Run the focused test to verify it passes**

Run: `bun test src/App.test.tsx`

Expected: 1 test passes and 0 tests fail.

- [ ] **Step 5: Run complete verification**

Run: `bun run verify`

Expected: all Bun tests pass, oxlint reports no errors, and the TypeScript/Vite production build succeeds.

- [ ] **Step 6: Commit the implementation**

```bash
git add src/App.tsx src/App.css src/App.test.tsx docs/superpowers/plans/2026-07-02-remove-top-progress-indicator.md
git commit -m "fix: remove top progress indicator"
```

