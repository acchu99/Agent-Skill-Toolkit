# Consolidated Agent Skills

Professional agent, skill, workflow, and rule packs for software projects that use coding agents such as Codex, Claude Code, and other agentic development tools.

This project is an extension and adaptation of [AG Kit](https://ag-kit.unikorn.vn/docs). AG Kit provides the core concepts of specialist Agents, reusable Skills, and repeatable Workflows; this repository consolidates and expands those ideas into a richer `.agents/` workspace that can be vendored into real engineering projects.

## What This Repository Provides

The repository is intentionally simple: the product is the `.agents/` directory.

| Area | Purpose |
| --- | --- |
| `.agents/agent/` | Specialist agent definitions for planning, frontend, backend, testing, security, DevOps, documentation, maintenance, and more. |
| `.agents/skills/` | Reusable domain instructions that agents load when a task needs specific expertise. |
| `.agents/workflows/` | Slash-command style procedures for common engineering work such as planning, debugging, creating features, testing, deployment, and verification. |
| `.agents/rules/` | Always-on and model-selected workspace rules that define routing, implementation, design, and safety behavior. |
| `.agents/memory/` | Project memory conventions for durable decisions and local operating notes. |
| `.agents/scripts/` | Helper scripts for validation, previews, and session management. |
| `.agents/ARCHITECTURE.md` | Internal architecture and inventory reference for the kit. |

Current inventory:

- 27 specialist agent files.
- 109 loadable skill packages with `SKILL.md`.
- 6 supplemental top-level skill notes.
- 27 workflow files.
- 6 rule files.
- 4 helper scripts.

## Relationship To AG Kit

[AG Kit](https://ag-kit.unikorn.vn/docs) defines a practical pattern for improving coding assistants with:

- Agents: specialist personas with tools, responsibilities, and behavioral constraints.
- Skills: modular knowledge packages loaded when relevant.
- Workflows: repeatable slash-command procedures for common development tasks.

This repository keeps that model and extends it with a larger inventory, stricter workspace rules, additional operational workflows, more specialized skills, and project memory conventions. Treat upstream AG Kit as the conceptual baseline and this repository as a consolidated, opinionated expansion for professional development teams.

## Quick Start

Copy the `.agents/` directory into the root of a project where you use a coding agent.

```bash
cp -R /path/to/consolidated-agent-skills/.agents /path/to/your-project/.agents
```

Then ask your coding agent to use it:

```text
Read .agents/rules/core-protocol.md and .agents/rules/request-routing.md.
Use the relevant agents, skills, and workflows in .agents/ for this task.
```

For a first task, start with planning:

```text
Use the .agents workflow /plan to create an implementation plan for adding password reset.
Follow the project rules in .agents/rules before proposing changes.
```

Or debug an issue:

```text
Use .agents/workflows/debug.md and the debugger agent to diagnose why login returns 500.
Read only the relevant skills before making changes.
```

## Using With Coding Agents

This kit is tool-agnostic. It works best with coding agents that can read files from the repository and follow instruction documents.

### Codex

Codex can use the `.agents/` files as local project instructions. A practical prompt pattern is:

```text
Use this repository's .agents system for the task.
Start with .agents/rules/core-protocol.md and .agents/rules/request-routing.md.
Load only the agent and skill files that match the request.
```

For larger tasks:

```text
Use .agents/workflows/orchestrate.md.
Create a plan first, then coordinate the relevant specialist agents.
Do not modify files until the plan is clear.
```

### Claude Code

Claude Code can consume the agent and workflow files directly from the repository. Use prompts like:

```text
Follow .agents/rules/core-protocol.md.
Use the orchestrator agent for this feature and load the skills named in its frontmatter.
```

When you want a specific specialist:

```text
Use .agents/agent/security-auditor.md to review the authentication flow.
Load only the security skills needed for this review.
```

### Other Coding Agents

Any agent with repository read access can use the same pattern:

1. Read the relevant always-on rules.
2. Select the appropriate agent file.
3. Load only the skill files named by that agent and relevant to the task.
4. Follow a workflow file when the request maps to a repeatable procedure.
5. Verify changes with the project test and validation commands.

## Core Concepts

Agents define role, scope, tools, and skill access. They answer the question: "Which specialist perspective should handle this?"

Skills define reusable expertise. They answer the question: "What domain-specific rules or procedures should the agent apply?"

Workflows define repeatable task procedures. They answer the question: "What sequence should the agent follow for this type of work?"

Rules define workspace-wide behavior. They answer the question: "What must every agent do regardless of specialty?"

Memory records durable project decisions. It answers the question: "What should future agent sessions remember about this project?"

## Common Workflows

| Workflow | Use When |
| --- | --- |
| `/plan` | You need a structured implementation plan before edits. |
| `/create` | You are creating a new app, feature, or substantial capability. |
| `/debug` | You need root cause analysis for a failure. |
| `/orchestrate` or `/coordinate` | The task needs multiple specialist perspectives. |
| `/test` | You need test generation, repair, or execution guidance. |
| `/verify` | You need proof that changes work, not only inspection. |
| `/deploy` | You need deployment preparation or production rollout guidance. |
| `/add-skill` | You want to add a reusable instruction module. |
| `/add-agent` | You want to add a new specialist role. |
| `/market` | You need marketing/growth work: copy, CRO, launch, or pricing. |
| `/humanize` | You need to strip AI writing tells from a document. |

See [docs/workflows.md](docs/workflows.md) for details.

## Documentation

- [Getting Started](docs/getting-started.md)
- [Core Concepts](docs/core-concepts.md)
- [Using With Coding Agents](docs/using-with-coding-agents.md)
- [Workflows](docs/workflows.md)
- [Customizing The Kit](docs/customizing.md)
- [Maintenance](docs/maintenance.md)
- [Internal Architecture](.agents/ARCHITECTURE.md)

## Recommended Adoption Pattern

Start by vendoring the full `.agents/` directory into one project and using it unchanged for a few tasks. After the team sees which agents and workflows are useful, customize project-specific memory, rules, and skills.

Keep customizations close to the project:

- Add project conventions to `.agents/memory/`.
- Add reusable local knowledge to `.agents/skills/`.
- Add repeatable project procedures to `.agents/workflows/`.
- Keep agent definitions focused on role and boundaries.

## Maintaining A Local Copy

When you update this kit or merge upstream AG Kit changes:

1. Recount agents, skills, workflows, rules, and scripts.
2. Review `.agents/ARCHITECTURE.md` for stale inventory.
3. Keep local project rules separate from reusable kit rules when possible.
4. Run documentation link checks after edits.
5. Avoid changing agent behavior while making documentation-only updates.

## License And Attribution

This repository is an extension of the public AG Kit model and documentation at [ag-kit.unikorn.vn/docs](https://ag-kit.unikorn.vn/docs). Preserve attribution when redistributing or adapting this kit, and check the upstream AG Kit repository for its license terms before publishing derived distributions.
