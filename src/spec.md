# Specification

## Summary
**Goal:** Make targeted navigation, match-history formatting, table cleanup, locked player-name behavior, and multi-select deletion improvements for Accepting Gifts and Straight Shot without changing unrelated flows.

**Planned changes:**
- Update Accepting Gifts end-of-set flow so the existing “Save & Start Next Match” saves and immediately starts the next match at the next calculated level (using existing progression logic), without changing any other button behaviors.
- Add a “Save & Start Next Match” button to the Straight Shot end-of-session flow that saves and immediately starts a new Straight Shot session, without changing any other existing button behaviors.
- Fix Accepting Gifts match-history notes first-line summary formatting to store only “level played | result” (e.g., “2+8 | 7-4”), while preserving any user-entered notes on subsequent lines.
- Update Match History table columns by renaming “Adjusted PPI” to “aPPI” and removing the “Rolling 10/20” column (header + cells) while keeping all other columns and row rendering intact.
- On Accepting Gifts and Straight Shot start pages, display the logged-in profile name as the player name and prevent editing; ensure created sessions always store the profile name as `playerName`.
- Add a discrete multi-select + “Delete selected” capability to the Match History table with confirmation, deleting the underlying match records via existing delete functionality while keeping the per-row “View” action unchanged.

**User-visible outcome:** Users can chain Accepting Gifts matches correctly, start consecutive Straight Shot sessions via a new button, see cleaner Accepting Gifts history summaries, view a simplified Match History table, always play these drills under their profile name, and bulk-delete selected match history entries with confirmation.
