---
name: kubernetes-alb-incident-response
description: Kubernetes and AWS ALB incident response for public 5xx/504 outages, stale target groups, EKS node failures, ingress health checks, AWS Load Balancer Controller scheduling, taints, and endpoint reconciliation. Use when a Kubernetes service or MCP deployment is Ready internally but external health URLs through an MCP ingress host or ALB fail.
allowed-tools: Read, Glob, Grep, Bash
---

# Kubernetes ALB Incident Response

> Trace the whole request path. A green pod is not proof that public traffic works.

---

## 1. First Principle

For a public `5xx` or ALB default `404` from AWS ALB, verify each layer separately:

```plaintext
client URL
  -> DNS / ALB listener rule
  -> ingress
  -> target group
  -> target IP:port
  -> Kubernetes Service / EndpointSlice
  -> pod
  -> application route
```

Do not stop at `kubectl get deployment` or pod readiness. Kubernetes readiness only proves the kubelet can reach the pod according to its probe.

---

## 2. Fast Triage

Run internal and external checks side by side:

| Layer | What to Check | Healthy Signal |
| ----- | ------------- | -------------- |
| Public URL | `curl -i --max-time 20 https://.../health` | HTTP 200 from app server |
| Deployment | `kubectl get deployment -n <ns>` | `READY` and `AVAILABLE` match desired |
| Pod placement | `kubectl get pods -n <ns> -o wide` | Pod on a `Ready` node |
| Service endpoints | `kubectl get endpointslices -n <ns>` | Endpoint IP matches current pod IP |
| Ingress | `kubectl describe ingress -n <ns> <name>` | Backend maps to service and live endpoint |
| App logs | `kubectl logs -n <ns> deployment/<name>` | External request appears if traffic reaches app |
| ALB target group | `aws elbv2 describe-target-health ...` | Current pod IP is `healthy` |
| ALB controller | `kubectl get pods -n kube-system -l app.kubernetes.io/name=aws-load-balancer-controller` | Controller pod `Running` and `Ready` |

If the external request never appears in app logs, investigate ALB, ingress, target groups, security groups, and controller reconciliation before changing app code.

For `mcp-server`, a public response like `HTTP/2 404` with `server: awselb/2.0` on `https://<env>-infra.example.com/mcp-server/health` means the request hit the ALB default rule. It is not proof of an unhealthy pod. Confirm whether the shared ALB has a listener rule for the selected environment host and path `/mcp-server` forwarding to the MCP target group.

---

## 3. EKS Node Failure Pattern

When a deployment uses a node selector, confirm there is an eligible healthy node:

```bash
kubectl get nodes --show-labels
kubectl describe node <node-name>
kubectl get pods -n <namespace> -o wide
```

Watch for:

- `NodeStatusUnknown` or `Kubelet stopped posting node status`
- `node.kubernetes.io/unreachable` taints
- A singleton node label such as `role=mcp`
- The only eligible workload node being `NotReady`

If the only eligible node is down, restarting or replacing that node may restore pod scheduling, but still verify the external ALB path afterward.

---

## 4. Public 504 With Ready Pod

If Kubernetes says the pod and service are healthy but the public URL returns an ALB `504`, check for stale ALB targets:

```bash
kubectl get pods -n <namespace> -o wide
kubectl get endpointslices -n <namespace>
aws elbv2 describe-target-groups --region <region> --load-balancer-arn <alb-arn>
aws elbv2 describe-target-health --region <region> --target-group-arn <target-group-arn>
```

Diagnosis pattern:

```plaintext
current pod IP:        10.0.1.112
EndpointSlice IP:      10.0.1.112
ALB target group IP:   10.0.1.140
target health:         unhealthy / Target.Timeout
public URL:            504 Gateway Time-out
```

This usually means the AWS Load Balancer Controller did not reconcile after pod rescheduling. Restore the controller first; manual target changes are usually a temporary workaround and can be overwritten.

---

## 5. Public ALB 404 With Healthy Cluster

If the public URL returns ALB default `404`, check for a missing listener rule or unapplied ingress before debugging pod health:

```bash
curl -i --max-time 20 "https://${INGRESS_HOST}/mcp-server/health"
kubectl describe ingress mcp-app-ingress -n "$NAMESPACE"
kubectl get endpointslices -n "$NAMESPACE"
kubectl logs -n kube-system deployment/aws-load-balancer-controller --tail=100
```

For `mcp-server`, recover the intended hardened app route by applying:

