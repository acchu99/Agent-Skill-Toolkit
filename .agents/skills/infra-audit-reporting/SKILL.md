---
name: infra-audit-reporting
description: the application infrastructure audit reporting with CloudMapper, Prowler, FinOps, S3 history, Netlify mirrors, and Grafana dashboard publishing.
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

# Infra Audit Reporting

## Goal

Produce repeatable, environment-scoped infrastructure audit reports for the application and publish them to the correct operational surfaces.

## Rules

- S3 `<env>/<profile>/runs/` is permanent history. Never add expiration rules to historical report prefixes.
- `<env>/<profile>/latest/` may be overwritten only by the same profile.
- Netlify mirrors all six latest environment/profile viewers in one atomic deployment.
- Grafana is generated from validated per-environment/per-profile manifests, never sibling URL substitution.
- GitHub Environments `dev`, `staging`, and `prod` own all runtime configuration. Do not add a shared reporting environment.
- Staging is workload-only when it shares the production EKS cluster; do not publish cluster- or VPC-level production data as staging.
- Every manifest must contain a validated, non-null `audit_scope`.
- Never commit provider tokens, AWS keys, generated report outputs, or report archives.
- The publishing context parser and Grafana publisher must handle missing `security` or `finops` profiles gracefully (e.g. using fallback default dictionaries) to avoid KeyError crashes during single-profile workflow runs.
- **Interconnectivity Health Probe**:
  - The health probe and connectivity-tester must use a single container image differentiated by the `ROLE` environment variable (`ROLE=probe` for the monitoring namespace, `ROLE=tester` for the JupyterHub namespace).
  - The connectivity-tester must use labels matching single-user notebooks (`component: singleuser-server`) and run on user node groups to accurately mirror user network constraints (including egress `NetworkPolicy`).
  - Ports (`DATASETS_RPC_PORT` and `MCP_PORT`) must be dynamically configurable via GitHub Environment variables, falling back to `18861` and `8000` respectively.
  - Adding new checks or alert rules requires updating `tests/test_publish_grafana.py` to maintain a passing test suite.
- **Terraform Region Configuration**:
  - Never declare an `aws_region` input variable or hardcode it in environment `.tfvars` files (`envs/*.tfvars`).
  - Configure the default `aws` provider block without a hardcoded `region` attribute, letting it natively consume standard `AWS_REGION` and `AWS_DEFAULT_REGION` environment variables populated by GitHub Actions.
  - To expose the active region as an output, use the `data "aws_region" "current" {}` data source and resolve the `aws_region` output to `data.aws_region.current.name`.
- **Cost Allocation & Grafana Dashboard Publishing**:
  - **RDS Cost Filtering**: The RDS cost fetch query (`fetch_rds_cost_ce`) must explicitly filter by the `"SERVICE"` dimension with value `"Amazon Relational Database Service"` to prevent environment-wide total costs from being incorrectly mapped/attributed as the RDS database cost.
  - **Comprehensive Project Cost Metrics**: The metric payload `finops-metrics.json` and its corresponding gauge `aws_finops_mtd_cost_usd` must query and export the actual Cost Explorer service list (`account_services`) when available (including `Amazon Elastic Compute Cloud - Compute` and all other related services) rather than only EKS node group estimation workloads.
  - **Grafana Display Labels (Bar Gauges)**: When using Prometheus metric queries for Bar Gauge panels, configure the `"displayName"` option under `fieldConfig.defaults` to use label templates (like `${__field.labels.service_name}`) to resolve clean series names rather than displaying the raw Prometheus metric string.

## Report Profiles

| Profile | Runs |
| --- | --- |
| `security` | CloudMapper and Prowler |
| `finops` | FinOps reports |
| `full` | CloudMapper, Prowler, and FinOps |

## Required Verification

```bash
python3 -m py_compile scripts/*.py
python3 -m unittest discover -s tests -p 'test_*.py'
./scripts/validate_workflow.sh
```

## Failure Handling

Security findings are report data, not workflow failures. Missing required artifacts, broken manifests, failed uploads, missing credentials, or failed Grafana publication are workflow failures.
