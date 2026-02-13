# Specification

## Summary
**Goal:** Revamp the APA 9-ball Practice scoring screen from manual rack inputs to a ball-based, per-inning workflow with automatic innings and in-flow dead ball/defensive-shot controls, while keeping saved match records compatible.

**Planned changes:**
- Replace numeric rack scoring inputs (points/innings) with a per-inning UI that shows balls 1–9 as selectable controls for the current rack; selecting/unselecting balls assigns them to the currently active player for the current inning.
- Add a clear “Turn Over” control that ends the current inning, increments innings for the player whose inning ended, and switches the active player indicator.
- Add in-flow controls to mark dead balls for the rack (count toward 10-point rack accounting but add 0 points) and to record a defensive shot for the currently active player.
- Enforce valid rack completion rules: 9-ball counts as 2 points, 1–8 as 1 point each, and the rack can only complete when exactly 10 rack points are accounted for via player-scored balls plus dead balls.
- Compute the existing per-rack summary data (playerA/playerB points, dead balls, innings, defensive shots) from the new UI so the saved match record shape and Match History/Details remain compatible and unchanged.

**User-visible outcome:** On the APA Practice game screen, the scorekeeper can track each inning by tapping pocketed balls, press “Turn Over” to switch players and automatically advance innings, record dead balls and defensive shots during play, and still finish/save matches with the same match history/details as before.
