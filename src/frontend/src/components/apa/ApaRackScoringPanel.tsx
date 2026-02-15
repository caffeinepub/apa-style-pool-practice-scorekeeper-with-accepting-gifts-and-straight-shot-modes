import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Plus, AlertCircle, RotateCcw, Shield, Lock } from 'lucide-react';
import { POINTS_PER_RACK } from '../../lib/apa/apaScoring';
import ApaBallButton from './ApaBallButton';
import { useApaInningFlow } from './useApaInningFlow';
import type { BallState } from './apaBallStyles';
import { calculateRackTotals } from './apaBallStyles';

interface RackScoringPanelProps {
  rackNumber: number;
  player1Name: string;
  player2Name: string;
  onRackComplete: (data: {
    player1Points: number;
    player2Points: number;
    deadBalls: number;
    player1Innings: number;
    player2Innings: number;
    player1DefensiveShots: number;
    player2DefensiveShots: number;
  }) => void;
  matchContext?: {
    player1CurrentPoints: number;
    player2CurrentPoints: number;
    player1Target: number;
    player2Target: number;
    matchComplete: boolean;
  };
}

export default function ApaRackScoringPanel({
  rackNumber,
  player1Name,
  player2Name,
  onRackComplete,
  matchContext,
}: RackScoringPanelProps) {
  const [ballStates, setBallStates] = useState<Record<number, BallState>>({});
  const [player1DefensiveShots, setPlayer1DefensiveShots] = useState(0);
  const [player2DefensiveShots, setPlayer2DefensiveShots] = useState(0);
  const [autoDeadBalls, setAutoDeadBalls] = useState<Set<number>>(new Set());
  
  const inningFlow = useApaInningFlow('A');

  const totals = calculateRackTotals(ballStates);
  const isRackComplete = totals.totalAccounted === POINTS_PER_RACK;
  
  // Check if 9-ball is pocketed (by either player)
  const nineBallState = ballStates[9];
  const isNineBallPocketed = nineBallState === 'playerA' || nineBallState === 'playerB';
  const isRackLocked = isNineBallPocketed;
  
  // Check if match completion would be reached with current rack
  const isMatchCompletionImminent = matchContext && !matchContext.matchComplete && (
    matchContext.player1CurrentPoints + totals.playerAPoints >= matchContext.player1Target ||
    matchContext.player2CurrentPoints + totals.playerBPoints >= matchContext.player2Target
  );
  
  const error = totals.totalAccounted > POINTS_PER_RACK 
    ? `Too many points! Remove ${totals.totalAccounted - POINTS_PER_RACK} point${totals.totalAccounted - POINTS_PER_RACK > 1 ? 's' : ''}.`
    : totals.totalAccounted < POINTS_PER_RACK
    ? `Need ${POINTS_PER_RACK - totals.totalAccounted} more point${POINTS_PER_RACK - totals.totalAccounted > 1 ? 's' : ''}.`
    : null;

  // Auto-dead logic: when 9-ball is pocketed, mark remaining unscored balls as dead
  useEffect(() => {
    if (isNineBallPocketed) {
      // 9-ball is pocketed - auto-mark remaining unscored balls 1-8 as dead
      const unscoredBalls = [1, 2, 3, 4, 5, 6, 7, 8].filter(ball => !ballStates[ball]);
      if (unscoredBalls.length > 0) {
        setBallStates(prev => {
          const updated = { ...prev };
          unscoredBalls.forEach(ball => {
            updated[ball] = 'dead';
          });
          return updated;
        });
        setAutoDeadBalls(new Set(unscoredBalls));
      }
    } else if (!isNineBallPocketed && autoDeadBalls.size > 0) {
      // 9-ball was unmarked - revert auto-dead balls back to unscored
      setBallStates(prev => {
        const updated = { ...prev };
        autoDeadBalls.forEach(ball => {
          if (updated[ball] === 'dead') {
            delete updated[ball];
          }
        });
        return updated;
      });
      setAutoDeadBalls(new Set());
    }
  }, [isNineBallPocketed]);

  const handleBallClick = (ballNumber: number) => {
    // If match is complete, disable all interactions
    if (matchContext?.matchComplete) {
      return;
    }

    // If rack is locked and this is not ball 9, do nothing
    if (isRackLocked && ballNumber !== 9) {
      return;
    }

    setBallStates(prev => {
      const currentState = prev[ballNumber] || 'unscored';
      const activePlayerState = inningFlow.activePlayer === 'A' ? 'playerA' : 'playerB';
      
      if (currentState === 'unscored') {
        // Mark as scored by active player
        inningFlow.markBallScored();
        return { ...prev, [ballNumber]: activePlayerState };
      } else if (currentState === activePlayerState) {
        // Unmark (back to unscored)
        const ballsForActivePlayer = Object.entries(prev).filter(
          ([_, state]) => state === activePlayerState
        ).length;
        inningFlow.markBallUnscored(ballsForActivePlayer === 1);
        const newStates = { ...prev };
        delete newStates[ballNumber];
        return newStates;
      } else if (currentState === 'dead') {
        // Allow unmarking dead balls (including auto-dead ones)
        if (autoDeadBalls.has(ballNumber)) {
          setAutoDeadBalls(prevSet => {
            const newSet = new Set(prevSet);
            newSet.delete(ballNumber);
            return newSet;
          });
        }
        const newStates = { ...prev };
        delete newStates[ballNumber];
        return newStates;
      } else {
        // Cycle through states: unscored -> active player -> dead -> unscored
        if (currentState === 'playerA' || currentState === 'playerB') {
          return { ...prev, [ballNumber]: 'dead' };
        }
      }
      return prev;
    });
  };

  const handleTurnOver = () => {
    // If match is complete, disable all interactions
    if (matchContext?.matchComplete) {
      return;
    }

    inningFlow.turnOver();
  };

  const handleDefensiveShot = (player: 'A' | 'B') => {
    // If match is complete, disable all interactions
    if (matchContext?.matchComplete) {
      return;
    }

    if (player === 'A') {
      setPlayer1DefensiveShots(prev => prev + 1);
    } else {
      setPlayer2DefensiveShots(prev => prev + 1);
    }
  };

  const handleReset = () => {
    // If match is complete, disable all interactions
    if (matchContext?.matchComplete) {
      return;
    }

    setBallStates({});
    setPlayer1DefensiveShots(0);
    setPlayer2DefensiveShots(0);
    setAutoDeadBalls(new Set());
    inningFlow.reset();
  };

  const handleComplete = () => {
    // If match is complete, disable all interactions
    if (matchContext?.matchComplete) {
      return;
    }

    if (!isRackComplete) return;

    // Count the active player's current inning (they're still at the table when rack completes)
    const player1FinalInnings = inningFlow.activePlayer === 'A' 
      ? inningFlow.playerAInnings + 1 
      : inningFlow.playerAInnings;
    const player2FinalInnings = inningFlow.activePlayer === 'B' 
      ? inningFlow.playerBInnings + 1 
      : inningFlow.playerBInnings;

    onRackComplete({
      player1Points: totals.playerAPoints,
      player2Points: totals.playerBPoints,
      deadBalls: totals.deadBallPoints,
      player1Innings: player1FinalInnings,
      player2Innings: player2FinalInnings,
      player1DefensiveShots,
      player2DefensiveShots,
    });

    // Reset for next rack
    setBallStates({});
    setPlayer1DefensiveShots(0);
    setPlayer2DefensiveShots(0);
    setAutoDeadBalls(new Set());
    inningFlow.reset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Rack {rackNumber} Scoring</span>
          {isRackLocked && (
            <Badge variant="secondary" className="gap-1">
              <Lock className="h-3 w-3" />
              Locked
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {matchContext?.matchComplete && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Match is complete. Scoring is disabled.
            </AlertDescription>
          </Alert>
        )}

        {isMatchCompletionImminent && !matchContext?.matchComplete && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Completing this rack will end the match!
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Active Player:</span>
            <Badge variant={inningFlow.activePlayer === 'A' ? 'default' : 'secondary'}>
              {inningFlow.activePlayer === 'A' ? player1Name : player2Name}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="font-medium">{player1Name}</p>
              <p className="text-muted-foreground">Points: {totals.playerAPoints}</p>
              <p className="text-muted-foreground">Innings: {inningFlow.playerAInnings}</p>
              <p className="text-muted-foreground">Defensive: {player1DefensiveShots}</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">{player2Name}</p>
              <p className="text-muted-foreground">Points: {totals.playerBPoints}</p>
              <p className="text-muted-foreground">Innings: {inningFlow.playerBInnings}</p>
              <p className="text-muted-foreground">Defensive: {player2DefensiveShots}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Balls (1-9)</span>
            <span className="text-sm text-muted-foreground">
              {totals.totalAccounted} / {POINTS_PER_RACK} points
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(ball => (
              <ApaBallButton
                key={ball}
                ballNumber={ball}
                state={ballStates[ball] || 'unscored'}
                onClick={() => handleBallClick(ball)}
                disabled={matchContext?.matchComplete || (isRackLocked && ball !== 9)}
              />
            ))}
          </div>

          {error && (
            <Alert variant={totals.totalAccounted > POINTS_PER_RACK ? 'destructive' : 'default'}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleTurnOver}
            disabled={matchContext?.matchComplete}
          >
            Turn Over
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleDefensiveShot('A')}
            disabled={matchContext?.matchComplete}
          >
            <Shield className="mr-1 h-3 w-3" />
            {player1Name} Defensive
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleDefensiveShot('B')}
            disabled={matchContext?.matchComplete}
          >
            <Shield className="mr-1 h-3 w-3" />
            {player2Name} Defensive
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReset}
            disabled={matchContext?.matchComplete}
          >
            <RotateCcw className="mr-1 h-3 w-3" />
            Reset Rack
          </Button>
        </div>

        <Button 
          onClick={handleComplete} 
          disabled={!isRackComplete || matchContext?.matchComplete}
          className="w-full gap-2"
        >
          <Plus className="h-4 w-4" />
          Complete Rack {rackNumber}
        </Button>
      </CardContent>
    </Card>
  );
}
