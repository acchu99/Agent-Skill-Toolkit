---
name: n8n-workflow-patterns
description: Best practices for building and orchestrating n8n workflows within the platform ecosystem.
---

# n8n Workflow Patterns

## 1. Directory Structure & Organization
Workflows in n8n Cloud must be organized into functional folders to ensure isolation and manageability.

- **`00-system`**: Error handlers, health checks, utilities.
- **`01-ingestion`**: Data ingestion workflows (Amazon Reports, Shopify).
- **`02-agents`**: Agent run workflows (Daily Briefly, Strategy Gen).
- **`03-actions`**: Connector-specific execution logic and the core Action Router.
- **`04-measurement`**: Post-action measurement and ROI reporting.
- **`05-alerts`**: Monitoring and anomaly notification logic.

If the repo already uses a runtime package such as `prototypes/n8n-runner`, also expect:
- `runtime/` for generated brand-agent runtime JSON
- `scripts/` for build/normalize/validate/deploy tooling
- `workflow-manifest.json` as the deployment and activation contract

## 2. The Dual-Layer Execution Model (Intent vs Runtime)
Workflows must distinguish between the tactical intent and the runtime instance.

- **`agent_actions` (Intent)**: Stores WHAT we want to do and WHY (Governance).
- **`execution_jobs` (Runtime)**: Stores IF we did it and HOW (Operations).

**Pattern:**
1. **Trigger**: Receives `job_id` and `agent_action_id`.
2. **Transition Job**: Update `execution_jobs.status` to `running`.
3. **Transition Action**: Update `agent_actions.status` to `executing`.
4. **Finalize**: Both must be finalized upon completion.

## 3. Callback Hub & HMAC Security
All long-running n8n workflows MUST communicate progress back to the Control Center API.

- **Endpoint**: `POST /api/v1/callbacks/executions/status`
- **Security**: Mandatory `X-N8N-Signature` HMAC header.
- **Payload**: Include `job_id`, `status`, `progress_pct`, and `step`.

## 4. Global Error Handling
Every production workflow **MUST** have an Error Workflow assigned in its settings.

- **Error Workflow Reference**: `system_error_handler`.
- **Logic**: The error handler should extract `{{$json.execution.error.message}}` and `{{$json.workflow.name}}` and post to the `#alerts` channel.

## 4. Webhook Security
Webhooks from external providers (like Slack) must be authenticated.
- **Header Check**: Validate `X-Slack-Signature` or `Authorization: Bearer [SECRET]`.
- **Secret Management**: Pass secrets via `N8N_WEBHOOK_SECRET` environment variables, never hardcoded in nodes.

## 5. CI/CD & Deployment Strategy (Production)
Workflows in production MUST NOT be edited manually.
- **Storage**: Version control all deployable workflow artifacts in the repo workflow package.
- **Generation**: If the project uses a normalizer/generator, treat that as the source of truth rather than hand-editing emitted JSON.
- **Deployment**: Use a GitHub Action using the n8n REST API to push updates from GitHub-managed artifacts.
- **Manifest**: Use a workflow manifest to define deploy order, activation, and `launch_scope`.
- **Validation**: Every deployment must be preceded by structural validation, and launch deployments should also pass a strict launch audit.

### Activation Rules

- Triggered entrypoint workflows may be `active: true`
- Sub-workflows called through `Execute Workflow` should usually be deployed but `active: false`
- Post-launch connectors can be deployed but inactive

Do not mark internal helper workflows active just because they are required for launch.

## 6. Rate Limit & Concurrency Management
Protect external API quotas (e.g., Amazon Ads API burst limits).
- **Pattern**: Implement a **Connector-Level Queue** in n8n (Wait node) or a dedicated SQS buffer.
- **Standard**: Default to 20 requests/second unless the connector registry specifies otherwise.

## 7. Naming Conventions
- **Nodes**: Use descriptive names like `Amazon Ads: Add Negative` instead of `HTTP Request`.
- **Workflows**: MUST follow the pattern: `{brand}_{domain}_{function}` (e.g., `examplebrand_sales_daily_brief`).

Exception:
- shared helper sub-workflows that are not brand-specific may use shared names such as `amazon_sp_api_signed_request`

## 8. Idempotency Pattern
Every action-producing workflow must generate a deterministic key before execution.
- **Standard Format**: `{brand}_{agent}_{action_type}_{date}_{hash(payload)}`.
- **Enforcement**: Check `agent_actions` for the key before calling external APIs.

## 9. Mandatory Credential Nodes
A production n8n instance MUST have the following credential types configured and tested:
- **AWS Secrets Manager**: For runtime secret injection.
- **AWS S3**: For data lake read/write.
- **Supabase (Postgres)**: For state and governance.
- **OpenAI**: For agent orchestration.
- **Slack**: For HITL and alerting.

Where the project uses env/secret-manager resolution instead of static n8n credential objects for per-brand APIs, keep that logic in helper workflows and document the env naming contract in `.env.example`.

## 8. Agent Configuration Parity (Governance)
All workflows executing agent actions must be cross-referenced against the `actions` schema defined in the agent's YAML files (`brands/*/agents/*.yaml`).
- **Schema Parity**: The `action_id` and payload shape in n8n MUST match the definitions in the YAML.
- **Autonomy Check**: Workflow branch logic (HITL vs Auto) MUST match the `autonomy_level` defined in the agent config.

## 10. The Universal Agent Orchestrator (The Brain)
Workflows in `02-agents/` implement the reasoning cycle for specific agent personas.
- **Pattern**: `agent_orchestrator`.
- **Identity**: SHOULD resolve agent config from a generated runtime registry, not runtime YAML parsing inside n8n.
- **Context Injection**: Query shared context from the data layer or RPCs, not ad hoc repo reads.
- **Prompting**: Fetch templates from `prompts/templates/` and inject context before LLM execution.
- **Persistence**: Persist proposed actions or intents into `agent_actions` so downstream execution has authoritative work items.
- **Model default**: Use the cost-effective route by default, currently `gpt-5.4-mini`, unless a prompt is explicitly escalated.

## 11. Skill Chaining Logic
Agents use "Skills" to process data before reasoning.
- **Standard**: Every skill listed in `agent.skills` MUST map to a sub-workflow call.
- **Location**: Shared skills live in a dedicated shared skill folder for the package; in the current runner this is under `02-agents/skills`.
- **Interface**: Skills must return a standardized JSON object that can be merged into the LLM context.

## 12. Legacy Workflow Hygiene

Do not leave obsolete prototype files in the active workflow package if validators recurse the folder tree.

Examples of high-risk leftovers:
- `*.local.json`
- old webhook handlers no longer referenced by the manifest
- old YAML-parsing orchestrator variants

Rules:
- either normalize/validate them to the current standard
- or remove/exclude them so they do not break `npm test`

If a file is not part of the manifest and not intentionally retained, it should not silently live in the deploy package.
