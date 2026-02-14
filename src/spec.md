# Specification

## Summary
**Goal:** Add a fourth mode tile on the Home screen that links to a new blank placeholder page for future official/real APA match logging.

**Planned changes:**
- Update the Home screen mode grid to display four ModeCard tiles, adding a new tile labeled in English as a placeholder for official/real APA match logging.
- Create a new placeholder page component with simple English placeholder text and a clear “Back to Home” navigation option.
- Register a new dedicated TanStack Router route in the app router that renders the placeholder page, and wire the new Home tile to navigate to it.

**User-visible outcome:** The Home screen shows a new 4th mode tile; selecting it opens a blank placeholder page for future real APA match logging with an option to return to Home.
