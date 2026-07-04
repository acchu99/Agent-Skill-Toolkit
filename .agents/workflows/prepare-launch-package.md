# Prepare Launch Package

Use this workflow when the project is nearing internal launch and a product
owner or operator needs a practical handoff package.

## Inputs

- Current readiness state
- Known blockers
- Main launch target brand or system
- Upcoming workstreams such as n8n, data pipelines, or integration hardening

## Outputs

Create or update a launch package under a planning directory, typically
`prototypes/launch`, with:

- `README.md`
- `launch-plan.md`
- `launch-checklist.md`
- `blocker-register.md`
- `operator-smoke-test.md`
- `owner-handbook.md`
- `day-1-setup.md`
- `operating-rhythm.md`
- `screen-guide.md`
- `decision-rights.md`
- `escalation-runbook.md`
- `known-limitations.md`
- `data-contracts.md`
- `launch-roles-and-contacts.md`
- `success-metrics.md`
- `glossary.md`
- `n8n-workstream.md` when workflow readiness is part of launch

## Procedure

1. Separate internal operator launch from autonomous turn-on.
2. Summarize what is already launchable.
3. Enumerate blockers with impact and owner suggestions.
4. Convert engineering state into operator-readable guidance.
5. Add the smoke test and escalation paths.
6. Tie adjacent workstreams such as n8n directly back to launch readiness.
