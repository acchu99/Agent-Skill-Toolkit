---
name: env-var-patterns
description: Guidelines for MyApp's hierarchical environment variables (V2).
---

# Environment Variables V2 Patterns

This skill defines the technical standards for managing environment variables across User, Org, and Space scopes in MyApp.

## 1. Scoping & Hierarchy

| Scope | Key Type | Propagation | Isolation |
|-------|----------|-------------|-----------|
| **Space** | `{{var}}` | Hierarchical (merged down via CTE) | Shared within branch |
| **User** | `{{user.var}}` | None | Strict User Isolation |
| **Org** | `{{org.var}}` | None | Strict Org Isolation |

### Recursive Space Merge
Space variables are merged using the `parent_vars || child_vars` logic in the `space_effective_privs` materialized view (or CTE). Child values override parent values.

## 2. Safe Substitution Protocol

### The "Materialization First" Rule
Substitutions MUST happen at the earliest possible moment on the backend via the **Safe Data Access API**.
- **Input:** Raw content from DB (SQL queries, Skill code, Prompt text).
- **Processing:** `src/lib/env-substitution.ts` parses `{{...}}` tokens.
- **Output:** Fully materialized content.

> [!IMPORTANT]
> Downstream consumers (MyApp Client, MCP Tools, RPC Server) should NEVER perform substitution themselves. They receive pre-substituted content.

## 3. Trusted Process Push

For variables that are not just for content substitution but represent session context (e.g., API keys, user preferences):

- **MyApp Client:** Pushed as `OS Environment Variables` during kernel startup.
- **MCP Tools:** Passed in the `request context` for every tool call.
- **RPC Server:** Injected into operation metadata.

## 4. Security Boundaries

- **No Raw Leakage:** The AI agent should never see the raw mapping of variables. Use `execute_skill` or data loaders to provide the *result* of an operation, not the credentials used to perform it.
- **Namespace Collision:** Always use the `user.` or `org.` prefix for respective scopes to avoid accidental overrides by Space-level variables.
