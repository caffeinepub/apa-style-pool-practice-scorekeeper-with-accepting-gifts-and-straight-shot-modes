import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Trophy, RefreshCw } from 'lucide-react';
import { useSaveMatch } from '../../hooks/useQueries';
import { buildApaNineBallMatch } from '../../lib/matches/matchBuilders';
import ApaRackScoringPanel from '../../components/apa/ApaRackScoringPanel';
import ApaResultsSummary from '../../components/apa/ApaResultsSummary';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useActor } from '../../hooks/useActor';
import { useActorRetry } from '../../hooks/useActorRetry';
import { toast } from 'sonner';
import { extractErrorText } from '../../utils/errorText';
import type { RackData } from '../../lib/apa/apaScoring';
import { calculatePPI, formatPPI } from '../../lib/apa/apaScoring';
import { formatSkillLevel } from '../../lib/apa/apaEqualizer';
import { computeApaPracticeMatchOutcome } from '../../lib/apa/apaPracticeMatchOutcome';

interface GameState {
  player1: string;
  player2: string;
  player1SL: number;
  player2SL: number;
  player1Target: number;
  player2Target: number;
  notes?: string;
  player1Points: number;
  player2Points: number;
  player1Innings: number;
  player2Innings: number;
  player1DefensiveShots: number;
  player2DefensiveShots: number;
  racks: RackData[];
  activePlayer: 'A' | 'B';
  sharedInnings: number;
}

