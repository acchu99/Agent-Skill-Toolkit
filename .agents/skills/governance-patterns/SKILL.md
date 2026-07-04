---
name: governance-patterns
description: HITL and risk management implementation patterns including risk class assignment, tactic risk escalation, rollback payloads, and autonomy promotion/demotion. Use when implementing or extending governance, approval gates, or risk management systems.
---

# Governance Implementation Patterns

This skill guides developer agents on implementing and extending the Human-in-the-Loop (HITL) and risk management systems.

## 1. Risk Class Assignment
New Action Types must be assigned a `risk_class` based on their "Blast Radius":
- **Low:** Reporting, drafting briefs, monitoring. (Target: L3 Autonomy).
- **Medium:** Bounded budget/bid moves, non-SEO listing edits. (Target: L2 Autonomy).
- **High:** Pricing/Coupons, SEO Metadata (Titles), Pausing high-volume campaigns. (Always L1/L2).

## 2. Tactic Risk Escalation
When bundling actions into a **Tactic**, apply the following logic:
- `Tactic.risk_class = MAX(component_actions.risk_class)`.
- **Complexity Penalty:** If a Tactic contains more than 3 distinct action classes, it is automatically escalated one risk level (e.g., Medium -> High).

## 3. Rollback Payload Requirements
Any code adding an `Act` capability MUST implement a rollback mechanism:
- The `action_proposal` must include a `rollback_payload` containing the exact state needed to revert the change (e.g., the previous bid value, the previous listing title).
- The `action_executor` must support a `rolled_back` status and consume the `rollback_payload`.

## 4. Autonomy Promotion/Demotion
Promotion from L2 -> L3 happens only if:
- `ROI > threshold` for 4 consecutive weeks.
- `error_rate < 1%`.
- `human_override_rate < 5%`.
Demotion to L1 happens automatically if any `Critical` anomaly is detected OR the global `kill_switch` is toggled.
