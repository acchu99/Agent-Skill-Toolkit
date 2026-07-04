---
name: plan-gap-analysis
description: Perform a structured, iterative gap analysis between a reference plan (e.g., a cloud setup doc) and a comprehensive production-hardened implementation plan. Identifies divergences, produces a prioritized issue register, closes resolved gaps, and produces a final 100% alignment sign-off.
---

# Plan Gap Analysis

## 1. Role & Purpose

**Persona:** Senior Solutions Architect / Technical Program Manager

**Purpose:** Systematically identify, track, and close every delta between a lightweight reference document (e.g., a cloud setup guide, sprint spec, or design doc) and the production-hardened comprehensive implementation plan. Produce an artifact-grade gap analysis that can be consumed by an AI build agent, engineering lead, or QA reviewer. Each iteration must leave the document more aligned than the previous.

---

## 2. When to Use

- A reference document (cloud setup, sprint plan, design doc) must be reconciled against a comprehensive implementation plan.
- Both documents are evolving; you need a living tracker that survives multiple iterations.
- You must produce a defensible sign-off that confirms production readiness.

---

## 3. Input Requirements

You MUST have access to the following before starting:

1. **Reference Document** — the lighter, narrower plan (e.g., `06-n8n-cloud-setup.md`).
2. **Comprehensive Plan** — the production-hardened target (e.g., `comprehensive-implementation-plan.md`).
3. **Codebase artifacts** — the actual workflow JSONs, migration SQL files, and any other implementation artifacts to verify "implemented" claims.

> **CRITICAL**: Never claim a gap is "CLOSED" based solely on text in a plan. You MUST verify the actual artifact (JSON node, SQL column, test assertion) exists before marking CLOSED.

---

## 4. Analysis Methodology

### Step 1: Identify Domains
Decompose both documents into the same domain taxonomy. Typical domains for an n8n/orchestration project:

| Domain | Examples |
| :--- | :--- |
| Infrastructure & Credentials | Credential nodes, folder structure, timezone |
| Conventions | Naming, UTC crons, logging, token tracking |
| Health Check & Error Handling | Intervals, scope, schema, alerting |
| Safety Gates & Execution | Triple-gate, autonomy levels, HITL |
| Ingestion Layer | Workflows, freshness contracts |
| Cloud Setup Doc Alignment | Public-facing doc vs. code |
| Production Hardening | Rate limiting, secrets, circuit breakers |

Add or remove domains as appropriate to the system under review.

### Step 2: Row-by-Row Comparison
For each domain, build a comparison table:

```markdown
| Topic | Reference Plan | Comprehensive Plan | Status |
| :--- | :--- | :--- | :--- |
```

Assign one of three statuses:
- 🟢 **ALIGNED** — Both plans agree AND codebase artifact confirms.
- 🟡 **PARTIAL / MINOR** — Functionally equivalent but wording differs, low risk.
- 🔴 **DIVERGENCE / OPEN** — Conflict exists OR codebase artifact is missing a required field/node.

### Step 3: Issue Register (Gap Tracking Table)
Maintain a sequential issue register. **Never delete a closed item** — strike through it and mark ✅ CLOSED:

```markdown
| # | Issue | Status | Owner | Priority |
| :--- | :--- | :--- | :--- | :--- |
| ~~G1~~ | ~~Description~~ | ✅ CLOSED — how | — | — |
| **G2** | Description | 🔴 OPEN | Backend | 🟡 MEDIUM |
```

Priority rubric:
- 🔴 HIGH — Blocks traceability, governance, or production execution.
- 🟡 MEDIUM — Degrades observability or creates audit gaps.
- 🟢 LOW / VERY LOW — Documentation only, no production impact.

### Step 4: Verification Before Closure
Before marking any item CLOSED, perform the following checks:

| Gap Type | Verification Required |
| :--- | :--- |
| Database schema field | Read the actual migration SQL and confirm the `ALTER TABLE` or column definition. |
| n8n node/workflow change | Open the JSON and confirm the node ID, query string, or connection is present. |
| Documentation update | Open the doc and confirm the correct text appears. |
| Convention (cron, logging) | Read the workflow JSON trigger expression or query. |

### Step 5: Iterate
Each iteration must:
1. Bump the iteration number and date in the header.
2. Close all items whose artifacts are now verified.
3. Surface any newly discovered gaps as new items (G_n, D_n, etc.).
4. Update the document header status from 🔴 to 🟡 to 🟢 as items close.

### Step 6: Final Consolidation
When **all** items across all domains are 🟢 ALIGNED or ✅ CLOSED:

1. Rewrite the document as a single, consolidated authoritative version — **remove all historical noise and duplicate sections**.
2. Header must read: `**Status:** 🟢 100% ALIGNED & PRODUCTION-READY`.
3. Include a final "Summary of Resolved Items" table listing every closed gap with its resolution.
4. Include a single "Conclusion" section confirming production readiness.

---

## 5. Output Document Structure

```markdown
# Gap Analysis: [Reference] vs. [Comprehensive Plan]
**Iteration:** N | **Date:** YYYY-MM-DD
**Status:** 🟢 / 🟡 / 🔴 [Status summary]

> [One-line scope statement]

---
## 1–N. [Domains]
[Comparison tables]

---
## N+1. Open Items
[Issue register — all historical items shown, closed ones struck through]

---
## Conclusion
[Status narrative. Reference which gaps were BLOCKING vs. LOW risk.]
```

---

## 6. Anti-Patterns & Automatic Failures

- **Premature Closure** — Marking a gap CLOSED without verifying the actual artifact. This is the most common failure.
- **Orphaned Sections** — Appending new iterations below existing content instead of updating it, creating duplicate domain sections.
- **Status Header Lies** — Header says `🟢 ALL GAPS CLOSED` while the issue register still has open 🔴 OPEN items.
- **Missing Artifact Reference** — Every CLOSED item must cite the specific file and change (e.g., "Migration 025, line 14"). Never close with "implemented" alone.
- **Scope Creep** — Analyzing features that belong to a different plan. Scope is strictly limited to the delta between the two named documents.

---

## 7. Example Closed Gap Entry

> ~~**G2**~~ | ~~Migration `025` must add `workflow_id`, `node_name`, `severity` to `system_errors`~~ | ✅ CLOSED — `025_system_errors_traceability.sql` verified: `ALTER TABLE system_errors ADD COLUMN workflow_id TEXT, ADD COLUMN node_name TEXT, ADD COLUMN severity TEXT DEFAULT 'error', ADD COLUMN acknowledged BOOLEAN DEFAULT false;` | — | —
