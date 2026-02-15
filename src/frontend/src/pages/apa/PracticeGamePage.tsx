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
import { SESSION_KEYS } from '@/lib/session/inProgressSessions';

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
    const saved = sessionStorage.getItem(SESSION_KEYS.APA_PRACTICE);
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
      sessionStorage.setItem(SESSION_KEYS.APA_PRACTICE, JSON.stringify(gameState));
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
      sessionStorage.removeItem(SESSION_KEYS.APA_PRACTICE);
      navigate({ to: '/history' });
    } catch (error) {
      const errorMessage = extractErrorText(error);
      toast.error(`Failed to save match: ${errorMessage}`);
    }
  };

  const handleEndWithoutSaving = () => {
    sessionStorage.removeItem(SESSION_KEYS.APA_PRACTICE);
    toast.info('Session ended without saving');
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

  const player1PPI = calculatePPI(gameState.player1Points, gameState.player1Innings);
  const player2PPI = calculatePPI(gameState.player2Points, gameState.player2Innings);

  const isAuthenticated = !!identity;

  // Compute match outcome for display
  const matchOutcome = computeApaPracticeMatchOutcome({
    player1Points: gameState.player1Points,
    player2Points: gameState.player2Points,
    player1SL: gameState.player1SL,
    player2SL: gameState.player2SL,
    player1Target: gameState.player1Target,
    player2Target: gameState.player2Target,
  });

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

      {/* Score Display */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{gameState.player1}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Skill Level {formatSkillLevel(gameState.player1SL)} • Race to {gameState.player1Target}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold">
                  {gameState.player1Points + liveRackPoints.player1Points}
                </span>
                <Badge variant={gameState.player1Points >= gameState.player1Target ? 'default' : 'secondary'}>
                  {gameState.player1Points >= gameState.player1Target ? 'Winner' : 'In Progress'}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Innings:</span> {gameState.player1Innings}
                </div>
                <div>
                  <span className="text-muted-foreground">PPI:</span> {formatPPI(player1PPI)}
                </div>
                <div>
                  <span className="text-muted-foreground">Defensive:</span> {gameState.player1DefensiveShots}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{gameState.player2}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Skill Level {formatSkillLevel(gameState.player2SL)} • Race to {gameState.player2Target}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold">
                  {gameState.player2Points + liveRackPoints.player2Points}
                </span>
                <Badge variant={gameState.player2Points >= gameState.player2Target ? 'default' : 'secondary'}>
                  {gameState.player2Points >= gameState.player2Target ? 'Winner' : 'In Progress'}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Innings:</span> {gameState.player2Innings}
                </div>
                <div>
                  <span className="text-muted-foreground">PPI:</span> {formatPPI(player2PPI)}
                </div>
                <div>
                  <span className="text-muted-foreground">Defensive:</span> {gameState.player2DefensiveShots}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Match Complete Summary */}
      {matchComplete && (
        <ApaResultsSummary
          player1={{
            name: gameState.player1,
            skillLevel: gameState.player1SL,
            pointsNeeded: gameState.player1Target,
            pointsEarned: gameState.player1Points,
            defensiveShots: gameState.player1DefensiveShots,
            innings: gameState.player1Innings,
            ppi: player1PPI,
            isWinner: matchOutcome.player1Won,
          }}
          player2={{
            name: gameState.player2,
            skillLevel: gameState.player2SL,
            pointsNeeded: gameState.player2Target,
            pointsEarned: gameState.player2Points,
            defensiveShots: gameState.player2DefensiveShots,
            innings: gameState.player2Innings,
            ppi: player2PPI,
            isWinner: !matchOutcome.player1Won,
          }}
          matchPointOutcome={matchOutcome.outcome}
        />
      )}

      {/* Connection Warning */}
      {showRetryConnection && !actor && (
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

      {/* Rack Scoring or Save Actions */}
      {!matchComplete ? (
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
            matchComplete: false,
            activePlayer: gameState.activePlayer,
            sharedInnings: gameState.sharedInnings,
          }}
        />
      ) : (
        <div className="space-y-2">
          <Button
            onClick={handleSaveMatch}
            disabled={!isAuthenticated || saveMatch.isPending}
            className="w-full gap-2"
            size="lg"
          >
            {saveMatch.isPending ? (
              <>Saving...</>
            ) : (
              <>
                <Trophy className="h-5 w-5" />
                End Session & Save
              </>
            )}
          </Button>
          <Button
            onClick={handleEndWithoutSaving}
            variant="outline"
            className="w-full"
            size="lg"
          >
            End Session Without Saving
          </Button>
        </div>
      )}
    </div>
  );
}
