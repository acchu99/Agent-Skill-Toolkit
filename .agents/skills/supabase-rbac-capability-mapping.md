---
name: supabase-rbac-capability-mapping
description: Standardized implementation of editable Role-Based Access Control (RBAC) matrices and granular permission management in Supabase.
---

# Supabase RBAC Capability Mapping

## When to use this skill
- You need a granular permission system that admins can manage via the UI.
- Standard RLS (Row Level Security) is insufficient for complex feature-level toggling.
- You are implementing the "Security & Access Control" page for the Command-Center.

## Schema Design

### 1. `roles` Table
Store the available roles and their granular permissions in a `JSONB` or structured column.

```sql
CREATE TABLE develop.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '[]', -- Array of {action: string, allowed: boolean}
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2. `user_roles` Junction
Map user profiles to their assigned role.

```sql
CREATE TABLE develop.user_roles (
  user_id UUID REFERENCES develop.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES develop.roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);
```

### 3. `users` Profile Sync
Ensure the `users` table has a `role` field for quick caching and fetching. Use a trigger on `auth.users` to maintain this.

## Implementation Pattern: The Capability Map

### 1. Permission Check Utility
Abstract the logic to check if a user has a specific permission.

```typescript
// utils.ts
export function hasPermission(role: string, actionName: string): boolean {
  if (role === 'admin') return true; // Global bypass

  // Check locally cached roles with permissions
  const cachedRoles = localStorage.getItem('cachedDbRoles');
  if (cachedRoles) {
    const roles = JSON.parse(cachedRoles);
    const dbRole = roles.find(r => r.name === role);
    if (dbRole?.permissions) {
      const perm = dbRole.permissions.find(p => p.action === actionName);
      return perm?.allowed ?? false;
    }
  }
  return false;
}
```

### 2. UI: The Matrix Editor
In the `RolesPage`, render a matrix where each cell is a toggle for a specific permission action.

```typescript
// RolesPage.tsx snippet
const handleTogglePermission = async (role: RoleData, actionName: string) => {
  const updated = role.permissions.map(p =>
    p.action === actionName ? { ...p, allowed: !p.allowed } : p
  );
  // Persist back to the DB via Proxy
  await updateRole(role.id, { permissions: updated });
};
```

## Security Best Practices
1. **Mutation Protection**: Use API routes to proxy `updateRole` and `updateUserRole` calls. Validate that the requesting user *actually* has the `Manage Roles` or `Manage User Roles` permission before executing the Supabase change.
2. **Global Admin**: Hardcode a bypass for the `admin` role in your `hasPermission` helper to prevent lockouts.
3. **Caching**: Cache a snapshot of common roles in `localStorage` (`cachedDbRoles`) to keep the UI snappy and avoid constant permission re-fetches.
4. **Syncing**: Use a database trigger to automatically populate `user_roles` when a new user signs up (defaulting to `viewer`).

## Common Pitfalls
- **Mismatched Actions**: Typos between the UI action string and the DB permission action string. Support a central `PERMISSION_ACTIONS` constant.
- **Race conditions**: Multiple permission updates at once. Use optimistic UI updates in the matrix.
- **RLS bypassing**: Ensure the `roles` and `user_roles` tables are protected by RLS, allowing only `authenticated` users with `admin` roles to read/write.

## Related Skills
- `.agents/skills/supabase-multi-schema-targeting.md`
- `.agents/skills/hybrid-auth-session-sync.md`
- `.agents/skills/migration-patterns.md`
