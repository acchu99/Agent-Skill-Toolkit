---
name: k8s-deployment-patterns
description: Shared EKS infrastructure patterns for validating the application Kubernetes clusters, addons, and downstream handoffs.
---

# Kubernetes Deployment Patterns For Shared EKS

This skill defines how to reason about Kubernetes-facing changes in `example-app-infra`. This repository owns shared cluster foundations, not application rollouts.

## Ownership Boundary

`example-app-infra` owns:

- VPCs, public/private subnets, NAT gateways, routing, and subnet tags.
- EKS control planes and core addons.
- Shared EKS cluster/node security group rules in `terraform/security_groups.tf`.
- Shared AWS Load Balancer Controller IAM policy.
- CloudTrail, VPC Flow Logs, GuardDuty, CloudWatch retention, and Terraform state foundation.

Application repositories own:

- Worker node groups, namespaces, deployments, services, ingresses, Helm releases, and runtime secrets.
- Docker images and immutable image tags.
- App-specific smoke tests, rollbacks, and runtime scaling.

## Terraform Promotion Pattern

Environment isolation comes from the S3 backend file and tfvars file, while Terraform remains on the default workspace.

```bash
./terraform/tf.sh dev validate
./terraform/tf.sh staging validate
./terraform/tf.sh prod validate

./terraform/tf.sh dev plan -lock=false
./terraform/tf.sh staging plan -lock=false
./terraform/tf.sh prod plan -lock=false
```

Run `apply` only after a reviewed plan and only for the selected environment.

## Cluster Verification Pattern

After shared infrastructure changes, verify the rendered cluster name, kubeconfig access, node visibility, and system pods.

```bash
aws eks update-kubeconfig --region us-east-2 --name <rendered-cluster-name>
kubectl get nodes
kubectl get pods -A
kubectl get pods -n kube-system
```

The rendered cluster name is `${environment}-${cluster_name}`. For example, `terraform/envs/prod.tfvars` sets `cluster_name = "example-app-cluster-prod"`, so Terraform renders `prod-example-app-cluster-prod`.

## CoreDNS Reachability Pattern

CoreDNS runs on the shared system core node group managed by this repository. Downstream application node groups can use a different security group than `module.eks.node_security_group_id`, so cluster DNS can fail even when CoreDNS, kube-proxy, and VPC CNI pods are healthy.

If downstream pods report `Temporary failure in name resolution`, confirm DNS before debugging the application database or ingress:

```bash
kubectl exec -n <namespace> <pod> -- cat /etc/resolv.conf
kubectl exec -n <namespace> <pod> -- python -c 'import socket; print(socket.getaddrinfo("kubernetes.default.svc.cluster.local", 443))'
```

For JupyterHub-style node groups attached to the EKS primary cluster security group, `terraform/security_groups.tf` must allow TCP/UDP `53` ingress from `module.eks.cluster_primary_security_group_id` to `module.eks.node_security_group_id`. Do not use `module.eks.cluster_security_group_id` for this path unless live evidence shows the downstream nodes use that module-created SG; in dev, JupyterHub nodes used the EKS primary cluster SG while CoreDNS nodes used the shared node SG.

If a DNS SG rule was added manually during an incident, add the matching Terraform resource and import the live rule before apply to avoid duplicate-rule failures:

```bash
./terraform/tf.sh <env> import aws_security_group_rule.<name> <node-sg>_ingress_<protocol>_53_53_<source-sg>
```

## Downstream Handoff Pattern

When changing shared infrastructure, tell downstream owners what changed and what they must re-check:

- `mcp-server`: public ALB route, namespace rollout, health endpoint, MCP app deployment.
- `example-app-datasets`: internal RPC service, IRSA/S3 access, namespace rollout, enrichment worker.
- `jupyterhub`: JupyterHub gateway, private admin route, Helm release, PVC cleaner, single-user image behavior.

Handoff should include the environment, workflow run URL, Terraform plan summary, rendered cluster name, subnet outputs, ALB controller status, and any rollback status.

## Common Failure Signals

- Terraform wants to recreate an existing live VPC, EKS cluster, subnet, or shared IAM policy.
- `kubectl` cannot authenticate after Terraform reports success.
- CoreDNS, kube-proxy, or VPC CNI are unavailable in `kube-system`.
- App pods cannot resolve `kubernetes.default.svc.cluster.local` or AWS private endpoints because CoreDNS SG ingress from downstream node security groups is missing.
- AWS Load Balancer Controller cannot reconcile ingress resources because subnet tags, IAM permissions, or certificate annotations are wrong.
- Application repos report healthy pods but public ALB routes return default 404, 502, 503, or 504.
