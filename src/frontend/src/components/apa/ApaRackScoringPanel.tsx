import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, AlertCircle, RotateCcw, Shield } from 'lucide-react';
import { POINTS_PER_RACK } from '../../lib/apa/apaScoring';
import ApaBallButton from './ApaBallButton';
import { useApaInningFlow } from './useApaInningFlow';
import { computeRackTotalForValidation, getBallValue } from './apaBallStyles';

const DEBUG_APA = true;

const dlog = (...args: any[]) => {
  if (!DEBUG_APA) return;
  // eslint-disable-next-line no-console
  console.log('[APA_RACK]', ...args);
};

type BallState = 'unscored' | 'playerA' | 'playerB' | 'dead';

interface BallData {
  state: BallState;
  isLocked: boolean;
}

interface MatchContext {
  player1CurrentPoints: number;
  player2CurrentPoints: number;
  player1Target: number;
  player2Target: number;
  matchComplete: boolean;
  activePlayer: 'A' | 'B';
  sharedInnings: number;
  bottomPlayer: 'A' | 'B';
}

interface ApaRackScoringPanelProps {
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
  onLiveRackUpdate?: (data: { player1Points: number; player2Points: number }) => void;
  matchContext: MatchContext;
}

export default function ApaRackScoringPanel({
  rackNumber,
  player1Name,
  player2Name,
  onRackComplete,
  onLiveRackUpdate,
  matchContext,
}: ApaRackScoringPanelProps) {
  const [balls, setBalls] = useState<Record<number, BallData>>(() => {
    const initial: Record<number, BallData> = {};
    for (let i = 1; i <= 9; i++) {
      initial[i] = { state: 'unscored', isLocked: false };
    }
    return initial;
  });

  const [player1DefensiveShots, setPlayer1DefensiveShots] = useState(0);
  const [player2DefensiveShots, setPlayer2DefensiveShots] = useState(0);
  const [deadBallMode, setDeadBallMode] = useState(false);
  const [currentInningBalls, setCurrentInningBalls] = useState<Set<number>>(new Set());
  const [targetReached, setTargetReached] = useState(false);
  const [targetReachedPlayer, setTargetReachedPlayer] = useState<'A' | 'B' | null>(null);
  const autoMarkedDeadBallsRef = useRef<Set<number>>(new Set());

  const { activePlayer, sharedInnings, turnOver, resetRack } = useApaInningFlow({
    startingPlayer: matchContext.activePlayer,
    initialInnings: matchContext.sharedInnings,
    bottomPlayer: matchContext.bottomPlayer,
  });

  // Calculate current rack points for both players
  const calculatePlayerPoints = (playerKey: 'A' | 'B'): number => {
    let points = 0;
    const cumulativePoints = playerKey === 'A' ? matchContext.player1CurrentPoints : matchContext.player2CurrentPoints;
    const target = playerKey === 'A' ? matchContext.player1Target : matchContext.player2Target;

    for (let i = 1; i <= 9; i++) {
      const ball = balls[i];
      if (ball && ball.state === `player${playerKey}`) {
        if (i === 9) {
          const player1Non9 = Object.keys(balls).reduce((sum, key) => {
            const n = Number(key);
            if (n === 9) return sum;
            return balls[n].state === 'playerA' ? sum + 1 : sum;
          }, 0);

          const player2Non9 = Object.keys(balls).reduce((sum, key) => {
            const n = Number(key);
            if (n === 9) return sum;
            return balls[n].state === 'playerB' ? sum + 1 : sum;
          }, 0);

          const currentNon9 = playerKey === 'A' ? player1Non9 : player2Non9;
          const pointsRemaining = POINTS_PER_RACK - currentNon9;

          const nineVal = pointsRemaining === 1 ? 1 : 2;

          dlog('NINE_VALUE', {
            player: playerKey,
            currentNon9,
            pointsRemaining,
            nineVal,
          });

          points += nineVal;
        } else {
          points += 1; // Count each ball as 1 point, not face value
        }
      }
    }

    return points;
  };

  const player1RackPoints = calculatePlayerPoints('A');
  const player2RackPoints = calculatePlayerPoints('B');

  // Calculate projected totals (cumulative + current rack)
  const player1ProjectedTotal = matchContext.player1CurrentPoints + player1RackPoints;
  const player2ProjectedTotal = matchContext.player2CurrentPoints + player2RackPoints;

  // Check if either player has reached or would exceed their target
  useEffect(() => {
    const player1ReachedTarget = player1ProjectedTotal >= matchContext.player1Target;
    const player2ReachedTarget = player2ProjectedTotal >= matchContext.player2Target;

    if (player1ReachedTarget || player2ReachedTarget) {
      setTargetReached(true);
      setTargetReachedPlayer(player1ReachedTarget ? 'A' : 'B');
    } else {
      setTargetReached(false);
      setTargetReachedPlayer(null);
    }
  }, [player1ProjectedTotal, player2ProjectedTotal, matchContext.player1Target, matchContext.player2Target]);

  // Emit live rack updates to parent
  useEffect(() => {
    if (onLiveRackUpdate) {
      onLiveRackUpdate({
        player1Points: player1RackPoints,
        player2Points: player2RackPoints,
      });
    }
  }, [player1RackPoints, player2RackPoints, onLiveRackUpdate]);

  const handleBallClick = (ballNumber: number) => {
    // Disable all ball clicks when match is complete
    if (matchContext.matchComplete) {
      return;
    }

    // Disable ball clicks when target is reached (scoring frozen)
    if (targetReached) {
      // Allow unselecting balls from current inning only
      const ball = balls[ballNumber];
      if (ball.state !== 'unscored' && currentInningBalls.has(ballNumber)) {
        // Unselect the ball
        setBalls((prev) => ({
          ...prev,
          [ballNumber]: { state: 'unscored', isLocked: false },
        }));
        setCurrentInningBalls((prev) => {
          const next = new Set(prev);
          next.delete(ballNumber);
          return next;
        });
      }
      return;
    }

    const ball = balls[ballNumber];
    if (ball.isLocked) return;

    dlog('CLICK', {
      ballNumber,
      deadBallMode,
      activePlayer,
      before: balls[ballNumber],
    });

    if (deadBallMode) {
      // Dead ball mode: only balls 1-8 can be marked dead
      if (ballNumber === 9) return;

      if (ball.state === 'dead') {
        dlog('DEAD_TOGGLE', { ballNumber, from: balls[ballNumber].state, to: 'unscored' });
        setBalls((prev) => ({
          ...prev,
          [ballNumber]: { state: 'unscored', isLocked: false },
        }));
      } else if (ball.state === 'unscored') {
        dlog('DEAD_TOGGLE', { ballNumber, from: balls[ballNumber].state, to: 'dead' });
        setBalls((prev) => ({
          ...prev,
          [ballNumber]: { state: 'dead', isLocked: false },
        }));
      }
    } else {
      // Normal scoring mode
      const currentState = ball.state;
      let nextState: BallState = 'unscored';

      // Handle 9-ball special logic
      if (ballNumber === 9) {
        if (currentState === 'unscored') {
          // Marking the 9-ball for active player
          nextState = `player${activePlayer}` as BallState;
          
          // Track this ball as part of current inning
          setCurrentInningBalls((prev) => new Set(prev).add(ballNumber));

          // Compute auto-dead list BEFORE setBalls
          const ballsToAutoMark: number[] = [];
          for (let i = 1; i <= 8; i++) {
            if (balls[i].state === 'unscored') ballsToAutoMark.push(i);
          }

          // Store immediately for reliable revert
          autoMarkedDeadBallsRef.current = new Set(ballsToAutoMark);

          // eslint-disable-next-line no-console
          console.log('[9-BALL DEBUG] 9-ball SELECTED by player', activePlayer);
          // eslint-disable-next-line no-console
          console.log('[9-BALL DEBUG] Auto-marking balls as dead:', Array.from(ballsToAutoMark));
          // eslint-disable-next-line no-console
          console.log('[9-BALL DEBUG] autoMarkedDeadBallsRef.current set to:', Array.from(autoMarkedDeadBallsRef.current));

          setBalls((prev) => {
            const updated = { ...prev };
            updated[9] = { state: nextState, isLocked: false };

            ballsToAutoMark.forEach((i) => {
              updated[i] = { state: 'dead', isLocked: false };
            });

            return updated;
          });

          return;
        } else if (currentState === `player${activePlayer}` || currentState === 'dead') {
          // Unselecting the 9-ball - revert auto-marked dead balls to blank
          // Allow reverting if the 9-ball is scored by active player OR if it's dead (from auto-mark)
          
          // eslint-disable-next-line no-console
          console.log('[9-BALL DEBUG] 9-ball UNSELECTED - starting revert process');
          // eslint-disable-next-line no-console
          console.log('[9-BALL DEBUG] Current 9-ball state:', currentState);
          // eslint-disable-next-line no-console
          console.log('[9-BALL DEBUG] autoMarkedDeadBallsRef.current contains:', Array.from(autoMarkedDeadBallsRef.current));
          
          // Log current state of balls 1-8 BEFORE revert
          const balls1to8Before: Record<number, string> = {};
          for (let i = 1; i <= 8; i++) {
            balls1to8Before[i] = balls[i].state;
          }
          // eslint-disable-next-line no-console
          console.log('[9-BALL DEBUG] State of balls 1-8 BEFORE revert:', balls1to8Before);

          // Remove from current inning tracking
          setCurrentInningBalls((prev) => {
            const next = new Set(prev);
            next.delete(ballNumber);
            return next;
          });

          setBalls((prev) => {
            const updated = { ...prev };
            updated[9] = { state: 'unscored', isLocked: false };

            // eslint-disable-next-line no-console
            console.log('[9-BALL DEBUG] Processing revert for balls:', Array.from(autoMarkedDeadBallsRef.current));

            autoMarkedDeadBallsRef.current.forEach((ballNum) => {
              // eslint-disable-next-line no-console
              console.log(`[9-BALL DEBUG] Reverting ball ${ballNum} from '${prev[ballNum].state}' to 'unscored'`);
              updated[ballNum] = { state: 'unscored', isLocked: false };
            });

            return updated;
          });

          // Log state of balls 1-8 AFTER revert
          setTimeout(() => {
            const balls1to8After: Record<number, string> = {};
            for (let i = 1; i <= 8; i++) {
              balls1to8After[i] = balls[i].state;
            }
            // eslint-disable-next-line no-console
            console.log('[9-BALL DEBUG] State of balls 1-8 AFTER revert:', balls1to8After);
            // eslint-disable-next-line no-console
            console.log('[9-BALL DEBUG] Revert operation completed successfully');
          }, 0);

          autoMarkedDeadBallsRef.current = new Set();
          // eslint-disable-next-line no-console
          console.log('[9-BALL DEBUG] autoMarkedDeadBallsRef.current cleared');
          return;
        } else {
          return; // Can't change opponent's 9-ball
        }
      }

      // Regular ball logic (1-8)
      if (currentState === 'unscored') {
        nextState = `player${activePlayer}` as BallState;
        
        // Track this ball as part of current inning
        setCurrentInningBalls((prev) => new Set(prev).add(ballNumber));

        // Calculate what the new score would be with this ball
        const cumulativePoints = activePlayer === 'A' ? matchContext.player1CurrentPoints : matchContext.player2CurrentPoints;
        const currentRackPoints = activePlayer === 'A' ? player1RackPoints : player2RackPoints;
        const target = activePlayer === 'A' ? matchContext.player1Target : matchContext.player2Target;
        const ballValue = getBallValue(ballNumber, cumulativePoints, currentRackPoints, target);
        const projectedTotal = cumulativePoints + currentRackPoints + ballValue;

        // Cap score at target - if it would exceed, don't allow the selection
        if (projectedTotal > target) {
          // Calculate how many points we can actually add
          const pointsNeeded = target - (cumulativePoints + currentRackPoints);
          if (pointsNeeded <= 0) {
            // Already at target, don't allow any more scoring
            return;
          }
          // For now, we'll just cap at target by not allowing balls that would exceed
          // In a more sophisticated implementation, we could allow partial ball values
          return;
        }
      } else if (currentState === `player${activePlayer}`) {
        nextState = 'unscored';
        // Remove from current inning tracking
        setCurrentInningBalls((prev) => {
          const next = new Set(prev);
          next.delete(ballNumber);
          return next;
        });
      } else {
        return; // Can't change opponent's balls
      }

      dlog('CLICK_RESULT', { ballNumber, from: currentState, to: nextState });

      setBalls((prev) => ({
        ...prev,
        [ballNumber]: { state: nextState, isLocked: false },
      }));
    }
  };

  const handleDefensiveIncrement = (player: 'A' | 'B') => {
    dlog('DEFENSIVE_TOGGLE', {
      player,
      currentDefensiveShots: player === 'A' ? player1DefensiveShots : player2DefensiveShots,
      activePlayer,
    });

    if (player === 'A') {
      setPlayer1DefensiveShots(player1DefensiveShots + 1);
    } else {
      setPlayer2DefensiveShots(player2DefensiveShots + 1);
    }
  };

  const handleTurnOverClick = () => {
    dlog('TURN_OVER_BEFORE', {
      activePlayer,
      sharedInnings,
      deadBallMode,
      lockedPointBalls: Array.from(currentInningBalls),
      ballsSnapshot: Object.fromEntries(Object.entries(balls).map(([k, v]) => [k, { s: v.state, L: v.isLocked }])),
    });

    // Lock all balls scored in this turn
    const newLockedBalls: number[] = [];
    setBalls((prev) => {
      const updated = { ...prev };
      for (let i = 1; i <= 9; i++) {
        if (prev[i].state !== 'unscored' && !prev[i].isLocked) {
          updated[i] = { ...prev[i], isLocked: true };
          newLockedBalls.push(i);
        }
      }
      return updated;
    });

    // Clear current inning tracking (but NOT autoMarkedDeadBallsRef - preserve it for 9-ball revert)
    setCurrentInningBalls(new Set());

    dlog('TURN_OVER_LOCKING', { newlyLocked: newLockedBalls });

    // Advance inning counter
    turnOver();
  };

  const handleResetRack = () => {
    setBalls(() => {
      const initial: Record<number, BallData> = {};
      for (let i = 1; i <= 9; i++) {
        initial[i] = { state: 'unscored', isLocked: false };
      }
      return initial;
    });
    setPlayer1DefensiveShots(0);
    setPlayer2DefensiveShots(0);
    setDeadBallMode(false);
    setCurrentInningBalls(new Set());
    setTargetReached(false);
    setTargetReachedPlayer(null);
    autoMarkedDeadBallsRef.current = new Set();
    resetRack(activePlayer, sharedInnings);
  };

  const handleEndRack = () => {
    dlog('END_RACK_CLICK', {
      activePlayer,
      sharedInnings,
      ballsSnapshot: Object.fromEntries(Object.entries(balls).map(([k, v]) => [k, { s: v.state, L: v.isLocked }])),
    });

    // Calculate dead ball count (1 point per dead ball, not face value)
    const deadBallCount = Object.keys(balls).filter((key) => balls[Number(key)].state === 'dead').length;

    dlog('END_RACK_SCORED', { 
      player1Points: player1RackPoints, 
      player2Points: player2RackPoints, 
      deadBalls: deadBallCount, 
      total: player1RackPoints + player2RackPoints + deadBallCount 
    });

    // Log score capping
    const player1Capped = (matchContext.player1CurrentPoints + player1RackPoints) > matchContext.player1Target;
    const player2Capped = (matchContext.player2CurrentPoints + player2RackPoints) > matchContext.player2Target;
    dlog('SCORE_CAPPED', {
      player1: {
        currentScore: matchContext.player1CurrentPoints,
        rackPoints: player1RackPoints,
        target: matchContext.player1Target,
        capped: player1Capped,
      },
      player2: {
        currentScore: matchContext.player2CurrentPoints,
        rackPoints: player2RackPoints,
        target: matchContext.player2Target,
        capped: player2Capped,
      },
    });

    onRackComplete({
      player1Points: player1RackPoints,
      player2Points: player2RackPoints,
      deadBalls: deadBallCount,
      player1Innings: sharedInnings,
      player2Innings: sharedInnings,
      player1DefensiveShots,
      player2DefensiveShots,
      activePlayer,
      sharedInnings: sharedInnings,
    });

    // Reset for next rack (this will clear autoMarkedDeadBallsRef via handleResetRack)
    handleResetRack();
  };

  // Rack validation: selected balls + dead balls must equal 10 points
  const rackTotal = computeRackTotalForValidation(balls);
  const isRackValid = rackTotal === POINTS_PER_RACK;

  // End Rack button logic:
  // - Enabled when target is reached (regardless of rack validation)
  // - OR when rack is valid (totals 10 points)
  const canEndRack = targetReached || isRackValid;

  // Check if 9-ball is selected (any non-blank state)
  const nineBallSelected = balls[9].state !== 'unscored';

  // Turn Over button logic:
  // - Disabled when match is complete
  // - Disabled when 9-ball is selected (must click End Rack or unselect 9-ball)
  // - Disabled when in dead ball marking mode
  const turnOverDisabled = matchContext.matchComplete || nineBallSelected || deadBallMode;

  return (
    <div className="flex justify-center w-full">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center">Rack {rackNumber}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Target Reached Alert */}
          {targetReached && targetReachedPlayer && (
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                {targetReachedPlayer === 'A' ? player1Name : player2Name} has reached their target! Complete this rack to
                end the match.
              </AlertDescription>
            </Alert>
          )}

          {/* Active Player Indicator */}
          <div className="flex justify-center">
            <Badge variant="outline" className="text-base px-4 py-2">
              Active: {activePlayer === 'A' ? player1Name : player2Name}
            </Badge>
          </div>

          {/* Ball Grid */}
          <div className="grid grid-cols-3 gap-4 justify-items-center">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((ballNumber) => (
              <ApaBallButton
                key={ballNumber}
                ballNumber={ballNumber}
                state={balls[ballNumber].state}
                isLocked={balls[ballNumber].isLocked}
                onClick={() => handleBallClick(ballNumber)}
              />
            ))}
          </div>

          {/* Rack Total Display */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Rack Total: {rackTotal} / {POINTS_PER_RACK}
              {isRackValid && <span className="ml-2 text-green-600">✓ Valid</span>}
            </p>
          </div>

          {/* Defensive Shots Counters */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-center">{player1Name} Defensive Shots</p>
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPlayer1DefensiveShots(Math.max(0, player1DefensiveShots - 1))}
                  disabled={player1DefensiveShots === 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-lg font-bold w-12 text-center">{player1DefensiveShots}</span>
                <Button variant="outline" size="icon" onClick={() => handleDefensiveIncrement('A')}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-center">{player2Name} Defensive Shots</p>
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPlayer2DefensiveShots(Math.max(0, player2DefensiveShots - 1))}
                  disabled={player2DefensiveShots === 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-lg font-bold w-12 text-center">{player2DefensiveShots}</span>
                <Button variant="outline" size="icon" onClick={() => handleDefensiveIncrement('B')}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Innings Display */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Innings: {sharedInnings}</p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={deadBallMode ? 'destructive' : 'outline'}
              onClick={() => setDeadBallMode(!deadBallMode)}
              className="w-full"
            >
              <Shield className="mr-2 h-4 w-4" />
              {deadBallMode ? 'Exit Dead Ball Mode' : 'Mark Dead Balls'}
            </Button>

            <Button variant="outline" onClick={handleResetRack} className="w-full">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Rack
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button onClick={handleTurnOverClick} disabled={turnOverDisabled} className="w-full">
              Turn Over
            </Button>

            <Button onClick={handleEndRack} disabled={!canEndRack} variant="default" className="w-full">
              End Rack
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
