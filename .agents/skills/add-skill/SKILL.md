---
name: add-skill
description: Steps to create a new skill document for agents, including placement rules (domain vs shared vs meta), formatting conventions, and cross-linking. Use when creating a new skill document.
disable-model-invocation: true
argument-hint: "[skill_name]"
---

# Add a Skill

Follow these steps when creating a new skill document that agents can reference.

## Skill Types

- **Domain skills** (`skills/{agent_domain}/`): Specific to one agent domain
- **Shared skills** (`skills/shared/`): Used across multiple agents
- **Meta skills** (`.agents/skills/` or `.claude/skills/`): For agents maintaining the project itself (not business agents)

## Steps

1. **Determine skill placement**
   - If only one agent domain uses it → `skills/{agent_domain}/`
   - If multiple agents benefit → `skills/shared/`
   - If it's about project maintenance → `.agents/skills/` (for other IDEs) and `.claude/skills/` (for Claude Code)

2. **Create the skill file**
   - Use snake_case naming: `{skill_name}.md`
   - Example: `skills/shared/pricing_elasticity.md`

3. **Follow the skill document format:**
   ```markdown
   # {Skill Name}

   ## When to use this skill
   - Bullet list of situations where this skill applies

   ## Key concepts
   - Core knowledge the agent needs

   ## Procedure
   1. Step-by-step instructions
   2. With concrete examples

   ## Examples
   - Real-world examples showing how to apply this skill

   ## Common mistakes
   - Pitfalls to avoid

   ## Related skills
   - Links to related skill documents
   ```

4. **Reference the skill from relevant agent specs or prompts**
   - If the skill should be loaded into agent context, reference it in the agent's system prompt or prompt template

5. **Validate**
   - Ensure the skill is findable via its directory location
   - Check that related skills are cross-linked
