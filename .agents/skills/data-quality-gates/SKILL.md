---
name: data-quality-gates
description: Define and enforce data quality checks, reconciliation rules, confidence thresholds, and release gates for analysis pipelines. Use when multiple heterogeneous sources feed shared analytics outputs, derived metrics drive autonomous decisions, or human approval gates depend on confidence and quality signals.
---

# Data Quality And Validation Gates

## Purpose

Prevent low-quality or incomplete data from propagating into generated outputs and configuration artifacts.

## When to Use

- Multiple heterogeneous sources feed shared analytics outputs
- Derived metrics drive autonomous decisions or budget changes
- Human approval gates depend on confidence and quality signals

## Core Concepts

- Hard Gate: Pipeline stops and requires intervention
- Soft Gate: Pipeline proceeds with warning and reduced confidence
- Confidence Score: Composite score from completeness, consistency, and freshness

## Required Deliverables

- `validation/data-quality-rules.yaml`
- `validation/reconciliation-rules.yaml`
- `validation/gates-policy.yaml`
- `validation/quality-report.md`

## Rule Categories

1. Schema: type, required-field, enum, and format validation
2. Freshness: maximum allowable staleness per source
3. Completeness: minimum row/coverage thresholds
4. Consistency: cross-table totals and sign conventions
5. Reconciliation: source totals vs derived totals within tolerance
6. Business constraints: floors/ceilings for key metrics

## Gate Policy Template

- `pass`: all hard checks pass and confidence >= threshold
- `warn`: hard checks pass but confidence in warning band
- `fail`: any hard check fails or confidence below minimum

## Procedure

1. Define source-level checks
2. Define transform-level checks
3. Define output-level checks
4. Attach severity and owner to each rule
5. Run checks before final config generation
6. Block downstream actioning on `fail`

## AWS 6-Pillar Checks

- Operational Excellence: Standardized quality controls and escalation
- Security: Prevents unsafe auto-actions from corrupted inputs
- Reliability: Stops propagation of bad data and drift
- Performance Efficiency: Early failure avoids wasted downstream compute
- Cost Optimization: Reduces costly rollback and reprocessing
- Sustainability: Lower churn by improving first-pass correctness
