import { useState, useCallback } from 'react';

/**
 * React hook managing shared innings counter for APA 9-Ball matches.
 * 
 * Innings increment logic (APA rules):
 * - An inning is complete when BOTH players have had a turn at the table
 * - The innings counter increments when the bottom player (lag loser) presses "Turn Over"
 * - The bottom player is determined by the lag result and remains constant throughout the match
 * 
 * Turn management:
 * - Active player switches between 'A' and 'B' on each "Turn Over"
 * - Turn state persists across rack boundaries
 * 
 * Rack reset:
 * - resetRack() preserves active player and innings across rack boundaries
 * - This allows the match to continue seamlessly from one rack to the next
 */

interface UseApaInningFlowProps {
  startingPlayer: 'A' | 'B';
  initialInnings: number;
  bottomPlayer: 'A' | 'B';
}

export function useApaInningFlow({ startingPlayer, initialInnings, bottomPlayer }: UseApaInningFlowProps) {
  const [activePlayer, setActivePlayer] = useState<'A' | 'B'>(startingPlayer);
  const [sharedInnings, setSharedInnings] = useState(initialInnings);

  /**
   * Handle Turn Over button press.
   * Switches active player and increments innings when bottom player's turn ends.
   */
  const turnOver = useCallback(() => {
    setActivePlayer((prev) => {
      const nextPlayer = prev === 'A' ? 'B' : 'A';
      
      // Increment innings when bottom player (lag loser) presses "Turn Over"
      // This happens when the current active player is the bottom player
      if (prev === bottomPlayer) {
        setSharedInnings((innings) => innings + 1);
      }
      
      return nextPlayer;
    });
  }, [bottomPlayer]);

  /**
   * Reset rack state while preserving active player and innings.
   * Used when starting a new rack in the same match.
   */
  const resetRack = useCallback((newActivePlayer: 'A' | 'B', newInnings: number) => {
    setActivePlayer(newActivePlayer);
    setSharedInnings(newInnings);
  }, []);

  return {
    activePlayer,
    sharedInnings,
    turnOver,
    resetRack,
  };
}
