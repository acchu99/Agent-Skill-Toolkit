---
description: Run a growth/marketing task — copy, CRO, launch, or pricing — via the growth-marketer agent.
---

# /market - Growth & Marketing

$ARGUMENTS

---

## Task

Handle a marketing/growth request end to end using the `growth-marketer` agent and its skills. This covers copy, conversion, launches, pricing, and content/SEO strategy — **not** application code.

### Steps

1. **Route to the agent**
   - Apply `growth-marketer` (announce it) and read `.agents/agent/growth-marketer.md`.

2. **Clarify the goal (if unclear)**
   - Who is the reader? What problem are they in? What is the single desired action? What's the metric to move (CVR, activation, ARPU)?
   - Ask 1–3 questions only if genuinely blocked; otherwise proceed with a stated assumption.

3. **Select the primary skill by task**
   | Ask | Skill |
   |-----|-------|
   | Landing/product/email/ad copy | `copywriting` |
   | Improve conversion on a page/flow | `conversion-rate-optimization` |
   | Plan a launch / go-to-market | `launch-strategy` |
   | Set or revise pricing/packaging | `pricing-strategy` |
   | Rank in Google / get cited by AI | `seo-fundamentals` / `geo-fundamentals` |

4. **Produce the deliverable**
   - One primary CTA per page/email. Translate features to outcomes. State the metric you're moving.

5. **Humanize before shipping**
   - Run the `writing-humanizer` pass on all prose so it doesn't read as AI hype.

6. **Hand off build work**
   - If the deliverable needs UI built, hand layout/implementation to `frontend-specialist`.

---

## Usage Examples

```
/market write the landing page hero for a Postgres backup tool
/market improve conversion on our signup form
/market plan a Product Hunt launch for v2
/market design a 3-tier pricing page for a usage-based API
```

---

## Guardrails

- No dark patterns and no fabricated testimonials or claims.
- Respect an existing brand voice if the project has one.
- Product requirements/backlog → route to `product-manager` / `product-owner` instead.
