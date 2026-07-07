---
name: conversion-rate-optimization
description: Increase the share of visitors who take the desired action on landing pages, product pages, forms, onboarding, and paywalls. Covers funnel analysis, the LIFT and Fogg models, above-the-fold anatomy, CTA/friction/social-proof heuristics, form-CRO, and how to run and read an A/B test. Pairs with copywriting and frontend-design.
when_to_use: "When improving conversion on a landing page, signup/checkout form, onboarding flow, pricing page, or paywall — or when diagnosing why a page isn't converting. Load copywriting for the words, frontend-design for the layout, and ab-testing-switchback-patterns for the experiment mechanics."
allowed-tools: Read, Glob, Grep
---

# Conversion Rate Optimization (CRO)

> Conversion = Motivation − Friction − Anxiety, at the moment of decision. Raise motivation, cut friction, remove anxiety.

## When to Apply

Any page or flow with a measurable goal: landing pages, signup, checkout, lead forms, onboarding activation, pricing, in-app paywalls/upgrade modals. Diagnose before you redesign — a page rarely fails for one reason.

## Diagnose First: The LIFT Model

Evaluate a page against six factors before changing anything:

| Factor | Question |
|--------|----------|
| **Value proposition** (the fulcrum) | Is the benefit clear and worth the cost/effort? |
| **Relevance** | Does the page match what the visitor expected (ad → page match)? |
| **Clarity** | Is the offer and next step obvious in 5 seconds? |
| **Urgency** | Any reason to act now vs. later? |
| **Anxiety** ⬇ | What fears/risks reduce conversion? (removes value) |
| **Distraction** ⬇ | What competes with the primary action? (removes value) |

Value prop is the lever; anxiety and distraction are the two things that pull conversion *down*.

## The Conversion Equation (Fogg behavior model)

Behavior happens when **Motivation × Ability × Prompt** all align. If conversion is low, one is missing:

- **Motivation low?** → sharpen the value prop, add proof, show the outcome.
- **Ability low (too hard)?** → cut form fields, remove steps, add defaults, delay signup.
- **Prompt weak?** → make the CTA obvious, singular, and above the fold.

## Above-the-Fold Anatomy

A visitor decides in ~5 seconds. Above the fold must answer:

1. **What is this?** (outcome headline)
2. **Is it for me?** (subhead naming the audience/use case)
3. **What do I do next?** (one primary CTA)
4. **Why trust it?** (a proof chip: logo row, rating, user count)

## CTA Best Practices

- **One primary CTA** per view; secondary actions visually demoted.
- Button copy states the **outcome**: "Start free trial" > "Submit".
- High contrast, generous hit area, repeated after long pages.
- Reduce commitment: "Start free — no card" beats "Buy now" for cold traffic.

## Friction Reduction

| Friction source | Fix |
|-----------------|-----|
| Long forms | Ask only what you need now; progressive profiling later |
| Forced signup | Let users experience value first (delayed/social auth) |
| Unclear pricing | Show it; hiding price adds anxiety |
| Too many choices | Default/recommend one option |
| Slow load | Every 100ms matters; see `nextjs-performance`, `performance-profiling` |

## Reducing Anxiety (trust)

Social proof (testimonials, logos, counts), guarantees/refunds, security badges where relevant, transparent pricing, clear data handling, real faces/names. Place proof next to the point of friction (near the CTA and the price).

## Form CRO

- Cut every non-essential field; each field costs conversion.
- Single column, labels above inputs, inline validation, clear error messages.
- Show progress on multi-step; save state.
- Ask for email before password; consider magic-link/SSO.

## Measure & Test

| Metric | Definition |
|--------|------------|
| **CVR** | conversions ÷ visitors (define the conversion precisely) |
| **Bounce / exit** | left without engaging / left from this page |
| **Micro-conversions** | scroll depth, video play, add-to-cart — leading indicators |
| **CAC / LTV** | acquisition cost vs. lifetime value — the real business frame |

Running a test:

1. Form a **hypothesis** tied to a LIFT/Fogg factor: "Cutting the form from 7→3 fields raises signup CVR."
2. Change **one thing** (or a coherent bundle) so the result is attributable.
3. Compute **sample size** up front; don't peek and stop early.
4. Run to **significance** (typically p < 0.05) and a full business cycle (≥ 1–2 weeks to cover weekday/weekend).
5. Ship the winner; log the learning even when the variant loses. See `ab-testing-switchback-patterns` for experiment design.

## Page-Type Playbooks

- **Landing:** message-match the ad, one CTA, proof above the fold.
- **Pricing:** anchor with 3 tiers, highlight the recommended one, answer billing objections. See `pricing-strategy`.
- **Onboarding:** get the user to the "aha" (first value) fast; defer everything optional.
- **Paywall/upgrade:** show what they're missing at the moment of intent, not on a generic settings page.

## Anti-Patterns

❌ **Redesigning on opinion** — no hypothesis, no measurement.
❌ **Testing trivia** — button-color tests while the value prop is unclear.
❌ **Peeking** — stopping a test the moment it looks significant.
❌ **Dark patterns** — tricking users converts once and churns forever (see `safety-gate-patterns`).
❌ **Multiple CTAs** competing for the primary action.

## Quick Checklist

- [ ] Value prop clear above the fold in 5 seconds
- [ ] Exactly one primary CTA, outcome-worded
- [ ] Form asks only what's needed now
- [ ] Proof placed next to friction/price
- [ ] Hypothesis + sample size defined before testing
- [ ] Test ran to significance over a full cycle

## Related Skills

- `copywriting` — the words that carry the value prop.
- `frontend-design` — layout, hierarchy, and above-the-fold execution.
- `pricing-strategy` — pricing-page structure and packaging.
- `ab-testing-switchback-patterns` — experiment design and analysis.
- `nextjs-performance` / `performance-profiling` — speed as a conversion factor.
