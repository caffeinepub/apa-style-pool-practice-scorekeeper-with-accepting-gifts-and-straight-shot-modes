# Specification

## Summary
**Goal:** Fix the Official APA Performance Charts so they render reliably (not blank) and add console-only debug taps showing the final per-series data passed into each chart line.

**Planned changes:**
- Update `frontend/src/components/players/ApaAggregateCharts.tsx` to stop using the current merged `dateMap` / single-dataset approach for chart data.
- Build five independent per-series datasets (`ppiSeries`, `appiSeries`, `yourPointsSeries`, `opponentPointsSeries`, `defensiveShotsSeries`), each containing only points with a valid x-axis date and a valid numeric y-value for that specific metric.
- Render each metric as its own `<Line>` so missing/invalid values in one metric do not suppress other lines; keep existing chart sections and English legend labels (PPI, aPPI, Your Points, Opponent Points, Defensive Shots).
- Add console-only debug logs in `frontend/src/components/players/ApaAggregateCharts.tsx` immediately before each series array is passed into its corresponding `<Line>`; do not add any on-screen debug UI and do not change existing debug logging in `frontend/src/lib/apa/apaAggregateStats.ts`.

**User-visible outcome:** The Official APA Performance Charts no longer appear fully blank when at least one metric has valid data, and developers can inspect the exact per-series arrays in the browser console right before they are rendered.
