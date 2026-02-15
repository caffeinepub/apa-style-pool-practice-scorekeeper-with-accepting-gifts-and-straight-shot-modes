# Version 48 ModeCard Resume Button Order Change

## Summary
This document describes a minimal UI-only change to the ModeCard component button ordering.

## Files Modified
- `frontend/src/components/navigation/ModeCard.tsx`

## Change Description
The Resume Game button has been moved to render **below** the Start New Game button when an in-progress session exists.

### Before
1. Resume Game (when available)
2. Start New Game

### After
1. Start New Game
2. Resume Game (when available)

## What Was NOT Changed
The following functionality remains completely unchanged:

- **sessionStorage keys**: All session keys (`APA_PRACTICE_SESSION`, `ACCEPTING_GIFTS_SESSION`, `STRAIGHT_SHOT_SESSION`) remain the same
- **Resume visibility logic**: The `hasInProgressSession(...)` check and conditional rendering logic is unchanged
- **Navigation targets**: Both buttons navigate to the same routes as before (`path` and `resumePath` props)
- **Button labels**: "Start New Game" and "Resume Game" text remains the same
- **Button variants**: The styling logic (outline vs default) is preserved
- **Session save/load logic**: No changes to how sessions are saved, loaded, or cleared
- **Connection/actor logic**: No changes to backend communication or actor initialization
- **Gameplay logic**: No changes to any game mode scoring, rules, or state management

## Purpose
This change improves the user experience by presenting the primary action (Start New Game) first, with the Resume option as a secondary action below it.

## Testing Checklist
- [ ] Home page displays mode cards correctly
- [ ] When no session exists, only "Start New Game" button is shown
- [ ] When a session exists, "Start New Game" appears first, "Resume Game" appears second
- [ ] Clicking "Start New Game" navigates to the correct start page
- [ ] Clicking "Resume Game" navigates to the correct in-progress page
- [ ] All three modes (APA Practice, Accepting Gifts, Straight Shot) display buttons in correct order
