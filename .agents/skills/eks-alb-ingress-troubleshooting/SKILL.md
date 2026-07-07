---
name: eks-alb-ingress-troubleshooting
description: Diagnosis and resolution patterns for AWS Load Balancer Controller, public gateway, and private JupyterHub ingress issues on EKS.
---

# EKS ALB Ingress Troubleshooting Skill

This skill provides a systematic approach to diagnosing and fixing issues with the AWS Load Balancer Controller (ALB/NLB) on EKS.

## 📋 Pre-Flight Checklist
- [ ] Is the `aws-load-balancer-controller` pod running in `kube-system`?
- [ ] Does the node group have the necessary IAM permissions?
- [ ] Are the subnets tagged correctly (`kubernetes.io/role/elb: 1`)?
- [ ] Are you checking the correct environment namespace?
- [ ] Is public traffic targeting the gateway host instead of the private Hub host?

## 🛠️ Common Issues & Fixes

### 1. IAM Permission Gaps
If the controller logs show `AccessDenied` or `UnauthorizedOperation`, ensure the following permissions are present:
- **EC2**: `DescribeAccountAttributes`, `DescribeAddresses`, `DescribeAvailabilityZones`, `DescribeInternetGateways`, `DescribeVpcs`, `DescribeSubnets`, `DescribeSecurityGroups`, `DescribeInstances`, `DescribeNetworkInterfaces`, `DescribeTags`.
- **Security Groups**: `CreateSecurityGroup`, `AuthorizeSecurityGroupIngress`, `AuthorizeSecurityGroupEgress`, `RevokeSecurityGroupIngress`, `RevokeSecurityGroupEgress`, `DeleteSecurityGroup`.
- **ELB**: `CreateLoadBalancer`, `CreateListener`, `DeleteListener`, `CreateRule`, `DeleteRule`, `AddTags`, `RemoveTags`, `ModifyListener`, `ModifyRule`, `SetWebAcl`, `AddListenerCertificates`, `RemoveListenerCertificates`.
- **Ingress Groups / Shared ALBs**: `elasticloadbalancing:SetRulePriorities` is **mandatory** when multiple Ingress resources share the same ALB group name (`alb.ingress.kubernetes.io/group.name`). Without this action, the controller will fail to reorder rules on the shared listener and output `FailedDeployModel` warning events with an `AccessDenied` exception.
- **Target Groups**: `elasticloadbalancing:CreateTargetGroup` and `elasticloadbalancing:DeleteTargetGroup`. Note that these are sometimes restricted to specific resource patterns in hardened environments; if the controller fails to create a TG, verify the resource ARN in the IAM policy.
- **IAM**: `CreateServiceLinkedRole` (with condition `iam:AWSServiceName: elasticloadbalancing.amazonaws.com`).

### 2. Service Stuck in `<pending>`
- **Finalizers**: Check if the service has `finalizers: - service.k8s.aws/resources`. If the controller cannot delete old resources, the service will hang on deletion.
- **Controller Logs**: Look for `failed to delete securityGroup: timed out`. This often happens if the SG is still in use by an ENI or another SG.

### 3. Ingress Not Accessible (404/502)
- **Shared Groups**: When using `group.name`, ensure all ingresses in the group have consistent `scheme` and `listen-ports`.
- **Target Type**:
    - `ip`: Routes directly to Pod IPs. Pods must be in a VPC subnet (not overlay network like flannel unless using AWS VPC CNI).
    - `instance`: Routes to NodePorts. Security groups must allow the ALB to reach the NodePorts on the instances.
- **SSL/TLS**: If hitting HTTPS, ensure `alb.ingress.kubernetes.io/certificate-arn` is provided. The ALB will return 404 if it cannot find a matching rule on the HTTPS listener.
- **Public Gateway vs Private Hub**:
    - Public app gateway hosts: `dev-infra.example.com`, `staging-infra.example.com`, `prod-infra.example.com`.
    - Private Hub hosts: `internal-dev-jhub.example.com`, `internal-staging-jhub.example.com`, `internal-prod-jhub.example.com`.
    - `JUPYTER_HUB_URL` should use the public gateway with `/jhub-core`.
- **Gateway Config**: If gateway behavior changes, verify the `checksum/config` pod-template annotation changes so NGINX pods roll.

### 4. Health Check Failures
- **Path**: Verify `alb.ingress.kubernetes.io/healthcheck-path` matches the application's health endpoint.
- **Base URL**: If the app has a `baseUrl` (e.g., `/jhub-core`), the health check path must include it: `/jhub-core/hub/health`.
- **Gateway Health**: The public gateway ingress health check should use `/health`.
- **Hub Health Through Gateway**: Check `/jhub-core/hub/health` separately from `/health`.

### 5. CORS or Redirect Issues
- Gateway should hide upstream CORS headers and emit the approved CORS headers itself.
- Preserve HTTPS forwarding headers:
    - `X-Forwarded-Proto https`
    - `X-Scheme https`
    - `X-Forwarded-Ssl on`
- Preserve websocket upgrade headers for notebook connections.

## 💻 Diagnostic Commands

### Check Controller Logs
```bash
kubectl logs -n kube-system -l app.kubernetes.io/name=aws-load-balancer-controller --tail 100
```

### Check Ingress Events
```bash
kubectl describe ingress <name> -n <namespace>
```

### Check Gateway Resources
```bash
kubectl get pods,svc,ingress -n jupyterhub-hardened
kubectl describe ingress jupyterhub-gateway -n jupyterhub-hardened
kubectl logs -n jupyterhub-hardened -l app=jupyterhub-gateway --tail=100
```

### Check Public Gateway
```bash
curl -sS -o /dev/null -w "dev health %{http_code} %{url_effective}\n" https://dev-infra.example.com/health
curl -sS -o /dev/null -w "dev jhub health %{http_code} %{url_effective}\n" https://dev-infra.example.com/jhub-core/hub/health
```

### Check TargetGroupBinding
```bash
kubectl get targetgroupbinding -n <namespace>
```

### Verify IAM Policy (AWS CLI)
```bash
aws iam get-policy-version --policy-arn <POLICY_ARN> --version-id $(aws iam get-policy --policy-arn <POLICY_ARN> --query 'Policy.DefaultVersionId' --output text) --query 'PolicyVersion.Document' --output json
```
