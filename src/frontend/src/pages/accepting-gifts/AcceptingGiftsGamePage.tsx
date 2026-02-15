import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, ChevronDown, RefreshCw } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useSaveMatch, useCompleteSession } from '../../hooks/useQueries';
import { buildAcceptingGiftsMatch } from '../../lib/matches/matchBuilders';
import EndMatchDialog from '../../components/matches/EndMatchDialog';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useActor } from '../../hooks/useActor';
import { useActorRetry } from '../../hooks/useActorRetry';
import { toast } from 'sonner';
import { extractErrorText } from '../../utils/errorText';
import AcceptingGiftsRulesPanel from './AcceptingGiftsRulesPanel';

interface SessionState {
  playerName: string;
  notes?: string;
  startingObjectBallCount: number;
  currentObjectBallCount: number;
  currentSetScorePlayer: number;
  currentSetScoreGhost: number;
  totalAttempts: number;
  setsCompleted: number;
}

type AttemptResult = 'make' | 'miss';

export default function AcceptingGiftsGamePage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const { retryConnection } = useActorRetry();
  const saveMatch = useSaveMatch();
  const completeSessionMutation = useCompleteSession();
  const [sessionState, setSessionState] = useState<SessionState | null>(null);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [showRetryConnection, setShowRetryConnection] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem('acceptingGiftsGame');
    if (saved) {
      const state = JSON.parse(saved);
      setSessionState(state);
    } else {
      navigate({ to: '/accepting-gifts/start' });
    }
  }, [navigate]);

  useEffect(() => {
    if (sessionState) {
      sessionStorage.setItem('acceptingGiftsGame', JSON.stringify(sessionState));
    }
  }, [sessionState]);

  // Show retry connection after 8 seconds if actor is not ready and end dialog is open
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

  if (!sessionState) {
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

  const handleAttemptResult = (result: AttemptResult) => {
    setSessionState(prev => {
      if (!prev) return prev;
      
      const playerScored = result === 'make';
      const newPlayerScore = playerScored ? prev.currentSetScorePlayer + 1 : prev.currentSetScorePlayer;
      const newGhostScore = playerScored ? prev.currentSetScoreGhost : prev.currentSetScoreGhost + 1;
      
      // Check if set is complete (first to 3)
      const setComplete = newPlayerScore === 3 || newGhostScore === 3;
      
      if (setComplete) {
        const playerWonSet = newPlayerScore === 3;
        const adjustment = playerWonSet ? 1 : -1;
        const nextObjectBallCount = Math.max(2, Math.min(7, prev.currentObjectBallCount + adjustment));
        
        return {
          ...prev,
          totalAttempts: prev.totalAttempts + 1,
          currentObjectBallCount: nextObjectBallCount,
          currentSetScorePlayer: 0,
          currentSetScoreGhost: 0,
          setsCompleted: prev.setsCompleted + 1,
        };
      }
      
      return {
        ...prev,
        totalAttempts: prev.totalAttempts + 1,
        currentSetScorePlayer: newPlayerScore,
        currentSetScoreGhost: newGhostScore,
      };
    });
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
      const completionStatus = sessionState.currentObjectBallCount === 7;
      const score = sessionState.setsCompleted;

      const { matchId, matchRecord } = buildAcceptingGiftsMatch({
        playerName: sessionState.playerName,
        startingObjectBallCount: sessionState.startingObjectBallCount,
        endingObjectBallCount: sessionState.currentObjectBallCount,
        totalAttempts: sessionState.totalAttempts,
        setsCompleted: sessionState.setsCompleted,
        finalSetScorePlayer: sessionState.currentSetScorePlayer,
        finalSetScoreGhost: sessionState.currentSetScoreGhost,
        notes: sessionState.notes,
        identity,
        completionStatus,
        score,
      });

      await saveMatch.mutateAsync({ matchId, matchRecord });
      await completeSessionMutation.mutateAsync(BigInt(sessionState.currentObjectBallCount));
      toast.success('Session saved successfully!');
      sessionStorage.removeItem('acceptingGiftsGame');
      navigate({ to: '/history' });
    } catch (error) {
      const errorMessage = extractErrorText(error);
      toast.error(`Failed to save session: ${errorMessage}`);
    }
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

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate({ to: '/' })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        <h1 className="text-2xl font-bold">Accepting Gifts</h1>
        <div className="w-24" />
      </div>

      {/* Session Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Session Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Player</div>
              <div className="text-lg font-semibold">{sessionState.playerName}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Object Balls</div>
              <div className="text-lg font-semibold">{sessionState.currentObjectBallCount}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Sets Completed</div>
              <div className="text-2xl font-bold">{sessionState.setsCompleted}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Attempts</div>
              <div className="text-2xl font-bold">{sessionState.totalAttempts}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Current Set</div>
              <div className="text-lg font-semibold">
                {sessionState.currentSetScorePlayer} - {sessionState.currentSetScoreGhost}
              </div>
            </div>
          </div>
          {sessionState.currentObjectBallCount === 7 && (
            <Alert>
              <AlertDescription className="font-semibold text-primary">
                🎉 Congratulations! You've reached 7 object balls!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Current Set Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Current Set</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <span className="font-medium">Score:</span>
            <div className="flex items-center gap-4">
              <Badge variant="default" className="text-lg">
                You: {sessionState.currentSetScorePlayer}
              </Badge>
              <Badge variant="secondary" className="text-lg">
                Ghost: {sessionState.currentSetScoreGhost}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => handleAttemptResult('make')}
              size="lg"
              className="h-20 text-lg"
            >
              Make
            </Button>
            <Button
              onClick={() => handleAttemptResult('miss')}
              variant="outline"
              size="lg"
              className="h-20 text-lg"
            >
              Miss
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rules Panel */}
      <Collapsible open={rulesOpen} onOpenChange={setRulesOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50">
              <div className="flex items-center justify-between">
                <CardTitle>Rules & Objective</CardTitle>
                <ChevronDown className={`h-5 w-5 transition-transform ${rulesOpen ? 'rotate-180' : ''}`} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <AcceptingGiftsRulesPanel />
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Connection Warning */}
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

      {/* End Session Button */}
      <Button
        onClick={() => setShowEndDialog(true)}
        className="w-full"
        size="lg"
      >
        End Session & Save
      </Button>

      {/* End Session Dialog */}
      <EndMatchDialog
        open={showEndDialog}
        onOpenChange={setShowEndDialog}
        onConfirm={handleEndSession}
        title="End Accepting Gifts Session?"
        description="Your session will be saved to history and your progress will be recorded."
        confirmText="Save Session"
        isPending={saveMatch.isPending || completeSessionMutation.isPending}
        disabled={!isAuthenticated}
      />
    </div>
  );
}
