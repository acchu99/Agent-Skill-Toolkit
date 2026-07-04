---
name: operator-launch-handoff
description: Create a practical launch handoff package for a product owner or operator, including launch plan, blockers, operating rhythm, decision rights, escalation, and n8n follow-on work.
---

# Operator Launch Handoff

## Purpose

Use this skill when an internal operator, product owner, or launch manager
needs to take over a system that is close to launch but not yet fully mature.

This skill converts engineering context into an operating handoff package.

## When To Use

- The UI or system is close to internal launch and needs a structured handoff.
- A product owner will begin running launch prep.
- There is a gap between “the app works” and “a human can safely run this.”
- Launch work spans app readiness, data readiness, and workflow readiness.

## Core Distinction

Always distinguish between:

1. internal operator launch
2. autonomous or production runtime turn-on

Do not collapse these into one readiness statement.

## Required Output Package

Create a launch package directory, typically under `prototypes/launch`, with at
least:

- launch plan
- launch checklist
- blocker register
- operator smoke test
- product owner handbook
- day-1 setup
- operating rhythm
- screen guide
- decision rights
- escalation runbook
- known limitations
- success metrics
- glossary
- n8n workstream plan if pipelines are part of launch readiness

## Procedure

### 1. Capture current reality

Summarize:

- what is already launchable
- what still blocks safe turn-on
- what is UI-ready versus data/runtime-ready

### 2. Separate workstreams

Split launch prep into:

- app/control-center hardening
- config readiness
- schema/model readiness
- workflow/pipeline readiness
- go/no-go review

### 3. Write for an operator, not for engineering only

The package should explain:

- what to look at first
- how to use the product
- what to do daily
- when to escalate
- what not to assume is ready

### 4. Include explicit blockers

Every blocker should state:

- current state
- impact
- required action
- suggested owner/workstream
- whether it blocks internal launch or only autonomous turn-on

### 5. Include a smoke test

The handoff is incomplete if there is no explicit operator smoke test.

### 6. Tie pipeline work back to launch

If n8n or workflow orchestration is part of launch readiness, create a specific
workstream artifact rather than burying it in generic notes.

## Quality Bar

The handoff is good enough only if a new product owner can answer:

- what is launchable now
- what still blocks full launch
- what to do this week
- who owns what
- how to know if launch is succeeding

## Common Mistakes

- producing only one plan document with no operating artifacts
- writing for engineers rather than for the incoming owner
- failing to distinguish operator launch from autonomous turn-on
- not including escalation or decision-rights guidance

## Related Skills

- `.agents/skills/implementation-readiness/SKILL.md`
- `.agents/skills/control-surface-hardening/SKILL.md`
- `.agents/skills/n8n-workflow-engineering/SKILL.md`
