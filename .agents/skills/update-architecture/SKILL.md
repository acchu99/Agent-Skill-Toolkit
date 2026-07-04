---
name: update-architecture
description: Steps to update the system architecture (docs, diagrams, registry, inline embeds). Use whenever changing the system architecture, adding/removing components, changing component interactions, or modifying governance/HITL flows.
disable-model-invocation: true
---

# Update Architecture

Follow these steps whenever you change the system architecture. This ensures all docs, diagrams, and inline embeds stay consistent.

## When to use this workflow

- Adding/removing a component from the architecture
- Changing how components interact
- Adding a new governance layer or approval gate
- Changing the HITL flow
- Updating guardrails or kill switch scopes

## Steps

1. **Update the `.mmd` source file** in `docs/diagrams/`
   - Edit the relevant `.mmd` file (e.g., `system-architecture.mmd`)
   - If creating a new diagram, add it to `docs/diagrams/registry.json`

2. **Check `registry.json` for affected targets**
   - Open `docs/diagrams/registry.json`
   - Find the diagram's entry and note all `targets` (docs that inline this diagram)

3. **Update all inline copies**
   - For each target doc, find the `<!-- DIAGRAM: {id} START -->` / `<!-- DIAGRAM: {id} END -->` block
   - Replace the inline mermaid with the updated content from the `.mmd` file

4. **Update `system-design-overview.md`** if the change affects:
   - Governance hierarchy (objectives → strategies → tactics → actions)
   - HITL approval gates
   - Guardrails or kill switches
   - Autonomy ladder

5. **Update `system-architecture.md`** sections that describe the changed components textually (not just diagrams)

6. **Scan for stale references**
   ```bash
   grep -ric "clickup\|metabase" docs/overview/ | grep -v ":0$"
   ```
   Fix any hits.

7. **Run the diagram embed script**
   ```bash
   python scripts/embed_diagrams.py
   ```

8. **Verify diagram syntax**
   ```bash
   bash scripts/validate_mermaid.sh
   ```
