---
name: hybrid-auth-session-sync
description: Architectural pattern for migrating from mock localStorage sessions to real Supabase Auth while maintaining backward compatibility for legacy components.
---

# Hybrid Auth Session Sync

## When to use this skill
- You are migrating a prototype from "mock login" (localStorage) to Supabase Auth.
- Legacy components still depend on `localStorage.getItem('agentic_session')`.
- You want a central point of truth (Supabase) but need to support existing code during a transition phase.

## Pattern: The manual sync hook

Instead of a deep `AuthContext` wrapper, use a lightweight sync hook in the top-level layout (`ClientLayout.tsx`).

### 1. Synchronization Logic
Upon a successful sign-in or page reload, fetch the user profile from the database and hydrate `localStorage`.

```typescript
// ClientLayout.tsx or a dedicated hook
useEffect(() => {
  const supabase = createClient();
  supabase.auth.getUser().then(({ data }) => {
    if (data?.user) {
      // Fetch profile from our custom users table (via Proxy or PostgREST)
      fetch('/api/users').then(res => res.json()).then(users => {
        const profile = users.find(u => u.id === data.user.id);
        if (profile) {
          const payload = {
            id: profile.id,
            email: profile.email,
            name: profile.name || profile.email.split('@')[0],
            role: profile.role
          };
          const current = localStorage.getItem('agentic_session');
          if (current !== JSON.stringify(payload)) {
            localStorage.setItem('agentic_session', JSON.stringify(payload));
            // Dispatch event for other components to react
            window.dispatchEvent(new Event('sessionUpdated'));
          }
        }
      });
    }
  });
}, []);
```

### 2. Component Reactivity
Components that rely on `agentic_session` should listen for the `sessionUpdated` event or re-read on mount.

```typescript
useEffect(() => {
  const handleUpdate = () => {
    const session = getSession(); // From utils.ts
    setSession(session);
  };
  window.addEventListener('sessionUpdated', handleUpdate);
  return () => window.removeEventListener('sessionUpdated', handleUpdate);
}, []);
```

### 3. Unified Logout
Ensure that both the Supabase session and the `localStorage` session are cleared simultaneously.

```typescript
const handleLogout = async () => {
  const supabase = createClient();
  await supabase.auth.signOut();
  localStorage.removeItem('agentic_session');
  window.location.href = '/login';
};
```

## Advantages
- **Minimal Invasive**: No need to rewrite every single component to use `useAuth()`.
- **Backward Compatible**: Existing prototype logic continues to work.
- **Gradual Migration**: Components can be migrated to direct Auth hooks one by one.

## Common Pitfalls
- **Sync Lag**: The profile might take a few hundred milliseconds to populate after login.
- **Race Conditions**: Multiple sync hooks can cause infinite loops if not careful with the `current !== payload` check.
- **Schema Mismatch**: Ensure the profile fetch (`/api/users`) targets the correct schema (see `supabase-multi-schema-targeting`).

## Related Skills
- `.agents/skills/supabase-multi-schema-targeting.md`
- `.agents/skills/supabase-rbac-capability-mapping.md`
