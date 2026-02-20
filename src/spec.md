# Specification

## Summary
**Goal:** Fix APA Practice end-of-match finalization to prevent accidental resumption and ensure correct score persistence.

**Planned changes:**
- Remove the 'Resume (Undo Accidental Win)' button and its handler from APA Practice
- Remove snapshot/rollback plumbing used exclusively for Resume functionality
- Enforce permanent gameplay stop after 'End Rack' finalizes a winning rack: balls become unclickable, rack scoring panel doesn't render again
- Fix save logic to persist authoritative values without recalculation: use player1TotalScore/player2TotalScore for scores, session.sharedInnings for innings, and sum of defensive shots from racks
- Preserve both totalScore and pointsEarnedRunningTotal fields in buildApaNineBallMatch with the same finalized value

**User-visible outcome:** After completing a winning rack in APA Practice, the match is permanently finalized with no way to resume gameplay. Saved matches persist accurate scores, innings, and defensive shots exactly as finalized during play.
