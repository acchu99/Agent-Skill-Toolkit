---
name: supabase-db-cli-tooling
description: Standard way for agents to communicate with Supabase Postgres using psql, pg_dump, and perl, with Homebrew libpq PATH fallback and safe execution defaults
---

# Supabase DB CLI Tooling

## When to use this skill
- You need direct SQL access to Supabase Postgres from an agent/session.
- You need schema/data export operations (`pg_dump`) for analysis or migration workflows.
- You need deterministic SQL text rewrites (for example schema remapping) using `perl`.

## Required modules/tools
- `psql` for query and script execution.
- `pg_dump` for schema/data extraction.
- `perl` for robust SQL text rewrite operations.
- Environment variable: `DATABASE_URL` (direct Postgres connection string, not REST URL).

## Standard bootstrap (must run first)
```bash
set -euo pipefail

# Homebrew libpq fallback (macOS)
if [ -f "/opt/homebrew/opt/libpq/bin/psql" ] && [ -f "/opt/homebrew/opt/libpq/bin/pg_dump" ]; then
  export PATH="/opt/homebrew/opt/libpq/bin:$PATH"
fi

# Load project env
set -a
source .env
set +a

# Validate required inputs/tools
[ -n "${DATABASE_URL:-}" ]
command -v psql >/dev/null
command -v pg_dump >/dev/null
command -v perl >/dev/null
```

## Communication patterns

### 1) Read/query pattern (safe default)
```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -At -F $'\t' -c "SELECT now();"
```

### 2) Execute SQL file
```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f path/to/file.sql
```

### 3) Execute inline multi-statement SQL
```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
BEGIN;
-- statements
COMMIT;
SQL
```

### 4) Dump schema/data for processing
```bash
pg_dump "$DATABASE_URL" --schema=public --schema-only --no-owner --no-privileges > /tmp/public_schema.sql
pg_dump "$DATABASE_URL" --schema=public --data-only   --no-owner --no-privileges > /tmp/public_data.sql
```

### 5) Deterministic SQL rewrite with perl
```bash
perl -i -pe 's/\bpublic\./dev./g' /tmp/public_schema.sql
```

## Error-handling standards
- Always use `set -euo pipefail` in shell wrappers.
- Always pass `-v ON_ERROR_STOP=1` to `psql` unless intentionally collecting non-fatal errors.
- Validate connectivity first:
```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -At -c 'SELECT 1;'
```
- Fail fast on missing `DATABASE_URL` or missing CLI dependencies.
- Print stage-aware errors in scripts (for example `ERROR (apply_post_data): ...`).

## Security and safety rules
- Never print full `DATABASE_URL` in logs.
- Prefer explicit target schema qualification (`public.table`, `dev.table`).
- Wrap bulk writes in transactions when feasible.
- For destructive operations (`DROP SCHEMA ... CASCADE`), log intent clearly before executing.

## Verification baseline after writes
- Table parity (if cloning/mirroring):
```sql
SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE';
SELECT count(*) FROM information_schema.tables WHERE table_schema='dev'    AND table_type='BASE TABLE';
```
- Row parity on key tables:
```sql
SELECT count(*) FROM public.brands;
SELECT count(*) FROM dev.brands;
```
- Constraint/index parity as needed for the workflow.

## Common mistakes
- Using Supabase REST URL instead of direct Postgres `DATABASE_URL`.
- Forgetting Homebrew `libpq` PATH fallback, then failing to find `psql`/`pg_dump`.
- Running `psql` without `ON_ERROR_STOP`, causing partial execution surprises.
- Global text replacement in SQL dumps without preserving extension-owned type references.

## Related skills
- `.agents/skills/live-supabase-migration-and-seeding.md`
- `.agents/skills/migration-patterns.md`
