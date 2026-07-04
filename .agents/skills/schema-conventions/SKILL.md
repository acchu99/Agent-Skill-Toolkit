---
name: schema-conventions
description: JSON schema patterns used in this project including required governance fields, strategy/tactic proposal schemas, and validation conventions. Use when creating or modifying JSON schemas for structured agent outputs.
---

# Schema Conventions

## Location

All JSON schemas live in `prompts/schemas/` and use the naming pattern `{purpose}.schema.json`.

## Required governance fields

Every action proposal schema must include these fields for traceability:

```json
{
  "justification": {
    "type": "string",
    "description": "Business justification for why this action should be taken"
  },
  "reasoning_summary": {
    "type": "string",
    "description": "Summary of the agent's reasoning process"
  },
  "tactic_alignment": {
    "type": "string",
    "description": "If part of a tactic, explains this action's role in the bundle"
  }
}
```

## Strategy proposal schemas

Must include:
```json
{
  "objective_alignment": {
    "type": "string",
    "description": "How this strategy advances the linked business objective"
  }
}
```

## Tactic proposal schemas

Must include:
```json
{
  "strategy_alignment": {
    "type": "string",
    "description": "How this tactic executes the strategy"
  },
  "intent": {
    "type": "string",
    "description": "Why these actions must be bundled together"
  }
}
```

## Existing schemas

| Schema | Purpose |
|---|---|
| `action_proposal.schema.json` | Generic action proposal structure |
| `strategy_proposal.schema.json` | Strategy proposals with objective_alignment |
| `tactic_proposal.schema.json` | Tactic proposals with strategy_alignment + intent |

## Pattern: versioned schemas

Schemas can reference a `prompt_version` field for tracking which prompt version generated the output. This enables A/B testing of prompt variants.

## Validation

Schemas should be valid JSON Schema Draft-07. Validate with:
```bash
python3 -c "import json; json.load(open('prompts/schemas/{name}.schema.json'))"
```
