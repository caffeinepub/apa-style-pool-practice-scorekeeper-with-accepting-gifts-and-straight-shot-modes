import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, AlertCircle, RotateCcw, Shield, Lock } from 'lucide-react';
import { POINTS_PER_RACK } from '../../lib/apa/apaScoring';
import ApaBallButton from './ApaBallButton';
import { useApaInningFlow } from './useApaInningFlow';
import type { BallState } from './apaBallStyles';
import { calculateRackTotals, getBallValue } from './apaBallStyles';

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
    activePlayer: 'A' | 'B';
    sharedInnings: number;
  }) => void;
  onLiveRackUpdate?: (data: {
    player1Points: number;
    player2Points: number;
  }) => void;
  matchContext?: {
    player1CurrentPoints: number;
    player2CurrentPoints: number;
    player1Target: number;
    player2Target: number;
    matchComplete: boolean;
    activePlayer?: 'A' | 'B';
    sharedInnings?: number;
  };
}

export default function ApaRackScoringPanel({
  rackNumber,
  player1Name,
  player2Name,
  onRackComplete,
  onLiveRackUpdate,
  matchContext,
}: RackScoringPanelProps) {
  const [ballStates, setBallStates] = useState<Record<number, BallState>>({});
  const [player1DefensiveShots, setPlayer1DefensiveShots] = useState(0);
  const [player2DefensiveShots, setPlayer2DefensiveShots] = useState(0);
  const [defensiveActive, setDefensiveActive] = useState(false);
  const [autoDeadBallsNinePocketed, setAutoDeadBallsNinePocketed] = useState<Set<number>>(new Set());
  const [autoDeadBallsMatchImminent, setAutoDeadBallsMatchImminent] = useState<Set<number>>(new Set());
  
  const inningFlow = useApaInningFlow({
    startingPlayer: matchContext?.activePlayer ?? 'A',
    initialInnings: matchContext?.sharedInnings ?? 0,
  });

  // Check if 9-ball is pocketed (by either player)
  const nineBallState = ballStates[9];
  const isNineBallPocketed = nineBallState === 'playerA' || nineBallState === 'playerB';
  
  // Calculate base totals with one-away context
  const baseTotals = calculateRackTotals(ballStates, matchContext);
  
  // Check if match would be complete with current live rack points
  const player1WouldReachTarget = matchContext && 
    matchContext.player1CurrentPoints + baseTotals.playerAPoints >= matchContext.player1Target;
  const player2WouldReachTarget = matchContext && 
    matchContext.player2CurrentPoints + baseTotals.playerBPoints >= matchContext.player2Target;
  const isMatchCompletionImminent = matchContext && !matchContext.matchComplete && 
    (player1WouldReachTarget || player2WouldReachTarget);
  
  // FIX: Check if a player WOULD WIN with current rack points WITHOUT the 9-ball being potted
  // This is the condition when the 9-ball should become dead and unclickable
  const canWinWithout9Ball = matchContext && !matchContext.matchComplete && !isNineBallPocketed && (
    (matchContext.player1CurrentPoints + baseTotals.playerAPoints >= matchContext.player1Target) ||
    (matchContext.player2CurrentPoints + baseTotals.playerBPoints >= matchContext.player2Target)
  );

  // Apply auto-dead logic for match completion imminent (exclude ball 9)
  useEffect(() => {
    if (isMatchCompletionImminent) {
      const currentAccounted = baseTotals.totalAccounted;
      if (currentAccounted < POINTS_PER_RACK) {
        // Auto-mark remaining unscored balls as dead to reach 10 points (but never ball 9)
        const newAutoDead = new Set<number>();
        for (let ball = 1; ball <= 8; ball++) {
          if (!ballStates[ball] || ballStates[ball] === 'unscored') {
            newAutoDead.add(ball);
          }
        }
        setAutoDeadBallsMatchImminent(newAutoDead);
      } else {
        setAutoDeadBallsMatchImminent(new Set());
      }
    } else {
      setAutoDeadBallsMatchImminent(new Set());
    }
  }, [isMatchCompletionImminent, baseTotals.totalAccounted, ballStates]);
  
  // Apply auto-dead for 9-ball early pocketing
  const effectiveBallStates = { ...ballStates };
  
  // First apply match-imminent auto-dead (only for balls 1-8)
  if (isMatchCompletionImminent) {
    autoDeadBallsMatchImminent.forEach(ball => {
      if (ball !== 9 && (!effectiveBallStates[ball] || effectiveBallStates[ball] === 'unscored')) {
        effectiveBallStates[ball] = 'dead';
      }
    });
  }
  
  // Then apply 9-ball auto-dead (overrides match-imminent for consistency, only for balls 1-8)
  if (isNineBallPocketed) {
    autoDeadBallsNinePocketed.forEach(ball => {
      if (ball !== 9 && (!effectiveBallStates[ball] || effectiveBallStates[ball] === 'unscored')) {
        effectiveBallStates[ball] = 'dead';
      }
    });
  }

  // FIX: Make 9-ball dead if game WOULD BE won without it (based on current rack points)
  // This overrides the normal constraint that prevents the 9-ball from being dead
  if (canWinWithout9Ball && (!effectiveBallStates[9] || effectiveBallStates[9] === 'unscored')) {
    effectiveBallStates[9] = 'dead';
  }

  const totals = calculateRackTotals(effectiveBallStates, matchContext);
  
  // When match completion is imminent, allow rack completion even if 9-ball is unscored
  // by treating remaining points as implicitly dead for accounting purposes
  const implicitDeadPoints = isMatchCompletionImminent && totals.totalAccounted < POINTS_PER_RACK
    ? POINTS_PER_RACK - totals.totalAccounted
    : 0;
  
  const effectiveTotalAccounted = totals.totalAccounted + implicitDeadPoints;
  const isRackComplete = effectiveTotalAccounted === POINTS_PER_RACK;
  
  // Calculate dead ball count from effective states
  const deadBallCount = Object.values(effectiveBallStates).filter(state => state === 'dead').length;
  
  const isRackLocked = isNineBallPocketed;
  
  const error = totals.totalAccounted > POINTS_PER_RACK 
    ? `Too many points! Remove ${totals.totalAccounted - POINTS_PER_RACK} point${totals.totalAccounted - POINTS_PER_RACK > 1 ? 's' : ''}.`
    : !isMatchCompletionImminent && totals.totalAccounted < POINTS_PER_RACK
    ? `Need ${POINTS_PER_RACK - totals.totalAccounted} more point${POINTS_PER_RACK - totals.totalAccounted > 1 ? 's' : ''} to complete rack.`
    : null;

  // Notify parent of live rack updates (capped at target)
  useEffect(() => {
    if (onLiveRackUpdate && matchContext) {
      const cappedPlayer1Points = Math.min(
        totals.playerAPoints,
        matchContext.player1Target - matchContext.player1CurrentPoints
      );
      const cappedPlayer2Points = Math.min(
        totals.playerBPoints,
        matchContext.player2Target - matchContext.player2CurrentPoints
      );
      onLiveRackUpdate({
        player1Points: Math.max(0, cappedPlayer1Points),
        player2Points: Math.max(0, cappedPlayer2Points),
      });
    } else if (onLiveRackUpdate) {
      onLiveRackUpdate({
        player1Points: totals.playerAPoints,
        player2Points: totals.playerBPoints,
      });
    }
  }, [totals.playerAPoints, totals.playerBPoints, onLiveRackUpdate, matchContext]);

  // Auto-dead logic: when 9-ball is pocketed, track which balls 1-8 should be auto-dead
  useEffect(() => {
    if (isNineBallPocketed) {
      const newAutoDead = new Set<number>();
      for (let ball = 1; ball <= 8; ball++) {
        if (!ballStates[ball] || ballStates[ball] === 'unscored') {
          newAutoDead.add(ball);
        }
      }
      setAutoDeadBallsNinePocketed(newAutoDead);
    } else {
      setAutoDeadBallsNinePocketed(new Set());
    }
  }, [isNineBallPocketed, ballStates]);

  const handleBallClick = (ballNumber: number) => {
    if (matchContext?.matchComplete) return;
    if (isRackLocked && ballNumber !== 9) return;
    if (defensiveActive) return; // Block ball selection when defensive is active
    
    // FIX: Block 9-ball if game WOULD BE won without it
    if (ballNumber === 9 && canWinWithout9Ball) return;

    // Check if adding points would exceed target (EXCEPT for ball 9)
    if (matchContext && !matchContext.matchComplete && ballNumber !== 9) {
      const currentState = ballStates[ballNumber] || 'unscored';
      
      // If transitioning from unscored to scored
      if (currentState === 'unscored') {
        const activePlayerIsA = inningFlow.activePlayer === 'A';
        const currentPlayerMatchPoints = activePlayerIsA ? matchContext.player1CurrentPoints : matchContext.player2CurrentPoints;
        const currentPlayerTarget = activePlayerIsA ? matchContext.player1Target : matchContext.player2Target;
        
        const pointsRemaining = currentPlayerTarget - currentPlayerMatchPoints;
        
        // Calculate what the ball would be worth in this context
        const effectiveBallValue = getBallValue(ballNumber);
        
        // Calculate current rack points for active player
        const currentRackTotals = calculateRackTotals(ballStates, matchContext);
        const currentPlayerRackPoints = activePlayerIsA ? currentRackTotals.playerAPoints : currentRackTotals.playerBPoints;
        
        const wouldExceedTarget = currentPlayerRackPoints + effectiveBallValue > pointsRemaining;
        
        // Block if would exceed target (only for balls 1-8)
        if (wouldExceedTarget) {
          return;
        }
      }
    }

    setBallStates(prev => {
      const current = prev[ballNumber] || 'unscored';
      let next: BallState;

      // Special handling for ball 9: never allow dead state
      if (ballNumber === 9) {
        if (current === 'unscored') {
          next = inningFlow.activePlayer === 'A' ? 'playerA' : 'playerB';
          inningFlow.markBallScored();
        } else if (current === 'playerA' || current === 'playerB') {
          next = 'unscored';
          inningFlow.markBallUnscored(Object.values({ ...prev, [ballNumber]: 'unscored' }).filter(s => s === 'playerA' || s === 'playerB').length === 0);
        } else {
          // Should never reach here, but fallback to unscored
          next = 'unscored';
        }
      } else {
        // Regular balls 1-8: cycle through all states
        if (current === 'unscored') {
          next = inningFlow.activePlayer === 'A' ? 'playerA' : 'playerB';
          inningFlow.markBallScored();
        } else if (current === 'playerA') {
          next = 'dead';
          inningFlow.markBallUnscored(Object.values({ ...prev, [ballNumber]: 'dead' }).filter(s => s === 'playerA' || s === 'playerB').length === 0);
        } else if (current === 'playerB') {
          next = 'dead';
          inningFlow.markBallUnscored(Object.values({ ...prev, [ballNumber]: 'dead' }).filter(s => s === 'playerA' || s === 'playerB').length === 0);
        } else {
          next = 'unscored';
        }
      }

      return { ...prev, [ballNumber]: next };
    });
  };

  const handleDefensiveShotIncrement = (player: 'A' | 'B') => {
    if (matchContext?.matchComplete) return;
    if (player === 'A') {
      setPlayer1DefensiveShots(prev => prev + 1);
    } else {
      setPlayer2DefensiveShots(prev => prev + 1);
    }
    setDefensiveActive(true);
  };

  const handleDefensiveShotDecrement = (player: 'A' | 'B') => {
    if (matchContext?.matchComplete) return;
    if (player === 'A') {
      setPlayer1DefensiveShots(prev => Math.max(0, prev - 1));
    } else {
      setPlayer2DefensiveShots(prev => Math.max(0, prev - 1));
    }
    setDefensiveActive(false);
  };

  const handleTurnOver = () => {
    if (matchContext?.matchComplete) return;
    if (isRackComplete) return; // Disable Turn Over when rack is complete
    
    // Reset defensive active state when turn ends
    setDefensiveActive(false);
    inningFlow.turnOver();
  };

  const handleCompleteRack = () => {
    if (!isRackComplete || matchContext?.matchComplete) return;

    const finalInnings = inningFlow.getFinalSharedInnings();

    // Use effective ball states (with auto-dead applied) for final totals
    const finalTotals = calculateRackTotals(effectiveBallStates, matchContext);

    onRackComplete({
      player1Points: finalTotals.playerAPoints,
      player2Points: finalTotals.playerBPoints,
      deadBalls: deadBallCount,
      player1Innings: finalInnings,
      player2Innings: finalInnings,
      player1DefensiveShots,
      player2DefensiveShots,
      activePlayer: inningFlow.activePlayer,
      sharedInnings: finalInnings,
    });

    // Reset rack-local state while preserving active player and innings
    setBallStates({});
    setPlayer1DefensiveShots(0);
    setPlayer2DefensiveShots(0);
    setDefensiveActive(false);
    setAutoDeadBallsNinePocketed(new Set());
    setAutoDeadBallsMatchImminent(new Set());
    inningFlow.resetRack(inningFlow.activePlayer, finalInnings);
  };

  const handleResetRack = () => {
    if (matchContext?.matchComplete) return;
    setBallStates({});
    setPlayer1DefensiveShots(0);
    setPlayer2DefensiveShots(0);
    setDefensiveActive(false);
    setAutoDeadBallsNinePocketed(new Set());
    setAutoDeadBallsMatchImminent(new Set());
    inningFlow.resetRack(matchContext?.activePlayer ?? 'A', matchContext?.sharedInnings ?? 0);
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
        {/* Active Player & Innings Display */}
        <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Active Player</div>
            <div className="text-lg font-semibold">
              {inningFlow.activePlayer === 'A' ? player1Name : player2Name}
            </div>
          </div>
          <div className="space-y-1 text-right">
            <div className="text-sm text-muted-foreground">Innings</div>
            <div className="text-lg font-semibold">{inningFlow.sharedInnings}</div>
          </div>
        </div>

        {/* Ball Grid */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(ball => {
            const state = effectiveBallStates[ball] || 'unscored';
            const isDisabled = matchContext?.matchComplete || 
              (isRackLocked && ball !== 9) || 
              defensiveActive ||
              (ball === 9 && canWinWithout9Ball);
            const isDead = state === 'dead';
            
            return (
              <ApaBallButton
                key={ball}
                ballNumber={ball}
                state={state}
                onClick={() => handleBallClick(ball)}
                disabled={isDisabled}
                isDead={isDead}
              />
            );
          })}
        </div>

        {/* Rack Totals */}
        <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{player1Name}</span>
            <Badge variant="default" className="text-base">
              {totals.playerAPoints} pts
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{player2Name}</span>
            <Badge variant="default" className="text-base">
              {totals.playerBPoints} pts
            </Badge>
          </div>
          <div className="flex items-center justify-between border-t pt-3">
            <span className="text-sm font-medium">Dead Balls</span>
            <Badge variant="secondary" className="text-base">
              {deadBallCount}
            </Badge>
          </div>
          <div className="flex items-center justify-between border-t pt-3">
            <span className="text-sm font-medium">Total Accounted</span>
            <Badge variant={isRackComplete ? 'default' : 'secondary'} className="text-base">
              {totals.totalAccounted} / {POINTS_PER_RACK}
            </Badge>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Defensive Shots Controls */}
        <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Defensive Shots</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">{player1Name}</div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDefensiveShotDecrement('A')}
                  disabled={player1DefensiveShots === 0 || matchContext?.matchComplete}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="min-w-[2rem] text-center font-semibold">{player1DefensiveShots}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDefensiveShotIncrement('A')}
                  disabled={matchContext?.matchComplete}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">{player2Name}</div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDefensiveShotDecrement('B')}
                  disabled={player2DefensiveShots === 0 || matchContext?.matchComplete}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="min-w-[2rem] text-center font-semibold">{player2DefensiveShots}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDefensiveShotIncrement('B')}
                  disabled={matchContext?.matchComplete}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleTurnOver}
            disabled={matchContext?.matchComplete || isRackComplete}
            className="flex-1"
            variant="outline"
          >
            Turn Over
          </Button>
          <Button
            onClick={handleResetRack}
            disabled={matchContext?.matchComplete}
            variant="ghost"
            size="icon"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <Button
          onClick={handleCompleteRack}
          disabled={!isRackComplete || matchContext?.matchComplete}
          className="w-full"
          size="lg"
        >
          Complete Rack
        </Button>
      </CardContent>
    </Card>
  );
}
