---
name: writing-humanizer
description: Strip AI writing tells from generated prose so it reads like a person wrote it. Removes throat-clearing openers, "it's not just X, it's Y" constructions, hype adjectives (leverage, robust, seamless, delve), em-dash overuse, rule-of-three padding, and hollow conclusions. Use on READMEs, docs, PR/commit descriptions, release notes, blog posts, and marketing copy.
when_to_use: "When editing or generating any prose that a human will read — READMEs, documentation, PR descriptions, commit messages, release notes, changelogs, blog posts, emails, or marketing copy — and it must not read as AI-generated. Pairs with copywriting and documentation-templates."
allowed-tools: Read, Write, Edit
---

# Writing Humanizer

> Source-inspired by the "stop-slop" pattern. The goal is not to hide AI use — it is to remove the low-signal filler that makes writing tedious.

## When to Apply

Run this pass on any prose before it ships: READMEs, guides, PR/commit descriptions, release notes, changelogs, landing-page copy, cold emails, docstrings that render in docs. Apply it AFTER the draft is written — humanize during editing, not while drafting.

> This is an editing skill. Do not use it to fabricate false experience ("I personally tested…") or invent voice the author does not have. Cut slop; keep truth.

## The Core Tells (cut these first)

| Tell | Example (slop) | Fix |
|------|----------------|-----|
| **Throat-clearing opener** | "In today's fast-paced digital landscape…" | Start with the actual point. |
| **"Not just X, it's Y"** | "It's not just a database — it's a platform." | State what it is. Delete the negation. |
| **Hype adjectives** | leverage, robust, seamless, powerful, cutting-edge, game-changing, elevate, unlock, supercharge | Use plain verbs/nouns or delete. |
| **"Delve / dive deep / tapestry / realm / journey"** | "Let's delve into the realm of…" | "Here's how X works." |
| **Rule-of-three padding** | "fast, reliable, and scalable" (when only one is true) | Keep the true ones. |
| **Hollow conclusion** | "In conclusion, X is a powerful tool that can help you…" | End on the last real point, or cut the paragraph. |
| **Empty transitions** | "It's worth noting that", "Needless to say", "At the end of the day" | Delete. |
| **Over-hedging** | "It might potentially be possible to perhaps consider…" | Commit or cut. |
| **Bold-everything** | Every other phrase **bolded** | Bold at most one idea per paragraph. |
| **Emoji garnish** | "🚀 Launch faster! ✨" | Remove unless the medium expects them. |
| **Participial trailer** | "…, allowing you to build faster and iterate quickly." | End the sentence at the fact. |

## Structural Tells

| Tell | Why it reads as AI | Fix |
|------|--------------------|-----|
| **Every paragraph same length** | Uniform rhythm | Vary sentence and paragraph length. Some short. Some longer with a subordinate clause. |
| **Listicle reflex** | Turning prose into 5 bullet points with bold lead-ins | Use a list only when order/parallelism matters; otherwise write sentences. |
| **Symmetrical headers** | "The Power of X", "The Beauty of Y", "The Future of Z" | Name the actual content. |
| **Restating the prompt** | "You asked me to explain X. X is…" | Answer directly. |
| **Summary that adds nothing** | A closing paragraph that recaps what was just said | Cut it or add a next step. |

## Punctuation & Voice

- **Em-dashes:** at most one per paragraph. AI overuses them as an all-purpose connector. Prefer a period, comma, or parentheses.
- **Semicolons:** rare in natural informal writing; convert most to periods.
- **"You"-address:** fine, but don't open every sentence with "You can…".
- **Active over passive:** "The migration drops the column" beats "The column will be dropped by the migration."
- **Contractions:** use them in informal docs and READMEs; they read as human. Skip in formal specs.
- **Concrete over abstract:** "cuts p95 latency from 800ms to 120ms" beats "dramatically improves performance."

## The Humanize Pass (procedure)

1. **Read the whole draft once.** Note the single most important point. It should appear in the first two sentences.
2. **Delete the opener** if it doesn't carry information. Most AI first sentences can go.
3. **Search-and-destroy** the vocabulary in the tells table (`leverage`, `seamless`, `robust`, `delve`, `elevate`, `unlock`, `game-changing`, `in today's`, `it's worth noting`).
4. **Break the rhythm.** If three sentences in a row are the same length, split or merge.
5. **Cut the conclusion** if it only restates. Prose can end on its last real point.
6. **Verify claims survived.** Humanizing removes filler, never facts. Every number, name, and caveat in the original stays.
7. **Read it aloud (mentally).** If a phrase is one you'd never say to a colleague, rewrite it.

## Before / After

```text
❌ BEFORE (slop):
In today's fast-paced development landscape, error handling is not just
important — it's absolutely critical. Our robust new middleware seamlessly
leverages a powerful retry mechanism to supercharge your application's
resilience, allowing you to build with confidence. In conclusion, it's a
game-changer.

✅ AFTER (human):
The new middleware retries failed requests with exponential backoff (3
attempts, capped at 2s). Before, a single flaky upstream call failed the
whole request; now it recovers ~90% of transient failures.
```

## Domain Notes

- **Commit messages:** imperative mood ("Add retry to X"), say what and why, skip "This commit…". See `release-engineering`.
- **PR descriptions:** lead with what changed and why; keep the "seamlessly leverages" energy out.
- **READMEs:** first paragraph = what it is + who it's for, in plain words. No "Welcome to the future of…".
- **Marketing copy:** humanizing ≠ boring. Keep specificity and voice; cut the manufactured enthusiasm. See `copywriting`.

## Anti-Patterns

❌ **Over-correcting into terseness** — removing filler doesn't mean removing warmth or useful context.
❌ **Deleting real hedges** — "usually" and "in most cases" are honest; keep genuine uncertainty.
❌ **Fabricating a human voice** — don't invent anecdotes or claimed experience to sound authentic.
❌ **Stripping structure that helps** — keep lists/tables when they genuinely aid scanning.

## Quick Checklist

- [ ] First two sentences carry the main point (no throat-clearing)
- [ ] No banned vocabulary (leverage/robust/seamless/delve/elevate/unlock/game-changing)
- [ ] ≤ 1 em-dash per paragraph
- [ ] No "it's not just X, it's Y" constructions
- [ ] Sentence/paragraph lengths vary
- [ ] Conclusion adds a next step or is deleted
- [ ] Every fact/number/caveat from the draft survived

## Related Skills

- `copywriting` — writing the marketing copy this skill then cleans up.
- `documentation-templates` — structure for the docs you humanize.
- `release-engineering` — commit/PR/changelog voice.
- `seo-fundamentals` / `geo-fundamentals` — human copy that still ranks and gets cited.
