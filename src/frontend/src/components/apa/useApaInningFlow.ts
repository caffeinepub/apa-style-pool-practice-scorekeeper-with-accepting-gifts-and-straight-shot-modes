import { useState, useCallback } from 'react';

interface ApaInningFlowState {
  activePlayer: 'A' | 'B';
  sharedInnings: number;
  bottomPlayer: 'A' | 'B';
}

interface ApaInningFlowInit {
  startingPlayer?: 'A' | 'B';
  initialInnings?: number;
  bottomPlayer?: 'A' | 'B';
}

export function useApaInningFlow(init?: ApaInningFlowInit) {
  const [state, setState] = useState<ApaInningFlowState>({
    activePlayer: init?.startingPlayer ?? 'A',
    sharedInnings: init?.initialInnings ?? 0,
    bottomPlayer: init?.bottomPlayer ?? 'B',
  });

  const turnOver = useCallback(() => {
    setState(prev => {
      const shouldIncrementInnings = prev.activePlayer === prev.bottomPlayer;
      return {
        ...prev,
        activePlayer: prev.activePlayer === 'A' ? 'B' : 'A',
        sharedInnings: shouldIncrementInnings ? prev.sharedInnings + 1 : prev.sharedInnings,
      };
    });
  }, []);

  const markBallScored = useCallback(() => {
    // No-op: innings are only incremented on turn over
  }, []);

  const markBallUnscored = useCallback((_isLastBall: boolean) => {
    // No-op: innings are only incremented on turn over
  }, []);

  const resetRack = useCallback((newActivePlayer: 'A' | 'B', currentInnings: number) => {
    setState(prev => ({
      ...prev,
      activePlayer: newActivePlayer,
      sharedInnings: currentInnings,
    }));
  }, []);

  const getFinalSharedInnings = useCallback(() => {
    return state.sharedInnings;
  }, [state.sharedInnings]);

  return {
    activePlayer: state.activePlayer,
    sharedInnings: state.sharedInnings,
    turnOver,
    markBallScored,
    markBallUnscored,
    resetRack,
    getFinalSharedInnings,
  };
}
