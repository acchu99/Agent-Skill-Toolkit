# Next.js App Router Performance Skill

## Description
Best practices for high-performance frontend development using Next.js App Router and React Server Components.

## Instructions
When building or refactoring pages:
1.  **Server Components First**: Default to Server Components for data fetching to reduce client-side bundle size.
2.  **Client Boundaries**: Use `"use client"` sparingly and only at the leaves of the component tree for interactivity.
3.  **Data Fetching**: Use the native `fetch` with Next.js caching and revalidation strategies rather than third-party libraries where possible.
4.  **Suspense & Streaming**: Implement `loading.tsx` and custom `Suspense` boundaries to improve perceived performance during data loads.
5.  **Route Groups**: Use `(group)` folders to organize routes without affecting the URL path.

## Core Files
- `src/pages/` (Note: MyApp is currently hybrid/Pages router, transition to App Router should follow these rules).
