# Using With Coding Agents

This kit is designed for repository-aware coding agents. The files are plain Markdown so they can be consumed by Codex, Claude Code, Cursor-style agents, local assistants, and custom automation.

## General Pattern

Use this pattern with any coding agent:

```text
Use the .agents system in this repository.
Start with .agents/rules/core-protocol.md and .agents/rules/request-routing.md.
Select the relevant agent, load only relevant skills, and follow a workflow when one matches the task.
```

For implementation work:

```text
Use the relevant .agents workflow for this task.
Before editing files, identify the agent and skills you are applying.
After editing, run the checks needed to verify the result.
```

For planning-only work:

```text
Use .agents/workflows/plan.md.
Produce a decision-complete implementation plan.
Do not modify files.
```

## Codex

Codex works well with explicit local-file references.

For a feature:

```text
Use .agents/rules/core-protocol.md and .agents/rules/request-routing.md.
Then use .agents/workflows/plan.md to plan adding organization invites.
Load the project-planner agent and relevant planning skills.
```

For direct implementation after a plan:

```text
Implement the approved plan using the .agents system.
Use the right specialist agent for each area and verify changes before finishing.
```

For review:

```text
Review this branch using .agents/agent/code-archaeologist.md and .agents/agent/security-auditor.md where relevant.
Lead with bugs, regressions, and missing tests.
```

## Claude Code

Claude Code can use the same file-based operating model.

Start a session with:

```text
Read .agents/rules/core-protocol.md.
Use the agent and skill loading protocol from this repository.
```

Invoke a specialist:

```text
Use .agents/agent/frontend-specialist.md for this UI change.
Load the skills listed in its frontmatter only when relevant to the requested work.
```

Coordinate multiple specialists:

```text
Use .agents/agent/orchestrator.md and .agents/workflows/orchestrate.md.
Create a plan first, then coordinate specialists for implementation.
```

## Generic Agent Prompt Template

Use this template when integrating with another coding assistant:

```text
You have access to a local .agents directory.

Operating rules:
1. Read .agents/rules/core-protocol.md before significant work.
2. Use .agents/rules/request-routing.md to select the right agent.
3. Read the chosen .agents/agent/*.md file.
4. Load only relevant skills from .agents/skills/.
5. Use .agents/workflows/*.md when the task matches a workflow.
6. Prefer project tests and verification commands over inspection-only claims.
7. Do not update .agents/memory/ unless asked to store durable project knowledge.

Task:
[describe the task]
```

## Prompting Specific Workflows

Planning:

```text
Use /plan from .agents/workflows/plan.md for this request.
The output should be implementation-ready and should list tests.
```

Debugging:

```text
Use /debug from .agents/workflows/debug.md.
Start from the observed error, isolate root cause, and only then propose a fix.
```

Verification:

```text
Use /verify from .agents/workflows/verify.md.
Run or identify the concrete commands that prove this change works.
```

Multi-agent work:

```text
Use /orchestrate from .agents/workflows/orchestrate.md.
Select specialists by domain and synthesize their findings into one plan.
```

## Practical Guidance

Be explicit about mode and scope. Tell the coding agent whether you want a plan, an implementation, a review, or a diagnosis.

Prefer file references over vague instruction:

```text
Use .agents/agent/test-engineer.md
```

is better than:

```text
Act like a tester
```

Ask for evidence when work is complete:

```text
Report the files changed and the verification commands run.
```

Keep persistent memory intentional:

```text
Store this deployment constraint in .agents/memory only if it should apply to future sessions.
```
