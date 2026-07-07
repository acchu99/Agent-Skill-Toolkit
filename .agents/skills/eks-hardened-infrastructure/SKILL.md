---
name: eks-hardened-infrastructure
description: Best practices for deploying, hardening, and managing isolated the application workloads on AWS EKS, including JupyterHub and the hardened MCP server.
---

# EKS Hardened Infrastructure Skill

This skill provides patterns and instructions for managing secure, hardened the application workloads on AWS EKS using Terraform, Helm, and Kubernetes manifests.

## 🛡️ Hardening Patterns

### 1. Namespace & Resource Isolation
- Always deploy JupyterHub into a dedicated namespace (e.g., `jhub-hardened`).
- Use dedicated node groups for different components:
    - `hardened-core`: For Hub, Proxy, and Scheduler.
    - `hardened-user`: For single-user notebooks.
- **Explicit Tolerations**: Hub, Proxy, and Schedulers must explicitly tolerate the custom taints on the `core` node group.
- **Storage Layer Hardening**: The EBS CSI Driver (Addon) must be configured with tolerations for BOTH `node` and `controller` components to ensure volume attachments succeed on tainted nodes.

### 2. Networking & Ingress
- Use **AWS Load Balancer Controller** (ALB) for external access.
- **Shared Ingress Group**: Use `alb.ingress.kubernetes.io/group.name` to share a single ALB across multiple namespaces/instances.
- **Target Type**: Always use `alb.ingress.kubernetes.io/target-type: ip` for direct routing to Pod IPs.
- **Service Type**: When using ALB Ingress, set `proxy.service.type: ClusterIP`. Avoid `LoadBalancer` for the proxy service to prevent creating conflicting NLBs.

### 2a. Hardened MCP Server Pattern

For `mcp-server`, the current hardened deployment is:

- Deployment: `mcp-hardened`
- Service: `mcp-hardened-service`
- Dev cluster: `dev-example-app-cluster`
- Dev namespace: `mcp-hardened`
- Staging cluster: `staging-example-app-cluster`
- Staging namespace: `mcp-hardened`
- Prod cluster: `prod-example-app-cluster`
- Prod namespace: `mcp-app-prod`
- Node label: `example.com/node-purpose=mcp-hardened`
- Taint tolerance: `example.com/dedicated=mcp-hardened:NoSchedule`
- Dev route: `https://dev-infra.example.com/mcp-server`
- Staging route: `https://staging-infra.example.com/mcp-server`
- Prod route: `https://prod-infra.example.com/mcp-server`

The legacy deployment and service names are `mcp-app-deployment` and `mcp-app-service`. They should not exist after hardened cutover. If they appear, remove them after verifying `mcp-hardened` is healthy.

Terraform manages MCP infrastructure such as the node group, IAM, monitoring, Secrets Manager metadata, and optionally the ALB controller release. Terraform must not write runtime secret values into Terraform state or overwrite the Kubernetes `mcp-env` secret.

App deployment manifests are applied separately from Terraform via `eks/deployment-hardened.yaml`, `eks/service-hardened.yaml`, and `eks/ingress.yaml`. These are templates. Render them with environment-specific values for `IMAGE_URI`, `NAMESPACE`, `INGRESS_HOST`, `INGRESS_ALB_GROUP_NAME`, `INGRESS_CERTIFICATE_ARN`, and `INGRESS_PUBLIC_SUBNETS` before applying.

Use the default Terraform workspace plus one backend config and one tfvars file per environment:

- Dev: `terraform init -reconfigure -backend-config=backend/dev.hcl` with `envs/dev.tfvars`
- Staging: `terraform init -reconfigure -backend-config=backend/staging.hcl` with `envs/staging.tfvars`
- Prod: `terraform init -reconfigure -backend-config=backend/prod.hcl` with `envs/prod.tfvars`

Shared EKS cluster names follow the application environment convention: `dev-example-app-cluster`, `staging-example-app-cluster`, and `prod-example-app-cluster`. If a plan wants to recreate existing resources such as ECR repositories, node groups, or IAM roles, reconcile/import state before applying.

### 3. Database Security
- Use **AWS RDS (PostgreSQL)** instead of in-cluster SQLite.
- Store database passwords in **AWS Secrets Manager**.
- Inject secrets into JupyterHub using Kubernetes Secret resources synced from AWS.

## ⚙️ Configuration Best Practices

### Ingress Annotations
```yaml
ingress:
  enabled: true
  ingressClassName: alb
  annotations:
    alb.ingress.kubernetes.io/group.name: dev-example-app-shared-alb
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/healthcheck-path: /<baseUrl>/hub/health
    alb.ingress.kubernetes.io/certificate-arn: <ACM_ARN>
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTP": 80}, {"HTTPS": 443}]'
    alb.ingress.kubernetes.io/ssl-redirect: '443'
```

