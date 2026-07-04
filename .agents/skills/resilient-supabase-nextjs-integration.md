---
name: resilient-supabase-nextjs-integration
description: Best practices for building resilient, crash-proof Next.js applications powered by Supabase, including hydration and query safety.
---

# Resilient Supabase & Next.js Integration

## When to use this skill
- You are integrating Supabase with a Next.js (App Router) application.
- You encounter "Hydration Mismatch" warnings or "400 Bad Request" (invalid UUID) errors.
- You want to ensure the UI remains stable even when database tables are empty or queries fail.

## 1. Hydration Resilience
Browser extensions (e.g., Grammarly, password managers) frequently inject attributes into the `<body>` tag, causing React hydration mismatches in Next.js.

### Pattern: Suppress Warnings on Body
In `app/layout.tsx`, add `suppressHydrationWarning` to both the `<html>` and `<body>` tags.

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
```

## 2. Query Safety (The UUID Guard)
Passing an empty string or invalid identifier to a Supabase `.eq()` filter for a UUID column will trigger a `400 Bad Request` database error.

### Pattern: Pre-fetch Validation
Always validate UUID strings before firing the Supabase query.

```typescript
// lib/api-client.ts
export function isValidUUID(uuid: string | undefined | null): boolean {
  if (!uuid) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export async function getKPIs(brandId: string) {
  let q = supabase.from('kpi_daily').select('*');
  
  if (isValidUUID(brandId)) {
    q = q.eq('brand_id', brandId);
  }
  
  return await q.order('date', { ascending: false });
}
```

## 3. Empty State Resilience
Ensure components handle empty data arrays (`[]`) gracefully to avoid math errors (e.g., division by zero) or Recharts crashes.

### Pattern: Safe Calculations & Formatters
- **Velocity/Change Calculations**: Check that the previous value is non-zero before dividing.
- **Chart Tick Formatters**: Ensure the formatter handles `undefined` or non-string inputs safely.

```tsx
// Use safe change calculation
const change = prevValue === 0 ? 0 : ((currentValue - prevValue) / prevValue) * 100;

// Safe XAxis formatter for Recharts
<XAxis 
  dataKey="date" 
  tickFormatter={d => typeof d === 'string' ? d.slice(5) : ''} 
/>
```

## 4. Context Synchronization
When using global State (e.g., a `BrandContext`), ensure sub-components wait for the context to fully resolve before firing dependant API calls.

### Pattern: `isLoaded` Guard
Expose an `isLoaded` flag from your context to distinguish between "No ID selected" and "Still loading ID from storage".

```tsx
const { activeBrandId, isLoaded } = useBrand();

useEffect(() => {
  if (!isLoaded) return; // Wait for localStorage/auth to sync
  if (!activeBrandId) {
    setLoading(false);
    return;
  }
  loadData();
}, [activeBrandId, isLoaded]);
```
