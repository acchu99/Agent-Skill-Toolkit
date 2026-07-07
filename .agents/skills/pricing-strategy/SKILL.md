---
name: pricing-strategy
description: Design SaaS and product pricing — model selection (flat, tiered, usage, per-seat, freemium), choosing a value metric, good-better-best tier design, psychological pricing, packaging, discounting, and how to test a price change safely. Pairs with conversion-rate-optimization and launch-strategy.
when_to_use: "When setting or revising pricing — choosing a pricing model, designing tiers/packaging, picking a value metric, or planning a price change. Load conversion-rate-optimization for the pricing page and launch-strategy when pricing ships with a launch."
allowed-tools: Read, Write
---

# Pricing Strategy

> Price on the value the customer gets, not the cost you incur. The right price is a positioning decision, not a spreadsheet output.

## When to Apply

Launching with a price, adding tiers, moving from flat to usage-based, introducing a free tier, repackaging, or planning an increase. Pricing touches product, positioning, and CRO — treat it as strategy, not a number.

## Step 1: Choose the Value Metric

The value metric is *what you charge for*. Good ones scale with the value the customer receives and are easy to understand and predict.

| Property | Good value metric |
|----------|-------------------|
| Aligns with value | Customer pays more as they get more value |
| Predictable | Customer can forecast their bill |
| Scales with growth | Grows as the customer grows |
| Simple | Explainable in one sentence |

Examples: seats (Slack), emails sent (Mailchimp contacts), GB stored, API calls, transactions processed. Avoid metrics customers can't predict or that punish engagement.

## Step 2: Choose the Model

| Model | How it works | Best for | Trade-off |
|-------|--------------|----------|-----------|
| **Flat rate** | One price, one product | Simple products, early stage | Leaves money on the table; no expansion |
| **Tiered (good-better-best)** | 3 packages by feature/limit | Most SaaS | Requires clear tier differentiation |
| **Per-seat** | Price × users | Collaboration tools | Can discourage adding users |
| **Usage-based** | Pay for what you consume | Infra/API products | Unpredictable bills create anxiety |
| **Freemium** | Free tier + paid upgrade | Viral/bottom-up products | Free users cost money; conversion is hard |
| **Hybrid** | Base seat + usage | Platforms | More complex to communicate |

Many products land on **tiered with a usage component and an enterprise "contact us"**.

## Step 3: Design the Tiers (good-better-best)

- **Three tiers** is the default — it uses anchoring and gives a clear "recommended" middle.
- Name tiers by **who they're for** (Starter / Pro / Business), not by size.
- The **middle tier is the target**; design the top tier partly to make the middle look reasonable (anchoring).
- Differentiate on a **value metric limit + a few gating features**, not a confusing feature matrix.
- Put the **most-wanted feature** one tier above where most people start, to drive upgrades.
- Add **"Contact sales" / Enterprise** for custom needs (SSO, SLA, security review — see `supabase-security`, `control-surface-hardening`).

## Step 4: Psychology & Presentation

- **Anchoring:** show the higher tier first or highlight it to make others feel affordable.
- **Charm pricing:** $29 vs $30 still measurably helps for self-serve; less so for enterprise.
- **Annual discount:** 2 months free (≈17%) is the common anchor; it improves cash flow and retention.
- **Decoy effect:** a deliberately weaker option can push people to the target tier.
- **Reduce choice paralysis:** default/recommend one tier visually.
- **Show value, not just price:** "$X/mo" next to what it unlocks and for whom.

## Step 5: Discounting (carefully)

- Discounts train customers to wait and can signal low value — use sparingly and with a reason (annual, launch, education/nonprofit).
- Prefer **more value at the same price** over cutting price.
- Never discount into unit economics you can't sustain; know your CAC and LTV first.

## Step 6: Changing a Price

1. **Grandfather** existing customers or give generous notice — surprise increases churn and trust.
2. Test on **new customers first**; measure signup CVR and expansion, not just the sticker.
3. Change **one variable** (price, packaging, or metric) at a time so you can attribute the effect.
4. Watch **downstream** metrics: trial→paid, churn, expansion, support load — not just conversion.
5. Communicate the **added value** that justifies the change (see `copywriting`).

## Metrics That Frame Pricing

| Metric | Why it matters |
|--------|----------------|
| **CAC** | What it costs to acquire a customer — floor for pricing |
| **LTV** | Lifetime value — should be ≫ CAC (rule of thumb ≥ 3×) |
| **ARPU** | Average revenue per user — moves with packaging |
| **Gross margin** | Usage models must price above marginal cost |
| **Expansion / NRR** | Does revenue grow within accounts over time? |

## Anti-Patterns

❌ **Cost-plus pricing** — ignores the value delivered; usually underprices.
❌ **Too many tiers** — 5+ options paralyze; 3 (+enterprise) is plenty.
❌ **Unpredictable usage bills** — bill shock churns customers; add caps/alerts.
❌ **Racing to the bottom** — competing on price alone erodes margin and signal.
❌ **Surprise increases** — no grandfathering/notice destroys trust.

## Quick Checklist

- [ ] Value metric chosen and one-sentence explainable
- [ ] Model fits the product and buying motion
- [ ] Three tiers, clear recommended middle, enterprise option
- [ ] Annual option with a real incentive
- [ ] Pricing page answers objections (see `conversion-rate-optimization`)
- [ ] Price changes grandfather existing customers

## Related Skills

- `conversion-rate-optimization` — pricing-page structure and objection handling.
- `copywriting` — tier names, benefit framing, and value communication.
- `launch-strategy` — pricing that ships as part of a launch.
- `safety-gate-patterns` — enforcing plan limits and feature gates in product.
