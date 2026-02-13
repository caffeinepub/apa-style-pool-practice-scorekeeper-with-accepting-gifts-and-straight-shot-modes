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
import { toast } from 'sonner';
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
      scratches: gameState.scratches + 1,
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

  const toggleEightBall = () => {
    if (!gameState) return;
    setGameState({
      ...gameState,
      eightBallPocketed: !gameState.eightBallPocketed,
    });
  };

  const handleEndMatch = async () => {
    if (!gameState || !identity) return;

    const totalStrokes = gameState.strokes;
    const isWin = totalStrokes <= 20;

    const { matchId, matchRecord } = buildStraightShotMatch({
      playerName: gameState.playerName,
      totalStrokes,
      scratches: gameState.scratches,
      ballsMade: gameState.ballsMade,
      eightBallPocketed: gameState.eightBallPocketed,
      notes: gameState.notes,
      identity,
    });

    await saveMatch.mutateAsync({ matchId, matchRecord });
    sessionStorage.removeItem('straightShotGame');
    
    if (isWin) {
      toast.success(`Session saved! You won with ${totalStrokes} strokes! 🎉`);
    } else {
      toast.success(`Session saved with ${totalStrokes} strokes.`);
    }
    
    navigate({ to: '/history' });
  };

  if (!gameState) {
    return null;
  }

  const totalStrokes = gameState.strokes;
  const isWin = totalStrokes <= 20;
  const allBallsPocketed = gameState.ballsMade === 15 && gameState.eightBallPocketed;
  const canEnd = allBallsPocketed;

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

      <Card className={`border-2 ${isWin ? 'border-emerald-500' : totalStrokes > 20 ? 'border-amber-500' : 'border-border'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Total Strokes</CardTitle>
            {isWin && allBallsPocketed && (
              <Badge className="bg-emerald-600 text-white">Winner! 🎉</Badge>
            )}
            {totalStrokes > 20 && (
              <Badge variant="outline" className="border-amber-500 text-amber-700 dark:text-amber-400">
                Over 20
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-6xl font-bold">{totalStrokes}</div>
            <div className="mt-2 text-sm text-muted-foreground">
              {20 - totalStrokes > 0 ? `${20 - totalStrokes} under par` : totalStrokes === 20 ? 'Right at 20!' : `${totalStrokes - 20} over par`}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Record Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={recordStroke}
              size="lg"
              className="h-20 gap-2"
            >
              <Plus className="h-5 w-5" />
              Normal Shot (+1)
            </Button>
            <Button
              onClick={recordScratch}
              size="lg"
              variant="destructive"
              className="h-20 gap-2"
            >
              <AlertTriangle className="h-5 w-5" />
              Scratch (+2)
            </Button>
          </div>
          {!gameState.scratchOnBreak && gameState.strokes === 0 && (
            <Button
              onClick={recordScratchOnBreak}
              size="lg"
              variant="outline"
              className="w-full gap-2 border-amber-500 text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950"
            >
              <AlertTriangle className="h-5 w-5" />
              Scratch on Break (+1)
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Balls Pocketed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{gameState.ballsMade} / 15</div>
                <div className="text-sm text-muted-foreground">balls made</div>
              </div>
              <Button onClick={recordBallMade} size="sm" variant="outline">
                <Plus className="mr-1 h-4 w-4" />
                Add Ball
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">8-Ball Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">
                  {gameState.eightBallPocketed ? (
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {gameState.eightBallPocketed ? 'Pocketed' : 'Not pocketed'}
                </div>
              </div>
              <Button onClick={toggleEightBall} size="sm" variant="outline">
                {gameState.eightBallPocketed ? 'Undo' : 'Mark Done'}
              </Button>
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
            <span className="text-muted-foreground">Total Strokes:</span>
            <span className="font-semibold">{totalStrokes}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Scratches:</span>
            <span className="font-semibold">{gameState.scratches} ({gameState.scratches * 2} strokes)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Balls Made:</span>
            <span className="font-semibold">{gameState.ballsMade} / 15</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">8-Ball:</span>
            <span className="font-semibold">{gameState.eightBallPocketed ? 'Pocketed ✓' : 'Not pocketed'}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="text-muted-foreground">Result:</span>
            <span className={`font-semibold ${isWin ? 'text-emerald-600' : 'text-amber-600'}`}>
              {isWin ? '20 or under ✓' : 'Over 20'}
            </span>
          </div>
        </CardContent>
      </Card>

      <Collapsible open={rulesOpen} onOpenChange={setRulesOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            View Rules
            <ChevronDown className={`h-4 w-4 transition-transform ${rulesOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4">
          <StraightShotRulesPanel />
        </CollapsibleContent>
      </Collapsible>

      <EndMatchDialog 
        onConfirm={handleEndMatch} 
        disabled={!canEnd}
      />
      
      {!canEnd && (
        <p className="text-center text-sm text-muted-foreground">
          Complete all 15 balls and pocket the 8-ball last to end the session
        </p>
      )}
    </div>
  );
}
