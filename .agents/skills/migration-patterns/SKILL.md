---
name: migration-patterns
description: Supabase migration conventions for this project including naming, required patterns (RLS, timestamps, UUIDs), current migration inventory, and key table relationships. Use when creating or modifying database migrations.
---

# Migration Patterns

## Naming

Migrations are in `supabase/migrations/` with the pattern `NNN_description.sql`:
- Sequential numbering (zero-padded to 3 digits)
- Snake_case description
- Example: `019_tactics.sql`

## Current migration inventory

| # | Name | Purpose |
|---|---|---|
| 001 | brands_channels | Core brand + channel tables |
| 002 | kpi_daily | KPI daily metrics |
| 003 | agent_tables | Agent runs, actions, approvals, experiments |
| 004 | functions | Helper SQL functions |
| 005 | seed_examplebrand | Example brand seed data |
| 007 | agent_events | Agent event tracking |
| 008 | prompt_templates | Prompt template storage |
| 009 | skill_documents | Skill document storage |
| 010 | agent_registry | Agent registration |
| 011 | prompt_versioning | Prompt version tracking |
| 012 | prompt_evaluations | Prompt A/B testing results |
| 013 | agent_memory | Agent lessons/observations |
| 014 | distributed_tracing | Cross-agent tracing |
| 015 | calibration_conflicts | Calibration conflict detection |
| 016 | business_objectives | Business objectives with rationale |
| 017 | strategies | Strategies with objective_alignment |
| 018 | actions_strategy_link | Link actions to strategies |
| 019 | tactics | Tactics table with strategy_alignment + intent |
| 020 | tactic_action_link | Link actions to tactics |
| 021 | control_center | Control Center tables (user_preferences, control_audit_log) |

## Required patterns

### Always use RLS
```sql
ALTER TABLE {table_name} ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON {table_name}
  FOR ALL USING (auth.role() = 'service_role');
```

### Always include timestamps
```sql
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
```

### Use UUIDs for primary keys
```sql
id UUID DEFAULT gen_random_uuid() PRIMARY KEY
```

### Use JSONB for flexible data
```sql
payload_json JSONB DEFAULT '{}'::jsonb
```

### Foreign keys with ON DELETE behavior
```sql
strategy_id UUID REFERENCES strategies(id) ON DELETE SET NULL
```

## Key table relationships

```
brands (1) → (N) channels
brands (1) → (N) business_objectives
business_objectives (1) → (N) strategies
strategies (1) → (N) tactics
tactics (1) → (N) agent_actions (via tactic_id)
strategies (1) → (N) agent_actions (standalone, via strategy_id)
agent_actions (1) → (N) approvals
agent_actions (1) → (N) experiments
```
