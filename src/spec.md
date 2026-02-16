# Specification

## Summary
**Goal:** Fix Stats → Official APA charts so each series renders independently when valid data exists, and ensure clear legends are shown.

**Planned changes:**
- Update the Official APA → PPI Trend chart to build two independent series datasets: one filtered to numeric PPI points and one filtered to numeric aPPI points, so missing values in one series never prevent the other from rendering.
- Update the Official APA → Match Results chart to build three independent series datasets: Your Points-only, Opponent Points-only, and Defensive Shots-only, so missing values in one series never prevent the others from rendering.
- Ensure both Official APA charts display visible legends with exactly these labels: “PPI”, “aPPI”, “Your Points”, “Opponent Points”, “Defensive Shots”, matching the rendered line colors/markers.
- Keep effective match date as the x-axis basis (existing getEffectiveMatchTimestamp behavior) and harden numeric parsing/coercion in `extractPlayerApaMatches(...)` so chart-consumed values are numbers when valid and null otherwise (avoiding NaN/runtime errors).

**User-visible outcome:** On Stats → Official APA, the PPI Trend and Match Results charts reliably plot any available valid datapoints (even when other fields are missing) and show clear legends for the displayed lines.
