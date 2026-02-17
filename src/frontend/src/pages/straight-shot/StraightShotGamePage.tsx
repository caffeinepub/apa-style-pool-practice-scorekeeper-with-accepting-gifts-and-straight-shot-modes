import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, ChevronDown, RefreshCw } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useSaveMatch } from '../../hooks/useQueries';
import { buildStraightShotMatch } from '../../lib/matches/matchBuilders';
import EndMatchDialog from '../../components/matches/EndMatchDialog';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useActor } from '../../hooks/useActor';
import { useActorRetry } from '../../hooks/useActorRetry';
import { toast } from 'sonner';
import { extractErrorText } from '../../utils/errorText';
import StraightShotRulesPanel from './StraightShotRulesPanel';
import { SESSION_KEYS } from '@/lib/session/inProgressSessions';

interface GameState {
  playerName: string;
  notes?: string;
  totalShots: number;
}

export default function StraightShotGamePage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const { retryConnection } = useActorRetry();
  const saveMatch = useSaveMatch();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [showRetryConnection, setShowRetryConnection] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEYS.STRAIGHT_SHOT);
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
      sessionStorage.setItem(SESSION_KEYS.STRAIGHT_SHOT, JSON.stringify(gameState));
    }
  }, [gameState]);

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

  const handleTotalShotsChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    setGameState(prev => prev ? { ...prev, totalShots: numValue } : null);
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
      const { matchId, matchRecord } = buildStraightShotMatch({
        playerName: gameState.playerName,
        notes: gameState.notes,
        totalShots: gameState.totalShots,
        identity,
      });

      await saveMatch.mutateAsync({ matchId, matchRecord });
      toast.success('Session saved successfully!');
      sessionStorage.removeItem(SESSION_KEYS.STRAIGHT_SHOT);
      navigate({ to: '/history' });
    } catch (error) {
      const errorMessage = extractErrorText(error);
      toast.error(`Failed to save session: ${errorMessage}`);
    }
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
      const { matchId, matchRecord } = buildStraightShotMatch({
        playerName: gameState.playerName,
        notes: gameState.notes,
        totalShots: gameState.totalShots,
        identity,
      });

      await saveMatch.mutateAsync({ matchId, matchRecord });
      toast.success('Session saved successfully!');

      // Clear old session and start new one
      sessionStorage.removeItem(SESSION_KEYS.STRAIGHT_SHOT);

      const newSession: GameState = {
        playerName: gameState.playerName,
        notes: '',
        totalShots: 0,
      };

      sessionStorage.setItem(SESSION_KEYS.STRAIGHT_SHOT, JSON.stringify(newSession));
      setGameState(newSession);
    } catch (error) {
      const errorMessage = extractErrorText(error);
      toast.error(`Failed to save session: ${errorMessage}`);
    }
  };

  const handleEndWithoutSaving = () => {
    sessionStorage.removeItem(SESSION_KEYS.STRAIGHT_SHOT);
    toast.info('Session ended without saving');
    navigate({ to: '/straight-shot/start' });
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
  const isWin = gameState.totalShots > 0 && gameState.totalShots <= 20;
  const isLoss = gameState.totalShots > 20;

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate({ to: '/' })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        <h1 className="text-2xl font-bold">Straight Shot</h1>
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
              <div className="text-sm text-muted-foreground">Total Shots</div>
              <div className="text-lg font-semibold">{gameState.totalShots}</div>
            </div>
          </div>
          {gameState.totalShots > 0 && (
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">Result:</div>
              {isWin && <Badge className="bg-green-600">Win</Badge>}
              {isLoss && <Badge variant="destructive">Loss</Badge>}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Record Total Shots</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="totalShots">Total Shots Taken</Label>
            <Input
              id="totalShots"
              type="number"
              min="0"
              value={gameState.totalShots}
              onChange={(e) => handleTotalShotsChange(e.target.value)}
              placeholder="Enter total shots"
            />
            <p className="text-sm text-muted-foreground">
              Complete the run first, then enter the total number of shots you took.
            </p>
          </div>
        </CardContent>
      </Card>

      <Collapsible open={rulesOpen} onOpenChange={setRulesOpen}>
        <Card>
          <CardHeader>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 hover:bg-transparent">
                <CardTitle>Rules</CardTitle>
                <ChevronDown className={`h-5 w-5 transition-transform ${rulesOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent>
              <StraightShotRulesPanel />
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Card>
        <CardHeader>
          <CardTitle>End Session</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={handleSaveAndStartNext} className="w-full" size="lg" disabled={saveMatch.isPending || !isAuthenticated}>
            {saveMatch.isPending ? 'Saving...' : 'Save & Start Next Match'}
          </Button>
          <Button onClick={handleEndSession} variant="outline" className="w-full" size="lg" disabled={saveMatch.isPending || !isAuthenticated}>
            {saveMatch.isPending ? 'Saving...' : 'Save & Exit'}
          </Button>
          <Button onClick={handleEndWithoutSaving} variant="ghost" className="w-full" size="lg">
            End Session Without Saving
          </Button>
        </CardContent>
      </Card>

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
