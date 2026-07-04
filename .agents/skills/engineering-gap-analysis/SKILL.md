---
name: engineering-gap-analysis
description: Perform a deep engineering audit of workflow artifacts (n8n JSON, SQL migrations, config files) against a comprehensive implementation plan. Identifies blockers, convention violations, orphaned nodes, and missing hardening — and closes all of them.
---

# Engineering Gap Analysis

## 1. Role & Purpose

**Persona:** Senior Software Engineer / Production Hardening Specialist

**Purpose:** Audit the *actual implementation artifacts* (workflow JSONs, SQL migrations, CI/CD configs, docs) against the requirements specified in a comprehensive implementation plan. Identify and resolve **blockers** (things that break production) and **violations** (things that create technical debt). Produce a signed-off, component-by-component readiness matrix.

This skill complements `plan-gap-analysis.md`. While plan gap analysis compares two textual plans, this skill compares the *code* against the plan.

---

## 2. When to Use

- A set of workflow artifacts (n8n JSONs, migrations, YAML configs) have been created or modified and must be audited for production readiness.
- You suspect that documented plans were not fully carried over into the actual code.
- A sprint or iteration is completing and you need a pass/fail readiness sign-off before deployment.

---

## 3. Input Requirements

You MUST have the following before starting:

1. **Comprehensive Implementation Plan** — the authoritative target specification.
2. **All artifact files to audit** — all workflow JSONs, migration SQL files, CI/CD YAML, and any documentation referenced in the plan.
3. **n8n-mapping.json** (or equivalent) — to confirm which files map to which logical workflows.

---

## 4. Audit Domains

Organize findings into these standard engineering categories:

### Blockers (B-series)
A blocker is any defect that **breaks production execution**. Examples:
- Orphaned DAG nodes — a node exists but has no inbound or outbound connection.
- Missing `agent_runs` start/end logging nodes.
- Wrong RPC function signature (wrong number or order of arguments).
- SQL migration missing a column that a workflow query references.
- Hardcoded secrets or static credentials in a workflow JSON.
- A node type version (`typeVersion`) that is deprecated or below the mandated minimum.
- A validator-breaking legacy artifact left in the active workflow package (for example `*.local.json` or an orphan old webhook flow).

### Convention Violations (V-series)
A violation is a deviation from the mandated conventions that creates **technical debt or audit gaps**. Examples:
- Cron expression is not UTC (e.g., uses local time offset).
- Slack alert goes to a non-standard channel (e.g., `#alerts-dev` instead of `#ops-alerts`).
- LLM node does not log token counts to `agent_runs.metadata`.
- A workflow `name` field does not follow `{brand}_{domain}_{function}` convention.
- Default node names in use (e.g., "HTTP Request 1").
- HITL flow uses interactive Slack buttons instead of Control Center deep links.

---

## 5. Audit Methodology

### Step 1: Map Artifacts
Build a complete inventory of all artifacts and their folder assignments. Verify against `n8n-mapping.json` (if present).

### Step 2: Structural Integrity Check (per workflow JSON)
For each workflow JSON artifact, verify:

| Check | What to Look For |
| :--- | :--- |
| **Orphaned Nodes** | Every node `id` in `nodes[]` MUST appear at least once as a source or target in `connections{}`. |
| **Dead-End Nodes** | Every non-terminal node MUST have at least one outbound connection. |
| **Logging Nodes** | `agent_run_start` (INSERT) and `agent_run_end` (UPDATE) Supabase nodes MUST exist AND be wired. |
| **Token Tracking** | If any LLM node exists, a Code node capturing `usage.total_tokens` MUST follow it and write to `agent_runs.metadata`. |
| **Node Versions** | `typeVersion` must meet the minimum: Webhook ≥ 2, HTTP Request ≥ 4.1, Slack ≥ 2.1, Schedule ≥ 1.1. |
| **Secrets** | No API key, token, or password may be hardcoded as a string value in any node parameter. |
| **Manifest Intent** | Workflow presence, `active` state, and `launch_scope` match its intended role (entrypoint vs sub-workflow vs post-launch). |
| **Generator Parity** | If the package uses generated workflows, changes are encoded in the generator/normalizer, not only in emitted JSON. |

### Step 3: Convention Audit (per workflow JSON)
For each workflow JSON, verify:

| Convention | Check |
| :--- | :--- |
| **Workflow Name** | Matches `{brand}_{domain}_{function}` or `system_{function}` pattern. |
| **Cron Expression** | All `scheduleTrigger` intervals use UTC expressions (e.g., `0 12 * * *`, `*/5 * * * *`). |
| **Slack Channel** | All Slack nodes target `#ops-alerts`. |
| **HITL Pattern** | No `actions` array or interactive button payloads in Slack nodes. Must use deep-link text only. |
| **Error Workflow Ref** | `settings.errorWorkflow` must be set to `system_error_handler`. |
| **Node Naming** | No default names. All nodes must have descriptive, action-oriented names. |
| **Brand Context** | Brand-aware workflows carry `brand_id`, `brand_slug`, and `brand_name` where relevant. |
| **Repo Lookup Safety** | No workflow uses UUID `brand_id` to build repo file paths. |

