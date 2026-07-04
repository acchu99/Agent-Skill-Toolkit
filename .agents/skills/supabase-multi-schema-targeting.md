---
name: supabase-multi-schema-targeting
description: Best practices for targeting and querying non-public Postgres schemas (e.g., develop, staging) in a Supabase environment.
---

# Supabase Multi-Schema Targeting

## When to use this skill
- You need to separate prototype/development data from the `public` schema.
- Your project uses a `develop` or versioned schema for active engineering.
- API calls are returning 404 or empty results despite data existing in a specific schema.

## Key Concepts
Supabase defaults to the `public` schema for all REST (`PostgREST`) and Auth operations. To target another schema, you must explicitly configure both the client and any direct fetch headers.

## Configuration Patterns

### 1. Supabase Client Setup (SSR/Browser)
When using `@supabase/ssr` or `@supabase/supabase-js`, specify the target schema in the initialization options.

```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: { schema: 'develop' } // Target schema here
    }
  );
}
```

### 2. Direct REST / Fetch Calls
If making raw `fetch` calls to the Supabase API, you must include the `Accept-Profile` header to inform PostgREST which schema to use.

```typescript
const response = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
  headers: {
    'apikey': ANON_KEY,
    'Authorization': `Bearer ${ANON_KEY}`,
    'Accept-Profile': 'develop', // Critical for non-public schemas
  }
});
```

### 3. Server-Side Targeting
In middleware or Server Components, ensure the Supabase client or the `headers()` object correctly propagates the schema preference.

## Row Level Security (RLS)
RLS policies are schema-scoped. Ensure that:
1. The schema itself is added to the "Exposed Schemas" list in the Supabase Dashboard (Settings -> API).
2. Permission is granted to the `anon` and `authenticated` roles for the specific schema:
   ```sql
   GRANT USAGE ON SCHEMA develop TO anon, authenticated;
   GRANT ALL ON ALL TABLES IN SCHEMA develop TO anon, authenticated;
   GRANT ALL ON ALL SEQUENCES IN SCHEMA develop TO anon, authenticated;
   ```

## Common Pitfalls
- **Missing Exposed Schema**: PostgREST will ignore the `Accept-Profile` header if the schema isn't in the allowed list.
- **Header Mismatch**: Using `Content-Profile` instead of `Accept-Profile` (the latter is required for GET/POST/PATCH).
- **Client Singleton**: Forgetting that a client singleton might have been initialized with the `public` default.

## Related Skills
- `.agents/skills/live-supabase-migration-and-seeding.md`
- `.agents/skills/migration-patterns.md`
