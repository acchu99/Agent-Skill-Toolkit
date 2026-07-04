---
name: n8n-workflow-engineering
description: Design production-ready n8n workflows for ingestion and orchestration with retries, idempotency, observability, and deployment controls. Use when building data extraction pipelines, scheduled ingestion, or lightweight orchestration workflows.
---

# n8n Workflow Engineering

## Purpose

Define n8n workflows as deployable artifacts for scheduled ingestion, agent orchestration, and controlled execution pipelines.

## When to Use

- You need lightweight orchestration without standing up a full workflow platform
- Data extraction spans APIs, file drops, object storage, and database sinks
- Pipeline operations must be observable and re-runnable

## Deliverables

- generated workflow JSON exports under the repo workflow package
- workflow generator / normalizer scripts when workflows are generated artifacts
- manifest describing deploy order, activation, and launch scope
- current-state README and validation docs
- env example documenting required credentials and per-brand secret resolution

## Mandatory Project Pattern

When the repo already uses generated workflow artifacts:

1. Treat the generator / normalizer as the source of truth.
2. Do not hand-edit emitted workflow JSON unless you also encode the change in the generator.
3. Regenerate workflows after changes.
4. Validate emitted JSON, manifest coverage, and launch-scope readiness.

If the workflows live under `prototypes/n8n-runner`, assume the current project pattern is:
- generated runtime registry from `brands/*/*.yaml`
- generated or rewritten workflow JSON under `00-system` through `05-alerts`
- deploy manifest in `workflow-manifest.json`
- GitHub/API deployment as the authoritative delivery path

## Required Workflow Patterns

1. Trigger: schedule + manual replay trigger
2. Fetch: source extractor node(s) for each provider
3. Normalize: schema-mapping node with explicit field transforms
4. Idempotency: dedup key calculation + upsert guard
5. Persist: sink to S3/object storage and database
6. Validate: row counts, schema conformance, reconciliation checks, and freshness / DQ checks
7. World-model write path when relevant: emit entities, state, relationships, signals, freshness, confidence, and provenance
8. Failure path: retry, backoff, dead-letter queue, alerting, and incident surfacing

## Launch-Scope Pattern

Use an explicit workflow manifest with:
- `name`
- `path`
- `active`
- `launch_scope`

Rules:
- entrypoint workflows can be `active: true`
- sub-workflows should generally be deployed but inactive
- post-launch connectors should remain deploy-safe but `active: false` with `launch_scope: post_launch`
- launch validation must only fail launch-scoped workflows, not intentionally disabled post-launch workflows

## Multi-Brand Pattern

Brand-aware workflows should carry:
- `brand_id`
- `brand_slug`
- `brand_name`

Rules:
- use `brand_slug` or generated runtime registry keys for repo/runtime lookups
- do not derive file paths from UUID `brand_id`
- pass brand context through wrappers, orchestrators, ingestion, and action execution consistently

## Amazon SP-API Pattern

For Amazon SP-API in n8n:

1. Resolve brand-scoped secrets from environment variables, not hardcoded credential IDs in workflow JSON.
2. Mint a fresh LWA access token from the refresh token per execution or per bounded batch.
3. Sign requests with AWS SigV4.
4. Optionally support STS AssumeRole if a role ARN is supplied.
5. Keep helper flows reusable:
   - one sub-workflow for LWA token retrieval
   - one sub-workflow for signed request execution
   - one main ingestion workflow for dataset fanout and persistence
6. Never persist secrets to S3, database, or downstream RPC payloads.
7. Support bounded pagination and retry for `429` and transient `5xx`.

Per-brand env convention should be explicit, for example:
- `AMAZON_SP_API_LWA_CLIENT_ID__<BRAND>`
- `AMAZON_SP_API_LWA_CLIENT_SECRET__<BRAND>`
- `AMAZON_SP_API_REFRESH_TOKEN__<BRAND>`
- `AMAZON_SP_API_AWS_ACCESS_KEY_ID__<BRAND>`
- `AMAZON_SP_API_AWS_SECRET_ACCESS_KEY__<BRAND>`

## Reliability Controls

- Exponential backoff for transient API failures
- Max retry threshold with DLQ handoff
- Idempotency key for each ingested record batch
- Resume/replay by date window and source partition
- Guard against duplicate action proposals or duplicate KPI writes

## Observability Controls

- Run-level correlation ID
- Success/failure counters per node
- Processing latency and record throughput metrics
- Structured error payload persisted for triage
- Freshness timestamps and provenance metadata persisted with business-facing outputs

## Security Controls

- Credentials only from n8n encrypted credential store or environment/secret manager resolution encoded outside workflow JSON
- Least-privilege API tokens and scoped IAM roles
- No secrets in workflow JSON
- TLS enforced for all external endpoints

## Documentation Controls

Every significant workflow change should update:
- the current-state README
- env example
- validation checklist
- launch-readiness/readiness audit docs
- diagrams showing the actual emitted topology, not an outdated reference architecture

When diagrams exist, update them together with the workflow change.

## Launch Safety Controls

- Respect kill switches before any execution path
- Respect approval status before any approval-gated action
- Surface stale-data or failed-validation conditions into incidents or alerts
- Do not allow stale source data to silently populate trusted downstream state

## AWS 6-Pillar Checks

- Operational Excellence: Standard workflow templates and runbooks
- Security: Credential isolation and least privilege
- Reliability: Retries, DLQ, and replay support
- Performance Efficiency: Batch windows and parallel extraction branches
- Cost Optimization: Scheduled lightweight runs, no always-on heavy compute
- Sustainability: Minimized redundant pulls and retention-based cleanup
