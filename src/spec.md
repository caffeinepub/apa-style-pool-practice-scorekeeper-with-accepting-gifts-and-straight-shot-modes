# Specification

## Summary
**Goal:** Restore Internet Identity login persistence across reloads/updates and correct APA Practice to true APA 9-ball Equalizer scoring, tracking, and saved-match summaries.

**Planned changes:**
- Fix the authentication persistence regression so logged-in users remain authenticated across page reloads, route navigation, and routine redeploys until they explicitly log out or the delegation expires (with a clear English “session expired” message when applicable).
- Remove APA UI/logic that treats APA as a “race to X” rack format; update APA Practice start/game screens to use skill level (SL 1–9) and points-to-win targets (SL1=14, SL2=19, SL3=25, SL4=31, SL5=38, SL6=46, SL7=55, SL8=65, SL9=75).
- Add APA 9-ball rack-by-rack scoring capture: per-rack ball points (1–8=1, 9-ball=2), dead balls (0), enforced rack accounting to total 10 points, defensive shots per player, and innings tracking for PPI calculation.
- Add end-of-match results that compute and display APA 20-point match result conversion (12–20 / 0–8) using user-provided SL-specific threshold ranges, and ensure no “race to” terminology appears in results.
- Update persisted match data structures and rendering so APA Practice saved matches store the new APA 9-ball Equalizer fields and Match History/Match Details show APA-relevant summaries; add a conditional backend migration only if required to preserve existing saved matches.
- Update branding elements that imply 8-ball (e.g., header/login “8” badge) so APA mode is clearly 9-ball and all user-facing text remains English.

**User-visible outcome:** Users stay logged in after refreshes, can run an APA 9-ball practice match with correct Equalizer points-to-win, rack-by-rack point capture (including dead balls and defensive shots), see innings and PPI, get proper 20-point match conversion results, and view accurate APA-focused summaries in Match History/Details with updated 9-ball branding.
