import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trophy } from 'lucide-react';
import { useSaveMatch } from '../../hooks/useQueries';
import { buildApaNineBallMatch } from '../../lib/matches/matchBuilders';
import EndMatchDialog from '../../components/matches/EndMatchDialog';
import ApaRackScoringPanel from '../../components/apa/ApaRackScoringPanel';
import ApaResultsSummary from '../../components/apa/ApaResultsSummary';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useActor } from '../../hooks/useActor';
import { toast } from 'sonner';
import { extractErrorText } from '../../utils/errorText';
import type { RackData } from '../../lib/apa/apaScoring';
import { calculatePPI, formatPPI } from '../../lib/apa/apaScoring';
import { calculateMatchPoints } from '../../lib/apa/apaMatchPoints';
import { formatSkillLevel } from '../../lib/apa/apaEqualizer';

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
}

export default function PracticeGamePage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const saveMatch = useSaveMatch();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [matchComplete, setMatchComplete] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem('apaPracticeGame');
    if (saved) {
      const state = JSON.parse(saved);
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

  const handleRackComplete = (data: {
    player1Points: number;
    player2Points: number;
    deadBalls: number;
    player1Innings: number;
    player2Innings: number;
    player1DefensiveShots: number;
    player2DefensiveShots: number;
  }) => {
    if (!gameState) return;

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

    const newState = {
      ...gameState,
      player1Points: gameState.player1Points + data.player1Points,
      player2Points: gameState.player2Points + data.player2Points,
      player1Innings: gameState.player1Innings + data.player1Innings,
      player2Innings: gameState.player2Innings + data.player2Innings,
      player1DefensiveShots: gameState.player1DefensiveShots + data.player1DefensiveShots,
      player2DefensiveShots: gameState.player2DefensiveShots + data.player2DefensiveShots,
      racks: [...gameState.racks, newRack],
    };

    setGameState(newState);

    // Check if match is complete
    if (newState.player1Points >= newState.player1Target || newState.player2Points >= newState.player2Target) {
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
      const player1Won = gameState.player1Points >= gameState.player1Target;
      const loserSL = player1Won ? gameState.player2SL : gameState.player1SL;
      const loserPoints = player1Won ? gameState.player2Points : gameState.player1Points;
      const matchPointOutcome = calculateMatchPoints(loserSL, loserPoints);

      const { matchId, matchRecord } = buildApaNineBallMatch({
        player1: gameState.player1,
        player2: gameState.player2,
        player1SL: gameState.player1SL,
        player2SL: gameState.player2SL,
        player1Points: gameState.player1Points,
        player2Points: gameState.player2Points,
        player1Innings: gameState.player1Innings,
        player2Innings: gameState.player2Innings,
        player1DefensiveShots: gameState.player1DefensiveShots,
        player2DefensiveShots: gameState.player2DefensiveShots,
        racks: gameState.racks,
        notes: gameState.notes,
        identity,
        matchPointOutcome,
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

  const player1Won = gameState.player1Points >= gameState.player1Target;
  const player2Won = gameState.player2Points >= gameState.player2Target;
  const player1PPI = calculatePPI(gameState.player1Points, gameState.player1Innings);
  const player2PPI = calculatePPI(gameState.player2Points, gameState.player2Innings);

  if (matchComplete) {
    const loserSL = player1Won ? gameState.player2SL : gameState.player1SL;
    const loserPoints = player1Won ? gameState.player2Points : gameState.player1Points;
    const matchPointOutcome = calculateMatchPoints(loserSL, loserPoints);

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
          matchPointOutcome={matchPointOutcome}
        />

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
              <div className="text-5xl font-bold text-emerald-600">{gameState.player1Points}</div>
              <div className="text-sm text-muted-foreground">of {gameState.player1Target} points</div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Innings:</span>
                <span className="font-semibold">{gameState.player1Innings}</span>
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
              <div className="text-5xl font-bold text-emerald-600">{gameState.player2Points}</div>
              <div className="text-sm text-muted-foreground">of {gameState.player2Target} points</div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Innings:</span>
                <span className="font-semibold">{gameState.player2Innings}</span>
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
      />

      {gameState.racks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Rack History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {gameState.racks.map((rack) => (
                <div key={rack.rackNumber} className="rounded-lg border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-semibold">Rack {rack.rackNumber}</span>
                    {rack.deadBalls > 0 && (
                      <Badge variant="outline">{rack.deadBalls} dead</Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">{gameState.player1}</p>
                      <p className="font-semibold">{rack.playerA.points} pts, {rack.playerA.innings} inn</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{gameState.player2}</p>
                      <p className="font-semibold">{rack.playerB.points} pts, {rack.playerB.innings} inn</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <EndMatchDialog onConfirm={handleEndMatch} disabled={!actor} />
    </div>
  );
}
