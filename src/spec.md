# Specification

## Summary
**Goal:** Fix the live score update issue in the APA rack scoring panel so that scores update immediately when balls are selected.

**Planned changes:**
- Update the score calculation logic in ApaRackScoringPanel.tsx to trigger immediate re-renders when ball states change
- Ensure playerA and playerB scores reflect ball selections in real-time without requiring additional user actions

**User-visible outcome:** When users click on balls to assign them to players or mark them as dead, both player scores will update instantly on the screen.
