---
name: data-visualization
description: Design and build clear, accurate, accessible charts and dashboards. Covers chart-type selection by data relationship, visual encoding principles, accessible color, removing chartjunk, dashboard layout, and library patterns (Recharts, D3, Plotly, Chart.js, Vega-Lite). Use before writing any charting code or laying out an analytics view.
when_to_use: "When choosing a chart type, encoding data visually, picking chart colors, building a dashboard/analytics view, or writing plotting code (D3, Recharts, Plotly, Chart.js, matplotlib, Vega-Lite). Load ui-ux-pro-max and frontend-design for surrounding layout, accessibility for color/contrast."
allowed-tools: Read, Write, Edit
---

# Data Visualization

> A chart's job is to make a comparison obvious. Pick the chart from the question the reader is asking, not from what looks impressive.

## When to Apply

Read this BEFORE writing the first line of charting code, choosing chart colors, or laying out a dashboard. Applies to any medium: React/Recharts, D3, Plotly, Chart.js, matplotlib/seaborn, Vega-Lite, or hand-authored SVG.

## Step 1: Chart Type From The Question

Choose by the **relationship** you're showing, not by variety:

| The reader asks… | Relationship | Use |
|------------------|--------------|-----|
| How does a value change over time? | Trend | Line (or area for cumulative) |
| How do categories compare? | Comparison | Bar (horizontal if labels are long) |
| What's the part-to-whole split? | Composition | Stacked bar; pie **only** for ≤ 3–4 slices |
| How are two variables related? | Correlation | Scatter (add trend line) |
| How is a single variable distributed? | Distribution | Histogram / box / violin |
| How does a metric vary across two dimensions? | Matrix | Heatmap |
| What's the flow between stages? | Flow | Sankey / funnel |
| Where is it geographically? | Spatial | Choropleth / symbol map |
| What's the single most important number? | KPI | Big-number stat tile + sparkline |

> Default to **bar and line**. They're the most accurately decoded by the human eye. Reach for exotic charts only when the question demands it.

## Step 2: Encoding Principles

Humans decode some visual channels far more accurately than others. Encode your most important variable in the most accurate channel available:

`position > length > angle/slope > area > color hue/intensity`

- **Bar charts must start at zero** — truncating the y-axis exaggerates differences and misleads.
- **Line charts may use a non-zero baseline** when showing change/trend (state it).
- One quantitative variable → one channel. Don't encode the same value with both height *and* color.
- **Order categories meaningfully** (by value, not alphabetically) unless there's a natural order.
- Direct-label lines/bars where possible instead of forcing a legend lookup.

## Step 3: Color (accessible by default)

- **Categorical:** distinct hues, but cap at ~7 series; beyond that, group or use small multiples. Ensure hues are distinguishable in grayscale and for color-blind viewers (avoid red/green as the only distinction).
- **Sequential:** single-hue light→dark for ordered magnitude.
- **Diverging:** two hues from a meaningful midpoint (e.g. below/above target).
- **Don't rely on color alone** — add labels, patterns, or shapes so meaning survives color blindness and grayscale printing.
- Text and key marks must meet contrast (see `accessibility`): ≥ 3:1 for large graphical objects.
- Use a **muted palette with one accent** to spotlight the series that matters; gray out the rest.

## Step 4: Remove Chartjunk

Every pixel that isn't data or a necessary label is noise. Maximize the data-ink ratio:

❌ 3D bars/pie, drop shadows, gradients-for-decoration, heavy gridlines, redundant legends, dual y-axes (usually misleading).
✅ Light/absent gridlines, direct labels, generous whitespace, a clear title that states the takeaway ("Signups grew 3× after launch", not "Signups over time").

## Step 5: Dashboard Layout

- **Inverted pyramid:** most important number top-left (Western reading order); detail below.
- **Group related metrics**; align to a grid; consistent chart sizes.
- **One idea per chart.** A dashboard is many simple charts, not one busy chart.
- **Consistent scales/colors** across charts so a color means the same thing everywhere.
- Provide context on every number: comparison (vs. last period), target, or trend — a number alone isn't insight.
- For interactive dashboards, see `draggable-dashboard` (layout) and `ui-ux-pro-max` (styling).

## Interaction (web)

- **Tooltips** for exact values on hover/focus; keep the chart readable without them.
- **Keyboard + screen-reader access:** provide a data table fallback or `aria-label` summaries; a chart image needs a text alternative (see `accessibility`).
- Don't hide essential information behind hover only — mobile and keyboard users lose it.

## Library Pointers

| Need | Reach for |
|------|-----------|
| React app, standard charts | **Recharts** or **visx** (composable) |
| Full custom / bespoke viz | **D3** (max control, more code) |
| Quick exploratory / scientific | **Plotly**, **matplotlib/seaborn** |
| Declarative spec, portable | **Vega-Lite** |
| Simple canvas charts | **Chart.js** |

Match the library to control needed vs. effort budget. Don't pull in D3 for a bar chart Recharts renders in 10 lines.

## Anti-Patterns

❌ **Truncated bar-chart y-axis** — the classic lie.
❌ **Pie chart with many slices** — angles are hard to compare; use a bar.
❌ **Dual y-axes** — implies correlations that may not exist.
❌ **Rainbow categorical palette** — no hierarchy, poor for color blindness.
❌ **Chart with no takeaway title** — makes the reader do the analysis.
❌ **Color as the only encoding** — fails ~8% of male viewers.

## Quick Checklist

- [ ] Chart type matches the reader's question
- [ ] Bar charts start at zero
- [ ] Categories ordered by value/meaning
- [ ] ≤ ~7 categorical series; palette works in grayscale
- [ ] Meaning survives without color (labels/shapes)
- [ ] Title states the takeaway, not just the axes
- [ ] Text/marks meet contrast; non-hover access provided

## Related Skills

- `ui-ux-pro-max` — chart styling, palettes, and design tokens.
- `frontend-design` — surrounding page layout and hierarchy.
- `accessibility` — contrast, color-blind safety, text alternatives.
- `draggable-dashboard` — interactive dashboard grid/layout.
