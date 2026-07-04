---
name: ab-testing-switchback-patterns
description: Architectural pattern for evaluating Human vs Agent strategies without algorithmic bias.
---

# A/B Testing Switchback Patterns

When injecting agentic decision loops into an established business, it is critical to evaluate the machine-learned strategy against the human-devised strategy objectively. To prevent cannibalization and algorithmic confusion (e.g. on Amazon or Meta Ads), the platform utilizes a **Time-Series Switchback Framework**.

## 1. Strategy Isolation
Never hardcode optimization rules or heuristic limits directly into the `brand-config.yaml` or into the Agent manifests if they are subject to testing.
- **Rule of Thumb:** Extract distinct rulesets into isolated strategy files (e.g., `human_strategy_a.yaml` and `agent_strategy_b.yaml`).

## 2. Director Agent Coordination
The swap mechanism should be handled by a higher-order executive agent (the Director Agent).
- **Cadence:** The Director Agent toggles the active ruleset every 7 or 14 days.
- **Why Time-Series:** Concurrent A/B testing on the same keywords or ASINs causes auction cannibalization. Alternating block schedules prevents this.

## 3. Downstream Attribution
If you are testing strategies, the analytics pipelines MUST know which strategy fired the action.
- **Implementation:** Append an `active_strategy_id` column to the core daily tracking tables (e.g. `kpi_daily`).
- **Data Flow:** Every time the Sense pipeline brings in revenue or spend data, it stamps it with the currently active strategy ID, allowing the Control Center to cleanly visualize the comparison.