### Step 4: Database Migration Audit
For each migration file referenced in the plan:

| Check | What to Look For |
| :--- | :--- |
| **Schema Completeness** | Every column referenced in any workflow query (`INSERT INTO`, `UPDATE`) must exist in the corresponding migration. |
| **RPC Signatures** | Every `SELECT rpc.function(...)` call in workflow JSON must match the exact function signature (name, parameter count, parameter order) in the migration. |
| **RLS Enabled** | Every table created must have `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`. |
| **Service Role Policy** | Every new table must have a `USING (auth.role() = 'service_role')` policy. |

### Step 5: CI/CD & Infrastructure Audit
Review deployment pipeline configs for:

- Legacy node version blocks (e.g., grep for `typeVersion: 1` where v2+ is required).
- Credential injection — secrets must come from AWS Secrets Manager or equivalent vault, not environment file commits.
- Workflow ID mapping verification between `n8n-mapping.json` and actual n8n instance IDs.
- Manifest-driven deploy order and activation verification.
- GitHub Action behavior for validate-only PRs versus deploy-on-main.

### Step 6: Launch-Scope and Legacy Hygiene Audit

Review the workflow package for:

- Files present in workflow directories but not intended to deploy
- Legacy prototype variants such as `*.local.json`
- Old helper flows no longer referenced by the manifest
- Documentation and diagrams that no longer match the emitted launch topology

When a workflow package uses strict launch validation:
- launch-scoped workflows must pass the full launch gate
- post-launch workflows may be deploy-safe but inactive
- sub-workflows may be required for launch while still correctly remaining `active: false`

---

## 6. Output Format

### Issue Register

```markdown
| ID | Severity | Artifact | Finding | Status |
| :--- | :--- | :--- | :--- | :--- |
| **B1** | 🔴 BLOCKER | `action_executor.json` | `kpi_snapshot` node has no inbound connection | 🔴 OPEN |
| ~~V2~~ | 🟡 VIOLATION | `agent_orchestrator.json` | Cron was `0 12 * * 1` (local time) | ✅ CLOSED |
```

### Component Readiness Matrix

```markdown
| Component | Folder | Readiness | Notes |
| :--- | :--- | :--- | :--- |
| **System** | `00-system` | 🟢 100% | All checks pass |
| **Ingestion** | `01-ingestion` | 🔴 BLOCKED | B3 open |
```

### Sign-Off Block

```markdown
## Audit Conclusion
**Overall Readiness:** 🟢 PRODUCTION READY / 🔴 BLOCKED (N open items)

All B-series blockers and V-series violations are [resolved / pending].
[Brief narrative of what was found and fixed.]

**Verified by:** [Agent Name]
*Reference: [Plan Version]*
```

---

## 7. Remediation Process

For each identified blocker or violation:

1. **Identify** the exact file, node ID, line, or column that is wrong.
2. **Propose** the minimal surgical fix (do not refactor more than necessary).
3. **Apply** the fix.
4. **Re-verify** — re-read the artifact after applying the fix to confirm correctness.
5. **Close** the item in the issue register with a citation: `✅ CLOSED — [artifact]:[what changed]`.

If the package is generated:
6. **Regenerate** the emitted artifacts.
7. **Re-run** structural and launch validation after regeneration.

---

## 8. Anti-Patterns & Automatic Failures

- **Self-Certifying Closure** — Marking an item as ✅ CLOSED without re-reading the artifact. Always re-read after applying a fix.
- **Batch Closure Without Verification** — Closing all items at once at the end of a session. Close each item immediately after its fix is verified.
- **Audit Scope Inflation** — Auditing style or architecture choices that are not mandated by the plan. Stay within the bounds of the plan's explicit requirements.
- **Missing Component in Readiness Matrix** — Every folder (00–05 for n8n runner) must appear in the matrix. No silent omissions.
- **Fix Breaks Another Node** — When patching a SQL query or connection, always re-verify the full `connections{}` block for that node — not just the modified connection.
- **Generated Artifact Drift** — Editing emitted JSON without updating the normalizer/generator, so the fix disappears on the next `npm test`.
- **Legacy Artifact Blindness** — Ignoring old local/prototype workflows that are still inside the validator’s scan path and can fail the build.
- **Docs Freeze** — Updating workflows without updating the current-state README, env example, validation checklist, readiness audit, and diagrams.
