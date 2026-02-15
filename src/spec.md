# Specification

## Summary
**Goal:** Fix APA 9-Ball Practice so a match can be completed immediately when a player reaches their points-to-win target mid-rack, without requiring the 9-ball to be pocketed, while leaving Straight Shot unchanged.

**Planned changes:**
- Update APA 9-Ball Practice rack completion gating so “Complete Rack” becomes enabled when (current match points + current rack live points) reaches/exceeds the target, even if the 9-ball is unscored.
- When completing in the above scenario, finalize the rack cleanly by treating remaining unaccounted rack points as dead for rack accounting (10 points accounted) without placing the 9-ball into a user-visible “Dead Ball” state.
- Add/adjust APA rack-scoring UI messaging in English to clearly explain that the rack can be completed now and remaining balls/points will be treated as dead when match completion is reached mid-rack.
- Ensure no Straight Shot (20-shot game) logic/UI/persistence/copy changes are made (no changes under `frontend/src/pages/straight-shot/`).

**User-visible outcome:** In APA 9-Ball Practice, once either player hits their points-to-win target during live rack entry, the user can immediately complete the rack and proceed to match completion without having to score the 9-ball; after completion, further scoring remains blocked as it is today.
