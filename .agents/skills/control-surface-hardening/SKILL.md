---
name: control-surface-hardening
description: Convert operator/control-center screens from prototype or local-only behavior into authoritative, auditable, server-backed operational surfaces.
---

# Control Surface Hardening

## Purpose

Use this skill when a UI screen looks operational but still behaves like a
prototype. The goal is to make operator-facing controls truthful, persistent,
auditable, and safe.

This skill is specifically for screens such as:

- approvals
- kill switches
- guardrails
- incidents
- alert policies
- experiments
- settings that affect shared or persisted behavior

## When To Use

- A screen currently uses `localStorage`, local React state, or in-session
  overlays for actions that operators will treat as real system control.
- A page appears to save successfully but does not persist authoritative state.
- A control mutates runtime behavior but does not create an audit trail.
- A screen displays IDs, placeholders, or raw JSON in ways that erode operator
  trust.

## Core Rule

If a control affects real operational state, it must not rely on local-only
state as the source of truth.

Acceptable local-only state:

- theme
- panel layout preferences
- ephemeral UI expansion/collapse state
- search text

Not acceptable as local-only state:

- approvals
- kill switches
- guardrails
- incidents
- alert policies
- experiments
- user preferences meant to persist across sessions

## Required Deliverables

- server-backed route handlers for each mutation
- client helpers calling those routes
- UI refresh path from authoritative data source
- audit log writes for meaningful control changes
- error states and optimistic revert behavior
- operator-readable labels instead of raw UUIDs where possible

## Procedure

### 1. Identify fake-authoritative behavior

Look for:

- `localStorage` used for approvals, switches, experiments, audit, or guardrails
- optimistic state that never revalidates against DB truth
- `defaultChecked` without persistence
- “New” buttons that create local-only records
- labels showing IDs where a human-readable name should be shown

### 2. Classify the state

For each editable field, decide:

- user-personal preference
- shared operational state
- runtime safety control
- reference data

Only user-personal preferences may remain local by design.

### 3. Create authoritative mutation paths

For each shared control:

1. add or reuse an API route
2. use a server/admin client for privileged writes
3. validate payloads explicitly
4. fetch current row before mutation when audit requires before/after state
5. persist the update
6. return the updated row

### 4. Add auditability

Every meaningful operator action should write to `control_audit_log` with:

- `user_id`
- `action_type`
- `target_type`
- `target_id`
- `previous_value`
- `new_value`
- `reason`
- `metadata.target_name` when useful

### 5. Make the UI honest

- reload from DB after mutation or keep state synchronized with API result
- show saving state
- show error state
- revert optimistic UI if persistence fails
- remove wording that implies unsupported functionality

Examples:

- `+ New Kill Switch` should usually become `Activate Kill Switch`
- free-text targets should become scoped selectors where possible
- badge/status text should reflect DB state, not browser overlays

### 6. Fix operator readability

- resolve brand IDs to brand names
- resolve agent IDs to agent names where possible
- render structured JSON using a shared human-readable component
- add contextual help for complex sections

### 7. Re-scan for dead prototype paths

After the screen is hardened:

- remove unused local-only helpers
- remove dead hooks based on browser overlays
- update audit filters and operator docs

## Checklist

- Mutation is server-backed
- Source of truth is authoritative DB state
- Audit record exists
- Refresh persists across reload
- Error path is visible
- Human-readable names are used instead of raw IDs where possible
- No stale local fallback remains in active UI path

## Common Mistakes

- Keeping the old localStorage path “just in case”
- Using optimistic UI without revert logic
- Writing audit only for some mutations but not others
- Leaving `defaultChecked` controls unwired
- Showing raw UUIDs or structured blobs where humans expect names and meaning

## Related Skills

- `.agents/skills/prototype-scaffolding/SKILL.md`
- `.agents/skills/implementation-readiness/SKILL.md`
- `.agents/skills/governance-patterns/SKILL.md`
- `.agents/skills/live-supabase-migration-and-seeding/SKILL.md`
