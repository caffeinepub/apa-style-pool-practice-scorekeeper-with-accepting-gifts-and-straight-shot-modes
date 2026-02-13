import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
import { useSaveMatch } from '../../hooks/useQueries';
import { buildStraightShotMatch } from '../../lib/matches/matchBuilders';
import EndMatchDialog from '../../components/matches/EndMatchDialog';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { toast } from 'sonner';

interface GameState {
  playerName: string;
  notes?: string;
  attempts: number;
  makes: number;
  currentStreak: number;
  bestStreak: number;
}

export default function StraightShotGamePage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const saveMatch = useSaveMatch();
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem('straightShotGame');
    if (saved) {
      setGameState(JSON.parse(saved));
    } else {
      navigate({ to: '/straight-shot/start' });
    }
  }, [navigate]);

  useEffect(() => {
    if (gameState) {
      sessionStorage.setItem('straightShotGame', JSON.stringify(gameState));
    }
  }, [gameState]);

  const recordShot = (made: boolean) => {
    if (!gameState) return;

    const newAttempts = gameState.attempts + 1;
    const newMakes = made ? gameState.makes + 1 : gameState.makes;
    const newCurrentStreak = made ? gameState.currentStreak + 1 : 0;
    const newBestStreak = Math.max(gameState.bestStreak, newCurrentStreak);

    setGameState({
      ...gameState,
      attempts: newAttempts,
      makes: newMakes,
      currentStreak: newCurrentStreak,
      bestStreak: newBestStreak,
    });
  };

  const handleEndMatch = async () => {
    if (!gameState || !identity) return;

    const { matchId, matchRecord } = buildStraightShotMatch({
      playerName: gameState.playerName,
      attempts: gameState.attempts,
      makes: gameState.makes,
      notes: gameState.notes,
      identity,
    });

    await saveMatch.mutateAsync({ matchId, matchRecord });
    sessionStorage.removeItem('straightShotGame');
    toast.success('Session saved successfully!');
    navigate({ to: '/history' });
  };

  if (!gameState) {
    return null;
  }

  const percentage = gameState.attempts > 0 
    ? ((gameState.makes / gameState.attempts) * 100).toFixed(1) 
    : '0.0';

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/' })}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Button>

      <div className="text-center">
        <h1 className="text-2xl font-bold">Straight Shot Session</h1>
        <p className="text-muted-foreground">{gameState.playerName}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Record Shot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => recordShot(true)}
              size="lg"
              className="h-24 gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              <CheckCircle2 className="h-6 w-6" />
              Made
            </Button>
            <Button
              onClick={() => recordShot(false)}
              size="lg"
              variant="destructive"
              className="h-24 gap-2"
            >
              <XCircle className="h-6 w-6" />
              Missed
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold">{percentage}%</div>
              <div className="text-sm text-muted-foreground">
                {gameState.makes} / {gameState.attempts}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold">{gameState.currentStreak}</div>
              <div className="text-sm text-muted-foreground">in a row</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Best Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold">{gameState.bestStreak}</div>
              <div className="text-sm text-muted-foreground">personal best</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Session Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Attempts:</span>
            <span className="font-semibold">{gameState.attempts}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Successful Shots:</span>
            <span className="font-semibold">{gameState.makes}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Missed Shots:</span>
            <span className="font-semibold">{gameState.attempts - gameState.makes}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Best Streak:</span>
            <span className="font-semibold">{gameState.bestStreak}</span>
          </div>
        </CardContent>
      </Card>

      <EndMatchDialog onConfirm={handleEndMatch} disabled={gameState.attempts === 0} />
    </div>
  );
}
