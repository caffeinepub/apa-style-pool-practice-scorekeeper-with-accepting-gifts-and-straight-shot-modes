# Specification

## Summary
**Goal:** Fix React error #185 infinite render loop by wrapping handleLiveRackUpdate with useCallback.

**Planned changes:**
- Add useCallback to React imports in PracticeGamePage.tsx
- Wrap handleLiveRackUpdate function with useCallback using [session] dependency array

**User-visible outcome:** The practice game page will no longer experience infinite render loops, providing a stable and responsive scoring experience.
