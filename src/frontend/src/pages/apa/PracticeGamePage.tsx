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
  const { actor, isFetching: actorFetching } = useActor();
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

  // Show retry connection after 8 seconds if actor is not ready
  useEffect(() => {
    if (matchComplete && !actor && !actorFetching) {
      const timer = setTimeout(() => {
        setShowRetryConnection(true);
      }, 8000);
      return () => clearTimeout(timer);
    } else {
      setShowRetryConnection(false);
    }
  }, [matchComplete, actor, actorFetching]);

  const handleLiveRackUpdate = (data: { player1Points: number; player2Points: number }) => {
    setLiveRackPoints(data);
  };

  const handleRackComplete = (data: {
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
    if (!gameState || matchComplete) return;

    const newRack: RackData = {
      rackNumber: gameState.racks.length + 1,
      playerA: {
        points: data.player1Points,
        defensiveShots: data.player1DefensiveShots,
        innings: data.player1Innings,
      },
      playerB: {
        points: data.player2Points,
        defensiveShots: data.player2DefensiveShots,
        innings: data.player2Innings,
      },
      deadBalls: data.deadBalls,
    };

    // Calculate new totals
    const newPlayer1Points = gameState.player1Points + data.player1Points;
    const newPlayer2Points = gameState.player2Points + data.player2Points;

    // Cap points at target
    const cappedPlayer1Points = Math.min(newPlayer1Points, gameState.player1Target);
    const cappedPlayer2Points = Math.min(newPlayer2Points, gameState.player2Target);

    const newState = {
      ...gameState,
      player1Points: cappedPlayer1Points,
      player2Points: cappedPlayer2Points,
      player1Innings: gameState.player1Innings + data.player1Innings,
      player2Innings: gameState.player2Innings + data.player2Innings,
      player1DefensiveShots: gameState.player1DefensiveShots + data.player1DefensiveShots,
      player2DefensiveShots: gameState.player2DefensiveShots + data.player2DefensiveShots,
      racks: [...gameState.racks, newRack],
      activePlayer: data.activePlayer,
      sharedInnings: data.sharedInnings,
    };

    setGameState(newState);
    // Reset live rack points after completion
    setLiveRackPoints({ player1Points: 0, player2Points: 0 });

    // Check if match is complete (either player reached their target)
    if (cappedPlayer1Points >= gameState.player1Target || cappedPlayer2Points >= gameState.player2Target) {
      setMatchComplete(true);
      toast.success('Match Complete!');
    }
  };

  const handleEndMatch = async () => {
    if (!gameState || !identity) {
      toast.error('You must be logged in to save a match');
      return;
    }

    if (!actor) {
      toast.error('Backend connection not ready. Please wait and try again.');
      return;
    }

    try {
      // Compute match outcome using shared helper
      const matchOutcome = computeApaPracticeMatchOutcome({
        player1Points: gameState.player1Points,
        player2Points: gameState.player2Points,
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
        player1Points: gameState.player1Points,
        player2Points: gameState.player2Points,
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
      sessionStorage.removeItem('apaPracticeGame');
      toast.success('Match saved successfully!');
      navigate({ to: '/history' });
    } catch (error) {
      const errorText = extractErrorText(error);
      toast.error(errorText);
      console.error('Error saving match:', error);
    }
  };

  if (!gameState) {
    return null;
  }

  const player1Won = gameState.player1Points >= gameState.player1Target && gameState.player2Points < gameState.player2Target;
  const player2Won = gameState.player2Points >= gameState.player2Target && gameState.player1Points < gameState.player1Target;
  const player1PPI = calculatePPI(gameState.player1Points, gameState.player1Innings);
  const player2PPI = calculatePPI(gameState.player2Points, gameState.player2Innings);

  // Calculate live display totals (saved + current rack)
  const player1DisplayPoints = gameState.player1Points + liveRackPoints.player1Points;
  const player2DisplayPoints = gameState.player2Points + liveRackPoints.player2Points;

  // Calculate total dead balls from completed racks
  const totalDeadBalls = gameState.racks.reduce((sum, rack) => sum + rack.deadBalls, 0);

  if (matchComplete) {
    // Compute match outcome for display
    const matchOutcome = computeApaPracticeMatchOutcome({
      player1Points: gameState.player1Points,
      player2Points: gameState.player2Points,
      player1SL: gameState.player1SL,
      player2SL: gameState.player2SL,
      player1Target: gameState.player1Target,
      player2Target: gameState.player2Target,
    });

    const isActorReady = !!actor;

    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/' })}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>

        <ApaResultsSummary
          player1={{
            name: gameState.player1,
            skillLevel: gameState.player1SL,
            pointsNeeded: gameState.player1Target,
            pointsEarned: gameState.player1Points,
            defensiveShots: gameState.player1DefensiveShots,
            innings: gameState.player1Innings,
            ppi: player1PPI,
            isWinner: player1Won,
          }}
          player2={{
            name: gameState.player2,
            skillLevel: gameState.player2SL,
            pointsNeeded: gameState.player2Target,
            pointsEarned: gameState.player2Points,
            defensiveShots: gameState.player2DefensiveShots,
            innings: gameState.player2Innings,
            ppi: player2PPI,
            isWinner: player2Won,
          }}
          matchPointOutcome={matchOutcome.outcome}
        />

        {showRetryConnection && !isActorReady && (
          <Alert>
            <AlertDescription className="flex items-center justify-between">
              <span>Still connecting to backend...</span>
              <Button
                variant="outline"
                size="sm"
                onClick={retryConnection}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Retry Connection
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-center">
          <Button 
            onClick={handleEndMatch} 
            size="lg" 
            className="gap-2"
            disabled={!isActorReady || saveMatch.isPending}
          >
            <Trophy className="h-5 w-5" />
            {!isActorReady ? 'Connecting...' : saveMatch.isPending ? 'Saving...' : 'Save Match & Return to History'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/' })}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Button>

      <div className="text-center">
        <h1 className="text-2xl font-bold">APA 9-Ball Practice Match</h1>
        <p className="text-muted-foreground">Rack {gameState.racks.length + 1}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{gameState.player1}</span>
              {player1Won && <Trophy className="h-5 w-5 text-yellow-500" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Skill Level</span>
              <Badge variant="secondary">{formatSkillLevel(gameState.player1SL)}</Badge>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-emerald-600">{player1DisplayPoints}</div>
              <div className="text-sm text-muted-foreground">of {gameState.player1Target} points</div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Innings:</span>
                <span className="font-semibold">{gameState.player1Innings}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dead Balls:</span>
                <span className="font-semibold">{totalDeadBalls}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">PPI:</span>
                <span className="font-semibold">{formatPPI(player1PPI)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Defensive Shots:</span>
                <span className="font-semibold">{gameState.player1DefensiveShots}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{gameState.player2}</span>
              {player2Won && <Trophy className="h-5 w-5 text-yellow-500" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Skill Level</span>
              <Badge variant="secondary">{formatSkillLevel(gameState.player2SL)}</Badge>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-emerald-600">{player2DisplayPoints}</div>
              <div className="text-sm text-muted-foreground">of {gameState.player2Target} points</div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Innings:</span>
                <span className="font-semibold">{gameState.player2Innings}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dead Balls:</span>
                <span className="font-semibold">{totalDeadBalls}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">PPI:</span>
                <span className="font-semibold">{formatPPI(player2PPI)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Defensive Shots:</span>
                <span className="font-semibold">{gameState.player2DefensiveShots}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
          matchComplete: matchComplete,
          activePlayer: gameState.activePlayer,
          sharedInnings: gameState.sharedInnings,
        }}
      />
    </div>
  );
}