### KubeSpawner Settings
When refactoring `values.yaml`, ensure liveness probes and resource limits are correctly nested within the spawner configuration:
```yaml
hub:
  extraConfig:
    customConfig: |
      c.KubeSpawner.liveness_probe_enabled = True
      c.KubeSpawner.liveness_probe_initial_delay_seconds = 30
```

### Authentication (RBAC)
In JupyterHub 3.x/4.x (Helm chart 3.x/4.x), avoid top-level `auth` keys. Instead, use `hub.config`:
```yaml
hub:
  config:
    Authenticator:
      admin_users: ["admin"]
      allowed_users: ["admin"]
    JupyterHub:
      authenticator_class: dummy
```

## 🔍 Troubleshooting Guide

### 🚀 Spawn Failures (Timeout/CrashLoop)
- **ImportError: 'serverextension' from 'jupyterhub'**: This occurs when a newer `jupyter-server` expects a class from JupyterHub 5.x, but the image uses 4.x.
    - **Fix**: Override the identity provider class in `singleuser.cmd` or `extraConfig`.
    - **Path for 4.x**: `jupyterhub.singleuser.extension.JupyterHubIdentityProvider`
    - **Path for 5.x**: `jupyterhub.serverextension.JupyterHubIdentityProvider`
- **Resource Limits**: Always sync `hub.resources` and `proxy.chp.resources` from legacy deployments. Omission can lead to random pod kills or slow starts.

### 🕸️ Networking
- **Proxy 403 (OTLPExporterError)**: Proxy (CHP) logs show `AccessDenied` for `xray:PutTraceSegments`.
    - **Fix**: Grant the node IAM role `xray:PutTraceSegments` permission or disable tracing in `proxy.chp.extraEnv`.

### ⚡ Zero-Latency Startup Checklist
To ensure notebook instances spin up in < 10 seconds:
1. **Warm Node Pool**: Set `min_size = 1` for the `hardened-user` node group.
2. **Image Pull Policy**: Set `singleuser.image.pullPolicy: IfNotPresent` to skip redundant ECR manifest checks.
3. **Continuous Pre-puller**: Ensure `prePuller.continuous.enabled: true` to keep images warm on all nodes.
4. **Volume Attachments**: Ensure the EBS CSI Driver is running healthy on all nodes (check tolerations).

### 🧹 Maintenance (PVC Cleaner)
- **Namespace**: The PVC cleaner must reside in the same namespace as the Hub (e.g., `jhub-hardened`) to correctly list and delete resources.
- **RBAC**: Use a `ClusterRoleBinding` to allow the cleaner to list and delete PVCs and Pods across the cluster.
- **Secrets**: The cleaner requires valid `SUPABASE_SERVICE_KEY` and `STRIPE_KEY` (test or live) to identify orphaned volumes.

## 💰 EC2 Cost Allocation

Only the EC2 workers owned by the hardened MCP node groups are in scope. Do not tag unrelated nodes in the shared EKS clusters from this repository.

Canonical AWS tags:

| Key | Value |
| --- | --- |
| `Name` | `mcp-{environment}-eks-node` on MCP EC2 workers only |
| `Project` | `example-app` |
| `Service` | `mcp` |
| `Environment` | `dev`, `staging`, or `prod` |
| `ManagedBy` | `Terraform` |

Implementation rules:
- Define the canonical map once in `local.cost_allocation_tags` and use it for AWS provider default tags.
- Add the stable EC2 `Name` only in `local.mcp_ec2_tags`; do not make `Name` a provider default tag.
- Keep the EC2 name independent of node-pool scheduling. Use the AWS-managed `eks:nodegroup-name` tag when node-pool detail is required.
- EKS managed node group tags do not propagate to EC2 instances. Do not treat `aws_eks_node_group.tags` as sufficient for Cost Explorer.
- Apply `aws_autoscaling_group_tag` resources to the managed node group with `propagate_at_launch = true`.
- Backfill currently running instances with `scripts/tag_mcp_ec2_instances.sh`; the script must discover Auto Scaling Groups through the EKS node groups rather than hardcoding generated ASG names.
- Keep the backfill idempotent and verify the `Name` plus all four cost-allocation tags after writing them.
- Do not introduce a launch template solely for tagging existing node groups because attaching a new launch template can require node group replacement.
- Activate `Project`, `Service`, and `Environment` as user-defined cost allocation tags from the AWS management account. Resource tagging alone does not make the keys immediately available in Cost Explorer.
- Allow up to 24 hours for new keys to appear for activation and up to another 24 hours for activation to take effect.
