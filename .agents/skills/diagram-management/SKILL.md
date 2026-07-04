---
name: diagram-management
description: How diagrams work in this project (sources, registry, inline embeds). Use when creating, updating, or debugging Mermaid diagrams and their inline copies across documentation.
---

# Diagram Management

## How diagrams work

The project uses **Mermaid** diagrams with a three-part system:

1. **Source files** (`.mmd`) — single source of truth in `docs/diagrams/`
2. **Registry** (`registry.json`) — maps each diagram to the docs that embed it
3. **Inline copies** — mermaid fenced code blocks inside markdown docs, wrapped with marker comments

## Source files

Each diagram has one `.mmd` file in `docs/diagrams/`:
```
docs/diagrams/
├── system-architecture.mmd
├── agent-handoffs.mmd
├── autonomy-ladder.mmd
├── brand-onboarding-factory.mmd
├── business-functions-agents.mmd
├── data-to-decisions.mmd
├── improvement-flywheel.mmd
├── incident-escalation.mmd
├── operating-cadence.mmd
├── sense-decide-queue.mmd
├── strategic-governance.mmd
└── registry.json
```

## Registry (`registry.json`)

Each entry maps a diagram to its embed targets:

```json
{
  "id": "sense-decide-queue",
  "title": "Sense → Decide → Bundle? → Queue → Approve → Execute → Measure",
  "source": "docs/diagrams/sense-decide-queue.mmd",
  "targets": [
    { "file": "docs/overview/system-architecture.md" },
    { "file": "docs/overview/implementation-runbook.md" },
    { "file": "docs/overview/executive-slide-deck.md" }
  ]
}
```

## Inline embed markers

Docs that embed a diagram wrap the mermaid block with HTML comments:

```markdown
<!-- DIAGRAM: sense-decide-queue START -->

` ` `mermaid
graph LR
  ...
` ` `

<!-- DIAGRAM: sense-decide-queue END -->
```

The marker ID must match the `id` in `registry.json`.

## Updating a diagram

1. Edit the `.mmd` source file
2. Look up its `targets` in `registry.json`
3. Update each target doc's inline copy between the `START`/`END` markers
4. Run `python scripts/embed_diagrams.py` to automate this
5. Run `bash scripts/validate_mermaid.sh` to check syntax

## Adding a new diagram

1. Create `docs/diagrams/{id}.mmd`
2. Add an entry to `registry.json` with `id`, `title`, `source`, `targets`
3. Add inline embed markers to each target doc
4. Copy the mermaid content into each target

## Common mistakes

- Editing an inline copy without updating the `.mmd` source (drift!)
- Adding a `.mmd` file without adding it to `registry.json` (orphan!)
- Forgetting to update all targets listed in `registry.json` (inconsistency!)
