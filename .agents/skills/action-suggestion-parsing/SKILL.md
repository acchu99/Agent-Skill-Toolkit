---
name: action-suggestion-parsing
description: Use when changing platform magic action parsing in src/pages/api/ai/actions/action.ts, especially followUpSuggestions extraction from model markdown, clickable suggestion buttons, stop actions, or action-api-samples fixture tests.
---

# Action Suggestion Parsing

## Purpose
Use this skill when fixing or planning changes to platform's magic action parser where raw model output must become structured `followUpSuggestions` for clickable UI suggestions.

Primary files:
- `src/pages/api/ai/actions/action.ts`
- `__tests__/unit/api/magic/action.test.ts`
- `__tests__/integration/api/magic/action.integration.test.ts`
- `__tests__/fixtures/action-api-samples.json`

## Core Workflow
1. Inspect the current parser path first:
   - `parseJsonFromText`
   - `buildWrappedFallback`
   - `ensureFollowUpsArray`
   - `normalizeCellsForAction`
2. Prefer narrow parser changes in `action.ts`; do not change frontend rendering unless the backend output shape is already correct.
3. Preserve the public API shape:
   - `followUpSuggestions: Array<{ question: string }>`
4. Add fixture coverage in `__tests__/fixtures/action-api-samples.json` for realistic parsed model payloads.
5. Add focused unit coverage in `__tests__/unit/api/magic/action.test.ts`.
6. Run unit tests first, then the exact-output integration fixture test.

## Suggestion Extraction Rules
When extracting clickable suggestions from markdown cells:
- Support bullet markers `-`, `*`, `•`, and numbered list markers.
- Explicitly handle quoted-bold model output like:
  `- **"What datasets do I have available?"** — Explore your data and start an analysis.`
- Strip markdown emphasis and outer quotes from the extracted question title.
- Preserve description text after `—`, `–`, or plain `-`.
- Normalize whitespace.
- Preserve multiple suggestions in original order.
- Remove only the extracted suggestion lines from `cell.source` and `cell.markdown`.
- Keep surrounding answer text and headings unless the cell becomes empty whitespace.

Expected extraction for the example above:

```json
{
  "question": "What datasets do I have available? — Explore your data and start an analysis."
}
```

## Guardrails
Do not over-extract normal explanatory bullets.

Use a suggestion-context guard:
- Strong signal: `actionName === "stop"` and surrounding text contains phrases like "What would you like to do next?", "Possible next questions", "next questions", "follow-up", "you could ask", or similar.
- Secondary signal: the bullet itself clearly contains a question plus suggestion/action wording.
- If neither signal is present, leave ordinary markdown bullets in the cell and keep `followUpSuggestions` empty.

Be careful with exact-output tests:
- `action-api-samples.json` is used by integration tests that compare JSON exactly.
- Include normalized fields such as `metadata: {}` when the handler adds them.
- Use parsed object payloads in fixtures, not raw stream log strings.

## Test Checklist
Cover these scenarios when changing extraction:
- Exact bug shape: `**"question?"** — description`.
- Multiple suggestions preserve order.
- Numbered suggestions are extracted.
- Em dash, en dash, and plain hyphen separators work.
- Ordinary explanatory markdown bullets are not extracted without suggestion context.
- Extracted suggestion lines no longer render as literal markdown in the response cell.

Useful commands:

```bash
npx jest __tests__/unit/api/magic/action.test.ts --runInBand
npx jest __tests__/integration/api/magic/action.integration.test.ts --runInBand
```
