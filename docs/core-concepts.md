# Core Concepts

This project extends the AG Kit model of Agents, Skills, and Workflows. The goal is to make coding agents more consistent by giving them explicit roles, reusable domain knowledge, and repeatable operating procedures.

## Agents

Agents are specialist role definitions. Each file in `.agents/agent/` describes:

- The agent's name and purpose.
- When to use that agent.
- Which tools it may use.
- Which skills it can load.
- Domain boundaries and behavioral expectations.

Use an agent when a task benefits from a specific perspective:

- `project-planner` for implementation planning.
- `frontend-specialist` for UI and frontend architecture.
- `backend-specialist` for API and server logic.
- `security-auditor` for security review.
- `debugger` for root cause analysis.
- `orchestrator` for multi-agent coordination.

## Skills

Skills are reusable knowledge modules. Most loadable skills live in directories like:

```text
.agents/skills/testing-patterns/SKILL.md
.agents/skills/api-patterns/SKILL.md
.agents/skills/frontend-design/SKILL.md
```

A skill should be loaded only when it is relevant to the task. This keeps context focused and prevents unrelated instructions from polluting the agent's work.

Skills typically contain:

- When to use the skill.
- Core principles.
- Procedures.
- Examples.
- Common mistakes.
- References or helper scripts when needed.

## Workflows

Workflows are repeatable task procedures in `.agents/workflows/`. They are written as slash-command style documents, but they can be used by any coding agent that can read files.

Examples:

- `/plan` for structured planning.
- `/create` for new features or apps.
- `/debug` for failure analysis.
- `/orchestrate` for multi-agent work.
- `/verify` for proving changes work.

Workflows are best for tasks that require a known sequence, checkpoints, or coordination across roles.

## Rules

Rules define workspace-wide behavior. They live in `.agents/rules/` and should be read before significant work.

Important rule files include:

- `core-protocol.md`: how agents and skills should be loaded.
- `request-routing.md`: how requests map to specialist agents.
- `code-rules.md`: implementation and planning expectations.
- `design-rules.md`: UI and design standards.
- `universal-rules.md`: general operating constraints.
- `quick-reference.md`: fast lookup for agents, skills, and scripts.

Rules have higher priority than individual agent or skill guidance.

## Memory

Memory stores durable project-specific context. It is not a scratchpad for every task. Use it for decisions and conventions that should survive across agent sessions.

Examples:

- Preferred deployment flow.
- Project-specific naming conventions.
- Known infrastructure boundaries.
- Recurring commands or validation steps.

Keep memory concise. If a note is useful only for the current task, it belongs in the conversation or a task plan, not persistent memory.

## Scripts

Scripts in `.agents/scripts/` support validation and local operation. They are optional helpers; they do not replace the project's own tests, linters, or build commands.

Current root helper scripts include:

- `auto_preview.py`
- `checklist.py`
- `session_manager.py`
- `verify_all.py`

Use scripts when a workflow or rule explicitly calls for them and they match the target project.

## How The Pieces Work Together

A typical task flow:

1. Read the relevant rules.
2. Classify the request.
3. Select the best agent.
4. Load only relevant skills.
5. Follow a workflow if the task maps to one.
6. Make or propose changes.
7. Verify with project-appropriate checks.
8. Record durable decisions in memory only when they will be reused.

The purpose is not to create bureaucracy. The purpose is to give coding agents enough structure to behave like disciplined collaborators.
