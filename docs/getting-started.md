# Getting Started

This guide explains how to add the consolidated `.agents/` system to another software project and start using it with a coding agent.

## Prerequisites

You need:

- A project repository where your coding agent can read local files.
- A coding agent such as Codex, Claude Code, or another repository-aware assistant.
- Basic agreement from the team that `.agents/` is part of the project operating model.

No runtime package installation is required for the documentation, agent, skill, or workflow files. Some helper scripts may require Python when you choose to run them.

## Install By Copying

From this repository:

```bash
cp -R .agents /path/to/your-project/.agents
```

Or from another directory:

```bash
cp -R /path/to/consolidated-agent-skills/.agents /path/to/your-project/.agents
```

Commit the copied files if you want the agent system to be shared across the team.

## First Run Checklist

After copying `.agents/`, ask your coding agent to inspect the core rules:

```text
Read .agents/rules/core-protocol.md and .agents/rules/request-routing.md.
Summarize how you will use agents, skills, and workflows in this repository.
Do not edit files yet.
```

Then run a small planning task:

```text
Use .agents/workflows/plan.md to create a plan for improving the README.
Use the project-planner agent and relevant documentation skills.
```

This verifies that the assistant can find the rules, select an agent, and load skills on demand.

## Recommended Project Layout

Place `.agents/` at the project root:

```text
your-project/
├── .agents/
│   ├── ARCHITECTURE.md
│   ├── agent/
│   ├── memory/
│   ├── rules/
│   ├── scripts/
│   ├── skills/
│   └── workflows/
├── src/
├── tests/
└── README.md
```

Keeping `.agents/` at the root makes prompts, workflow references, and relative paths predictable across coding tools.

## First Customizations

Start small:

- Add durable project decisions to `.agents/memory/MEMORY.md`.
- Add coding standards or domain constraints to `.agents/memory/project-conventions.md`.
- Add one custom skill only when the same guidance is reused across multiple tasks.
- Add one workflow only when the team repeats the same multi-step procedure.

Avoid rewriting all agents immediately. The base agent files are meant to be reusable.

## Good First Prompts

Plan a change:

```text
Use the .agents system. Start with /plan, then propose the smallest implementation path.
```

Debug a failure:

```text
Use .agents/workflows/debug.md and the debugger agent.
Find root cause before proposing fixes.
```

Review security:

```text
Use .agents/agent/security-auditor.md to review the authentication changes.
Load only relevant security skills.
```

Verify work:

```text
Use .agents/workflows/verify.md.
Run the checks needed to prove this change works.
```

## Updating From This Repository

When refreshing a project copy:

1. Compare local `.agents/` changes against this repository.
2. Preserve project-specific memory and local skills.
3. Pull in new reusable agents, skills, workflows, and rules deliberately.
4. Re-run a small planning task to confirm the coding agent still follows the expected protocol.
