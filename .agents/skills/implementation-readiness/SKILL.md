---
name: implementation-readiness
description: Evaluate whether an implementation plan is execution-ready and deployment-ready with explicit gaps, mitigations, and release gates. Use when a plan appears complete but may hide assumptions, or when converting a strategy document into an execution-ready package.
---

# Implementation Readiness Audit

## Purpose

Use this skill to assess whether a plan can be executed end-to-end by an agent with minimal human intervention.

## When to Use

- A plan appears complete but may still hide assumptions or missing artifacts
- You need to convert a strategy document into an execution-ready and deployment-ready package
- You must validate readiness before scheduling implementation work

## Inputs

- Primary implementation plan document
- Related architecture docs and constraints
- Existing deployment, testing, and runbook artifacts

## Output Artifacts

Produce these artifacts (or equivalent) in the target planning directory:

- `implementation-plan-gap-analysis.md`
- `implementation-plan-revised.md`
- `hidden-assumptions-and-missing-questions.md`
- `deployment/execution-checklist.md`
- `deployment/definition-of-done.md`

If a product owner or operator must take over before or during launch, also
produce an operator-ready handoff package. Typical artifacts:

- `launch/launch-plan.md`
- `launch/blocker-register.md`
- `launch/operator-smoke-test.md`
- `launch/owner-handbook.md`
- `launch/operating-rhythm.md`
- `launch/escalation-runbook.md`

## Evaluation Dimensions

1. Completeness: All required outputs, owners, dependencies, and acceptance criteria are explicit
2. Executability: Steps are dependency-ordered and runnable without interpretation
3. Deployability: Environments, rollback, cutover, and promotion gates are defined
4. Operability: Monitoring, alerting, and incident handling are included
5. Safety: Guardrails for high-risk actions and human-approval boundaries are explicit
6. Operability For Humans: Incoming operators can understand the system without tribal knowledge

## Procedure

1. Inventory all requirements and expected deliverables from source-of-truth docs
2. Compare current plan against required artifacts and interfaces
3. Identify ambiguities, hidden assumptions, and unresolved decisions
4. Add missing technical artifacts (schemas, manifests, workflows, runbooks)
5. Define failure handling, retry policy, idempotency, and validation gates
6. Build dependency-first checklist and measurable Definition of Done
7. If launch is human-led, define operator handoff, decision rights, and escalation paths

## AWS 6-Pillar Checks

- Operational Excellence: Is there a deterministic runbook and escalation path?
- Security: Are permissions, secrets, and approval boundaries defined?
- Reliability: Are retries, backoff, idempotency, and recovery runbooks present?
- Performance Efficiency: Is work parallelized where safe and bottlenecks identified?
- Cost Optimization: Are always-on components minimized and cost guardrails set?
- Sustainability: Is compute/storage waste reduced via scoped runs and retention policies?

## Quality Bar

A plan passes this audit only if:

- No blocker-level unknowns remain for execution
- Every output has generation logic and validation criteria
- Deployment gates and rollback criteria are testable
- Traceability from requirements to configuration is complete
- Operator-facing launch artifacts exist when a human owner must run the system
