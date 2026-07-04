---
name: live-supabase-migration-and-seeding
description: Execute live Supabase migrations and seed imports safely with strict error handling, dependency-aware ordering, and verification checkpoints
---

# Live Supabase Migration And Seeding

## When to use this skill
- Applying SQL migrations to a live Supabase/Postgres database.
- Importing prepared seed SQL/CSV artifacts into existing tables.
- Running repeatable data setup where idempotency and safety checks matter.
- Diagnosing migration failures caused by extension, FK, or identity mismatches.

## Key concepts
- Apply migrations in strict numeric order.
- Treat only `already exists` errors as skippable.
- Halt immediately on any other SQL error.
- Seed in foreign-key dependency order.
- Verify target row counts and date ranges after writes.
- Preserve auditability: log each command, error, fix, and result.

## Prerequisites
- `.env` contains a valid `DATABASE_URL` (direct Postgres connection string).
- `psql` is available in PATH (or install `libpq`).
- SQL files are final and should be executed as-is.
- Operator confirms this run targets the intended live environment.

## Procedure
1. Validate environment and inputs.
- Confirm `.env`, migration files, and seed files exist.
- Source `.env` and confirm `DATABASE_URL` is non-empty.
- Confirm tooling (`psql`, optionally `supabase`) is installed.

2. Apply migrations sequentially.
- Execute each migration file in explicit order.
- Capture output per file.
- If output has no `ERROR:` lines: mark success.
- If all `ERROR:` lines contain `already exists`: mark skipped and continue.
- If any other `ERROR:` appears: stop and investigate.

3. Diagnose and fix non-skippable failures minimally.
- Extension missing (`type "vector" does not exist`): enable required extension, then retry from failed migration.
- FK missing parent row: reconcile parent identity before retrying child migration.
- Do not edit migration SQL files during the run.

4. Re-run from the failed migration onward.
- Resume in order, re-checking error policy for each file.

5. Apply seed files in dependency order.
- Typical order: parents first, then children (e.g., `brands -> channels -> kpi_daily`).
- Use `ON CONFLICT`-based seed files where available for idempotent reruns.

6. Verify outputs.
- Run deterministic checks (counts, min/max dates, key IDs).
- Compare actual vs expected and report mismatches.

7. Document run details.
- Record start/end scope, commands run, failures, fixes, and final verification.
- Include any non-file system changes (extensions enabled, package installs, data reconciliations).

## Reusable command templates

### Ordered migration loop with strict error classification
```bash
for f in supabase/migrations/*.sql; do
  out=$(psql "$DATABASE_URL" -v ON_ERROR_STOP=0 -f "$f" 2>&1 || true)
  if grep -q "ERROR:" <<<"$out"; then
    non_allowed=$(grep "ERROR:" <<<"$out" | grep -v "already exists" || true)
    if [ -n "$non_allowed" ]; then
      echo "$out"
      echo "FATAL in $f" >&2
      exit 1
    fi
    echo "SKIP (already exists only): $f"
  else
    echo "OK: $f"
  fi
done
```

### Seed in dependency order
```bash
psql "$DATABASE_URL" -f seed/import_brands.sql
psql "$DATABASE_URL" -f seed/import_channels.sql
psql "$DATABASE_URL" -f seed/import_kpi_daily.sql
```

### Verification checks
```sql
SELECT 'brands' AS tbl, COUNT(*) FROM brands;
SELECT 'channels' AS tbl, COUNT(*) FROM channels;
SELECT 'kpi_daily' AS tbl, COUNT(*), MIN(date), MAX(date) FROM kpi_daily;
```

## Identity reconciliation pattern (FK-safe)
Use this when migrations/seeds expect a fixed UUID but earlier data used generated IDs.

1. Preserve old parent row under a temporary unique identity (for example slug suffix).
2. Insert canonical parent row with required fixed ID.
3. Update child `brand_id` references in base tables from old ID to canonical ID.
4. Delete legacy parent row.
5. Retry failed child migration/seed.

## Common mistakes
- Running seed files before parent tables or parent rows exist.
- Treating all errors as skippable instead of only `already exists`.
- Continuing after non-skippable errors without a deterministic fix.
- Forgetting extension prerequisites for specialized types (`vector`, etc.).
- Verifying only counts without checking date/key ranges.

## Related skills
- `.agents/skills/migration-patterns.md`
- `.agents/skills/data-quality-and-validation-gates.md`
- `.agents/workflows/add-migration.md`
