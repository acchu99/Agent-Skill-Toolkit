---
name: codebase-evaluation
description: Comprehensive codebase evaluation methodology for generating robust implementation plans that enable first-iteration production-ready delivery. Use when given a feature requirement or system change where a build agent will consume the implementation plan as their sole instruction set.
---

# Codebase Evaluation for Implementation Planning

> **Role:** Senior Software Architect
> **Purpose:** Systematically evaluate a full codebase against a requirement to produce an implementation plan so complete that a build agent can deliver a production-ready application in a single iteration — no rework loops, no missing edge cases, no integration surprises.

## When to Use This Skill

- You have been given a feature requirement, system change, or new application spec
- A build agent (or team of agents) will consume your implementation plan as their sole instruction set
- The output must be **executable without clarification requests** — every decision is made, every ambiguity is resolved, every dependency is mapped

## Governing Principles

1. **Zero-Ambiguity Doctrine** — If the build agent would need to make a judgment call, you have not finished planning. Every branch, fallback, and edge case must be decided.
2. **Full-Surface Coverage** — You must evaluate every layer of the codebase the requirement touches: data model, API, business logic, UI, infrastructure, configuration, tests, and documentation.
3. **Dependency-First Ordering** — Implementation steps must be topologically sorted. No step references an artifact that a prior step has not yet created.
4. **Contract-Driven Interfaces** — Every boundary between modules, services, or layers must have its interface (types, schemas, API signatures) fully specified before implementation steps reference it.
5. **Production-Grade by Default** — Error handling, validation, logging, auth, performance, accessibility, and observability are not follow-ups. They are part of every step.

---

## Phase 1: Codebase Reconnaissance

Systematically map the existing codebase before proposing any changes. You are building a mental model that prevents integration failures.

### 1.1 Project Structure Inventory

| Evaluate | Capture |
|---|---|
| Root directory layout | Framework, language, monorepo vs. polyrepo, package manager |
| Build system | Build tool, config files, scripts, output targets |
| Entry points | Application bootstrap, routing setup, server initialization |
| Environment config | Env vars, config files, secrets management, feature flags |
| Dependency manifest | Direct dependencies, peer dependencies, version constraints |

**Output:** A structural map that a build agent can use to know exactly where every new file goes and what existing patterns to follow.

### 1.2 Architecture Pattern Extraction

Do not assume architecture from the framework. Read the code to discover the **actual** patterns in use:

1. **Layering model** — How is the codebase stratified? (e.g., routes → controllers → services → repositories → models)
2. **State management** — Where does state live? (DB, cache, in-memory, client-side store, URL params)
3. **Data flow** — Trace a representative request end-to-end: entry point → validation → business logic → persistence → response
4. **Error propagation** — How do errors flow? Custom error classes? Global handlers? Per-route try/catch?
5. **Cross-cutting concerns** — Auth middleware, logging, rate limiting, CORS, request tracing
6. **Naming conventions** — File naming, function naming, variable naming, CSS class naming — document the exact patterns, do not generalize

**Output:** A pattern reference document the build agent uses to write code that is indistinguishable from the existing codebase.

### 1.3 Data Model Audit

1. Read every migration, schema definition, or ORM model
2. Map all tables/collections, their columns/fields, types, constraints, indexes, and relationships
3. Identify the **governance hierarchy** if applicable (objectives → strategies → tactics → actions)
4. Flag any schema inconsistencies (orphaned columns, missing foreign keys, naming drift)
5. Document RLS policies, triggers, computed columns, and any database-side business logic

**Output:** A complete entity-relationship map with column-level detail sufficient to write migrations without referencing the DB.

### 1.4 API Surface Inventory

1. Enumerate every endpoint (REST routes, GraphQL resolvers, RPC handlers, WebSocket events)
2. For each endpoint: method, path, auth requirement, request schema, response schema, error codes
3. Identify middleware chains and their execution order
4. Document rate limits, pagination patterns, and caching strategies
5. Map which endpoints the requirement will modify vs. which new endpoints are needed

**Output:** An API contract sheet the build agent uses to implement endpoints with correct signatures on the first pass.

### 1.5 UI Component Audit (if applicable)

