import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, AlertTriangle, CheckCircle2, ChevronDown } from 'lucide-react';
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
  strokes: number;
  scratches: number;
  ballsMade: number;
  eightBallPocketed: boolean;
  scratchOnBreak: boolean;
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

  const recordStroke = () => {
    if (!gameState) return;
    setGameState({
      ...gameState,
      strokes: gameState.strokes + 1,
    });
  };

  const recordScratch = () => {
    if (!gameState) return;
    setGameState({
      ...gameState,
      strokes: gameState.strokes + 2,
      scratches: gameState.scratches + 1,
    });
  };

  const recordScratchOnBreak = () => {
    if (!gameState) return;
    setGameState({
      ...gameState,
      strokes: gameState.strokes + 1,
      scratchOnBreak: true,
    });
  };

  const recordBallMade = () => {
    if (!gameState) return;
    setGameState({
      ...gameState,
      ballsMade: gameState.ballsMade + 1,
    });
  };

  const recordEightBall = () => {
    if (!gameState) return;
    setGameState({
      ...gameState,
      eightBallPocketed: true,
    });
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
      const totalStrokes = gameState.strokes;
      const shots = gameState.ballsMade + (gameState.eightBallPocketed ? 1 : 0);

      // Calculate scores for each shot
      const firstShotScore = Math.min(totalStrokes, 5);
      const secondShotScore = Math.max(0, Math.min(totalStrokes - 5, 5));
      const thirdShotScore = Math.max(0, Math.min(totalStrokes - 10, 5));
      const fourthShotScore = Math.max(0, Math.min(totalStrokes - 15, 5));
      const totalScore = firstShotScore + secondShotScore + thirdShotScore + fourthShotScore;

      const { matchId, matchRecord } = buildStraightShotMatch({
        playerName: gameState.playerName,
        notes: gameState.notes,
        strokes: [totalStrokes],
        scratchStrokes: [gameState.scratches],
        shots,
        ballsMade: gameState.ballsMade,
        firstShotScore,
        secondShotScore,
        thirdShotScore,
        fourthShotScore,
        totalScore,
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

  const isComplete = gameState.strokes >= 20;
  const isWin = isComplete && gameState.strokes <= 20;

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
            <span>Current Session</span>
            {isComplete && (
              <Badge variant={isWin ? 'default' : 'destructive'}>
                {isWin ? 'Win' : 'Loss'}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-6xl font-bold text-emerald-600">{gameState.strokes}</div>
            <div className="text-sm text-muted-foreground">Total Strokes</div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4 text-center">
              <div className="text-3xl font-bold">{gameState.scratches}</div>
              <div className="text-sm text-muted-foreground">Scratches</div>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <div className="text-3xl font-bold">{gameState.ballsMade}</div>
              <div className="text-sm text-muted-foreground">Balls Made</div>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <div className="text-3xl font-bold">{gameState.eightBallPocketed ? '✓' : '—'}</div>
              <div className="text-sm text-muted-foreground">8-Ball</div>
            </div>
          </div>

          <div className="space-y-3">
            <Button onClick={recordStroke} className="w-full h-16 text-lg" variant="default">
              <Plus className="mr-2 h-5 w-5" />
              Normal Shot (+1 stroke)
            </Button>
            <Button onClick={recordScratch} className="w-full h-16 text-lg" variant="outline">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Scratch (+2 strokes)
            </Button>
            {!gameState.scratchOnBreak && (
              <Button onClick={recordScratchOnBreak} className="w-full h-16 text-lg" variant="outline">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Scratch on Break (+1 stroke)
              </Button>
            )}
            <div className="grid gap-3 md:grid-cols-2">
              <Button onClick={recordBallMade} variant="secondary" className="h-12">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Ball Made
              </Button>
              <Button 
                onClick={recordEightBall} 
                variant="secondary" 
                className="h-12"
                disabled={gameState.eightBallPocketed}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                8-Ball Pocketed
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <EndMatchDialog onConfirm={handleEndMatch} disabled={!actor} />
    </div>
  );
}
