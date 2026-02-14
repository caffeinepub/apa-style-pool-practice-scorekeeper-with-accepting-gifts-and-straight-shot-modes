# Specification

## Summary
**Goal:** Enable saving Official/Real APA Match Log entries by persisting exactly the user-entered form fields (no extra calculations) and displaying them in Match History and Match Details.

**Planned changes:**
- Add backend support to store and retrieve an Official/Real APA match log record type in the existing matchHistory storage and APIs (save, list, fetch, delete), persisting fields exactly as entered.
- Update the Official APA Match Log page Save button to submit the current form state via the existing `useSaveMatch` React Query mutation, replacing the placeholder message with real saving UX (disabled/spinner, English error message).
- Update Match History and Match Details UI to recognize this match type, show a compact English summary in history, and render all saved fields in details without impacting other existing match modes.
- If needed for compatibility, add a conditional backend migration so existing saved matches remain readable after deploy.

**User-visible outcome:** Users can click “Save Match” on the Official APA Match Log form to save the exact inputs, see a confirmation, and then find the saved entry in Match History and open Match Details to view all saved fields in English.