1. Inventory the component library: shared/base components, layout components, page-level components
2. Document the styling approach: CSS modules, Tailwind, styled-components, design tokens
3. Map the routing structure and navigation hierarchy
4. Identify form handling patterns: validation library, error display, submission flow
5. Document data fetching patterns: hooks, loaders, server components, caching strategy
6. Catalog existing UI states: loading, empty, error, success — capture the exact patterns used

**Output:** A UI pattern reference the build agent uses to produce visually and structurally consistent components.

### 1.6 Testing Infrastructure Audit

1. Identify test frameworks, assertion libraries, and mocking tools
2. Map the test directory structure and naming conventions
3. Document existing test patterns: unit, integration, e2e, snapshot
4. Identify test utilities, fixtures, factories, and custom matchers
5. Capture CI test commands and coverage thresholds
6. Note any gaps in current test coverage relevant to the requirement

**Output:** A testing playbook the build agent uses to write tests that follow established patterns and pass CI.

### 1.7 Infrastructure and Deployment Audit

1. Document deployment targets: cloud provider, services, regions
2. Map CI/CD pipeline stages and their configurations
3. Identify IaC files (Terraform, CDK, CloudFormation, Docker, Helm)
4. Document environment promotion strategy (dev → staging → prod)
5. Capture any deployment prerequisites the requirement introduces

**Output:** Deployment context so the build agent includes infra changes where needed.

---

## Phase 2: Requirement Decomposition

Transform the high-level requirement into an exhaustive specification that eliminates all ambiguity.

### 2.1 Functional Decomposition

Break the requirement into **atomic functional units** — the smallest independently testable behaviors:

1. List every user-facing behavior the requirement introduces or modifies
2. For each behavior, specify:
   - **Trigger** — What initiates it (user action, system event, scheduled job, API call)
   - **Preconditions** — What must be true before it can execute
   - **Input** — Exact data shape with types, constraints, and validation rules
   - **Processing** — Step-by-step logic including every conditional branch
   - **Output** — Exact data shape returned or state change produced
   - **Postconditions** — What must be true after successful execution
   - **Error cases** — Every failure mode with its specific handling (not "handle errors gracefully")
3. Map each functional unit to the codebase layer(s) it touches

### 2.2 Non-Functional Requirements Extraction (AWS 6 Pillars Alignment)

For every functional unit, explicitly evaluate against the AWS Well-Architected Framework pillars:

| Pillar | Concern | Decision Required |
|---|---|---|
| **Operational Excellence** | **Observability** | What to log? What metrics to emit? What alerts to trigger? |
| | **Rollback strategy** | If this fails in production, what is the recovery procedure? Deployment gates? |
| **Security** | **Auth/Authz** | Who can perform this action? What role/permission? What happens on denial? |
| | **Security** | Input sanitization? CSRF? Rate limiting? Data exposure risk? Encryption at rest/transit? |
| | **Validation** | Client-side, server-side, or both? What messages for each invalid state? |
| **Reliability** | **Concurrency** | Can this be called simultaneously? Optimistic locking? Queue? Idempotency? |
| | **Availability** | Failure modes of dependencies? Retry logic? Circuit breakers? |
| | **Backward compatibility** | Does this break existing API consumers? Migration path? |
| **Performance Efficiency** | **Performance** | Expected response time? Pagination? Lazy loading? Query optimization needed? |
| **Cost Optimization** | **Resource Efficiency** | Are we using the most cost-effective resources? Any runaway cost risks (e.g., API usage)? |
| **Sustainability** | **Footprint** | Can we reduce compute/storage waste? (e.g., efficient data structures, proper cleanup) |
| **UX/Accessibility** | **Accessibility** | ARIA labels? Keyboard navigation? Screen reader flow? Color contrast? |
| | **i18n/L10n** | Hardcoded strings or i18n keys? Date/number formatting? |

### 2.3 Edge Case Enumeration

For each functional unit, systematically explore:

1. **Empty states** — No data exists yet; first-time user; newly provisioned tenant
2. **Boundary values** — Maximum lengths, zero values, negative values, special characters
3. **Concurrent mutations** — Two users editing the same resource simultaneously
4. **Partial failures** — Network drops mid-operation; third-party service timeout; DB write succeeds but cache invalidation fails
5. **Permission boundaries** — User A views resource owned by User B; admin vs. regular user
6. **State transitions** — Invalid transitions (e.g., approving an already-rejected item)
7. **Data consistency** — Orphaned records; referential integrity after deletion; cascading effects

