import { useState } from 'react';

type Player = 'A' | 'B';

interface InningFlowState {
  activePlayer: Player;
  playerAInnings: number;
  playerBInnings: number;
  currentInningHasBalls: boolean;
}

export function useApaInningFlow(startingPlayer: Player = 'A') {
  const [state, setState] = useState<InningFlowState>({
    activePlayer: startingPlayer,
    playerAInnings: 0,
    playerBInnings: 0,
    currentInningHasBalls: false,
  });

  const markBallScored = () => {
    setState(prev => ({ ...prev, currentInningHasBalls: true }));
  };

  const markBallUnscored = (wasLastBall: boolean) => {
    if (wasLastBall) {
      setState(prev => ({ ...prev, currentInningHasBalls: false }));
    }
  };

  const turnOver = () => {
    setState(prev => {
      // Always increment innings for the player ending their turn, regardless of whether they scored
      const newPlayerAInnings = prev.activePlayer === 'A' ? prev.playerAInnings + 1 : prev.playerAInnings;
      const newPlayerBInnings = prev.activePlayer === 'B' ? prev.playerBInnings + 1 : prev.playerBInnings;

      return {
        activePlayer: prev.activePlayer === 'A' ? 'B' : 'A',
        playerAInnings: newPlayerAInnings,
        playerBInnings: newPlayerBInnings,
        currentInningHasBalls: false,
      };
    });
  };

  const reset = () => {
    setState({
      activePlayer: startingPlayer,
      playerAInnings: 0,
      playerBInnings: 0,
      currentInningHasBalls: false,
    });
  };

  return {
    activePlayer: state.activePlayer,
    playerAInnings: state.playerAInnings,
    playerBInnings: state.playerBInnings,
    currentInningHasBalls: state.currentInningHasBalls,
    markBallScored,
    markBallUnscored,
    turnOver,
    reset,
  };
}
