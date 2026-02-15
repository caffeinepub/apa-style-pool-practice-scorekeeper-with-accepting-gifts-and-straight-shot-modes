import { useState } from 'react';

type Player = 'A' | 'B';

interface InningFlowState {
  activePlayer: Player;
  sharedInnings: number;
  currentInningHasBalls: boolean;
}

interface InitialState {
  startingPlayer?: Player;
  initialInnings?: number;
}

export function useApaInningFlow(init?: InitialState) {
  const startingPlayer = init?.startingPlayer ?? 'A';
  const initialInnings = init?.initialInnings ?? 0;

  const [state, setState] = useState<InningFlowState>({
    activePlayer: startingPlayer,
    sharedInnings: initialInnings,
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
      // Only increment shared innings when Player B ends their turn (switching back to A)
      const shouldIncrementInnings = prev.activePlayer === 'B';
      
      return {
        activePlayer: prev.activePlayer === 'A' ? 'B' : 'A',
        sharedInnings: shouldIncrementInnings ? prev.sharedInnings + 1 : prev.sharedInnings,
        currentInningHasBalls: false,
      };
    });
  };

  const resetRack = (preserveActivePlayer?: Player, preserveInnings?: number) => {
    setState({
      activePlayer: preserveActivePlayer ?? startingPlayer,
      sharedInnings: preserveInnings ?? 0,
      currentInningHasBalls: false,
    });
  };

  // Helper to compute final innings at rack completion
  const getFinalSharedInnings = () => {
    // If active player is B when rack completes, we need to count this final inning
    return state.activePlayer === 'B' ? state.sharedInnings + 1 : state.sharedInnings;
  };

  return {
    activePlayer: state.activePlayer,
    sharedInnings: state.sharedInnings,
    currentInningHasBalls: state.currentInningHasBalls,
    markBallScored,
    markBallUnscored,
    turnOver,
    resetRack,
    getFinalSharedInnings,
  };
}