### 2.4 AWS Pillar Alignment Verification

Before moving to Phase 3, perform a final sweep to ensure the proposed solution adheres to the 6 Pillars:

1. **Operational Excellence:** Is the code instrumented for "you build it, you run it"? Are logs searchable?
2. **Security:** Is "Least Privilege" applied? Is data protected at every layer?
3. **Reliability:** What happens when a dependency is down? Is there a documented recovery path?
4. **Performance Efficiency:** Does the solution scale horizontally? Are we using the right tool for the job?
5. **Cost Optimization:** Does this change increase monthly burn? Can it be implemented more efficiently?
6. **Sustainability:** Are we minimizing idle resources?

---

## Phase 3: Impact Analysis

Determine the full blast radius of the requirement across the existing codebase.

### 3.1 Change Surface Mapping

For every file that will be created or modified:

```
| File Path | Change Type | Description | Dependencies |
|---|---|---|---|
| src/models/order.ts | MODIFY | Add `tracking_status` field | Migration 028 |
| src/routes/orders.ts | MODIFY | Add GET /orders/:id/tracking endpoint | OrderService |
| src/services/order-service.ts | MODIFY | Add `getTrackingStatus()` method | ShippingProvider |
| src/services/shipping-provider.ts | CREATE | External shipping API client | env.SHIPPING_API_KEY |
| tests/services/shipping-provider.test.ts | CREATE | Unit tests with mocked API | test fixtures |
```

### 3.2 Dependency Chain Analysis

1. Map upstream dependencies — What existing code calls the code you are changing? Will those callers break?
2. Map downstream dependencies — What does your changed code call? Are those interfaces stable?
3. Identify circular dependency risks
4. Flag any dependency version bumps required
5. Document shared state or global singletons affected

### 3.3 Migration and Data Impact

1. Schema migrations required (with exact SQL or ORM migration code)
2. Data backfill requirements for existing records
3. Backward-compatible migration strategy (can old code run against new schema during deploy?)
4. Rollback migration (down migration) for every up migration

---

## Phase 4: Implementation Plan Generation

Produce the plan the build agent will execute. Every step must be **atomic, ordered, and self-contained**.

### 4.1 Step Structure

Each implementation step MUST include:

```markdown
### Step N: [Action Title]

**Objective:** What this step produces (one sentence)
**Prerequisites:** Which prior steps must be complete
**Artifacts to produce:**
- Exact file paths to create or modify
- Exact function/class/component names

**Specification:**
- Precise logic, not hand-waves
- Input/output types with field-level detail
- Error handling for each failure mode
- Validation rules with exact constraints
- Test cases: inputs, expected outputs, edge cases

**Acceptance criteria:**
- [ ] Specific, verifiable condition (not "works correctly")
- [ ] Specific test that must pass
- [ ] Specific integration point that must be validated

**Patterns to follow:**
- Reference to existing file exhibiting the pattern (exact path + line range)
```

### 4.2 Step Ordering Rules

1. **Schema before code** — Database migrations before application code that references them
2. **Types before implementations** — Interfaces, types, schemas before code that uses them
3. **Shared before specific** — Utility functions, shared components, base classes before domain-specific code
4. **Backend before frontend** — API endpoints before UI that calls them (unless mocked)
5. **Core before periphery** — Happy path before error handling refinements, but error handling is still in the same step, not deferred
6. **Tests alongside implementation** — Each step includes its own tests, never a "write all tests" step at the end. Explicitly detail E2E (e.g., Playwright/Cypress) and Unit testing (e.g., Vitest/Jest) for all critical data and user flows.
7. **Deployment as Code** — Include exact, atomic steps for the full production deployment of the entire system (e.g., Vercel deployment configs, environment variable mapping, Supabase production migrations, and webhook wiring).

### 4.3 Interface Contracts

Before any implementation steps, produce a **contracts section** that defines:

