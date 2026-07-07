---
description: Create a new loadable skill package using the kit's actual convention (kebab-case dir + SKILL.md + frontmatter), then wire it into agents and the catalog.
---

# Add a Skill

Create a new skill the same way the existing skills are built. Load the `add-skill` skill for the full checklist.

## Convention (must match existing skills)

A skill is a **directory** with an uppercase `SKILL.md`:

```text
.agents/skills/<skill-name>/SKILL.md   # kebab-case dir, SKILL.md entry
```

Optional siblings: `references/`, `scripts/`, `templates/`, `data/`. Do **not** create new top-level `.agents/skills/<name>.md` notes — use a directory + `SKILL.md`.

## Steps

1. **Create `SKILL.md`** with frontmatter:
   ```yaml
   ---
   name: <skill-name>
   description: <one line, keyword-rich — how the skill is discovered>
   when_to_use: "<triggers and pairings>"
   allowed-tools: Read, Glob, Grep
   ---
   ```

2. **Write the body** in house style: `# Title` + `>` principle, `## When to Apply`, tables/checklists/✅❌ examples, `## Anti-Patterns`, `## Quick Checklist`, `## Related Skills`.

3. **Wire into agents:** add the skill name to the `skills:` frontmatter of each relevant `.agents/agent/<agent>.md`.

4. **Register in the catalog:** update counts + tables in `.agents/ARCHITECTURE.md` and `README.md`; add to `quick-reference.md` if it's a key skill.

5. **Validate:** recount skills, confirm every `Related Skills` name exists, and check any `scripts/` path you cite.

## Usage Examples

```
/add-skill rate-limiting-patterns
/add-skill accessible-charts
```
