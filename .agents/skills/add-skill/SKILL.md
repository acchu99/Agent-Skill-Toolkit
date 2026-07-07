---
name: add-skill
description: Steps to create a new loadable skill package for agents, matching the kit's actual convention (kebab-case directory + SKILL.md + frontmatter), including placement, formatting, cross-linking, and wiring into agents and docs. Use when creating a new skill.
disable-model-invocation: true
argument-hint: "[skill-name]"
---

# Add a Skill

Follow these steps to create a new skill the same way the existing 109 skills are built.

## Skill Shape (the actual convention)

Every loadable skill is a **directory** with a `SKILL.md`:

```text
.agents/skills/<skill-name>/
└── SKILL.md            # required
    references/         # optional: deep-dive docs read on demand
    scripts/            # optional: runnable helpers (python/js)
    templates/          # optional: scaffolds
    data/               # optional: datasets
```

- Directory name is **kebab-case** (e.g. `conversion-rate-optimization`), matching the `name:` field.
- The entry file is always **`SKILL.md`** (uppercase), not `<skill-name>.md`.
- A few legacy notes live as top-level `.agents/skills/<name>.md` files; do **not** add new ones that way — use a directory + `SKILL.md`.

## Steps

1. **Create `.agents/skills/<skill-name>/SKILL.md`** with YAML frontmatter:

   ```yaml
   ---
   name: <skill-name>                # kebab-case, matches the directory
   description: <one line, keyword-rich — this is how the skill is discovered>
   when_to_use: "<sentence naming the triggers and any pairings>"
   allowed-tools: Read, Glob, Grep    # add Write, Edit, Bash only if the skill needs them
   ---
   ```

2. **Write the body** using the kit's house style (see any existing SKILL.md):
   - `# Title` + a one-line `>` philosophy/principle.
   - `## When to Apply` — the concrete situations.
   - Core content as **tables, checklists, and ✅/❌ examples** (not walls of prose).
   - `## Anti-Patterns` with ❌ items.
   - `## Quick Checklist` with `- [ ]` items.
   - `## Related Skills` linking sibling skills by name.

3. **Wire it into agents.** Add the skill name to the `skills:` frontmatter of every agent that should load it (`.agents/agent/<agent>.md`). A skill nothing references will rarely be loaded.

4. **Register it in the catalog.** Update the inventory counts and tables in `.agents/ARCHITECTURE.md` and `README.md`, and add it to `.agents/rules/quick-reference.md` if it's a key skill.

5. **Cross-link.** Reference related skills in your `## Related Skills`, and add a back-link from the most relevant sibling so discovery works both ways.

6. **Validate.** Confirm the counts (`find .agents/skills -mindepth 1 -maxdepth 2 -name SKILL.md | wc -l`), that every skill you named in `Related Skills` exists, and that any `scripts/` path you cite is real.

## Common Mistakes

❌ Naming the file `<skill-name>.md` instead of `SKILL.md`.
❌ Omitting frontmatter — the skill won't be discoverable by `description`/`when_to_use`.
❌ Adding the skill but not wiring it into any agent or the catalog.
❌ Prose-dumping instead of tables/checklists — inconsistent with the kit.
❌ Linking `Related Skills` that don't exist.

## Related Skills

- `skillify` — turn an ad-hoc procedure into a reusable skill.
- `add-agent` — create the specialist that will load this skill.
