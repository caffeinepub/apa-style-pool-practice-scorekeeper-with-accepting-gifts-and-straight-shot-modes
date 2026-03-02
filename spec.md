# Specification

## Summary
**Goal:** Add a small "Debug" text link in the AppLayout footer that toggles the existing DebugPanel component open and closed.

**Planned changes:**
- Add a small "Debug" text link in the footer of AppLayout, next to or below the copyright line ("© 2026 APA 9-Ball Scorekeeper. Built with ❤️ using caffeine.ai")
- Import the existing `DebugPanel` component from `frontend/src/components/debug/DebugPanel.tsx` into AppLayout
- Add a boolean toggle state in AppLayout to show/hide the DebugPanel when the "Debug" link is clicked
- No other layout, header, nav, or page elements are modified

**User-visible outcome:** A small "Debug" link appears in the footer on all pages. Clicking it opens the DebugPanel showing debug info; clicking again closes it. All existing functionality (gear icon/Edit Profile, bar chart icon, Logout) remains completely unchanged.
