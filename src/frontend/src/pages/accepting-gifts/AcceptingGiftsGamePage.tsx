import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useSaveMatch, useSetAgLevelIndex } from '../../hooks/useQueries';
import { buildAcceptingGiftsMatch } from '../../lib/matches/matchBuilders';
import { applyAttemptResult, prepareNextSet, GameState } from '../../lib/accepting-gifts/acceptingGiftsSession';
import { getLevelByIndex, getMaxAttemptForLevel, computeNextBaselineLevel } from '../../lib/accepting-gifts/acceptingGiftsLevels';
import EndMatchDialog from '../../components/matches/EndMatchDialog';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useActor } from '../../hooks/useActor';
import { useActorRetry } from '../../hooks/useActorRetry';
import { toast } from 'sonner';
import { extractErrorText } from '../../utils/errorText';
import { SESSION_KEYS } from '@/lib/session/inProgressSessions';
import React from 'react';

type GamePhase = 'playing' | 'setComplete';

export default function AcceptingGiftsGamePage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const { retryConnection } = useActorRetry();
  const saveMatch = useSaveMatch();
  const setAgLevelIndex = useSetAgLevelIndex();
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
        baselineLevelIndex: parsed.baselineLevelIndex ?? 0,
        levelPlayedIndex: parsed.levelPlayedIndex ?? parsed.baselineLevelIndex ?? 0,
        playerSetScore: parsed.playerSetScore ?? 0,
        ghostSetScore: parsed.ghostSetScore ?? 0,
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

  const currentLevel = getLevelByIndex(gameState.levelPlayedIndex);
  const maxAttempt = getMaxAttemptForLevel(gameState.levelPlayedIndex);

  const handleAttemptInput = (attemptInput: number) => {
    setGameState((prev) => {
      if (!prev) return prev;
      const updated = applyAttemptResult(prev, attemptInput);

      if (updated.playerSetScore === 7 || updated.ghostSetScore === 7) {
        setGamePhase('setComplete');
      }

      return updated;
    });
  };

  const handleStartNextSet = () => {
    setGameState((prev) => {
      if (!prev) return prev;
      const nextSet = prepareNextSet(prev);
      return nextSet;
    });
    setGamePhase('playing');
  };

  const handleSaveAndStartNext = async () => {
    if (!identity) {
      toast.error('Please log in to save sessions');
      return;
    }

    if (!actor) {
      toast.error('Backend connection not ready. Please wait or retry connection.');
      return;
    }

    try {
      const playerWonMatch = gameState.playerSetScore === 7;
      const nextBaselineIndex = computeNextBaselineLevel(
        gameState.baselineLevelIndex,
        gameState.levelPlayedIndex,
        playerWonMatch
      );

      const levelPlayed = getLevelByIndex(gameState.levelPlayedIndex);
      const result = `${gameState.playerSetScore}-${gameState.ghostSetScore}`;
      const noteSummary = `${levelPlayed.label} | ${result}`;

      const baselineLevel = getLevelByIndex(gameState.baselineLevelIndex);

      const { matchId, matchRecord } = buildAcceptingGiftsMatch({
        playerName: gameState.playerName,
        notes: noteSummary + (gameState.notes ? `\n${gameState.notes}` : ''),
        startingObjectBallCount: baselineLevel.objectBallCount,
        endingObjectBallCount: levelPlayed.objectBallCount,
        totalAttempts: gameState.totalAttempts,
        setsCompleted: gameState.setsCompleted + 1,
        finalSetScorePlayer: gameState.playerSetScore,
        finalSetScoreGhost: gameState.ghostSetScore,
        completionStatus: true,
        score: gameState.setsCompleted + 1,
        identity,
      });

      await saveMatch.mutateAsync({ matchId, matchRecord });
      await setAgLevelIndex.mutateAsync(BigInt(nextBaselineIndex));
      toast.success('Session saved successfully!');

      // Clear old session and start new one at next level
      sessionStorage.removeItem(SESSION_KEYS.ACCEPTING_GIFTS);

      const nextLevel = getLevelByIndex(nextBaselineIndex);
      const newSession: GameState = {
        playerName: gameState.playerName,
        notes: '',
        baselineLevelIndex: nextBaselineIndex,
        levelPlayedIndex: nextBaselineIndex,
        playerSetScore: 0,
        ghostSetScore: 0,
        totalAttempts: 0,
        setsCompleted: 0,
        completed: false,
      };

      sessionStorage.setItem(SESSION_KEYS.ACCEPTING_GIFTS, JSON.stringify(newSession));
      setGameState(newSession);
      setGamePhase('playing');
    } catch (error) {
      const errorMessage = extractErrorText(error);
      toast.error(`Failed to save session: ${errorMessage}`);
    }
  };

  const handleSaveAndExit = async () => {
    if (!identity) {
      toast.error('Please log in to save sessions');
      return;
    }

    if (!actor) {
      toast.error('Backend connection not ready. Please wait or retry connection.');
      return;
    }

    try {
      const playerWonMatch = gameState.playerSetScore === 7;
      const nextBaselineIndex = computeNextBaselineLevel(
        gameState.baselineLevelIndex,
        gameState.levelPlayedIndex,
        playerWonMatch
      );

      const levelPlayed = getLevelByIndex(gameState.levelPlayedIndex);
      const result = `${gameState.playerSetScore}-${gameState.ghostSetScore}`;
      const noteSummary = `${levelPlayed.label} | ${result}`;

      const baselineLevel = getLevelByIndex(gameState.baselineLevelIndex);

      const { matchId, matchRecord } = buildAcceptingGiftsMatch({
        playerName: gameState.playerName,
        notes: noteSummary + (gameState.notes ? `\n${gameState.notes}` : ''),
        startingObjectBallCount: baselineLevel.objectBallCount,
        endingObjectBallCount: levelPlayed.objectBallCount,
        totalAttempts: gameState.totalAttempts,
        setsCompleted: gameState.setsCompleted + 1,
        finalSetScorePlayer: gameState.playerSetScore,
        finalSetScoreGhost: gameState.ghostSetScore,
        completionStatus: true,
        score: gameState.setsCompleted + 1,
        identity,
      });

      await saveMatch.mutateAsync({ matchId, matchRecord });
      await setAgLevelIndex.mutateAsync(BigInt(nextBaselineIndex));
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

  // Generate attempt buttons dynamically (0 to maxAttempt)
  const attemptButtons: React.ReactElement[] = [];
  for (let i = 0; i <= maxAttempt; i++) {
    attemptButtons.push(
      <Button
        key={i}
        onClick={() => handleAttemptInput(i)}
        className="w-full"
        size="lg"
        variant={i === maxAttempt ? 'default' : 'outline'}
      >
        {i}
      </Button>
    );
  }

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
              <div className="text-sm text-muted-foreground">Level</div>
              <div className="text-lg font-semibold">{currentLevel.label}</div>
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
            <p className="mb-4 text-sm text-muted-foreground">
              How many balls did you clear before missing? ({maxAttempt} = runout for {currentLevel.label})
            </p>
            <div className="grid grid-cols-4 gap-3">{attemptButtons}</div>
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
            <div className="flex flex-col gap-3">
              <Button onClick={handleSaveAndStartNext} className="w-full" size="lg" disabled={saveMatch.isPending || !isAuthenticated}>
                {saveMatch.isPending ? 'Saving...' : 'Save & Start Next Match'}
              </Button>
              <Button onClick={handleSaveAndExit} variant="outline" className="w-full" size="lg" disabled={saveMatch.isPending || !isAuthenticated}>
                {saveMatch.isPending ? 'Saving...' : 'Save & Exit'}
              </Button>
              <Button onClick={handleEndWithoutSaving} variant="ghost" className="w-full" size="lg">
                Exit Without Saving
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showRetryConnection && !actor && (
        <Alert>
          <AlertDescription className="flex items-center justify-between">
            <span>Still connecting to backend. Retry to save your session.</span>
            <Button onClick={handleRetryConnection} variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry Connection
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {!isAuthenticated && (
        <Alert>
          <AlertDescription>Please log in to save your session.</AlertDescription>
        </Alert>
      )}

      <EndMatchDialog
        open={showEndDialog}
        onOpenChange={setShowEndDialog}
        onConfirm={handleEndWithoutSaving}
        title="End Session Without Saving?"
        description="Are you sure you want to end this session without saving? All progress will be lost."
        confirmText="End Without Saving"
        disabled={false}
      />
    </div>
  );
}
