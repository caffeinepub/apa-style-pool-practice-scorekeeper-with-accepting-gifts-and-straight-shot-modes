# Specification

## Summary
**Goal:** Fix the 9-ball unlock behavior so auto-dead balls revert to unscored state when the 9-ball is unclicked, and resolve the React error #185 when abandoning a practice session.

**Planned changes:**
- Fix ApaRackScoringPanel to revert auto-marked dead balls (balls 2-8) to clickable/unscored state when the 9-ball is unclicked
- Add microtask delay (setTimeout 0ms) between clearPracticeSession() and navigate('/') in PracticeGamePage to prevent state updates on unmounted components

**User-visible outcome:** Users can now click/unclick the 9-ball and see balls 4-8 correctly toggle between dead and unscored states, and can abandon practice sessions without encountering console errors.
