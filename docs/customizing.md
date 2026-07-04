# Customizing The Kit

This repository is meant to be adapted. The safest customization strategy is to keep reusable kit behavior separate from project-specific knowledge.

## Customization Principles

- Prefer adding small project-specific files over rewriting shared files.
- Keep durable project decisions in memory, not in agent prompts.
- Add a skill only when the guidance will be reused.
- Add a workflow only when the procedure has multiple repeatable steps.
- Keep agent responsibilities narrow and explicit.
- Verify documentation and inventory after structural changes.

## Add Project Memory

Use `.agents/memory/` for durable project conventions.

Examples:

- "Production deploys require approval from the platform team."
- "Use pnpm, not npm, in this repository."
- "The staging database may be inspected but not mutated."

Do not store temporary task notes or one-off debugging observations unless they will matter in future sessions.

## Add A Skill

Use `.agents/workflows/add-skill.md` as the procedure.

A good skill has:

- A clear trigger: when to use it.
- Concrete principles or steps.
- Examples that match real project work.
- Common mistakes to avoid.
- Links to related skills when useful.

Recommended package shape:

```text
.agents/skills/my-domain-skill/
└── SKILL.md
```

Use additional files only when the skill needs references, scripts, templates, or examples.

## Add An Agent

Use `.agents/workflows/add-agent.md` as the procedure.

Add a new agent when the project needs a stable specialist role, not just a one-time perspective.

Good reasons to add an agent:

- A domain has recurring tasks and distinct standards.
- A role needs specific boundaries or tool constraints.
- Multiple workflows need the same specialist.

Avoid adding agents for:

- One-off tasks.
- Minor variants of existing roles.
- Temporary project phases.

## Add A Workflow

Create a workflow when the team repeats a procedure and wants consistent execution.

Good workflow examples:

- Release readiness check.
- Incident triage.
- Security review before deployment.
- Data migration planning.
- Customer launch handoff.

Workflow files should include:

- When to use the workflow.
- Inputs the agent needs.
- Step-by-step procedure.
- Checkpoints or approval gates.
- Verification and completion criteria.

## Update Rules Carefully

Rules affect every agent session. Treat changes to `.agents/rules/` as high-impact.

Good rule changes:

- Clarify routing behavior.
- Add project-wide safety constraints.
- Add required verification expectations.
- Define design or implementation standards used across the repo.

Risky rule changes:

- Tool-specific instructions that do not apply to all agents.
- Large blocks of domain knowledge better suited to skills.
- Temporary preferences from a single task.

## Keep Local And Upstream Concepts Aligned

This project extends AG Kit, so the core language should remain familiar:

- Agents are specialist personas.
- Skills are modular knowledge packages.
- Workflows are repeatable procedures.
- Rules are workspace-wide behavior.
- Memory is durable project context.

If you rename these concepts locally, future updates become harder and prompts become less portable across teams.

## Documentation Expectations

When adding or changing agents, skills, workflows, or rules:

1. Update `.agents/ARCHITECTURE.md` if inventory or structure changes.
2. Update user-facing docs if usage changes.
3. Keep examples current.
4. Run a stale-term search for old counts or old workflow names.
5. Verify relative links.
