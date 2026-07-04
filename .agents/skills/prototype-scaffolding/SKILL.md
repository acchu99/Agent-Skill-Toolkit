---
name: Prototype Scaffolding
description: A comprehensive playbook for turning a design doc into a clickable, role-gated, functional prototype.
---

# Prototype Scaffolding Workflow

## Overview
This macro-skill outlines the end-to-end framework for rapidly generating clickable Next.js functional prototypes from design documents. It leverages a robust mock data layer, artificial API latency for loading states, and lightweight client-side Role-Based Access Control (RBAC) to isolate front-end UX validation from backend deployment realities.

## Prerequisites
- A standardized implementation plan detailing routes, mock data shapes, and UI requirements.
- Standard Next.js (App Router) environment.

## Step-by-Step Implementation Guide

### 1. Project Initialization
Scaffold a clean Next.js application without Tailwind if you plan to use a CSS framework like Bootstrap.
```bash
npx create-next-app@latest . --typescript --eslint --tailwind=false --src-dir=false --app --import-alias="@/*"
npm install bootstrap react-bootstrap lucide-react
```

### 2. Mock Data Layer
Before building UI, define your entity interfaces and mock arrays. This prevents scattering placeholder text throughout your components. Link entities using IDs to simulate relational databases.
```typescript
// lib/mock-data.ts
export interface User {
  id: string;
  name: string;
  role: 'admin' | 'operator' | 'viewer';
}

export const mockUsers: User[] = [
  { id: 'u1', name: 'Alice Admin', role: 'admin' },
  { id: 'u2', name: 'Bob Operator', role: 'operator' },
];
```

### 3. Mock Authentication and RBAC Utilities
Create utility functions reading from a mocked JWT session embedded in `localStorage` to selectively render or disable UI components based on user role.
```typescript
// lib/utils.ts
import type { User } from './mock-data';

export function getSession(): User | null {
  if (typeof window === 'undefined') return null;
  const sessionData = localStorage.getItem('mockSession');
  return sessionData ? JSON.parse(sessionData) : null;
}

export function canApprove(role: string): boolean {
  return ['admin', 'operator'].includes(role.toLowerCase());
}
```

Create a login page (`app/login/page.tsx`) that simply sets `localStorage.setItem('mockSession', JSON.stringify(selectedUser))` and redirects.

### 4. Global Layout Shell
Implement the invariant UI frame first.
- Create a `Sidebar` and `Topbar` component.
- Apply these in `app/layout.tsx`. Read the mock session in a `useEffect` to redirect unauthenticated users to `/login`.

### 5. Mock API Routes with Simulated Latency
Zero-dependency prototypes load data instantaneously. Use Route Handlers to inject artificial sleep delays to test loading spinners and UX flow.
```typescript
// app/api/example/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // Simulate network latency (between 400ms and 1200ms)
  const latency = Math.floor(Math.random() * 800) + 400;
  await new Promise(resolve => setTimeout(resolve, latency));

  const body = await request.json();
  return NextResponse.json({ success: true, simulated_delay_ms: latency });
}
```

### 6. Interactive State Simulation in Pages
For mutations (e.g., approving an item), use React `useState` to overlay changes on top of the read-only mock data to give the illusion of database updates during the user session.
```tsx
const [removedItems, setRemovedItems] = useState<Set<string>>(new Set());
const displayData = mockData.filter(item => !removedItems.has(item.id));
```

### 7. Prototype Exit Criteria
This skill is for prototypes. Before treating the result as an operator-facing
control surface, explicitly graduate it.

Graduation checklist:
- replace local-only operational mutations with server-backed routes
- persist shared state to an authoritative database
- add audit entries for real control changes
- remove or rename controls that imply unsupported authority
- replace raw IDs and raw JSON blobs with human-readable renderers
- add contextual operator help for complex screens

Operational controls that must not stay prototype-only:
- approvals
- kill switches
- guardrails
- incidents
- alert policies
- experiments

## Gotchas & Warnings
- **Server vs Client Components:** Using `localStorage` means your components reading the session must be `"use client"`. SSR will not have access to the local storage, which can cause hydration mismatches. Use a `mounted` state check.
- **Client-Side Security:** The RBAC pattern provides zero security. A user can easily edit their `mockSession` role to `admin` in local storage. Do not use this pattern for production.
- **Realistic Data:** Use robust, realistic data for the Mock Data layer. Include edge cases like long strings, null values, or unusual characters to properly stress-test the UI.
- **Prototype Drift:** Local-only state is acceptable for UX validation, but dangerous once operators start trusting the screen. Do not leave prototype mutation paths in place on launchable control surfaces.
