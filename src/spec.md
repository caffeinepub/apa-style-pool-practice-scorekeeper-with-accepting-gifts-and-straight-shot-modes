# Specification

## Summary
**Goal:** Correct APA 9-Ball Practice gameplay flow and UI by preserving turn across racks, showing dead-ball totals, ensuring correct innings timing, and preventing “Connecting...” save states from getting stuck.

**Planned changes:**
- Preserve the active player when completing a rack and starting the next rack, while resetting rack-scoped states (ball states, defensive-shot counters, rack-scoped dead bookkeeping).
- Display the match’s accumulated dead-ball total on the APA Practice gameplay screen under/adjacent to the innings line with clear English labeling (defaults to 0 when none).
- Ensure innings increment only when the active player changes from Player 2 back to Player 1, and do not increment on Player 1 → Player 2 turnover; keep innings consistent across racks.
- Update match-complete save flow to avoid being permanently stuck on “Connecting...”; add an inline English message plus a user-invokable “Retry connection” action when the backend actor isn’t ready, and fail fast with a clear error if save is attempted while not ready.
- Update Edit Profile dialog save flow to avoid being permanently stuck on “Connecting...”; add an inline English message plus “Retry connection” action when the backend actor isn’t ready, and keep the dialog usable with clear errors until the actor is available.

**User-visible outcome:** In APA 9-Ball Practice, the correct player continues after completing a rack, dead balls are shown near innings, innings count updates at the right time, and save buttons on match completion and profile editing no longer get stuck on “Connecting...” and provide clear retry/error feedback when connection isn’t ready.
