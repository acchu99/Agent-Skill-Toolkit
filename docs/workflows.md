# Workflows

Workflows are repeatable procedures stored in `.agents/workflows/`. They are written as slash commands, but they are just Markdown instruction files. Any coding agent can follow them when prompted.

## How To Invoke A Workflow

Use the slash command name in your prompt and point the agent to the file:

```text
Use /debug from .agents/workflows/debug.md to diagnose this failing test.
```

Or:

```text
Follow .agents/workflows/verify.md for this change.
```

The workflow should guide the agent's sequence. The agent still needs to read the relevant rules, agent file, and skills.

## Core Workflows

| Workflow | Primary Use |
| --- | --- |
| `/brainstorm` | Explore requirements with structured questions. |
| `/plan` | Create a decision-complete implementation plan. |
| `/create` | Create a new application, feature, or substantial capability. |
| `/enhance` | Improve existing code or UX. |
| `/debug` | Diagnose failures and identify root cause. |
| `/test` | Generate, repair, or run tests. |
| `/verify` | Prove the work behaves correctly. |
| `/preview` | Start or inspect a local preview. |
| `/deploy` | Prepare deployment or rollout steps. |
| `/status` | Summarize project or task state. |

## Coordination Workflows

| Workflow | Primary Use |
| --- | --- |
| `/orchestrate` | Coordinate multiple specialist agents for complex work. |
| `/coordinate` | Use advanced multi-agent coordination patterns. |
| `/doc-chronicle` | Capture architecture or documentation history. |
| `/prepare-launch-package` | Produce practical launch handoff material. |

Use coordination workflows when a task crosses domains, such as frontend plus backend plus testing, or security plus infrastructure plus release planning.

## Maintenance Workflows

| Workflow | Primary Use |
| --- | --- |
| `/add-agent` | Add a new specialist agent definition. |
| `/add-skill` | Add a reusable skill module. |
| `/add-migration` | Create a database migration using project conventions. |
| `/update-architecture` | Update architecture docs and diagrams. |
| `/run-consistency-check` | Check docs and diagrams for consistency problems. |
| `/tech-debt-scan` | Identify maintenance and refactoring opportunities. |
| `/remember` | Store durable project memory. |

## Domain-Specific Workflows

| Workflow | Primary Use |
| --- | --- |
| `/e2e-generate` | Generate end-to-end tests. |
| `/rls-audit` | Audit row-level security or database authorization. |
| `/sentry-triage` | Triage production errors from Sentry. |
| `/ui-ux-pro-max` | Apply richer UI and UX design guidance. |
| `/market` | Run a growth/marketing task: copy, CRO, launch, or pricing. |
| `/humanize` | Strip AI writing tells from a document. |

## Adapting Workflows

When copying this kit into a project, keep base workflow intent intact and adapt project-specific details sparingly.

Good workflow customizations:

- Add project-specific verification commands.
- Add required approval checkpoints.
- Add environment-specific deployment constraints.
- Add links to internal runbooks.

Avoid:

- Turning one workflow into a catch-all procedure.
- Hiding destructive operations inside routine workflows.
- Duplicating agent instructions that already belong in `.agents/agent/`.
- Storing temporary task notes in workflow files.

## Example: Plan Then Implement

Prompt:

```text
Use .agents/workflows/plan.md to plan adding GitHub OAuth.
After the plan is approved, use the relevant specialist agents to implement it.
```

Expected agent behavior:

1. Read core rules.
2. Use request routing to select `project-planner`.
3. Load planning and architecture skills as needed.
4. Produce an implementation plan.
5. Wait for approval if the workflow requires it.
6. During implementation, route frontend, backend, security, and test work to the right specialists.
7. Verify with concrete checks.

## Example: Debug

Prompt:

```text
Use .agents/workflows/debug.md.
The failing command is npm test and the error is "Cannot find module".
Find root cause before editing files.
```

Expected agent behavior:

1. Start from the observed failure.
2. Inspect the smallest relevant code and config surface.
3. Form a concrete hypothesis.
4. Verify the hypothesis.
5. Make the smallest fix.
6. Re-run the failing check.

## Example: Verify

Prompt:

```text
Use .agents/workflows/verify.md for the changes on this branch.
Report the exact commands run and any remaining risk.
```

Expected agent behavior:

1. Identify the changed files.
2. Select checks that cover the changed behavior.
3. Run tests, builds, or static checks where possible.
4. Report outcomes plainly.
5. Name anything that could not be verified.
