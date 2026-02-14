# Specification

## Summary
**Goal:** Ensure APA 9-ball rack scoring ends immediately when the 9-ball is made, matching scorekeeper rules.

**Planned changes:**
- When ball 9 is marked as pocketed by either player, automatically mark any remaining unscored balls (1–8) as Dead Ball to complete the rack total.
- After ball 9 is pocketed, lock rack interactions so balls 1–8 cannot be changed and turns cannot be switched unless ball 9 is first unmarked.
- If ball 9 is unmarked, revert any balls that were auto-marked dead solely due to ball 9 being made back to unscored, restoring normal rack editing.
- Add/adjust English UI text to clearly communicate that making the 9-ball ends the rack while preserving existing 9-ball point assignment behavior.

**User-visible outcome:** When a user marks the 9-ball as made, the rack immediately completes (remaining balls become dead and the UI locks); the user can still correct mistakes by unmarking the 9-ball to reopen the rack.