1. **API contracts** — Every new or modified endpoint with full request/response schemas (TypeScript types, JSON Schema, or equivalent)
2. **Component contracts** — Every new component's props interface with types and defaults
3. **Service contracts** — Every new service's public method signatures with parameter and return types
4. **Event contracts** — Every new event's payload schema
5. **Database contracts** — Every new table/column with type, constraints, and relationships

The build agent implements TO these contracts. If two steps produce code that must interoperate, the contract is the source of truth.

### 4.4 Configuration and Environment

Explicitly specify:

1. New environment variables (name, type, default, required/optional, where to document)
2. New feature flags (name, default state, rollout plan)
3. Config file changes (exact keys and values)
4. Secret management (what needs to be in vault/secrets manager)

### 4.5 Verification Plan

For the completed implementation, specify:

1. **Smoke test script** — Exact steps to verify the feature works end-to-end
2. **Regression checkpoints** — Existing tests that must still pass
3. **Manual verification steps** — If automated testing cannot cover certain scenarios
4. **Performance benchmarks** — If applicable, the expected performance envelope
5. **Build and lint** — The exact commands and their expected output

---

## Phase 5: Risk Assessment and Contingency

### 5.1 Technical Risk Register

For every non-trivial risk:

| Risk | Likelihood | Impact | Mitigation | Contingency |
|---|---|---|---|---|
| Third-party API rate limit hit | Medium | High | Implement retry with exponential backoff + circuit breaker | Queue and batch requests; alert on-call |
| Migration on large table causes lock | Low | Critical | Use online DDL / zero-downtime migration pattern | Schedule during maintenance window |

### 5.2 Assumption Log

Document every assumption you made during planning:

```
| # | Assumption | If Wrong, Impact | Verification Method |
|---|---|---|---|
| A1 | Auth uses JWT with `user_id` claim | Auth middleware rewrite needed | Check auth middleware source |
| A2 | Supabase RLS is enabled on all tables | Security review required | Check migration files for RLS policies |
```

### 5.3 Open Questions Resolution

There must be **zero open questions** in the final plan. For every question that arose during evaluation:

1. Answer it definitively using evidence from the codebase
2. If the codebase does not provide an answer, make an explicit architectural decision and document the reasoning
3. If the decision requires stakeholder input, flag it as a **blocker** — do not paper over it with a default

### 5.4 Requirement Traceability Matrix

Conclude the plan with a comprehensive evaluation checklist mapping *every single requirement* from the specification documents directly to the proposed implementation steps. This must serve as a definitive, checkable test to ensure there are absolutely zero gaps between the finalized code and the original specifications.

---

## Common Mistakes

- **Skipping reconnaissance** — Proposing architecture without reading the actual code; the resulting plan conflicts with existing patterns and causes integration failures
- **Vague steps** — "Implement the service layer" is not a step. "Create `src/services/tracking-service.ts` exporting `getStatus(orderId: string): Promise<TrackingStatus>` that calls `ShippingProvider.track()` and maps the response to the `TrackingStatus` type defined in Step 3" is a step
- **Deferred error handling** — "We'll handle errors later" guarantees the first iteration is not production-ready. Every step includes its error cases
- **Missing state transitions** — Specifying the happy path but not what happens when a user retries, cancels mid-flow, or encounters a timeout
- **Implicit conventions** — Saying "follow existing patterns" without citing the specific file and line range that demonstrates the pattern
- **Test afterthought** — A "Phase 6: Write Tests" section means the build agent will write tests that retrofit to the implementation rather than validate the specification
- **Ignoring existing code** — Creating new utilities that duplicate existing helpers; introducing a second HTTP client; adding a new date library when one is already in use
- **Underspecified types** — Using `any`, `object`, or `Record<string, unknown>` in interface contracts. Every field must have a concrete type
- **No rollback path** — If the deployment fails, there is no documented way to revert without data loss

## Related Skills

- `/migration-patterns` — SQL migration conventions and existing table inventory
- `/schema-conventions` — JSON schema patterns for structured outputs
- `/project-navigation` — Where to find things in the codebase
- `skills/shared/guardrail_evaluation.md` — Evaluating actions against brand guardrails
- `skills/shared/traceability_patterns.md` — Governance hierarchy traceability contract
