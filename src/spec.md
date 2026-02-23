# Specification

## Summary
**Goal:** Revert unauthorized UI changes and fix the 9-ball revert guard in APA Pool Scorekeeper.

**Planned changes:**
- Remove the unauthorized '+4' projected score display next to player scores in ApaRackScoringPanel
- Remove the unauthorized 'PPI: 0.00 | Def: 0' live calculation display during active gameplay
- Fix the 9-ball revert guard to allow automatic dead ball revert when clicking the 9-ball

**User-visible outcome:** The scoreboard displays only the actual current scores without projected totals or live PPI calculations during gameplay, and clicking a dead 9-ball automatically reverts it to unscored state.
