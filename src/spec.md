# Specification

## Summary
**Goal:** Fix Match History table logic so Official APA rows are detected using existing match-type/mode discrimination, aPPI displays correctly for Official APA only, and “All History” sorting uses a single unified effective timestamp key.

**Planned changes:**
- Reuse the existing match-type/mode discriminator (as used in matchWinLoss.ts, matchHistoryRowModel.ts, and match builders) to identify “Official APA match” rows without adding any new flags/fields.
- Update MatchHistoryTable aPPI column logic to compute/display aPPI only for Official APA rows using the existing official APA aPPI utility with full match-list context; show "—" when aPPI cannot be computed or when the row is not Official APA.
- Ensure the “All History” ordering (and the table view fed by it) sorts strictly by the numeric value from getEffectiveMatchTimestamp(match), descending (newest first), while keeping the Date column display date-only as it is now.

**User-visible outcome:** In Match History, only Official APA matches show an aPPI value (otherwise "—"), and the All tab history list is consistently ordered newest-first using the effective match timestamp while the Date column remains date-only.
