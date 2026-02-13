# Specification

## Summary
**Goal:** Build a pool practice scorekeeper app with three modes (APA Practice, Accepting Gifts, Straight Shot) plus match history, including persistence and a cohesive non-blue/purple visual theme.

**Planned changes:**
- Create core navigation and screens: Home (mode selection + Match History), and per-mode Start/New Game + In-Progress Game screens.
- Implement backend persistence with a unified game record model: mode, date/time, player names, optional notes, and a mode-specific scoring payload.
- Build APA Practice scoring flow: enter players + match target, adjust scores (increment/decrement), record per-visit/inning events in a simple log, end game and save summary.
- Add Accepting Gifts mode: rules display in-app, game creation, in-progress tracking, completion saving, and scoring logic per user-provided rules.
- Add Straight Shot mode: game creation, in-progress metric tracking with running summary, completion saving, and history summary (tracked fields adjustable after clarification).
- Implement Match History: list in reverse-chronological order, filter by mode/All, compact summary cards, open read-only details view, and delete a saved game.
- Apply consistent UI styling across screens (typography, spacing, buttons, cards, headers) with a cohesive palette that is not primarily blue/purple.

**User-visible outcome:** Users can start and track pool practice games in APA Practice, Accepting Gifts, or Straight Shot modes, view rules for Accepting Gifts, save completed games, browse/filter past games in Match History, open details, and delete records.
