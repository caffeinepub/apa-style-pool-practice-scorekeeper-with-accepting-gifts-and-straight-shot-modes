import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useSaveMatch } from '../../hooks/useQueries';
import { buildStraightShotMatch } from '../../lib/matches/matchBuilders';
import EndMatchDialog from '../../components/matches/EndMatchDialog';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useActor } from '../../hooks/useActor';
import { toast } from 'sonner';
import { extractErrorText } from '../../utils/errorText';
import StraightShotRulesPanel from './StraightShotRulesPanel';

interface GameState {
  playerName: string;
  notes?: string;
  totalShots: number;
}

export default function StraightShotGamePage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const saveMatch = useSaveMatch();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [rulesOpen, setRulesOpen] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem('straightShotGame');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Backward-compatible migration: prefer totalShots, fallback to strokes if present
        const totalShots = parsed.totalShots !== undefined ? parsed.totalShots : (parsed.strokes || 0);
        setGameState({
          playerName: parsed.playerName,
          notes: parsed.notes,
          totalShots,
        });
      } catch (error) {
        console.error('Error parsing saved game state:', error);
        navigate({ to: '/straight-shot/start' });
      }
    } else {
      navigate({ to: '/straight-shot/start' });
    }
  }, [navigate]);

  useEffect(() => {
    if (gameState) {
      sessionStorage.setItem('straightShotGame', JSON.stringify(gameState));
    }
  }, [gameState]);

  const handleTotalShotsChange = (value: string) => {
    if (!gameState) return;
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      setGameState({
        ...gameState,
        totalShots: numValue,
      });
    } else if (value === '') {
      setGameState({
        ...gameState,
        totalShots: 0,
      });
    }
  };

  const handleEndMatch = async () => {
    if (!gameState || !identity) {
      toast.error('You must be logged in to save a session');
      return;
    }

    if (!actor) {
      toast.error('Backend connection not ready. Please wait and try again.');
      return;
    }

    try {
      const totalStrokes = gameState.totalShots;

      const { matchId, matchRecord } = buildStraightShotMatch({
        playerName: gameState.playerName,
        notes: gameState.notes,
        strokes: [totalStrokes],
        scratchStrokes: [0],
        shots: 0,
        ballsMade: 0,
        firstShotScore: 0,
        secondShotScore: 0,
        thirdShotScore: 0,
        fourthShotScore: 0,
        totalScore: totalStrokes,
        identity,
      });

      await saveMatch.mutateAsync({ matchId, matchRecord });
      sessionStorage.removeItem('straightShotGame');
      toast.success('Session saved successfully!');
      navigate({ to: '/history' });
    } catch (error) {
      const errorText = extractErrorText(error);
      toast.error(errorText);
      console.error('Error saving session:', error);
    }
  };

  if (!gameState) {
    return null;
  }

  const isWin = gameState.totalShots > 0 && gameState.totalShots <= 20;
  const isLoss = gameState.totalShots > 20;

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
        <h1 className="text-2xl font-bold">Straight Shot Strokes Drill</h1>
        <p className="text-muted-foreground">{gameState.playerName}</p>
      </div>

      <Collapsible open={rulesOpen} onOpenChange={setRulesOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full gap-2">
            <ChevronDown className={`h-4 w-4 transition-transform ${rulesOpen ? 'rotate-180' : ''}`} />
            {rulesOpen ? 'Hide Rules' : 'Show Rules'}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4">
          <StraightShotRulesPanel />
        </CollapsibleContent>
      </Collapsible>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Record Your Result</span>
            {isWin && (
              <Badge variant="default">Win</Badge>
            )}
            {isLoss && (
              <Badge variant="destructive">Loss</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="totalShots">Total Shots</Label>
            <Input
              id="totalShots"
              type="number"
              min="0"
              value={gameState.totalShots}
              onChange={(e) => handleTotalShotsChange(e.target.value)}
              placeholder="Enter total shots taken"
              className="text-2xl font-bold text-center h-16"
            />
            <p className="text-sm text-muted-foreground text-center">
              Enter the total number of shots you took to clear the table
            </p>
          </div>

          <div className="rounded-lg border bg-muted/50 p-4 text-center">
            <p className="text-sm font-medium mb-2">Win Condition</p>
            <p className="text-xs text-muted-foreground">
              20 shots or under is a <span className="font-semibold text-emerald-600">Win</span>
              <br />
              Over 20 shots is a <span className="font-semibold text-destructive">Loss</span>
            </p>
          </div>
        </CardContent>
      </Card>

      <EndMatchDialog onConfirm={handleEndMatch} disabled={!actor} />
    </div>
  );
}
