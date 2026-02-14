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
}

export default function ApaRackScoringPanel({
  rackNumber,
  player1Name,
  player2Name,
  onRackComplete,
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
      }
      // If ball is scored by other player or dead, do nothing
      return prev;
    });
  };

  const handleMarkDead = (ballNumber: number) => {
    // If rack is locked, do nothing
    if (isRackLocked) {
      return;
    }

    setBallStates(prev => {
      const currentState = prev[ballNumber] || 'unscored';
      if (currentState === 'unscored') {
        return { ...prev, [ballNumber]: 'dead' };
      } else if (currentState === 'dead') {
        // User is manually unmarking a dead ball
        // If it was auto-marked, remove it from the auto-dead set
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
      }
      return prev;
    });
  };

  const handleDefensiveShot = () => {
    if (inningFlow.activePlayer === 'A') {
      setPlayer1DefensiveShots(prev => prev + 1);
    } else {
      setPlayer2DefensiveShots(prev => prev + 1);
    }
  };

  const handleTurnOver = () => {
    // Disable turn over when rack is locked
    if (isRackLocked) {
      return;
    }
    inningFlow.turnOver();
  };

  const handleCompleteRack = () => {
    if (isRackComplete) {
      onRackComplete({
        player1Points: totals.playerAPoints,
        player2Points: totals.playerBPoints,
        deadBalls: totals.deadBallPoints,
        player1Innings: inningFlow.playerAInnings + (inningFlow.activePlayer === 'A' && inningFlow.currentInningHasBalls ? 1 : 0),
        player2Innings: inningFlow.playerBInnings + (inningFlow.activePlayer === 'B' && inningFlow.currentInningHasBalls ? 1 : 0),
        player1DefensiveShots,
        player2DefensiveShots,
      });
      // Reset for next rack
      setBallStates({});
      setPlayer1DefensiveShots(0);
      setPlayer2DefensiveShots(0);
      setAutoDeadBalls(new Set());
      inningFlow.reset();
    }
  };

  const handleReset = () => {
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
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Select balls pocketed by the active player. Balls 1-8 = 1 point, 9-ball = 2 points. Total must equal {POINTS_PER_RACK} points. Making the 9-ball ends the rack and locks editing until the 9-ball is unmarked.
          </AlertDescription>
        </Alert>

        {/* Rack Locked Warning */}
        {isRackLocked && (
          <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950">
            <Lock className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-900 dark:text-amber-100">
              Rack locked: 9-ball has been made. Unmark the 9-ball to continue editing.
            </AlertDescription>
          </Alert>
        )}

        {/* Active Player Indicator */}
        <div className="rounded-lg border-2 border-emerald-600 bg-emerald-50 p-4 dark:bg-emerald-950">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                Active Player
              </div>
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                {inningFlow.activePlayer === 'A' ? player1Name : player2Name}
              </div>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Inning {(inningFlow.activePlayer === 'A' ? inningFlow.playerAInnings : inningFlow.playerBInnings) + 1}
            </Badge>
          </div>
        </div>

        {/* Ball Grid */}
        <div className="space-y-4">
          <div className="text-center text-sm font-medium text-muted-foreground">
            Select Balls Pocketed
          </div>
          <div className="grid grid-cols-5 gap-4 justify-items-center">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(ballNumber => (
              <ApaBallButton
                key={ballNumber}
                ballNumber={ballNumber}
                state={ballStates[ballNumber] || 'unscored'}
                onClick={() => handleBallClick(ballNumber)}
                disabled={isRackLocked && ballNumber !== 9}
              />
            ))}
          </div>
        </div>

        {/* Dead Ball Controls */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Mark Dead Balls</div>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(ballNumber => {
              const state = ballStates[ballNumber] || 'unscored';
              const isDead = state === 'dead';
              const isUnscored = state === 'unscored';
              return (
                <Button
                  key={ballNumber}
                  variant={isDead ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleMarkDead(ballNumber)}
                  disabled={(!isUnscored && !isDead) || isRackLocked}
                  className={isDead ? 'bg-gray-500 hover:bg-gray-600' : ''}
                >
                  {ballNumber}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Rack Totals */}
        <div className="rounded-lg border p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{player1Name}:</span>
            <span className="font-semibold text-emerald-600">{totals.playerAPoints} pts</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{player2Name}:</span>
            <span className="font-semibold text-blue-600">{totals.playerBPoints} pts</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Dead Balls:</span>
            <span className="font-semibold text-gray-600">{totals.deadBallPoints} pts</span>
          </div>
          <div className="border-t pt-2 flex justify-between">
            <span className="font-medium">Rack Total:</span>
            <span className={`font-bold ${totals.totalAccounted === POINTS_PER_RACK ? 'text-emerald-600' : 'text-amber-600'}`}>
              {totals.totalAccounted} / {POINTS_PER_RACK}
            </span>
          </div>
          {error && (
            <p className="text-xs text-amber-600 text-center">{error}</p>
          )}
        </div>

        {/* Innings Display */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border p-3 text-center">
            <div className="text-sm text-muted-foreground">{player1Name} Innings</div>
            <div className="text-2xl font-bold text-emerald-600">
              {inningFlow.playerAInnings + (inningFlow.activePlayer === 'A' && inningFlow.currentInningHasBalls ? 1 : 0)}
            </div>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <div className="text-sm text-muted-foreground">{player2Name} Innings</div>
            <div className="text-2xl font-bold text-blue-600">
              {inningFlow.playerBInnings + (inningFlow.activePlayer === 'B' && inningFlow.currentInningHasBalls ? 1 : 0)}
            </div>
          </div>
        </div>

        {/* Defensive Shots */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">{player1Name} Defensive</div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDefensiveShot}
                disabled={inningFlow.activePlayer !== 'A'}
                className="flex-1"
              >
                <Shield className="h-4 w-4 mr-1" />
                Record
              </Button>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {player1DefensiveShots}
              </Badge>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">{player2Name} Defensive</div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDefensiveShot}
                disabled={inningFlow.activePlayer !== 'B'}
                className="flex-1"
              >
                <Shield className="h-4 w-4 mr-1" />
                Record
              </Button>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {player2DefensiveShots}
              </Badge>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid gap-3">
          <Button
            onClick={handleTurnOver}
            variant="outline"
            size="lg"
            className="w-full"
            disabled={isRackLocked}
          >
            Turn Over
          </Button>
          <Button
            onClick={handleCompleteRack}
            disabled={!isRackComplete}
            className="w-full"
            size="lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Complete Rack {rackNumber}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
