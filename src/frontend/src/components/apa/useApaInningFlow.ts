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
      const newInnings = prev.currentInningHasBalls
        ? (prev.activePlayer === 'A' ? prev.playerAInnings + 1 : prev.playerBInnings + 1)
        : (prev.activePlayer === 'A' ? prev.playerAInnings : prev.playerBInnings);

      return {
        activePlayer: prev.activePlayer === 'A' ? 'B' : 'A',
        playerAInnings: prev.activePlayer === 'A' ? newInnings : prev.playerAInnings,
        playerBInnings: prev.activePlayer === 'B' ? newInnings : prev.playerBInnings,
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
