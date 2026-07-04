---
name: operator-guidance-system
description: Build a centralized in-product help and explanation system so operators can understand pages, sections, statuses, and expected data without relying on tribal knowledge.
---

# Operator Guidance System

## Purpose

Use this skill when the interface is becoming powerful enough that operators can
get lost, misread screens, or fail to understand what action is required.

The goal is to add productized guidance rather than scattered tooltips.

## When To Use

- The product has multiple operational screens and dense concepts.
- Human users need plain-English explanations of what a page or section does.
- Operators need to understand what data to expect in a section.
- Domain language such as world model, confidence, freshness, risk class, or
  capability gaps would otherwise require engineering interpretation.

## Required Pattern

Implement guidance as a system with four layers:

1. page-level orientation
2. section-level contextual help
3. glossary / concept-level explanations
4. optional AI/plain-English interpretation of current live state

Do not solve this with only disconnected tooltip text.

## Deliverables

- centralized help registry
- reusable help trigger component
- reusable help drawer/popover
- page-level `How to use this page` entry point
- searchable help center
- consistent explanation structure

## Help Entry Structure

Every help entry should answer:

- what this is
- why it matters
- how to read it
- what data to expect here
- what requires action
- common mistakes
- related areas

## Procedure

### 1. Build a registry, not ad hoc strings

Create a single source of truth for help content keyed by:

- page
- section
- metric
- concept

### 2. Wire reusable UI entry points

Add:

- page-level `How to use this page`
- section-level `?` buttons
- related-topic navigation
- back navigation inside the help surface

### 3. Include expected-data guidance

For tables, cards, and operational views, include examples of what users should
expect to find there now and what the mature state should contain later.

This is especially important for:

- world model
- intelligence
- approvals
- incidents
- strategy and traceability views

### 4. Ground complex guidance in real product state

When adding AI/plain-English explanations:

- ground them on real entities and state
- keep references traceable
- do not replace curated help content with generated prose

### 5. Keep the navigation sane

Help should reduce confusion, not create it.

Required:

- related-topic navigation
- back button/history
- searchable help center

## Content Quality Bar

The guidance is good enough only if an operator can answer:

- what they are looking at
- what a healthy state looks like
- what a concerning state looks like
- whether they need to act now

## Common Mistakes

- treating tooltips as sufficient
- documenting only the UI, not the expected data
- writing engineering-centric explanations instead of operator-centric ones
- creating help with no navigation history
- adding AI summaries without traceable grounding

## Related Skills

- `.agents/skills/prototype-scaffolding/SKILL.md`
- `.agents/skills/control-surface-hardening/SKILL.md`
- `.agents/skills/implementation-readiness/SKILL.md`
