# Specification

## Summary
**Goal:** Restore the ability to save matches across all supported modes by fixing the underlying regression, aligning frontend/backend schemas (especially Official/Real APA Match Logs), and preventing save UI from getting stuck due to client-side state or backend readiness issues.

**Planned changes:**
- Reproduce and fix the save-match failure in each saving mode (APA Practice, Straight Shot, Accepting Gifts, Official/Real APA Match Log), determining whether the cause is frontend validation/disabled actions, backend traps, or frontend-backend type mismatches.
- Align the backend `ApiMatch.officialApaMatchLogData` shape with what is stored and what the frontend sends (removing any stale/unsupported fields such as `points` if they are no longer collected), and ensure `convertToApiMatch` projects consistent supported fields.
- Ensure Match History and Match Details render correctly for newly saved and previously saved Official/Real APA Match Logs after schema alignment, and that frontend generated types/IDL bindings compile cleanly.
- Harden frontend save flows so save buttons are not left disabled due to stale loading/fetching state, and fail fast with a clear English message when the backend actor/identity is not ready (while allowing saving once ready).
- Fix backend access control so that when `inviteOnlyMode = false`, authenticated users can save and list matches without being blocked by approval/allowlist rules; preserve existing behavior when `inviteOnlyMode = true`.

**User-visible outcome:** Users can successfully save matches in all supported modes and see them appear in Match History; Official/Real APA Match Logs save and display correctly; if saving fails, the app shows a clear English error message (including underlying error text when available), and save buttons recover properly after transient issues.
