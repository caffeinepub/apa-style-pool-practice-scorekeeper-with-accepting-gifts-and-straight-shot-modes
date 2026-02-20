import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, AlertCircle, RotateCcw, Shield, Lock } from 'lucide-react';
import { POINTS_PER_RACK } from '../../lib/apa/apaScoring';
import ApaBallButton from './ApaBallButton';
import { useApaInningFlow } from './useApaInningFlow';

const DEBUG_APA = false;

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

  const [deadBallMode, setDeadBallMode] = useState(false);
  const [player1DefensiveShots, setPlayer1DefensiveShots] = useState(0);
  const [player2DefensiveShots, setPlayer2DefensiveShots] = useState(0);
  const [lockedPointBalls, setLockedPointBalls] = useState<Set<number>>(new Set());

  const { activePlayer, sharedInnings, turnOver, resetRack } = useApaInningFlow({
    startingPlayer: matchContext.activePlayer,
    initialInnings: matchContext.sharedInnings,
    bottomPlayer: matchContext.bottomPlayer,
  });

  useEffect(() => {
    const player1Points = calculatePlayerPoints('player1');
    const player2Points = calculatePlayerPoints('player2');
    onLiveRackUpdate?.({ player1Points, player2Points });
  }, [balls, onLiveRackUpdate]);

  const calculatePlayerPoints = (player: 'player1' | 'player2'): number => {
    let points = 0;
    const playerState = player === 'player1' ? 'playerA' : 'playerB';

    for (let i = 1; i <= 9; i++) {
      if (balls[i].state === playerState) {
        if (i === 9) {
          const player1Total = calculatePlayerPoints('player1');
          const player2Total = calculatePlayerPoints('player2');
          const currentPlayerTotal = player === 'player1' ? player1Total : player2Total;
          const pointsRemaining = POINTS_PER_RACK - currentPlayerTotal;

          if (pointsRemaining === 1) {
            points += 1;
          } else {
            points += 2;
          }
        } else {
          points += 1;
        }
      }
    }

    return points;
  };

  const calculateDeadBalls = (): number => {
    let count = 0;
    for (let i = 1; i <= 9; i++) {
      if (balls[i].state === 'dead') {
        if (i === 9) {
          const player1Total = calculatePlayerPoints('player1');
          const player2Total = calculatePlayerPoints('player2');
          const totalScored = player1Total + player2Total;
          const pointsRemaining = POINTS_PER_RACK - totalScored;

          if (pointsRemaining === 1) {
            count += 1;
          } else {
            count += 2;
          }
        } else {
          count += 1;
        }
      }
    }
    return count;
  };

  const handleBallClick = (ballNumber: number) => {
    // Prevent all ball clicks when match is complete
    if (matchContext.matchComplete) {
      return;
    }

    if (balls[ballNumber].isLocked) {
      return;
    }

    if (DEBUG_APA) {
      console.log('[APA] Ball click:', ballNumber, 'deadBallMode:', deadBallMode);
    }

    if (deadBallMode) {
      setBalls((prev) => ({
        ...prev,
        [ballNumber]: { ...prev[ballNumber], state: prev[ballNumber].state === 'dead' ? 'unscored' : 'dead' },
      }));
    } else {
      const currentState = balls[ballNumber].state;
      let newState: BallState;

      if (currentState === 'unscored') {
        newState = activePlayer === 'A' ? 'playerA' : 'playerB';
      } else if (currentState === 'playerA') {
        newState = 'playerB';
      } else if (currentState === 'playerB') {
        newState = 'playerA';
      } else {
        newState = 'unscored';
      }

      setBalls((prev) => ({
        ...prev,
        [ballNumber]: { ...prev[ballNumber], state: newState },
      }));
    }
  };

  const handleTurnOver = () => {
    if (DEBUG_APA) {
      console.log('[APA] Turn Over pressed');
    }

    const newLockedBalls = new Set(lockedPointBalls);
    for (let i = 1; i <= 9; i++) {
      if (balls[i].state === 'playerA' || balls[i].state === 'playerB' || balls[i].state === 'dead') {
        newLockedBalls.add(i);
      }
    }
    setLockedPointBalls(newLockedBalls);

    setBalls((prev) => {
      const updated = { ...prev };
      for (let i = 1; i <= 9; i++) {
        if (newLockedBalls.has(i)) {
          updated[i] = { ...updated[i], isLocked: true };
        }
      }
      return updated;
    });

    if (deadBallMode) {
      setDeadBallMode(false);
    }

    turnOver();
  };

  const handleDefensiveShot = (player: 'player1' | 'player2') => {
    if (player === 'player1') {
      setPlayer1DefensiveShots((prev) => prev + 1);
    } else {
      setPlayer2DefensiveShots((prev) => prev + 1);
    }
  };

  const handleRemoveDefensiveShot = (player: 'player1' | 'player2') => {
    if (player === 'player1') {
      setPlayer1DefensiveShots((prev) => Math.max(0, prev - 1));
    } else {
      setPlayer2DefensiveShots((prev) => Math.max(0, prev - 1));
    }
  };

  const handleEndRack = () => {
    const player1Points = calculatePlayerPoints('player1');
    const player2Points = calculatePlayerPoints('player2');
    const deadBalls = calculateDeadBalls();

    onRackComplete({
      player1Points,
      player2Points,
      deadBalls,
      player1Innings: sharedInnings,
      player2Innings: sharedInnings,
      player1DefensiveShots,
      player2DefensiveShots,
      activePlayer,
      sharedInnings,
    });
  };

  const handleResetRack = () => {
    const initial: Record<number, BallData> = {};
    for (let i = 1; i <= 9; i++) {
      initial[i] = { state: 'unscored', isLocked: false };
    }
    setBalls(initial);
    setPlayer1DefensiveShots(0);
    setPlayer2DefensiveShots(0);
    setDeadBallMode(false);
    setLockedPointBalls(new Set());
    resetRack(matchContext.activePlayer, matchContext.sharedInnings);
  };

  const player1Points = calculatePlayerPoints('player1');
  const player2Points = calculatePlayerPoints('player2');
  const deadBalls = calculateDeadBalls();
  const totalPoints = player1Points + player2Points + deadBalls;
  const isRackValid = totalPoints === POINTS_PER_RACK;

  const player1ProjectedTotal = matchContext.player1CurrentPoints + player1Points;
  const player2ProjectedTotal = matchContext.player2CurrentPoints + player2Points;
  const player1WouldWin = player1ProjectedTotal >= matchContext.player1Target;
  const player2WouldWin = player2ProjectedTotal >= matchContext.player2Target;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Rack {rackNumber}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Innings: {Math.max(0, sharedInnings)}</Badge>
            <Badge variant={activePlayer === 'A' ? 'default' : 'secondary'}>
              {activePlayer === 'A' ? player1Name : player2Name} at table
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Ball Grid */}
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <ApaBallButton
              key={num}
              ballNumber={num}
              state={balls[num].state}
              onClick={() => handleBallClick(num)}
              isLocked={balls[num].isLocked}
            />
          ))}
        </div>

        {/* Score Display */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-sm text-muted-foreground mb-1">{player1Name}</div>
            <div className="text-3xl font-bold text-emerald-600">{player1Points}</div>
            {player1WouldWin && (
              <Badge variant="default" className="mt-1">
                Win
              </Badge>
            )}
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Dead</div>
            <div className="text-3xl font-bold text-red-600">{deadBalls}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">{player2Name}</div>
            <div className="text-3xl font-bold text-blue-600">{player2Points}</div>
            {player2WouldWin && (
              <Badge variant="default" className="mt-1">
                Win
              </Badge>
            )}
          </div>
        </div>

        {/* Validation Alert */}
        {!isRackValid && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Total points must equal {POINTS_PER_RACK}. Current: {totalPoints}
            </AlertDescription>
          </Alert>
        )}

        {/* Defensive Shots */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{player1Name} Defensive Shots</span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRemoveDefensiveShot('player1')}
                disabled={player1DefensiveShots === 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-lg font-semibold w-8 text-center">{player1DefensiveShots}</span>
              <Button size="sm" variant="outline" onClick={() => handleDefensiveShot('player1')}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{player2Name} Defensive Shots</span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRemoveDefensiveShot('player2')}
                disabled={player2DefensiveShots === 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-lg font-semibold w-8 text-center">{player2DefensiveShots}</span>
              <Button size="sm" variant="outline" onClick={() => handleDefensiveShot('player2')}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant={deadBallMode ? 'default' : 'outline'} onClick={() => setDeadBallMode(!deadBallMode)}>
            <Shield className="mr-2 h-4 w-4" />
            Mark Dead Ball(s)
          </Button>
          <Button variant="outline" onClick={handleTurnOver}>
            <Lock className="mr-2 h-4 w-4" />
            Turn Over
          </Button>
          <Button variant="outline" onClick={handleResetRack}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset Rack
          </Button>
          <Button onClick={handleEndRack} disabled={!isRackValid} className="font-semibold">
            End Rack
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
