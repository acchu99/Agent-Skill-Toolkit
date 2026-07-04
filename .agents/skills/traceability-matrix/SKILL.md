---
name: traceability-matrix
description: Build and validate end-to-end traceability across requirements, sources, transforms, outputs, and configuration artifacts. Use when a project requires auditability, deterministic regeneration, or confidence/quality metadata attached to outputs.
---

# Traceability Matrix Builder

## Purpose

Create a stable, auditable mapping that proves how each requirement is satisfied and propagated into final system configuration.

## Canonical Mapping Chain

`REQ-* -> SRC-* -> TRN-* -> OUT-* -> CFG-*`

## When to Use

- A project requires auditability or deterministic regeneration
- Multiple data sources feed derived metrics and downstream configs
- You need confidence and quality metadata attached to outputs

## Required Artifacts

- `traceability/requirements_to_sources.csv`
- `traceability/sources_to_transformations.csv`
- `traceability/transformations_to_outputs.csv`
- `traceability/outputs_to_configs.csv`
- `traceability/coverage-report.md`

## Required Fields

Each mapping row should include:

- `id_from`
- `id_to`
- `description`
- `evidence_path`
- `confidence`
- `data_quality_grade`
- `owner`
- `last_verified_at`

## Validation Rules

1. 100% of `CFG-*` entries map back to at least one `OUT-*`
2. 100% of `OUT-*` entries map back to at least one `TRN-*`
3. 100% of `TRN-*` entries map back to at least one `SRC-*`
4. 100% of in-scope `REQ-*` entries map to at least one `SRC-*`
5. No orphan IDs and no duplicate IDs in a namespace

## Procedure

1. Extract explicit requirements and assign stable `REQ-*` IDs
2. Register all source files/tables/APIs as `SRC-*`
3. Register each transformation as `TRN-*` with formula or SQL reference
4. Register outputs/charts/reports as `OUT-*`
5. Register config fields/artifacts as `CFG-*`
6. Generate coverage report and fail on orphan links

## AWS 6-Pillar Checks

- Operational Excellence: Traceability enables repeatable operations and faster debugging
- Security: Provenance and ownership improve governance and least-privilege reviews
- Reliability: Orphan detection prevents silent config drift
- Performance Efficiency: Dependency visibility avoids redundant transforms
- Cost Optimization: Eliminates rework from unverifiable outputs
- Sustainability: Reusable mapping model reduces repeated analysis effort
