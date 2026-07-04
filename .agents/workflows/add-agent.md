---
description: Steps to add a new domain agent to the system
---

# Add a New Agent

Follow these steps when adding a new domain agent (e.g., a Pricing Agent, Logistics Agent, etc.).

## Prerequisites

- The agent's business function and primary KPIs are defined
- The governance hierarchy (objectives → strategies) supports this agent's domain

## Steps

1. **Create the agent spec**
   - Copy `templates/agent-spec.example.yaml` to `brands/{brand}/agents/{agent_name}.yaml`
   - Fill in: `primary_kpi`, `allowed_action_classes`, `autonomy_defaults`, `confidence_thresholds`
   - Add `tactic_config` section with `enabled: true`, `max_actions_per_tactic`, `allowed_modes`

2. **Create prompt templates**
   - Create directory `prompts/{agent_name}/`
   - Add at minimum:
     - `system.md` — system prompt with domain context
     - `action_proposals.md` — structured action proposal template
     - `daily_brief.md` — daily briefing template (if applicable)
   - Reference shared prompts: `prompts/shared/tactic_proposal.md`, `prompts/shared/strategy_proposal.md`

3. **Create or update JSON schemas**
   - Add `prompts/schemas/{agent_name}_action_proposal.schema.json`
   - Ensure it includes: `justification`, `reasoning_summary`, `tactic_alignment` fields
   - Validate against existing schemas for consistency

4. **Create skill documents**
   - Create directory `skills/{agent_name}/`
   - Add domain-specific skills the agent needs
   - Reference shared skills as applicable (`skills/shared/`)

5. **Update the agent portfolio diagram**
   - Edit `docs/diagrams/business-functions-agents.mmd`
   - Add the new agent to the `AG` subgraph
   - Connect it to the relevant business functions and KPIs
   - Follow the `update-architecture` workflow to sync inline copies

6. **Update agent handoffs diagram** (if the agent interacts with others)
   - Edit `docs/diagrams/agent-handoffs.mmd`
   - Add data flow connections
   - Follow the `update-architecture` workflow

7. **Create a Supabase migration** (if new tables or columns are needed)
   - Follow the `add-migration` workflow
   - Register the agent in `agent_registry` if it exists

8. **Update the README** if this is a significant new capability

## Validation checklist

- [ ] Agent spec YAML passes `yamllint`
- [ ] Prompt templates reference the correct schemas
- [ ] JSON schemas are valid and include required governance fields
- [ ] Diagrams updated and inline copies synced
- [ ] Agent appears in `business-functions-agents.mmd`