export default function PracticeGamePage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const { retryConnection } = useActorRetry();
  const saveMatch = useSaveMatch();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [matchComplete, setMatchComplete] = useState(false);
  const [liveRackPoints, setLiveRackPoints] = useState({ player1Points: 0, player2Points: 0 });
  const [showRetryConnection, setShowRetryConnection] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem('apaPracticeGame');
    if (saved) {
      const state = JSON.parse(saved);
      // Ensure activePlayer and sharedInnings exist (backward compatibility)
      if (!state.activePlayer) {
        state.activePlayer = 'A';
      }
      if (state.sharedInnings === undefined) {
        state.sharedInnings = 0;
      }
      
      // Clamp totals to targets on load (defensive normalization)
      state.player1Points = Math.min(state.player1Points, state.player1Target);
      state.player2Points = Math.min(state.player2Points, state.player2Target);
      
      setGameState(state);
      // Check if match is already complete
      if (state.player1Points >= state.player1Target || state.player2Points >= state.player2Target) {
        setMatchComplete(true);
      }
    } else {
      navigate({ to: '/apa-practice/start' });
    }
  }, [navigate]);

  useEffect(() => {
    if (gameState) {
      sessionStorage.setItem('apaPracticeGame', JSON.stringify(gameState));
    }
  }, [gameState]);

  // Show retry connection after 8 seconds if actor is not ready and match is complete
  useEffect(() => {
    if (matchComplete && !actor) {
      const timer = setTimeout(() => {
        setShowRetryConnection(true);
      }, 8000);
      return () => clearTimeout(timer);
    } else {
      setShowRetryConnection(false);
    }
  }, [matchComplete, actor]);

  if (!gameState) {
    return (
      <div className="container mx-auto max-w-4xl p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Loading game...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleRackComplete = (rackData: {
    player1Points: number;
    player2Points: number;
    deadBalls: number;
    player1Innings: number;
    player2Innings: number;
    player1DefensiveShots: number;
    player2DefensiveShots: number;
    activePlayer: 'A' | 'B';
    sharedInnings: number;
  }) => {
    setGameState(prev => {
      if (!prev) return prev;

      // Clamp points to targets
      const newPlayer1Points = Math.min(
        prev.player1Points + rackData.player1Points,
        prev.player1Target
      );
      const newPlayer2Points = Math.min(
        prev.player2Points + rackData.player2Points,
        prev.player2Target
      );

      const newRack: RackData = {
        rackNumber: prev.racks.length + 1,
        playerA: {
          points: rackData.player1Points,
          defensiveShots: rackData.player1DefensiveShots,
          innings: rackData.player1Innings,
        },
        playerB: {
          points: rackData.player2Points,
          defensiveShots: rackData.player2DefensiveShots,
          innings: rackData.player2Innings,
        },
        deadBalls: rackData.deadBalls,
      };

      const newState = {
        ...prev,
        player1Points: newPlayer1Points,
        player2Points: newPlayer2Points,
        player1Innings: prev.player1Innings + rackData.player1Innings,
        player2Innings: prev.player2Innings + rackData.player2Innings,
        player1DefensiveShots: prev.player1DefensiveShots + rackData.player1DefensiveShots,
        player2DefensiveShots: prev.player2DefensiveShots + rackData.player2DefensiveShots,
        racks: [...prev.racks, newRack],
        activePlayer: rackData.activePlayer,
        sharedInnings: rackData.sharedInnings,
      };

      // Check if match is complete
      if (newPlayer1Points >= prev.player1Target || newPlayer2Points >= prev.player2Target) {
        setMatchComplete(true);
      }

      return newState;
    });

    // Reset live rack points
    setLiveRackPoints({ player1Points: 0, player2Points: 0 });
  };

  const handleLiveRackUpdate = (data: { player1Points: number; player2Points: number }) => {
    setLiveRackPoints(data);
  };

  const handleSaveMatch = async () => {
    if (!identity) {
      toast.error('Please log in to save matches');
      return;
    }

    if (!actor) {
      toast.error('Backend connection not ready. Please wait or retry connection.');
      return;
    }

    try {
      // Clamp final totals to targets before saving
      const finalPlayer1Points = Math.min(gameState.player1Points, gameState.player1Target);
      const finalPlayer2Points = Math.min(gameState.player2Points, gameState.player2Target);

      // Compute match outcome
      const matchOutcome = computeApaPracticeMatchOutcome({
        player1Points: finalPlayer1Points,
        player2Points: finalPlayer2Points,
        player1SL: gameState.player1SL,
        player2SL: gameState.player2SL,
        player1Target: gameState.player1Target,
        player2Target: gameState.player2Target,
      });

      const { matchId, matchRecord } = buildApaNineBallMatch({
        player1: gameState.player1,
        player2: gameState.player2,
        player1SL: gameState.player1SL,
        player2SL: gameState.player2SL,
        player1Target: gameState.player1Target,
        player2Target: gameState.player2Target,
        player1Points: finalPlayer1Points,
        player2Points: finalPlayer2Points,
        player1Innings: gameState.player1Innings,
        player2Innings: gameState.player2Innings,
        player1DefensiveShots: gameState.player1DefensiveShots,
        player2DefensiveShots: gameState.player2DefensiveShots,
        racks: gameState.racks,
        notes: gameState.notes,
        identity,
        matchOutcome,
      });

      await saveMatch.mutateAsync({ matchId, matchRecord });
      toast.success('Match saved successfully!');
      sessionStorage.removeItem('apaPracticeGame');
      navigate({ to: '/history' });
    } catch (error) {
      const errorMessage = extractErrorText(error);
      toast.error(`Failed to save match: ${errorMessage}`);
    }
  };

  const handleNewMatch = () => {
    sessionStorage.removeItem('apaPracticeGame');
    navigate({ to: '/apa-practice/start' });
  };

  const handleRetryConnection = async () => {
    try {
      await retryConnection();
      toast.success('Connection restored');
    } catch (error) {
      toast.error('Failed to restore connection');
    }
  };

  // Calculate live totals (capped at targets)
  const livePlayer1Total = Math.min(
    gameState.player1Points + liveRackPoints.player1Points,
    gameState.player1Target
  );
  const livePlayer2Total = Math.min(
    gameState.player2Points + liveRackPoints.player2Points,
    gameState.player2Target
  );

  // Compute match outcome for display
  const matchOutcome = computeApaPracticeMatchOutcome({
    player1Points: gameState.player1Points,
    player2Points: gameState.player2Points,
    player1SL: gameState.player1SL,
    player2SL: gameState.player2SL,
    player1Target: gameState.player1Target,
    player2Target: gameState.player2Target,
  });

  // Determine if user is authenticated
  const isAuthenticated = !!identity;

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate({ to: '/' })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        <h1 className="text-2xl font-bold">APA 9-Ball Practice</h1>
        <div className="w-24" />
      </div>

      {/* Live Score Display */}
      <Card>
        <CardHeader>
          <CardTitle>Match Score</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{gameState.player1}</span>
                <Badge variant="outline">{formatSkillLevel(gameState.player1SL)}</Badge>
              </div>
              <div className="flex items-center justify-between text-2xl font-bold">
                <span>
                  {livePlayer1Total} / {gameState.player1Target}
                </span>
                {livePlayer1Total >= gameState.player1Target && (
                  <Trophy className="h-6 w-6 text-yellow-500" />
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                PPI: {formatPPI(calculatePPI(gameState.player1Points, gameState.player1Innings))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{gameState.player2}</span>
                <Badge variant="outline">{formatSkillLevel(gameState.player2SL)}</Badge>
              </div>
              <div className="flex items-center justify-between text-2xl font-bold">
                <span>
                  {livePlayer2Total} / {gameState.player2Target}
                </span>
                {livePlayer2Total >= gameState.player2Target && (
                  <Trophy className="h-6 w-6 text-yellow-500" />
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                PPI: {formatPPI(calculatePPI(gameState.player2Points, gameState.player2Innings))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Innings</div>
              <div className="text-lg font-semibold">{gameState.sharedInnings}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Racks Played</div>
              <div className="text-lg font-semibold">{gameState.racks.length}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Dead Balls</div>
              <div className="text-lg font-semibold">
                {gameState.racks.reduce((sum, rack) => sum + rack.deadBalls, 0)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Match Complete Summary */}
      {matchComplete && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Match Complete!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ApaResultsSummary
              player1={{
                name: gameState.player1,
                skillLevel: gameState.player1SL,
                pointsNeeded: gameState.player1Target,
                pointsEarned: gameState.player1Points,
                defensiveShots: gameState.player1DefensiveShots,
                innings: gameState.player1Innings,
                ppi: calculatePPI(gameState.player1Points, gameState.player1Innings),
                isWinner: matchOutcome.player1Won,
              }}
              player2={{
                name: gameState.player2,
                skillLevel: gameState.player2SL,
                pointsNeeded: gameState.player2Target,
                pointsEarned: gameState.player2Points,
                defensiveShots: gameState.player2DefensiveShots,
                innings: gameState.player2Innings,
                ppi: calculatePPI(gameState.player2Points, gameState.player2Innings),
                isWinner: !matchOutcome.player1Won,
              }}
              matchPointOutcome={matchOutcome.outcome}
            />

            {!isAuthenticated && (
              <Alert>
                <AlertDescription>
                  You must log in to save matches.
                </AlertDescription>
              </Alert>
            )}

            {isAuthenticated && showRetryConnection && !actor && (
              <Alert>
                <AlertDescription className="flex items-center justify-between">
                  <span>Still connecting to backend. Retry to save your match.</span>
                  <Button size="sm" variant="outline" onClick={handleRetryConnection}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry Connection
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleSaveMatch}
                disabled={!isAuthenticated || saveMatch.isPending}
                className="flex-1"
              >
                {saveMatch.isPending ? 'Saving...' : 'Save Match'}
              </Button>
              <Button onClick={handleNewMatch} variant="outline" className="flex-1">
                New Match
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rack Scoring Panel */}
      {!matchComplete && (
        <ApaRackScoringPanel
          rackNumber={gameState.racks.length + 1}
          player1Name={gameState.player1}
          player2Name={gameState.player2}
          onRackComplete={handleRackComplete}
          onLiveRackUpdate={handleLiveRackUpdate}
          matchContext={{
            player1CurrentPoints: gameState.player1Points,
            player2CurrentPoints: gameState.player2Points,
            player1Target: gameState.player1Target,
            player2Target: gameState.player2Target,
            matchComplete,
            activePlayer: gameState.activePlayer,
            sharedInnings: gameState.sharedInnings,
          }}
        />
      )}
    </div>
  );
}
