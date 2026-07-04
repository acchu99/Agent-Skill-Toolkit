---
description: Steps to create a new Supabase SQL migration
---

# Add a Migration

Follow these steps when adding a new database migration.

## Naming Convention

Migrations are numbered sequentially: `NNN_description.sql`

- Check the highest existing number in `supabase/migrations/`
- Use the next number, zero-padded to 3 digits
- Use snake_case for the description
- Example: `022_agent_memory_indexes.sql`

## Steps

1. **Determine the next migration number**
   // turbo
   ```bash
   ls -1 supabase/migrations/ | tail -5
   ```

2. **Create the migration file**
   - File: `supabase/migrations/NNN_description.sql`

3. **Follow these SQL conventions:**
   - Add a comment header with purpose and dependencies
   - Use `IF NOT EXISTS` for CREATE statements (idempotent)
   - Enable RLS on all new tables: `ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;`
   - Create RLS policies for service_role access at minimum
   - Add indexes for common query patterns
   - Add `created_at` and `updated_at` timestamp columns (with defaults)
   - Use `uuid` for primary keys with `gen_random_uuid()` default

4. **Template:**
   ```sql
   -- Migration: NNN — Description
   -- Dependencies: NNN_previous_migration
   -- Purpose: Brief description of what this migration does

   -- 1. Tables
   CREATE TABLE IF NOT EXISTS {table_name} (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     -- columns here
     created_at TIMESTAMPTZ DEFAULT now(),
     updated_at TIMESTAMPTZ DEFAULT now()
   );

   -- 2. RLS
   ALTER TABLE {table_name} ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "service_role_full_access" ON {table_name}
     FOR ALL USING (auth.role() = 'service_role');

   -- 3. Indexes
   CREATE INDEX IF NOT EXISTS idx_{table_name}_{column}
     ON {table_name}({column});

   -- 4. Functions (if needed)
   CREATE OR REPLACE FUNCTION {function_name}(...)
   RETURNS ... AS $$
   BEGIN
     -- logic
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   ```

5. **Update implementation docs** if this migration relates to a documented phase
   - Link the migration from the relevant `docs/implementation/NN-*.md` file

## Validation

// turbo
```bash
# Check SQL syntax (basic)
cat supabase/migrations/NNN_description.sql | head -5
```

- [ ] File follows naming convention
- [ ] RLS enabled on all new tables
- [ ] Indexes added for query patterns
- [ ] Timestamps included
- [ ] UUIDs used for primary keys
