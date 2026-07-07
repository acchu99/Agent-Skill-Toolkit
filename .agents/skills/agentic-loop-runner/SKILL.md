---
name: agentic-loop-runner
description: Generic protocol for running agentic implementation loops from a plan, goal contract, evaluation plan, security review, or acceptance-criteria document. Use when coordinating planner, explorer, implementation, QA, validation, and synthesis agents across one or more loop iterations.
allowed-tools: Read, Glob, Grep
---

# Agentic Loop Runner

Use this skill to execute an existing goal/evaluation contract. By default, run an agentic loop. Do not use it to author the contract from scratch; use `agentic-evaluation-design` for that.

## Core Loop

Run the loop as a controller, not as a loose checklist:

1. **Contract intake**: Read the source contract, user request, acceptance criteria, scope boundaries, hard constraints, verification runbook, and any declared time budget.
2. **Human clarity checkpoint**: Ask the human only when one missing decision would materially reduce agent count, token use, or wasted implementation iterations.
3. **Planning pass**: Convert the contract into a short implementation plan with affected repos, files, agents, dependency order, stop conditions, and validation commands.
4. **Discovery pass**: Use explorer/domain agents to verify current repo state before coding. Replace stale contract assumptions with observed file paths and test commands.
5. **Implementation wave**: Route work to the smallest set of domain agents that match the affected layers. Keep each agent inside its file/domain boundary.
6. **Integration pass**: Merge agent outputs into one coherent implementation. Resolve overlaps, contradictions, and partial edits before QA.
7. **QA and validation**: Run the deterministic verification runbook from the contract. Add focused tests when the contract requires a behavior that is not covered.
8. **Pass/fail decision**: If checks fail, feed exact failing evidence back into the planner and run another focused iteration. If checks pass, produce the final synthesis.

For reusable diagrams and prompt/report templates, read `references/loop-templates.md`.

## Intake Rules

Before invoking implementation agents, extract and restate:

- Original user request and source contract path.
- Target repo or service boundaries.
- Allowed file operations and blocked file operations.
- Resolved design decisions and assumptions.
- P0/P1 acceptance criteria.
- Verification commands, expected outputs, and cleanup commands.
- Time budget only if the contract or user explicitly provides one.

If the contract is missing deterministic acceptance criteria, stop and ask for clarification or first use `agentic-evaluation-design` to create the missing contract.

Default to running the loop after intake. Bring the human into the loop before agent fan-out when:

- Multiple plausible repo targets, ownership boundaries, or implementation strategies exist and choosing wrong would send agents into unrelated files.
- A single product/security decision would replace broad exploration with a smaller scoped task.
- Required credentials, destructive access, production access, or policy exceptions are needed.
- The contract conflicts with the live checkout or the user's latest instruction.

Ask one concise question, state why the answer will save work, then continue with the loop after the answer. Do not ask for clarification when repo inspection can answer the question cheaply.

## Agent Roles

Use roles based on the contract, not a fixed roster:

| Role | Responsibility |
| --- | --- |
| Planner | Convert the contract into ordered implementation steps and retry strategy. |
| Explorer | Map the current codebase, tests, config, and ownership boundaries. |
| Domain implementers | Edit only the backend, frontend, database, infra, or security surfaces they own. |
| Security/reliability reviewers | Check boundaries, auth, isolation, error handling, rollout risk, and operational safety. |
| Test/QA | Add or run deterministic tests and reproduce exploit/regression scenarios. |
| Integrator/synthesizer | Merge findings, resolve conflicts, run final checks, and report outcome. |

## Handoff Packet

Every subagent invocation must include a complete packet:

```markdown
## Context
- Original request: <verbatim or concise faithful summary>
- Source contract: <path>
- Target repos/services: <list>
- Current iteration: <n>
- Decisions already made: <list>
- Previous findings/failures: <exact evidence or "none">
- Human clarification: <answer that shaped scope, or "not needed">

## Scope
- Allowed files/areas: <list>
- Blocked files/areas: <list>
- Hard constraints: <list>
- Stop conditions: <list>

## Task
<specific work for this agent only>

## Verification
- Commands to run or preserve for QA: <list>
- Acceptance criteria this agent must support: <list>
```

Never ask a subagent to infer scope from the folder name. Pass the contract details explicitly.

## Failure Loop Rules

- Treat deterministic check failures as loop input, not as final output.
- Feed the exact command, exit code, failing assertion, log excerpt, or reproduction step back into the planner.
- Keep retry iterations focused on the failed criterion.
- Do not broaden scope, change hard constraints, alter prompt/policy text, or weaken acceptance criteria without explicit user approval.
- Stop and report a blocker when the contract requires credentials, production access, or destructive operations that are unavailable or unsafe.

## Exit Rules

The final synthesis must state:

- Source contract and user goal.
- Agents or roles used.
- Files changed or intended to change.
- Verification commands run and results.
- Acceptance criteria pass/fail status.
- Unresolved risks, skipped checks, and blockers.
- Next iteration target if anything failed.

Do not mark the loop complete until all P0 acceptance criteria pass or a concrete blocker is reported.
