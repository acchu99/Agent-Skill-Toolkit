---
name: User Auth UX (Sign Up / Sign In / Sign Out)
description: End-to-end pattern for implementing seamless, production-ready user sign-up, sign-in, and sign-out flows using Supabase Auth in a Next.js (App Router) application with optimistic UI, error handling, and session persistence.
---

# User Auth UX — Sign Up / Sign In / Sign Out

## Overview
This skill defines the standard pattern for adding a complete authentication experience to a Next.js App Router application backed by **Supabase Auth**. It covers the full lifecycle: account creation (sign up), returning user login (sign in), and secure session teardown (sign out). Each flow prioritises perceived performance through optimistic transitions and clear loading/error feedback.

## When to use this skill
- Adding a new authentication surface to a prototype or production app.
- Replacing a mock `localStorage` session (see `prototype-scaffolding.md`) with real Supabase Auth.
- Building brand or tenant-level login pages where a consistent UX pattern is required.

## Prerequisites
- Next.js App Router project (TypeScript).
- Supabase project with Auth enabled.
- Environment variables set:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
  ```
- Install the Supabase client:
  ```bash
  npm install @supabase/supabase-js @supabase/ssr
  ```

---

## Step-by-Step Implementation Guide

### 1. Supabase Client Setup

Create two clients — one for the browser and one for the server (middleware / Server Components).

```typescript
// lib/supabase/client.ts  (browser — use in Client Components and event handlers)
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

```typescript
// lib/supabase/server.ts  (server — use in Server Components, Route Handlers, Middleware)
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch { /* called from a Server Component — harmless */ }
        },
      },
    }
  );
}
```

---

### 2. Middleware — Session Refresh on Every Request

This is critical. Without it, expired sessions are never refreshed and protected routes silently break.

```typescript
// middleware.ts (project root)
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — do NOT remove this call
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');

  if (!user && !isAuthPage) {
    // Unauthenticated — redirect to login, preserving the intended destination
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    // Already authenticated — skip auth pages
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
```

---

### 3. Sign-Up Page

```tsx
// app/signup/page.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SignUpPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = form.get('email') as string;
    const password = form.get('password') as string;

    startTransition(async () => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Redirect back after email confirmation
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
      } else {
        // Email confirmation flow — show success state
        setSuccess(true);
      }
    });
  }

  if (success) {
    return (
      <div className="auth-container">
        <h1>Check your email</h1>
        <p>We sent a confirmation link to your inbox. Click it to activate your account.</p>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <h1>Create account</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" />

        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />

        {error && <p className="auth-error" role="alert">{error}</p>}

        <button type="submit" disabled={isPending} className="auth-btn">
          {isPending ? 'Creating account…' : 'Sign up'}
        </button>
      </form>
      <p>Already have an account? <a href="/login">Sign in</a></p>
    </div>
  );
}
```

---

### 4. Email Confirmation Callback Route Handler

```typescript
// app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const redirectTo = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  // Exchange failed — redirect to error page
  return NextResponse.redirect(`${origin}/login?error=confirmation_failed`);
}
```

---

### 5. Sign-In Page

```tsx
// app/login/page.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Surface server-side errors (e.g. from the callback redirect)
  const urlError = searchParams.get('error');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = form.get('email') as string;
    const password = form.get('password') as string;

    startTransition(async () => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setError(error.message);
        return;
      }

      // Navigate to the originally requested page, or default to dashboard
      const redirectTo = searchParams.get('redirectTo') ?? '/dashboard';
      router.push(redirectTo);
      router.refresh(); // Force Server Components to re-render with new session
    });
  }

  return (
    <div className="auth-container">
      <h1>Sign in</h1>
      {urlError === 'confirmation_failed' && (
        <p className="auth-error" role="alert">Email confirmation failed. Please try again.</p>
      )}
      <form onSubmit={handleSubmit} className="auth-form">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" />

        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" />

        {error && <p className="auth-error" role="alert">{error}</p>}

        <button type="submit" disabled={isPending} className="auth-btn">
          {isPending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p>No account? <a href="/signup">Create one</a></p>
    </div>
  );
}
```

---

### 6. Sign-Out

Sign out is a **server action** — do not call `supabase.auth.signOut()` from a plain client event handler because the server-side session cookie won't be cleared.

```typescript
// app/actions/auth.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
```

Wire it up to any button or menu item:

```tsx
// components/SignOutButton.tsx
'use client';
import { signOut } from '@/app/actions/auth';

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button type="submit" className="sign-out-btn">Sign out</button>
    </form>
  );
}
```

---

### 7. Reading the Current User in Server Components

```typescript
// Example: app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Belt-and-suspenders guard (middleware handles the common case)
  if (!user) redirect('/login');

  return <h1>Welcome, {user.email}</h1>;
}
```

---

### 8. Suggested CSS for Auth Pages

```css
/* Minimal baseline — adapt to the project's design system */
.auth-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  max-width: 380px;
}

.auth-form input {
  padding: 0.6rem 0.9rem;
  border: 1px solid var(--border-color, #d0d7de);
  border-radius: 6px;
  font-size: 0.95rem;
  background: var(--surface-1, #fff);
  color: var(--body-color, #24292f);
}

.auth-btn {
  padding: 0.65rem 1rem;
  border: none;
  border-radius: 6px;
  background: #0070f3;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}

.auth-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-error {
  color: #cf222e;
  font-size: 0.875rem;
  margin: 0;
}
```

---

## Gotchas & Warnings

- **Never use `supabase.auth.getSession()` for access control.** It reads from the cookie without verifying with the Supabase server. Always use `supabase.auth.getUser()` in middleware and Server Components to prevent forged sessions.
- **`router.refresh()` after sign-in is mandatory.** Without it, Server Components (including the layout) still render with the old (unauthenticated) state because Next.js caches them.
- **Sign out must be a Server Action.** Calling `signOut()` purely on the client does not clear the HTTP-only session cookie, leaving the user apparently logged in on server-rendered pages.
- **Middleware matcher scope.** Ensure the matcher excludes static assets and `_next/*` paths, or every asset fetch will incur a Supabase round-trip, significantly slowing page loads.
- **Email confirmation is async.** The sign-up flow transitions to a "check your email" state immediately after calling `signUp`. Do not redirect the user directly to `/dashboard` — they won't have a verified session yet.
- **Password strength.** Enforce a `minLength={8}` at minimum. For production, add a strength meter or use Supabase's built-in password policy settings in the Auth dashboard.

## Related Skills
- `.agents/skills/prototype-scaffolding.md` — mock auth pattern for rapid prototyping before wiring Supabase.
- `.agents/skills/live-supabase-migration-and-seeding.md` — setting up and seeding the Supabase database.
- `.agents/skills/schema-conventions.md` — DB conventions including `auth.users` references.
