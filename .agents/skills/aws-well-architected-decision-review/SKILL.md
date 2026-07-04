---
name: aws-well-architected-decision-review
description: Evaluate architecture decisions with a repeatable AWS 6-pillar rubric, metrics, tradeoffs, and recommendation outcomes. Use when architecture options are under consideration, a plan includes data/orchestration/storage/automation decisions, or you need objective comparison with explicit tradeoffs.
---

# AWS Well-Architected Decision Review

## Purpose

Apply a consistent, metric-based review to major design decisions before implementation.

## When to Use

- Architecture options are under consideration
- A plan includes data, orchestration, storage, or automation decisions
- You need objective comparison with explicit tradeoffs

## Scoring Rubric

Score each pillar from 1 to 5 for every decision:

- 1: High risk / major gaps
- 2: Weak coverage / significant mitigation needed
- 3: Acceptable baseline
- 4: Strong alignment
- 5: Best-practice alignment

Recommended weighted score formula:

`Total = 0.22*Operational + 0.20*Security + 0.20*Reliability + 0.14*Performance + 0.14*Cost + 0.10*Sustainability`

## Required Outputs

- `architecture/decision-scorecard.md`
- `architecture/tradeoff-log.md`
- `architecture/mitigation-plan.md`

## Decision Record Template

For each decision:

- Context and alternatives
- Pillar scores + evidence
- Risks and mitigations
- Cost/performance assumptions
- Final recommendation and trigger to re-evaluate

## Gate Criteria

- No pillar score below 3 without approved mitigation
- Weighted score must exceed target threshold (default 3.6/5)
- High-risk decisions require human approval before deployment

## AWS 6-Pillar Checks

This skill directly operationalizes all six pillars through a mandatory scorecard and mitigation workflow.
