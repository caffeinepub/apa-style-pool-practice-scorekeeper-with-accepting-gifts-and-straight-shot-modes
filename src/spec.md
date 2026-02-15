# Specification

## Summary
**Goal:** Correct and complete Official APA metrics by adding Official APA aPPI, ensuring match-history derived fields populate for APA matches, and fixing Official APA Win% to use a last-20 match window.

**Planned changes:**
- Compute and expose an Official APA aPPI value wherever Official APA match metrics are rendered, reusing any existing expected-PPI/aPPI lookup logic if it already exists; otherwise set aPPI = PPI (no new tables or hardcoded lookup values).
- Update Official APA Match Details to render an `aPPI:` line directly under `PPI:` in the Official APA section, showing a formatted number when available or `—` when not.
- Populate Match History table derived columns for APA matches (at minimum Official APA match logs) so PPI, aPPI, Rolling 10/20, APA 10/20, Wins/Losses, and Win % render as values when inputs exist (and remain `—` for non-APA drill modes).
- Fix Official APA Win% computation to use up to the 20 most recent Official APA matches by effective match date (excluding unknown outcomes from the denominator), without changing charts.

**User-visible outcome:** In match details and match history, Official APA rows show aPPI under PPI and derived APA fields populate when data exists; Official APA Win% on Stats reflects the last 20 Official APA matches (or fewer if less exist).
