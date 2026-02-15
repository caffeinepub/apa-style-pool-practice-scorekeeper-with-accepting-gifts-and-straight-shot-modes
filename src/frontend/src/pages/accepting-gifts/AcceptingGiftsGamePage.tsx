import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useSaveMatch, useSetCurrentObjectBallCount } from '../../hooks/useQueries';
import { buildAcceptingGiftsMatch } from '../../lib/matches/matchBuilders';
import { applyAttemptResult, prepareNextSet } from '../../lib/accepting-gifts/acceptingGiftsSession';
import EndMatchDialog from '../../components/matches/EndMatchDialog';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useActor } from '../../hooks/useActor';
import { useActorRetry } from '../../hooks/useActorRetry';
import { toast } from 'sonner';
import { extractErrorText } from '../../utils/errorText';
import { SESSION_KEYS } from '@/lib/session/inProgressSessions';

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

type GamePhase = 'playing' | 'setComplete';

export default function AcceptingGiftsGamePage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const { retryConnection } = useActorRetry();
  const saveMatch = useSaveMatch();
  const setCurrentObjectBallCount = useSetCurrentObjectBallCount();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gamePhase, setGamePhase] = useState<GamePhase>('playing');
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [showRetryConnection, setShowRetryConnection] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEYS.ACCEPTING_GIFTS);
    if (saved) {
      const parsed = JSON.parse(saved);
      const migratedState: GameState = {
        playerName: parsed.playerName,
        notes: parsed.notes,
        startingObjectBallCount: parsed.startingObjectBallCount,
        currentObjectBallCount: parsed.currentObjectBallCount,
        playerSetScore: parsed.playerSetScore ?? parsed.finalSetScorePlayer ?? 0,
        ghostSetScore: parsed.ghostSetScore ?? parsed.finalSetScoreGhost ?? 0,
        totalAttempts: parsed.totalAttempts ?? 0,
        setsCompleted: parsed.setsCompleted ?? 0,
        completed: parsed.completed ?? false,
      };
      setGameState(migratedState);
    } else {
      navigate({ to: '/accepting-gifts/start' });
    }
  }, [navigate]);

  useEffect(() => {
    if (gameState) {
      sessionStorage.setItem(SESSION_KEYS.ACCEPTING_GIFTS, JSON.stringify(gameState));
    }
  }, [gameState]);

  useEffect(() => {
    if (showEndDialog && !actor) {
      const timer = setTimeout(() => {
        setShowRetryConnection(true);
      }, 8000);
      return () => clearTimeout(timer);
    } else {
      setShowRetryConnection(false);
    }
  }, [showEndDialog, actor]);

  if (!gameState) {
    return (
      <div className="container mx-auto max-w-4xl p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Loading session...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAttemptInput = (ballsCleared: number) => {
    setGameState(prev => {
      if (!prev) return prev;
      const updated = applyAttemptResult(prev, ballsCleared);
      
      if (updated.playerSetScore === 7 || updated.ghostSetScore === 7) {
        setGamePhase('setComplete');
      }
      
      return updated;
    });
  };

  const handleStartNextSet = () => {
    setGameState(prev => {
      if (!prev) return prev;
      const playerWonSet = prev.playerSetScore === 7;
      const nextSet = prepareNextSet(prev, playerWonSet);
      return nextSet;
    });
    setGamePhase('playing');
  };

  const handleEndSession = async () => {
    if (!identity) {
      toast.error('Please log in to save sessions');
      return;
    }

    if (!actor) {
      toast.error('Backend connection not ready. Please wait or retry connection.');
      return;
    }

    try {
      const { matchId, matchRecord } = buildAcceptingGiftsMatch({
        playerName: gameState.playerName,
        notes: gameState.notes,
        startingObjectBallCount: gameState.startingObjectBallCount,
        endingObjectBallCount: gameState.currentObjectBallCount,
        totalAttempts: gameState.totalAttempts,
        setsCompleted: gameState.setsCompleted,
        finalSetScorePlayer: gameState.playerSetScore,
        finalSetScoreGhost: gameState.ghostSetScore,
        completionStatus: true,
        score: gameState.setsCompleted,
        identity,
      });

      await saveMatch.mutateAsync({ matchId, matchRecord });
      await setCurrentObjectBallCount.mutateAsync(BigInt(gameState.currentObjectBallCount));
      toast.success('Session saved successfully!');
      sessionStorage.removeItem(SESSION_KEYS.ACCEPTING_GIFTS);
      navigate({ to: '/history' });
    } catch (error) {
      const errorMessage = extractErrorText(error);
      toast.error(`Failed to save session: ${errorMessage}`);
    }
  };

  const handleEndWithoutSaving = () => {
    sessionStorage.removeItem(SESSION_KEYS.ACCEPTING_GIFTS);
    toast.info('Session ended without saving');
    navigate({ to: '/accepting-gifts/start' });
  };

  const handleRetryConnection = async () => {
    try {
      await retryConnection();
      toast.success('Connection restored');
    } catch (error) {
      toast.error('Failed to restore connection');
    }
  };

  const isAuthenticated = !!identity;
  const setIsComplete = gameState.playerSetScore === 7 || gameState.ghostSetScore === 7;

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate({ to: '/' })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        <h1 className="text-2xl font-bold">Accepting Gifts</h1>
        <div className="w-24" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Session Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Player</div>
              <div className="text-lg font-semibold">{gameState.playerName}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Object Balls</div>
              <div className="text-lg font-semibold">{gameState.currentObjectBallCount}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Attempts</div>
              <div className="text-lg font-semibold">{gameState.totalAttempts}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Sets Completed</div>
              <div className="text-lg font-semibold">{gameState.setsCompleted}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Set (Race to 7)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-around">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Me</div>
              <div className="text-4xl font-bold">{gameState.playerSetScore}</div>
            </div>
            <div className="text-2xl text-muted-foreground">–</div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Ghost</div>
              <div className="text-4xl font-bold">{gameState.ghostSetScore}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {gamePhase === 'playing' && !setIsComplete && (
        <Card>
          <CardHeader>
            <CardTitle>Record Attempt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">
              How many balls did you clear before missing? (3 = runout)
            </p>
            <div className="grid grid-cols-4 gap-3">
              <Button
                onClick={() => handleAttemptInput(0)}
                className="w-full"
                size="lg"
                variant="outline"
              >
                0
              </Button>
              <Button
                onClick={() => handleAttemptInput(1)}
                className="w-full"
                size="lg"
                variant="outline"
              >
                1
              </Button>
              <Button
                onClick={() => handleAttemptInput(2)}
                className="w-full"
                size="lg"
                variant="outline"
              >
                2
              </Button>
              <Button
                onClick={() => handleAttemptInput(3)}
                className="w-full"
                size="lg"
                variant="default"
              >
                3
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {setIsComplete && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Set Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-lg">
              {gameState.playerSetScore === 7 ? (
                <span className="font-semibold text-green-600">You won this set! 🎉</span>
              ) : (
                <span className="font-semibold text-orange-600">Ghost won this set</span>
              )}
            </p>
            <p className="text-center text-sm text-muted-foreground">
              {gameState.playerSetScore === 7
                ? `Next set will use ${Math.min(gameState.currentObjectBallCount + 1, 7)} balls`
                : `Next set will use ${Math.max(gameState.currentObjectBallCount - 1, 2)} balls`}
            </p>
            <div className="flex gap-3">
              <Button
                onClick={handleStartNextSet}
                className="flex-1"
                size="lg"
              >
                Start Next Set
              </Button>
              <Button
                onClick={() => setShowEndDialog(true)}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                End & Save Session
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showRetryConnection && !actor && (
        <Alert>
          <AlertDescription className="flex items-center justify-between">
            <span>Still connecting to backend. Retry to save your session.</span>
            <Button size="sm" variant="outline" onClick={handleRetryConnection}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Connection
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {!setIsComplete && (
        <div className="space-y-2">
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

      <EndMatchDialog
        open={showEndDialog}
        onOpenChange={setShowEndDialog}
        onConfirm={handleEndSession}
        title="End Accepting Gifts Session?"
        description="Your session will be saved to history and your progress will be preserved."
        confirmText="Save Session"
        isPending={saveMatch.isPending}
        disabled={!isAuthenticated}
      />
    </div>
  );
}
