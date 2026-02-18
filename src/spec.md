# Specification

## Summary
**Goal:** Restore the Match History date sort toggle and correct per-row running W-L/Win% so it is computed per mode/bucket (excluding unknown outcomes) based on the currently displayed row order.

**Planned changes:**
- Update MatchHistoryTable running W-L and Win% calculations to accumulate only within the current row’s bucket (Official APA, APA Practice, Accepting Gifts, Straight Shot) across the displayed order, excluding unknown outcomes from wins/losses and Win% denominator.
- Restore the existing “Sort by date” toggle behavior in MatchHistoryTable using getEffectiveMatchTimestamp(match), without changing the current default ordering on initial load and without adding new sort UI controls.
- Keep the MatchHistoryTable layout/columns and date-only display unchanged; confine logic changes to frontend/src/components/history/MatchHistoryTable.tsx (plus minimal existing sort-control wiring if required).

**User-visible outcome:** Users can toggle date sorting via the table’s existing sort control, and each row shows correct running W-L and Win% for its own mode/bucket (unknown outcomes excluded), reflecting the current displayed sort order.
