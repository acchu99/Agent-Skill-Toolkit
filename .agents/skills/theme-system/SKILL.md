---
name: Dark/Light Theme System
description: Framework-independent pattern for dark/light CSS variables with React Context.
---

# CSS Custom Properties Theme System

## Overview
A lightweight but robust approach to theme switching that avoids large CSS-in-JS libraries or Tailwind config complexity. It relies on standard CSS variables (`--var-name`) swapped at the `:root` or `<html>` tier via a `data-theme` attribute, synchronized with `localStorage` and `window.matchMedia`.

## Prerequisites
- React (App Router or Pages Router)

## Step-by-Step Implementation Guide

### 1. The Context Provider (`lib/theme-context.tsx`)
Create a provider that manages the active theme and persists it to local storage. It sets properties directly on `document.documentElement` to allow CSS overrides.
```tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'dark' | 'light';
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({ theme: 'dark', resolvedTheme: 'dark', setTheme: () => {} });

const lightVars: Record<string, string> = {
  '--body-bg': '#f5f6f8',
  '--body-color': '#24292f',
  '--surface-1': '#ffffff',
  '--surface-2': '#f6f8fa',
};

const darkVars: Record<string, string> = {
  '--body-bg': '#0f1117',
  '--body-color': '#e1e4e8',
  '--surface-1': '#161b22',
  '--surface-2': '#1c2128',
};

function applyVars(vars: Record<string, string>) {
  const root = document.documentElement;
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  // Specifically for framework body background overrides
  document.body.style.background = vars['--body-bg'];
  document.body.style.color = vars['--body-color'];
  
  const isLight = vars['--body-bg'] === '#f5f6f8';
  root.setAttribute('data-theme', isLight ? 'light' : 'dark');
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [resolvedTheme, setResolved] = useState<'dark' | 'light'>('dark');

  const resolve = useCallback((t: Theme) => {
    if (t === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return t;
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem('theme', t);
    const r = resolve(t);
    setResolved(r);
    applyVars(r === 'light' ? lightVars : darkVars);
  }, [resolve]);

  useEffect(() => {
    const initial = (localStorage.getItem('theme') as Theme) || 'dark';
    setTheme(initial);

    // Watch for OS-level preference changes
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => { if (initial === 'system') setTheme('system'); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [setTheme]);

  return <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
```

### 2. Global CSS overrides (`globals.css`)
Define the default variables on `:root` and rely on `[data-theme="light"]` attribute selectors to override styles specifically for components that cannot just inherit from the CSS variables (e.g. strict framework overrides or hardcoded structural definitions).

```css
/* Base Dark Theme (Default) */
:root {
  --body-bg: #0f1117;
  --body-color: #e1e4e8;
  --border-color: #2d333b;
}

body {
  background: var(--body-bg) !important;
  color: var(--body-color) !important;
}

/* Base Light Theme Overrides (if required by generic selectors) */
[data-theme="light"] body {
  background: #f5f6f8 !important;
  color: #24292f !important;
}

/* Component specifics utilizing data-theme */
.card {
  background: var(--surface-1);
  border: 1px solid var(--border-color);
}

[data-theme="light"] .card {
  background: #ffffff !important;
  border-color: #d0d7de !important;
}
```

### 3. Consume context
Wrap your `app/layout.tsx` (or root component) in `<ThemeProvider>`. Use `const { theme, setTheme } = useTheme()` anywhere to render a theme toggle UI.

## Gotchas & Warnings
- **Server-Side Rendering (SSR) Flash:** Since `localStorage` is read on the client side, Next.js will initially render the default theme (dark) server-side, causing a brief visual flash if the user's saved preference is light. To fix this robustly, inject a blocking `<script>` tag in the `<head>` to read `localStorage` before the first paint, or use a sophisticated library like `next-themes`.
- **CSS Specificity:** Setting `--body-bg` on `:root` isn't always enough to cleanly override framework defaults (like Bootstrap) due to CSS specificity issues on the `body` tag, which is why the provider explicitly modifies `document.body.style` directly.
