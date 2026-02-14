# Specification

## Summary
**Goal:** Remember the signed-in user’s primary player APA 9-ball skill level in their profile and use it to auto-fill APA practice match setup.

**Planned changes:**
- Extend the backend `UserProfile` to include an optional APA 9-ball skill level field and persist/return it through the existing profile save/get APIs without breaking existing saved profiles.
- Update the Profile Setup / Edit Profile dialog to display and edit “APA 9-Ball Skill Level (Default)” alongside the name, using existing APA skill level utilities, and save both fields to the user profile.
- Update the APA Practice Start page to default the primary player skill level to the saved profile value when present, while still allowing the user to manually override it.

**User-visible outcome:** Users can set a default APA 9-ball skill level in their profile, and the APA Practice Start page will preselect it automatically (unless the user changes it for that match).
