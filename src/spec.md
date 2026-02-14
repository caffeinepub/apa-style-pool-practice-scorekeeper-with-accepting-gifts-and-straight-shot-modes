# Specification

## Summary
**Goal:** Persist each user’s Accepting Gifts object-ball progression across sessions, support resuming in-progress sessions, enforce a 2–7 ball range, and provide reset/override controls for the baseline.

**Planned changes:**
- Add backend persistence for the authenticated user’s Accepting Gifts baseline/current object-ball count and optional in-progress session state (get/set/clear APIs).
- Wire new persistence APIs into the existing React Query data layer so Accepting Gifts restores the last saved baseline (defaulting to 3 if none) and can resume an in-progress session after reload/login.
- Enforce a minimum of 2 object balls (2–7 inclusive) in both frontend inputs/validation and backend validation, while remaining tolerant of older saved data that includes 1.
- Add Start/Game page controls to explicitly set/reset the baseline/current object-ball count (2–7) and persist it immediately; ensure all related UI copy reflects the 2–7 range in English.
- Clear any in-progress session state on match end/save, and update the persisted baseline/current count to the session’s ending object-ball count.

**User-visible outcome:** Returning users see Accepting Gifts pick up where they left off (including resuming mid-session when applicable), can only play within 2–7 object balls, and can manually set/reset the baseline object-ball count for future sessions.
