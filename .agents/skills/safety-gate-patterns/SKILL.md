---
name: safety-gate-patterns
description: Standardized safety architecture for AI agent execution, involving Kill Switches, Idempotency, and Data Quality gates.
---

# Safety Gate Patterns (The Triple-Gate)

To ensure safe and reliable execution of AI-driven actions, the platform employs a "Triple-Gate" safety architecture. Every execution-path workflow MUST implement these three gates sequentially before payload delivery.

## Gate 1: Kill Switches (The Emergency Stop)
Check for active kill switches at the Brand, Agent, or Connector level.

- **Check Logic**: `SELECT * FROM kill_switches WHERE is_active = true AND (scope = 'global' OR target = :connector)`.
- **Response**: If ANY kill switch matches, transition action to `blocked` and exit.

## Gate 1.5: Autonomy & Risk Routing (MANDATORY)
Before any execution logic, branch the workflow based on the `autonomy_level` and `risk_class` defined in the agent's YAML configuration.

- **L1 (Escalation)**: Immediate human intervention required. Workflow MUST alert `owner_role` and pause until manual clearance.
- **L2 (Approval)**: Execution paused. Workflow MUST send a deep-linked approval request to the Control Center and resume via Supabase Realtime.
- **L3 (Auto)**: Full automation. Workflow proceeds to execution after safety gates pass.

**Verification**: `agent_actions.guardrails_evaluated` must be `true` for all levels.

## Gate 2: Idempotency (The Double-Run Guard)
Prevent duplicate execution of the same logical intent.

- **Key Generation**: Hash the core action parameters (e.g., campaign_id, keyword, brand, date).
- **Check Logic**: Map the action to an `idempotency_key`.
- **Response**: If status is `executing` or `executed` for that key, skip the second run.

## Gate 2.5: KPI Pre-Execution Snapshot
Immediately before the API call, capture the current state of affected KPIs (e.g., ACoS, CPC).
- **Storage**: Store in `execution_jobs.metadata` as a `pre_execution_snap`.
- **Purpose**: Enables directional ROI measurement by establishing a T-0 baseline.

## Gate 3: Data Quality (The Sanity Check)
Validate the payload against schema and business constraints.

- **Check Logic**: Ensure required fields are present and within bounds (e.g., budget change < 50%).
- **Standard**: Validation logic MUST enforce the `required_fields` specified in the agent's YAML configuration (`brands/*/agents/*.yaml`). For example, `inventory.yaml` may require `daily_velocity` even if the connector schema does not.
- **Response**: If DQ fails, transition to `failed` with a specific `validation_error` message.

## Gate 4: Revert Payload Validity (The Time-Lock Guard)
Destructive API actions executed autonomously or via HITL MUST be reversible. However, ecosystem dynamics change rapidly.

- **Check Logic**: Enforce a strict time-to-live (TTL) on all `rollback_payloads` at the database level.
- **Implementation**: Utilize a PostgreSQL trigger (e.g. `max_rollback_window_hours INT DEFAULT 24`) that rejects any `UPDATE` setting `executed = true` if the time elapsed since `created_at` exceeds the specified window.
- **Fallback**: If a rollback payload expires before execution, the system must force a manual recalculation rather than processing the stale inverse-action payload.

---

## 4. Circuit Breaker Integration
When a workflow fails repeatedly, it should automatically "trip" a Kill Switch.

**Pattern:**
- Increment error count in `connector_registry`.
- **Failure Threshold**: Check for > 3 exhausted failures (after retries) within a 15-minute sliding window.
- **Retry Strategy**: Nodes MUST use exponential backoff (starting at 5s, 3 retries).
- If threshold is exceeded, trigger a `kill_switch` for that specific connector via `rpc.trip_kill_switch`.
- Notify engineers via `#incidents` Slack channel.

## 5. Directional ROI Attribution (Post-Action)
Codify attribution not as causal truth, but as directional drift within a T-1 to T+2 window.
- **Logic**: Δ KPI * Attribution Weight. 
- **Skill Consultation**: Measurement workflows MUST consult brand-specific skills (e.g., `shared/roi_calculation`) to ensure attribution logic aligns with the brand's financial standards.
- **Annotation**: Every attribution update MUST include an `impact_notes` field acknowledging the causal limits.

## 6. Secret Management & Rotation
Never store long-lived integration tokens (Amazon, Shopify) in static n8n credentials.

- **Source of Truth**: **AWS Secrets Manager**.
- **Access Pattern**: Fetch at runtime using `rpc.get_decrypted_secret(key_name)`.
- **Caching**: Implement a 1-hour in-memory cache in the workflow to avoid excessive AWS API costs.

## 7. Advanced Observability (Metrics & Latency)
Capture P95 latency and quota consumption per-connector.

- **Target**: **Amazon CloudWatch** or **Grafana**.
- **Action**: Every successful execution must emit an `ExecutionLatency` metric.
- **Alerting**: Alert if P95 latency for a connector exceeds 5 seconds.
