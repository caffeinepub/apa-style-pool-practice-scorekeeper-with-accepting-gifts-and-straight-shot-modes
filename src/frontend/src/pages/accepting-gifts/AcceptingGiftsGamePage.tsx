import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Info, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { useSaveMatch, useCompleteSession, useSetCurrentObjectBallCount } from '../../hooks/useQueries';
import { buildAcceptingGiftsMatch } from '../../lib/matches/matchBuilders';
import EndMatchDialog from '../../components/matches/EndMatchDialog';
import AcceptingGiftsRulesPanel from './AcceptingGiftsRulesPanel';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useActor } from '../../hooks/useActor';
import { toast } from 'sonner';
import { extractErrorText } from '../../utils/errorText';
import { clampObjectBallCount, applyAttemptResult, prepareNextSet } from '../../lib/accepting-gifts/acceptingGiftsSession';

interface GameState {
  playerName: string;
  notes?: string;
  startingObjectBallCount: number;
  currentObjectBallCount: number;
  playerSetScore: number;
  ghostSetScore: number;
  totalAttempts: number;
  setsCompleted: number;
  completed: boolean;
}

export default function AcceptingGiftsGamePage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const saveMatch = useSaveMatch();
  const completeSession = useCompleteSession();
  const setBaselineMutation = useSetCurrentObjectBallCount();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [rulesOpen, setRulesOpen] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem('acceptingGiftsGame');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure all new fields exist for backward compatibility
      const loadedState: GameState = {
        playerName: parsed.playerName,
        notes: parsed.notes,
        startingObjectBallCount: parsed.startingObjectBallCount ?? 3,
        currentObjectBallCount: parsed.currentObjectBallCount ?? parsed.startingObjectBallCount ?? 3,
        playerSetScore: parsed.playerSetScore ?? 0,
        ghostSetScore: parsed.ghostSetScore ?? 0,
        totalAttempts: parsed.totalAttempts ?? 0,
        setsCompleted: parsed.setsCompleted ?? 0,
        completed: parsed.completed ?? false,
      };
      // Clamp current count to 2-7 for safety (handles old sessions with 1)
      loadedState.currentObjectBallCount = clampObjectBallCount(loadedState.currentObjectBallCount);
      setGameState(loadedState);
    } else {
      navigate({ to: '/accepting-gifts/start' });
    }
  }, [navigate]);

  useEffect(() => {
    if (gameState) {
      sessionStorage.setItem('acceptingGiftsGame', JSON.stringify(gameState));
      // Persist current count to backend for cross-session resume
      setBaselineMutation.mutate(BigInt(gameState.currentObjectBallCount));
    }
  }, [gameState]);

  const handleAttemptOutcome = (playerScored: boolean) => {
    if (!gameState) return;

    const updated = applyAttemptResult(gameState, playerScored);

    // Check if set is complete (either side reached 7)
    if (updated.playerSetScore >= 7 || updated.ghostSetScore >= 7) {
      const playerWonSet = updated.playerSetScore >= 7;
      const nextState = prepareNextSet(updated, playerWonSet);
      setGameState(nextState);
      toast.success(
        playerWonSet
          ? `Set won! Next set: ${nextState.currentObjectBallCount} object balls`
          : `Set lost. Next set: ${nextState.currentObjectBallCount} object balls`
      );
    } else {
      setGameState(updated);
    }
  };

  const handleSetBaseline = async () => {
    if (!gameState) return;
    try {
      await setBaselineMutation.mutateAsync(BigInt(gameState.currentObjectBallCount));
      toast.success(`Baseline set to ${gameState.currentObjectBallCount} object balls`);
    } catch (error) {
      const errorText = extractErrorText(error);
      toast.error(errorText);
      console.error('Failed to set baseline:', error);
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
      const { matchId, matchRecord } = buildAcceptingGiftsMatch({
        playerName: gameState.playerName,
        notes: gameState.notes,
        identity,
        startingObjectBallCount: gameState.startingObjectBallCount,
        endingObjectBallCount: gameState.currentObjectBallCount,
        totalAttempts: gameState.totalAttempts,
        setsCompleted: gameState.setsCompleted,
        finalSetScorePlayer: gameState.playerSetScore,
        finalSetScoreGhost: gameState.ghostSetScore,
      });

      await saveMatch.mutateAsync({ matchId, matchRecord });
      // Persist the ending count as the new baseline for future sessions
      await completeSession.mutateAsync(BigInt(gameState.currentObjectBallCount));
      sessionStorage.removeItem('acceptingGiftsGame');
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

  const isSetInProgress = gameState.playerSetScore < 7 && gameState.ghostSetScore < 7;

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

      <Card>
        <CardHeader>
          <CardTitle>Current Set (Race to 7)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border-2 border-primary bg-primary/5 p-4">
            <div className="text-center text-sm text-muted-foreground mb-2">
              Playing with {gameState.currentObjectBallCount} object ball{gameState.currentObjectBallCount !== 1 ? 's' : ''} + 8-ball
            </div>
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <div className="text-sm font-medium text-muted-foreground mb-1">You</div>
                <div className="text-5xl font-bold text-emerald-600">{gameState.playerSetScore}</div>
              </div>
              <div className="text-3xl font-bold text-muted-foreground">-</div>
              <div className="text-center">
                <div className="text-sm font-medium text-muted-foreground mb-1">Ghost</div>
                <div className="text-5xl font-bold text-amber-600">{gameState.ghostSetScore}</div>
              </div>
            </div>
          </div>

          {isSetInProgress && (
            <div className="grid gap-3 md:grid-cols-2">
              <Button
                onClick={() => handleAttemptOutcome(true)}
                className="h-20 text-lg gap-2"
                variant="default"
              >
                <CheckCircle className="h-6 w-6" />
                Run Out (Point)
              </Button>
              <Button
                onClick={() => handleAttemptOutcome(false)}
                className="h-20 text-lg gap-2"
                variant="outline"
              >
                <XCircle className="h-6 w-6" />
                Missed / Failed Run (Ghost Point)
              </Button>
            </div>
          )}

          {!isSetInProgress && (
            <div className="rounded-lg border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950 p-4 text-center">
              <p className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">
                {gameState.playerSetScore >= 7 ? 'Set Won! 🎉' : 'Set Lost'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Next set will use {gameState.currentObjectBallCount} object ball{gameState.currentObjectBallCount !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          <Button
            variant="outline"
            onClick={handleSetBaseline}
            disabled={setBaselineMutation.isPending}
            className="w-full gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Set Current Count ({gameState.currentObjectBallCount}) as Baseline
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold">{gameState.totalAttempts}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sets Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold">{gameState.setsCompleted}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Session Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setGameState({ ...gameState, completed: !gameState.completed })}
              variant={gameState.completed ? 'default' : 'outline'}
              className="w-full"
            >
              {gameState.completed ? 'Completed ✓' : 'Mark Complete'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <EndMatchDialog onConfirm={handleEndMatch} disabled={!actor} />
    </div>
  );
}
