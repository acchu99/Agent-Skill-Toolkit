---
name: Draggable/Resizable Dashboard Widgets
description: Complex feature guide for implementing responsive drag-and-drop dashboards using react-grid-layout with LocalStorage persistence.
---

# Draggable Dashboard Widgets

## Overview
A common requirement for sophisticated web tools and Control Centers is a customizable widget dashboard. This skill outlines how to use the `react-grid-layout` library to achieve draggable and resizable widgets, persisting the user's custom layout directly to `localStorage` so it survives page reloads.

## Prerequisites
- React
- Next.js (optional, but code handles SSR mismatch)
- Installation of `react-grid-layout`:
```bash
npm install react-grid-layout react-resizable
npm install -D @types/react-grid-layout @types/react-resizable
```

## Step-by-Step Implementation Guide

### 1. Import Styles
You MUST import the library styles in your root layout (`app/layout.tsx`) or global CSS file:
```typescript
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
```

### 2. Build the Dashboard Component
Use the `WidthProvider` wrapper to make the layout responsive to container size changes. Define layouts for multiple breakpoints (lg, md, sm) or just let the grid auto-flow for smaller screens.

```tsx
'use client';
import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';

// Wrap Responsive Grid with a width provider for responsive fluid sizing
const ResponsiveGridLayout = WidthProvider(Responsive);

// Define default layout for the desktop breakpoint
const defaultLayouts = {
  lg: [
    // i = key, x/y = grid coordinates, w/h = width/height blocks
    { i: 'widget-health', x: 0, y: 0, w: 4, h: 2 },
    { i: 'widget-approvals', x: 4, y: 0, w: 4, h: 2 },
    { i: 'widget-metrics', x: 8, y: 0, w: 4, h: 4 },
  ],
};

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [layouts, setLayouts] = useState(defaultLayouts);

  useEffect(() => {
    // Only mount after client hydration to avoid React hydration mismatch errors
    setMounted(true);
    
    // Load saved layout on first client render
    const saved = localStorage.getItem('dashboardLayout');
    if (saved) {
      try {
        setLayouts(JSON.parse(saved));
      } catch (e) {
        // Fallback to default on parse error
        console.error("Format error in saved layout", e);
      }
    }
  }, []);

  const onLayoutChange = (currentLayout: Layout[], allLayouts: any) => {
    // Update local state and persist to storage
    setLayouts(allLayouts);
    localStorage.setItem('dashboardLayout', JSON.stringify(allLayouts));
  };

  // SSR prevention guard
  if (!mounted) return <div className="loading-skeleton" style={{ height: 400 }} />;

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={layouts}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
      rowHeight={100}
      onLayoutChange={onLayoutChange}
      draggableHandle=".widget-header" // Important: restricts dragging to the header
      margin={[16, 16]}
    >
      <div key="widget-health" className="widget-card">
        <div className="widget-header">System Health</div>
        <div className="widget-body">All Systems Operational</div>
      </div>
      <div key="widget-approvals" className="widget-card">
        <div className="widget-header">Pending Approvals</div>
        <div className="widget-body">0 items pending</div>
      </div>
      <div key="widget-metrics" className="widget-card">
        <div className="widget-header">Core Metrics</div>
        <div className="widget-body">Revenue: $10,000</div>
      </div>
    </ResponsiveGridLayout>
  );
}
```

### 3. Add Custom CSS
Ensure you give the widgets styling and indicate the grab handle property.

```css
.widget-card {
  background: white;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.widget-header {
  padding: 10px;
  background: #f5f5f5;
  border-bottom: 1px solid #eaeaea;
  font-weight: bold;
  cursor: grab; /* Indicates it can be dragged */
  user-select: none;
}

.widget-header:active {
  cursor: grabbing;
}

.widget-body {
  padding: 15px;
  flex: 1;
  overflow-y: auto;
}
```

## Gotchas & Warnings
- **Hydration Mismatch:** Because `localStorage` is completely unreadable from the server, the initial server HTML will differ from the client HTML if the user has a custom layout saved. You MUST use a `mounted` state guard to delay rendering the grid (or at least applying the custom layout) until hydration completes. Failure to do so creates React rendering errors.
- **Drag Handle Configuration:** Explicitly assign a `draggableHandle` CSS class (like `.widget-header`). If you omit this, clicking *anywhere* in the widget body (e.g. interacting with an inner graph, text input, or button) will unexpectedly trigger the grid layout dragging mechanism, which is a terrible user experience.
