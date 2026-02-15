# Specification

## Summary
**Goal:** Fix the Official/Real APA Match Log save/update flow so it no longer gets stuck on “Connecting…” and users can reliably save matches.

**Planned changes:**
- Update the form’s primary action button enable/disable and label logic to separate “no actor yet (connecting)” from “actor available but fetching” and from “save mutation in progress (saving)”.
- Add an inline, English error state when the backend actor never becomes available, including a user-invokable “Retry connection” action that preserves already-entered form inputs.
- Add a client-side timeout and recovery path for save/update requests that hang, showing an English error message and re-enabling the Save/Update button without clearing the form.
- Verify end-to-end save of Official/Real APA Match Logs in public (invite-only disabled) mode and apply any necessary backend fixes so `saveMatch` completes without traps/deadlocks; ensure failures return errors the frontend can display (not an indefinite “Connecting…” state).

**User-visible outcome:** Logged-in users can save/update an Official/Real APA Match Log without the button staying stuck on “Connecting…”, can retry connection if the backend actor isn’t ready, and get clear errors with a retry option if a save takes too long—while their form inputs remain intact.
