# Specification

## Summary
**Goal:** Fix practice match stat calculations in matchup analysis so that Record, Win Rate, and Avg PPI statistics correctly include practice matches when the toggle is ON.

**Planned changes:**
- Remove the "Best 10 of last 20 matches" checkbox from MatchupAnalysisDropdownPlayerStats component
- Modify getFilteredMatches() to return the full opponent dataset (official plus optional practice matches) sorted chronologically without slicing
- Add getMatchOutcomeAndPpi() helper function to extract win/loss/PPI from both official and practice matches
- Update Record and Win Rate calculation to iterate through all matches (official and practice) using the helper function
- Replace single Avg PPI calculation with two separate calculations: "Last 10 Avg PPI" and "Best 10 of last 20 Avg PPI"
- Update the Avg PPI display card to show Last 10 as primary value with two subtext lines: "Last 10" and "Best 10 of last 20: [value]"

**User-visible outcome:** When the "Official + Practice" toggle is ON, the matchup analysis panel displays accurate Record, Win Rate, and Avg PPI statistics that include practice matches. The Avg PPI card shows both "Last 10" and "Best 10 of last 20" values with the same visual style as other stat cards.
