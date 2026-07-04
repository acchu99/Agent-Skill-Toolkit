# AG Kit Extension Architecture

> Internal architecture and inventory reference for this consolidated `.agents/` toolkit.

This repository is an extension and adaptation of [AG Kit](https://ag-kit.unikorn.vn/docs). It keeps AG Kit's core model of Agents, Skills, and Workflows, then expands it with additional specialist roles, operational workflows, project memory conventions, stricter rules, and helper scripts for professional software projects.

For developer-facing usage documentation, start with [../README.md](../README.md).

## Overview

The toolkit currently contains:

- 26 specialist agent files.
- 101 loadable skill packages with `SKILL.md`.
- 6 supplemental top-level skill notes.
- 25 workflow files.
- 6 workspace rule files.
- 4 helper scripts.

## Directory Structure

```text
.agents/
├── ARCHITECTURE.md       # Internal architecture and inventory reference
├── agent/                # Specialist agent definitions
├── skills/               # Loadable skill packages and supplemental notes
├── workflows/            # Slash-command style procedures
├── rules/                # Workspace rules and routing protocol
├── memory/               # Persistent project memory conventions
├── scripts/              # Helper scripts for preview, validation, and sessions
└── mcp_config.json       # MCP configuration
```

## Agents

Agents are specialist personas for distinct engineering domains. Each agent file defines role, scope, tools, skills, and behavioral expectations.

| Agent | Focus |
| --- | --- |
| `ai-optimization-specialist` | AI optimization and agent behavior quality. |
| `architecture-chronicler` | Architecture history and documentation. |
| `backend-specialist` | APIs, server logic, and backend integration. |
| `code-archaeologist` | Legacy code analysis and refactoring. |
| `database-architect` | Schema design, migrations, and data modeling. |
| `debugger` | Root cause analysis and systematic debugging. |
| `dependency-security-scouter` | Dependency and supply-chain security review. |
| `devops-engineer` | CI/CD, infrastructure, deployment, and operations. |
| `documentation-writer` | README, guides, references, and developer docs. |
| `explorer-agent` | Codebase discovery and repository mapping. |
| `frontend-specialist` | Web UI, React/Next.js, frontend architecture, and UX. |
| `game-developer` | Game logic, mechanics, and game project structure. |
| `maintenance-janitor` | Maintenance, cleanup, consistency, and hygiene. |
| `mobile-developer` | iOS, Android, React Native, and mobile UX. |
| `orchestrator` | Multi-agent coordination and synthesis. |
| `penetration-tester` | Offensive security testing and adversarial review. |
| `performance-optimizer` | Profiling, optimization, and web performance. |
| `product-manager` | Requirements, prioritization, and user stories. |
| `product-owner` | Product strategy, backlog, and MVP decisions. |
| `project-planner` | Discovery, planning, and implementation breakdown. |
| `qa-automation-engineer` | E2E automation and QA pipelines. |
| `reliability-engineer` | Resilience, incident prevention, and operational reliability. |
| `security-auditor` | Security architecture, compliance, and risk review. |
| `seo-specialist` | SEO and generative engine optimization. |
| `test-coverage-architect` | Coverage strategy and test architecture. |
| `test-engineer` | Unit, integration, and end-to-end testing. |

## Skills

Skills are modular knowledge packages loaded on demand. Most loadable skills use this shape:

```text
.agents/skills/<skill-name>/
└── SKILL.md
```

Some skills include optional references, examples, scripts, or templates:

```text
.agents/skills/<skill-name>/
├── SKILL.md
├── references/
├── examples/
├── scripts/
└── templates/
```

The kit includes skill coverage for:

- Frontend, UI, design systems, Tailwind, React, and Next.js.
- Backend, APIs, Node.js, NestJS, Python, Rust, and TypeScript.
- Database design, Prisma, migrations, Supabase, and schema conventions.
- Testing, TDD, Playwright, E2E, validation, and coverage strategy.
- Security, red-team tactics, vulnerability scanning, governance, and safety gates.
- Infrastructure, Docker, Kubernetes, EKS, deployment, and server management.
- Architecture, planning, implementation readiness, and gap analysis.
- Game development across web, mobile, 2D, 3D, multiplayer, PC, and VR/AR.
- Documentation, memory, context compression, coordination, and maintenance.

## Workflows

Workflows are slash-command style procedures. They can be invoked by name or referenced directly as Markdown files.

| Workflow | Purpose |
| --- | --- |
| `/add-agent` | Add a new specialist agent. |
| `/add-migration` | Create a database migration using project conventions. |
| `/add-skill` | Add a reusable skill document. |
| `/brainstorm` | Run structured discovery and requirement clarification. |
| `/coordinate` | Coordinate multiple agents for complex tasks. |
| `/create` | Create a new application, feature, or capability. |
| `/debug` | Diagnose failures and isolate root cause. |
| `/deploy` | Prepare deployment and rollout procedures. |
| `/doc-chronicle` | Capture architecture or documentation history. |
| `/e2e-generate` | Generate end-to-end tests. |
| `/enhance` | Improve existing code or user experience. |
| `/orchestrate` | Run multi-agent orchestration. |
| `/plan` | Create a structured implementation plan. |
| `/prepare-launch-package` | Create launch handoff material. |
| `/preview` | Start or inspect a project preview. |
| `/remember` | Store durable project memory. |
| `/rls-audit` | Audit row-level security and database authorization. |
| `/run-consistency-check` | Check documentation and diagrams for consistency. |
| `/sentry-triage` | Triage production errors from Sentry. |
| `/status` | Summarize project or task status. |
| `/tech-debt-scan` | Identify maintainability and refactoring opportunities. |
| `/test` | Generate, repair, or run tests. |
| `/ui-ux-pro-max` | Apply richer UI and UX design guidance. |
| `/update-architecture` | Update architecture docs and diagrams. |
| `/verify` | Prove changes work with concrete checks. |

## Rules

Rules define workspace-wide behavior and have higher priority than individual agent or skill instructions.

| Rule File | Purpose |
| --- | --- |
| `core-protocol.md` | Core agent and skill loading protocol. |
| `request-routing.md` | Request classification and specialist routing. |
| `code-rules.md` | Planning and implementation expectations. |
| `design-rules.md` | Design and UI standards. |
| `quick-reference.md` | Fast lookup for common agents, skills, and scripts. |
| `universal-rules.md` | General workspace behavior. |

## Memory

Memory files store durable project-level context:

```text
.agents/memory/
├── MEMORY.md
└── project-conventions.md
```

Use memory for conventions and decisions that should survive across coding-agent sessions. Do not use it for temporary task notes.

## Scripts

Root helper scripts:

| Script | Purpose |
| --- | --- |
| `auto_preview.py` | Help start or inspect local previews. |
| `checklist.py` | Run checklist-style validation where applicable. |
| `session_manager.py` | Support local session management workflows. |
| `verify_all.py` | Coordinate broader verification checks where applicable. |

Scripts are optional helpers. Target projects should still use their own build, test, lint, and deployment commands as the source of truth.

## Loading Protocol

Recommended agent flow:

```text
User request
  -> Read applicable rules
  -> Classify request
  -> Select agent
  -> Read selected agent file
  -> Load only relevant skills
  -> Follow matching workflow if one exists
  -> Verify result
```

This keeps context focused while preserving a consistent operating model across coding assistants.

## Maintenance Checklist

When this repository changes:

1. Recount agents, loadable skills, supplemental skill notes, workflows, rules, and scripts.
2. Update this file and the root README when inventory changes.
3. Search for stale counts or old workflow names.
4. Verify relative documentation links.
5. Keep documentation-only edits separate from behavior changes.

Useful inventory commands:

```bash
find .agents/agent -maxdepth 1 -type f -name '*.md' | wc -l
find .agents/skills -mindepth 1 -maxdepth 2 -name 'SKILL.md' | wc -l
find .agents/skills -maxdepth 1 -type f -name '*.md' | wc -l
find .agents/workflows -maxdepth 1 -type f -name '*.md' | wc -l
find .agents/rules -maxdepth 1 -type f -name '*.md' | wc -l
find .agents/scripts -maxdepth 1 -type f | wc -l
```
