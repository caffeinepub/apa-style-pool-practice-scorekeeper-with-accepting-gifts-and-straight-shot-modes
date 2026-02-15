# Straight Shot (20-Shot Game) Spot Check

This checklist ensures the Straight Shot game remains untouched and functional after APA Practice changes.

## Manual QA Steps

1. **Start a Session**
   - Navigate to Home → Straight Shot
   - Enter player name
   - Optionally add notes
   - Click "Start Session"
   - Verify session starts successfully

2. **Enter Total Shots**
   - Enter a number in the "Total Shots" field (e.g., 18, 20, 22)
   - Verify the Win/Loss badge updates correctly:
     - ≤20 shots = Win (green)
     - >20 shots = Loss (red)

3. **Save Session**
   - Click "End & Save Session"
   - Confirm in the dialog
   - Verify success toast appears
   - Verify navigation to Match History

4. **View in History**
   - Navigate to Match History
   - Filter to "Straight" tab
   - Verify the saved session appears
   - Click to view details
   - Verify all data displays correctly (shots, Win/Loss, notes)

## Expected Behavior

- All interactions should work smoothly
- No console errors
- Win/Loss calculation based on 20-shot threshold
- Data persists correctly
- Moving average displays on start screen (last 10 sessions)

## Pass Criteria

✅ All 4 steps complete without errors
✅ Data saves and displays correctly
✅ Win/Loss logic works as expected
✅ No changes to Straight Shot code files
