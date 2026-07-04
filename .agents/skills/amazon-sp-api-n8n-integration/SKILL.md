---
name: amazon-sp-api-n8n-integration
description: Implement Amazon Selling Partner API support in n8n with brand-scoped secret resolution, LWA token minting, AWS SigV4 signing, pagination, and deploy-safe helper sub-workflows. Use when adding or hardening SP-API ingestion or execution paths.
---

# Amazon SP-API n8n Integration

## Purpose

Provide a repeatable pattern for using Amazon SP-API inside the platform n8n runner without relying on fragile static OAuth credentials or hand-maintained workflow JSON.

## When to Use

- A workflow in `prototypes/n8n-runner` needs Amazon SP-API access
- Amazon seller-account ingestion needs to become production-ready
- You need token obtain/refresh, SigV4 signing, or paginated SP-API request support
- You need multi-brand SP-API support from one workflow package

## Required Design

Use three layers:

1. **Main workflow**
- handles trigger, brand fanout, dataset selection, persistence, and normalization
- example: `ingestion_amazon_sp_api`

2. **LWA token helper sub-workflow**
- resolves brand-scoped secrets
- exchanges refresh token for short-lived access token
- returns sanitized auth context only

3. **Signed request helper sub-workflow**
- signs requests with AWS SigV4
- optionally assumes role with STS
- performs retries and bounded pagination
- returns sanitized response payloads only

Do not collapse all of this into one giant workflow if the helper flows can be shared.

## Secret Resolution Pattern

Prefer brand-scoped environment variables:

```text
AMAZON_SP_API_<KEY>__<BRAND_SLUG_UPPER>
```

Typical keys:
- `LWA_CLIENT_ID`
- `LWA_CLIENT_SECRET`
- `REFRESH_TOKEN`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- optional `ROLE_ARN`
- optional `AWS_SESSION_TOKEN`
- optional `SELLER_ID`
- optional `MARKETPLACE_IDS`

Fallback to unsuffixed global env vars only if the brand-scoped variant is missing.

Rules:
- never persist secrets to S3
- never pass secrets to Supabase RPCs
- never hardcode live secrets or credential IDs in workflow JSON

## Request Pattern

For each request:
1. resolve brand runtime and secret context
2. obtain LWA access token from refresh token
3. optionally assume AWS role
4. build canonical request
5. compute SigV4 signature
6. execute request with retry/backoff for `429` and transient `5xx`
7. follow token-based pagination with a strict page cap
8. return sanitized response envelope

## Launch-Scope Guidance

For Amazon-first launch:
- enable SP-API only for brands that are actually provisioned
- start with read-focused datasets such as:
  - orders
  - inventory summaries
  - financial events
- keep higher-risk mutation paths out of launch unless rollback and governance are explicit

## Workflow Generation Rule

If the repo uses a workflow normalizer/generator:
- implement SP-API changes in the generator
- regenerate emitted JSON
- do not rely on direct edits to generated workflow files

## Required Documentation Updates

When adding or changing SP-API support, update:
- package `README.md`
- `.env.example`
- validation checklist
- readiness audit / launch-gap docs
- current-state diagrams
- a dedicated SP-API integration note if the flow is non-trivial

## Validation Checklist

Minimum verification:
1. `npm test`
2. `npm run audit:launch`
3. confirm helper workflows exist in the manifest
4. confirm helper workflows are deployed but not incorrectly activated
5. confirm no validator-breaking legacy SP-API workflow remains
6. manually replay one SP-API ingestion workflow in the destination env
7. verify:
   - `agent_runs`
   - raw S3 snapshot
   - Supabase normalization RPC
   - no secrets persisted downstream

## Common Failure Modes

- Using static n8n OAuth credentials for SP-API and ignoring SigV4 needs
- Encoding secrets in workflow JSON
- Forgetting per-brand secret routing
- Leaving placeholder marketplace IDs in runtime config
- Returning secrets in helper workflow outputs
- Hand-editing emitted JSON without updating the normalizer
- Updating workflows but not the docs/diagrams that describe them
