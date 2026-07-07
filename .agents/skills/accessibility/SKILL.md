---
name: accessibility
description: Build interfaces that work for everyone — WCAG 2.2 AA in practice. Covers the POUR principles, semantic HTML first, color contrast, keyboard navigation and focus management, ARIA (and when NOT to use it), accessible forms, images/media alternatives, and how to test with automated + manual + screen-reader checks. Use when building or auditing any UI.
when_to_use: "When building or auditing web/app UI for accessibility — contrast, keyboard support, focus, ARIA, forms, screen readers, or WCAG conformance. Load frontend-design/ui-ux-pro-max for the surrounding design and data-visualization for accessible charts."
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Accessibility (WCAG 2.2 AA)

> Accessibility is not a feature you add at the end — it's a property of building the UI correctly. Most of it is free if you start with semantic HTML.

## When to Apply

Building any UI (components, pages, forms, charts) or auditing an existing one. Target **WCAG 2.2 Level AA** unless a stricter bar is required (public sector, healthcare, finance often require it by law).

## The POUR Principles

| Principle | Means | In practice |
|-----------|-------|-------------|
| **Perceivable** | Users can perceive the content | Text alternatives, contrast, captions, don't rely on color alone |
| **Operable** | Users can operate the UI | Full keyboard support, visible focus, no keyboard traps, enough time |
| **Understandable** | Content and operation are clear | Labels, predictable behavior, clear errors |
| **Robust** | Works across assistive tech | Valid semantic HTML, correct roles/states |

## Rule 0: Semantic HTML First

The single highest-leverage move. Native elements come with roles, states, focus, and keyboard behavior for free.

```html
<!-- ❌ reinvents everything, accessible to no one -->
<div class="btn" onclick="submit()">Submit</div>

<!-- ✅ focusable, keyboard-activatable, announced as a button -->
<button type="submit">Submit</button>
```

Use `<button>`, `<a href>`, `<nav>`, `<main>`, `<header>`, `<label>`, `<h1>`–`<h6>` (one `<h1>`, no skipped levels), lists, and `<table>` with `<th>`. Reach for ARIA only when no native element fits.

## Color & Contrast

| Content | Minimum ratio (AA) |
|---------|--------------------|
| Body text (< 18pt / < 14pt bold) | **4.5:1** |
| Large text (≥ 18pt / ≥ 14pt bold) | **3:1** |
| UI components & graphical objects (icons, form borders, chart marks) | **3:1** |

- **Never encode meaning with color alone** — pair it with text, icon, or pattern (error states, chart series, required fields).
- Don't remove focus outlines without replacing them with a visible alternative.

## Keyboard & Focus

- **Everything interactive works with keyboard** (Tab/Shift-Tab, Enter/Space, Arrow keys for composite widgets).
- **Visible focus indicator** on every focusable element (≥ 3:1 contrast against the background).
- **Logical tab order** follows visual/reading order; don't use positive `tabindex`.
- **Manage focus** on route changes, modal open/close (trap focus in modal, restore on close), and dynamic content.
- **No keyboard traps.** A skip-link ("Skip to content") helps bypass repeated nav.

## ARIA — Use Sparingly

> The first rule of ARIA: don't use ARIA if a native element does the job. Bad ARIA is worse than none.

- Add `aria-label`/`aria-labelledby` only when the accessible name isn't already in the DOM.
- Reflect **state**: `aria-expanded`, `aria-checked`, `aria-selected`, `aria-current`, `aria-invalid`.
- Use `aria-live="polite"` for async status/toasts so screen readers announce them.
- Don't override native roles (`<button role="link">` — just use the right element).
- Decorative images: `alt=""`. Meaningful images: `alt` describing the meaning, not "image of".

## Accessible Forms

- Every input has a **programmatically associated `<label>`** (`for`/`id`), not just a placeholder.
- Group related fields with `<fieldset>` + `<legend>` (radio groups, address blocks).
- Mark required fields in text/`aria-required`, not color alone.
- **Errors:** identify the field, describe the problem in text, link/move focus to it, use `aria-invalid` + `aria-describedby`.
- Don't disable the submit button as the only error feedback — explain what's wrong.

## Media & Motion

- Images: meaningful `alt`; complex images/charts need a longer text alternative or data table (see `data-visualization`).
- Video: captions; audio: transcripts.
- Respect `prefers-reduced-motion`; don't autoplay motion that can't be paused; avoid content that flashes > 3×/sec.

## Testing (all three layers)

Automated tools catch ~30–40% of issues. You need manual + AT testing for the rest.

| Layer | How |
|-------|-----|
| **Automated** | `python .agents/skills/frontend-design/scripts/accessibility_checker.py <path>`; axe DevTools / Lighthouse; `playwright_runner.py <url> --a11y` (see `webapp-testing`) |
| **Manual keyboard** | Unplug the mouse. Tab through everything. Can you reach and operate all controls? Is focus visible? |
| **Screen reader** | VoiceOver (macOS/iOS), NVGA/NVDA (Windows), TalkBack (Android). Does it announce names, roles, states, and errors? |
| **Zoom/reflow** | 200% zoom and 320px width — content reflows without horizontal scroll or loss |

## Anti-Patterns

❌ **`<div>`/`<span>` as buttons/links** — no focus, no keyboard, no role.
❌ **Placeholder as label** — disappears on input, low contrast, not announced reliably.
❌ **Removing focus outlines** with no replacement.
❌ **Color-only meaning** — red text as the only error signal.
❌ **ARIA soup** — roles/attributes papering over non-semantic markup.
❌ **Auditing at the end** — retrofitting accessibility is far costlier than building it in.

## Quick Checklist

- [ ] Semantic HTML; one `<h1>`, no skipped heading levels
- [ ] Text contrast ≥ 4.5:1 (3:1 large / UI components)
- [ ] Meaning never conveyed by color alone
- [ ] All interactive elements keyboard-operable with visible focus
- [ ] Focus managed on modals/route changes; no traps; skip-link present
- [ ] Inputs have associated labels; errors described in text + focus moved
- [ ] Images have appropriate `alt`; media has captions/transcripts
- [ ] Passed automated + keyboard + screen-reader checks at 200% zoom

## Related Skills

- `frontend-design` — building the UI this audits (has the a11y checker script).
- `ui-ux-pro-max` — accessible color palettes and component patterns.
- `data-visualization` — accessible charts (contrast, text alternatives).
- `webapp-testing` — Playwright-driven a11y checks.
- `web-design-guidelines` — broader web quality standards.
