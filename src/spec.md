# Specification

## Summary
**Goal:** Improve visual differentiation and continuity of lines in APA aggregate charts.

**Planned changes:**
- In `frontend/src/components/players/ApaAggregateCharts.tsx`, set explicit Recharts `<Line />` stroke colors and `strokeWidth={2}` for PPI/aPPI Trend (PPI black `#000`, aPPI blue `#2563eb`) and Match Results (Your Points black `#000`, Opponent Points blue `#2563eb`, Defensive Shots purple `#7c3aed`), without changing any data generation or labels.
- In `frontend/src/components/players/ApaAggregateCharts.tsx`, add `connectNulls={true}` to every `<Line />` in both charts.

**User-visible outcome:** The two APA aggregate charts display clearly color-differentiated lines, and lines remain continuous across missing/null values.
