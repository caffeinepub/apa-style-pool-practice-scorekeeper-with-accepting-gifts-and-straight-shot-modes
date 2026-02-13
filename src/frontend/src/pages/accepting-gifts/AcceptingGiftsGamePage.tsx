import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Minus, Info } from 'lucide-react';
import { useSaveMatch } from '../../hooks/useQueries';
import { buildAcceptingGiftsMatch } from '../../lib/matches/matchBuilders';
import EndMatchDialog from '../../components/matches/EndMatchDialog';
import AcceptingGiftsRulesPanel from './AcceptingGiftsRulesPanel';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { toast } from 'sonner';

interface GameState {
  playerName: string;
  notes?: string;
  score: number;
  attempts: number;
  completed: boolean;
}

export default function AcceptingGiftsGamePage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const saveMatch = useSaveMatch();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [rulesOpen, setRulesOpen] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem('acceptingGiftsGame');
    if (saved) {
      setGameState(JSON.parse(saved));
    } else {
      navigate({ to: '/accepting-gifts/start' });
    }
  }, [navigate]);

  useEffect(() => {
    if (gameState) {
      sessionStorage.setItem('acceptingGiftsGame', JSON.stringify(gameState));
    }
  }, [gameState]);

  const adjustScore = (delta: number) => {
    if (!gameState) return;
    const newScore = gameState.score + delta;
    if (newScore < 0) return;
    setGameState({ ...gameState, score: newScore });
  };

  const adjustAttempts = (delta: number) => {
    if (!gameState) return;
    const newAttempts = gameState.attempts + delta;
    if (newAttempts < 0) return;
    setGameState({ ...gameState, attempts: newAttempts });
  };

  const handleEndMatch = async () => {
    if (!gameState || !identity) return;

    const { matchId, matchRecord } = buildAcceptingGiftsMatch({
      playerName: gameState.playerName,
      score: gameState.score,
      notes: gameState.notes,
      completionStatus: gameState.completed,
      identity,
    });

    await saveMatch.mutateAsync({ matchId, matchRecord });
    sessionStorage.removeItem('acceptingGiftsGame');
    toast.success('Session saved successfully!');
    navigate({ to: '/history' });
  };

  if (!gameState) {
    return null;
  }

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
        <h1 className="text-2xl font-bold">Accepting Gifts Session</h1>
        <p className="text-muted-foreground">{gameState.playerName}</p>
      </div>

      <Collapsible open={rulesOpen} onOpenChange={setRulesOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full gap-2">
            <Info className="h-4 w-4" />
            {rulesOpen ? 'Hide Rules' : 'Show Rules'}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4">
          <AcceptingGiftsRulesPanel />
        </CollapsibleContent>
      </Collapsible>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Score</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-6xl font-bold">{gameState.score}</div>
              <div className="text-sm text-muted-foreground">Points</div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => adjustScore(-1)}
                variant="outline"
                className="flex-1"
                disabled={gameState.score === 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => adjustScore(1)}
                variant="outline"
                className="flex-1"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attempts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-6xl font-bold">{gameState.attempts}</div>
              <div className="text-sm text-muted-foreground">Total Attempts</div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => adjustAttempts(-1)}
                variant="outline"
                className="flex-1"
                disabled={gameState.attempts === 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => adjustAttempts(1)}
                variant="outline"
                className="flex-1"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Session Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => setGameState({ ...gameState, completed: !gameState.completed })}
            variant={gameState.completed ? 'default' : 'outline'}
            className="w-full"
          >
            {gameState.completed ? 'Marked as Completed' : 'Mark as Completed'}
          </Button>
        </CardContent>
      </Card>

      <EndMatchDialog onConfirm={handleEndMatch} />
    </div>
  );
}
