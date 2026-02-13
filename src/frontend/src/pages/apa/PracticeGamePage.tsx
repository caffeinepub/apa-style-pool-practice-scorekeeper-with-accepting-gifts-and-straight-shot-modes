import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Minus, Trophy } from 'lucide-react';
import { useSaveMatch } from '../../hooks/useQueries';
import { buildApaPracticeMatch } from '../../lib/matches/matchBuilders';
import EndMatchDialog from '../../components/matches/EndMatchDialog';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { toast } from 'sonner';

interface GameState {
  player1: string;
  player2: string;
  target: number;
  notes?: string;
  score1: number;
  score2: number;
  innings: Array<{ player: number; points: number; description: string }>;
}

export default function PracticeGamePage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const saveMatch = useSaveMatch();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [inningPoints, setInningPoints] = useState('');
  const [inningDesc, setInningDesc] = useState('');
  const [activePlayer, setActivePlayer] = useState<1 | 2>(1);

  useEffect(() => {
    const saved = sessionStorage.getItem('apaPracticeGame');
    if (saved) {
      setGameState(JSON.parse(saved));
    } else {
      navigate({ to: '/apa-practice/start' });
    }
  }, [navigate]);

  useEffect(() => {
    if (gameState) {
      sessionStorage.setItem('apaPracticeGame', JSON.stringify(gameState));
    }
  }, [gameState]);

  const adjustScore = (player: 1 | 2, delta: number) => {
    if (!gameState) return;
    const newScore = player === 1 ? gameState.score1 + delta : gameState.score2 + delta;
    if (newScore < 0) return;

    setGameState({
      ...gameState,
      score1: player === 1 ? newScore : gameState.score1,
      score2: player === 2 ? newScore : gameState.score2,
    });
  };

  const addInning = () => {
    if (!gameState || !inningPoints) return;
    const points = parseInt(inningPoints);
    if (isNaN(points) || points < 0) return;

    const newInnings = [
      ...gameState.innings,
      { player: activePlayer, points, description: inningDesc.trim() },
    ];

    setGameState({
      ...gameState,
      innings: newInnings,
      score1: activePlayer === 1 ? gameState.score1 + points : gameState.score1,
      score2: activePlayer === 2 ? gameState.score2 + points : gameState.score2,
    });

    setInningPoints('');
    setInningDesc('');
  };

  const handleEndMatch = async () => {
    if (!gameState || !identity) return;

    const { matchId, matchRecord } = buildApaPracticeMatch({
      player1: gameState.player1,
      player2: gameState.player2,
      score1: gameState.score1,
      score2: gameState.score2,
      notes: gameState.notes,
      innings: gameState.innings,
      identity,
    });

    await saveMatch.mutateAsync({ matchId, matchRecord });
    sessionStorage.removeItem('apaPracticeGame');
    toast.success('Match saved successfully!');
    navigate({ to: '/history' });
  };

  if (!gameState) {
    return null;
  }

  const winner = gameState.score1 >= gameState.target ? 1 : gameState.score2 >= gameState.target ? 2 : null;

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
        <h1 className="text-2xl font-bold">APA Practice Match</h1>
        <p className="text-muted-foreground">Race to {gameState.target}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className={activePlayer === 1 ? 'ring-2 ring-emerald-500' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{gameState.player1}</span>
              {winner === 1 && <Trophy className="h-5 w-5 text-yellow-500" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-5xl font-bold">{gameState.score1}</div>
              <div className="text-sm text-muted-foreground">Score</div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => adjustScore(1, -1)}
                variant="outline"
                className="flex-1"
                disabled={gameState.score1 === 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => adjustScore(1, 1)}
                variant="outline"
                className="flex-1"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={() => setActivePlayer(1)}
              variant={activePlayer === 1 ? 'default' : 'outline'}
              className="w-full"
            >
              Active Player
            </Button>
          </CardContent>
        </Card>

        <Card className={activePlayer === 2 ? 'ring-2 ring-emerald-500' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{gameState.player2}</span>
              {winner === 2 && <Trophy className="h-5 w-5 text-yellow-500" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-5xl font-bold">{gameState.score2}</div>
              <div className="text-sm text-muted-foreground">Score</div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => adjustScore(2, -1)}
                variant="outline"
                className="flex-1"
                disabled={gameState.score2 === 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => adjustScore(2, 1)}
                variant="outline"
                className="flex-1"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={() => setActivePlayer(2)}
              variant={activePlayer === 2 ? 'default' : 'outline'}
              className="w-full"
            >
              Active Player
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Inning</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="points">Points Scored</Label>
              <Input
                id="points"
                type="number"
                min="0"
                value={inningPoints}
                onChange={(e) => setInningPoints(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Description (Optional)</Label>
              <Input
                id="desc"
                value={inningDesc}
                onChange={(e) => setInningDesc(e.target.value)}
                placeholder="e.g., Run out"
              />
            </div>
          </div>
          <Button
            onClick={addInning}
            disabled={!inningPoints}
            className="w-full"
          >
            Add Inning for {activePlayer === 1 ? gameState.player1 : gameState.player2}
          </Button>
        </CardContent>
      </Card>

      {gameState.innings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Inning Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {gameState.innings.map((inning, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <span className="font-medium">
                      {inning.player === 1 ? gameState.player1 : gameState.player2}
                    </span>
                    {inning.description && (
                      <span className="ml-2 text-sm text-muted-foreground">
                        - {inning.description}
                      </span>
                    )}
                  </div>
                  <span className="font-bold">{inning.points}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <EndMatchDialog onConfirm={handleEndMatch} />
    </div>
  );
}
