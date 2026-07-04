---
name: eks-jupyterhub-management
description: Best practices for deploying, hardening, and managing the Terraform-managed hardened JupyterHub deployment on AWS EKS.
---

# EKS JupyterHub Management Skill

This skill provides patterns and instructions for managing a secure, hardened JupyterHub deployment on AWS EKS using Terraform and Helm.

## 🛡️ Hardening Patterns

### 1. Namespace & Resource Isolation
- Always deploy JupyterHub into the Terraform-owned hardened namespace:
    - `dev`: `myapp-jupyterhub-hardened`
    - `staging`: `myapp-jupyterhub-hardened`
    - `prod`: `myapp-jupyterhub-hardened`
- `terraform/namespace.tf` owns namespace creation. Helm must use `create_namespace = false`.
- Use dedicated node groups for different components:
    - `hardened-core`: For Hub, Proxy, and Scheduler.
    - `hardened-user`: For single-user notebooks.
- **Explicit Tolerations**: Hub, Proxy, and Schedulers must explicitly tolerate the custom taints on the `core` node group.
- **Storage Layer Hardening**: The EBS CSI Driver (Addon) must be configured with tolerations for BOTH `node` and `controller` components to ensure volume attachments succeed on tainted nodes.

### 2. Networking & Ingress
- Use **AWS Load Balancer Controller** (ALB) for gateway and private Hub ingress.
- Public app access goes through `jupyterhub-gateway` on `dev-infra.example.com`, `staging-infra.example.com`, or `prod-infra.example.com`.
- Private Hub admin access goes through `internal-*-jhub.example.com`.
- **Shared Ingress Group**: Use `alb.ingress.kubernetes.io/group.name` to share a single ALB across multiple namespaces/instances.
- **Target Type**: Always use `alb.ingress.kubernetes.io/target-type: ip` for direct routing to Pod IPs.
- **Permission Boundaries & ACM**: When deploying in environments with strict IAM permission boundaries (e.g., `dev-permission-boundary-new`), dynamic certificate discovery (`acm:ListCertificates`) may fail.
    - **Pattern**: Explicitly provide the certificate ARN using the `alb.ingress.kubernetes.io/certificate-arn` annotation to bypass discovery requirements.
- **Service Type**: When using ALB Ingress, set `proxy.service.type: ClusterIP`. Avoid `LoadBalancer` for the proxy service to prevent creating conflicting NLBs.
- **Gateway Headers**: Preserve HTTPS forwarding headers and websocket upgrade headers in `terraform/jhub_gateway.tf`.
- **Gateway CORS**: Hide upstream CORS headers and let the gateway emit the approved CORS headers.

### 3. Database Security
- Use **AWS RDS (PostgreSQL)** instead of in-cluster SQLite.
- The current module generates the JupyterHub DB password with Terraform `random_password`.
- Pass the generated password directly to RDS and `hub.db.url` as sensitive Terraform values.
- Do not assume AWS Secrets Manager owns the JupyterHub DB password in this repository.
- If the Hub logs only show `Failed to connect to db`, verify pod DNS and TCP connectivity before assuming a password, schema, or RDS subnet problem.

## ⚙️ Configuration Best Practices

### Ingress Annotations
```yaml
ingress:
  enabled: true
  ingressClassName: alb
  annotations:
    alb.ingress.kubernetes.io/group.name: dev-myapp-shared-alb
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/healthcheck-path: /<baseUrl>/hub/health
    alb.ingress.kubernetes.io/certificate-arn: <ACM_ARN>
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTP": 80}, {"HTTPS": 443}]'
    alb.ingress.kubernetes.io/ssl-redirect: '443'
```

### Terraform-Managed Helm

- Update `terraform/values-hardened.yml.tpl` for static chart values.
- Update `terraform/envs/<env>.tfvars` for environment-specific inputs.
- Apply through `terraform/tf.sh <env> plan/apply` or `.github/workflows/terraform-deploy.yml`.
- Avoid manual `helm upgrade` as the normal path; Terraform owns the release.

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
- **Gateway 403**: Check the `map $http_origin $origin_allowed` rules in `terraform/jhub_gateway.tf`.
- **Gateway redirects to HTTP**: Verify `X-Forwarded-Proto https`, `X-Scheme https`, and `X-Forwarded-Ssl on` are preserved.
- **Gateway config change not rolling**: Ensure the deployment pod template has a checksum annotation from the NGINX config map.
- **Hub cannot connect to RDS after deploy**:
    1. Confirm RDS is `available`, in the same VPC as the target EKS cluster, and attached to an RDS SG that allows PostgreSQL from the node SG used by Hub pods.
    2. From a debug pod scheduled with the same core node selector and tolerations as Hub, first resolve `kubernetes.default.svc.cluster.local`, then resolve the RDS endpoint, then test TCP `5432`.
    3. If DNS fails for `kubernetes.default.svc.cluster.local`, stop debugging JupyterHub/RDS credentials. The likely owner is shared cluster DNS reachability in `../myapp-infra/terraform/security_groups.tf`, especially CoreDNS ingress from the EKS primary cluster security group to the shared node security group on TCP/UDP `53`.
    4. If DNS works but TCP `5432` fails, inspect the JupyterHub RDS security group in this repo.
    5. If DNS and TCP work, then inspect `hub.db.url`, Terraform `random_password.db_pass`, and JupyterHub schema state.

Use a same-scheduling debug pod rather than an untainted default pod:

```bash
kubectl run hub-rds-check -n myapp-jupyterhub-hardened \
  --restart=Never \
  --image=quay.io/jupyterhub/k8s-hub:4.3.2 \
  --overrides='{ "spec": { "nodeSelector": { "hub.jupyter.org/node-purpose": "core" }, "tolerations": [ { "key": "hardened.example.com/dedicated", "operator": "Equal", "value": "core", "effect": "NoSchedule" }, { "key": "hub.jupyter.org/dedicated", "operator": "Equal", "value": "core", "effect": "NoSchedule" }, { "key": "hub.jupyter.org/node-purpose", "operator": "Equal", "value": "core", "effect": "NoSchedule" } ] } }' \
  --command -- sleep 3600
```

Then exec DNS/TCP probes and delete the pod after collecting evidence.

### ⚡ Zero-Latency Startup Checklist
To ensure notebook instances spin up in < 10 seconds:
1. **Warm Node Pool**: Set `min_size = 1` for the `hardened-user` node group.
2. **Image Pull Policy**: Set `singleuser.image.pullPolicy: IfNotPresent` to skip redundant ECR manifest checks.
3. **Continuous Pre-puller**: Ensure `prePuller.continuous.enabled: true` to keep images warm on all nodes.
4. **Volume Attachments**: Ensure the EBS CSI Driver is running healthy on all nodes (check tolerations).

### 🧹 Maintenance (PVC Cleaner)
- **Namespace**: The PVC cleaner must reside in the Terraform-owned hardened namespace for the environment.
- **RBAC**: Use a `ClusterRoleBinding` to allow the cleaner to list and delete PVCs and Pods across the cluster.
- **Secrets**: The cleaner requires valid `SUPABASE_SERVICE_KEY` and `STRIPE_KEY` (test or live) to identify orphaned volumes.