```bash
export IMAGE_URI="<account>.dkr.ecr.us-east-2.amazonaws.com/dev-mcp:<tag>"
export NAMESPACE="mcp-app-namespace"
export INGRESS_HOST="dev-infra.example.com"
export INGRESS_ALB_GROUP_NAME="dev-example-app-shared-alb"
export INGRESS_CERTIFICATE_ARN="<acm-certificate-arn>"
export INGRESS_PUBLIC_SUBNETS="subnet-..., subnet-..."
mkdir -p rendered
perl -pe 's#\$\{([A-Z0-9_]+)\}#exists $ENV{$1} ? $ENV{$1} : die "Missing env var $1\n"#ge' eks/deployment-hardened.yaml > rendered/deployment-hardened.yaml
perl -pe 's#\$\{([A-Z0-9_]+)\}#exists $ENV{$1} ? $ENV{$1} : die "Missing env var $1\n"#ge' eks/service-hardened.yaml > rendered/service-hardened.yaml
perl -pe 's#\$\{([A-Z0-9_]+)\}#exists $ENV{$1} ? $ENV{$1} : die "Missing env var $1\n"#ge' eks/ingress.yaml > rendered/ingress.yaml
kubectl apply -f rendered/deployment-hardened.yaml
kubectl apply -f rendered/service-hardened.yaml
kubectl apply -f rendered/ingress.yaml
kubectl rollout status deployment/mcp-app-hardened -n "$NAMESPACE" --timeout=5m
```

Use the `perl` substitution when `envsubst` is unavailable on macOS. After applying ingress, allow the AWS Load Balancer Controller time to reconcile before rechecking the public URL.

---

## 6. AWS Load Balancer Controller

Check the controller when target groups are stale:

```bash
kubectl get deployment aws-load-balancer-controller -n kube-system
kubectl get pods -n kube-system -l app.kubernetes.io/name=aws-load-balancer-controller -o wide
kubectl describe pod -n kube-system -l app.kubernetes.io/name=aws-load-balancer-controller
kubectl logs -n kube-system deployment/aws-load-balancer-controller --tail=100
```

Common blockers:

| Symptom | Likely Cause | Fix Direction |
| ------- | ------------ | ------------- |
| Controller pods `Pending` | Untolerated node taints | Add the required toleration through the managed source of truth |
| `didn't match Pod's node affinity/selector` | Affinity pins controller to a specific node class | Schedule on an eligible node class or adjust affinity deliberately |
| `didn't have free ports for requested pod ports` | `hostNetwork: true` with multiple replicas on one eligible node | Add another eligible node, remove host networking if appropriate, or scale to one replica |
| Repeated AWS permission errors | Controller IAM role lacks permissions | Fix IAM policy/IRSA/node role |

Prefer persistent changes in Helm/Terraform/manifests. A `kubectl patch` is acceptable as an incident mitigation only when speed matters; document it afterward so it is not lost on the next reconcile.

---

## 7. Verification Before Calling It Fixed

Verify all of these before reporting recovery:

- Public health URL returns `200`, not only cluster readiness.
- Response headers/body come from the app, not just an ALB default response.
- ALB target group points at the current pod IP and reports `healthy`.
- `EndpointSlice` endpoint matches the current pod IP and port.
- App logs show the external health request after the fix.
- Controller deployment is at an intentional desired state, or any remaining rollout issue is explicitly called out.

Example final verification set:

```bash
curl -i --max-time 20 "https://${INGRESS_HOST}/mcp-server/health"
kubectl get pods -n "$NAMESPACE" -o wide
kubectl get deployment mcp-app-hardened -n "$NAMESPACE"
kubectl get service mcp-app-hardened-service -n "$NAMESPACE"
kubectl get endpointslices -n "$NAMESPACE"
aws elbv2 describe-target-health --region us-east-2 --target-group-arn <mcp-target-group-arn>
```

Expected `mcp-server` recovery state:

- `curl` returns `HTTP/2 200` with `server: uvicorn`.
- `deployment.apps/mcp-app-hardened` is `2/2`.
- No `mcp-app-deployment-*` pods remain.
- `mcp-app-ingress` has the selected environment host and expected shared ALB address.

---

## 8. Incident Notes To Preserve

When summarizing, include:

- External symptom, for example `HTTP/2 504` from `awselb/2.0`.
- Internal Kubernetes state, including pod IP and node.
- ALB target health before and after.
- Controller condition that prevented reconciliation.
- Any live changes made, especially node reboot, deployment patch, or controller scale changes.
- Any follow-up required to make emergency patches permanent.
