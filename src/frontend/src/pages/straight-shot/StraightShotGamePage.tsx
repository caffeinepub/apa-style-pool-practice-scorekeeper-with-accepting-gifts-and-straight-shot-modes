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
        strokes: [gameState.totalShots],
        scratchStrokes: [],
        shots: gameState.totalShots,
        ballsMade: 15,
        firstShotScore: 0,
        secondShotScore: 0,
        thirdShotScore: 0,
        fourthShotScore: 0,
        totalScore: gameState.totalShots,
        identity,
      });

      await saveMatch.mutateAsync({ matchId, matchRecord });
      toast.success('Session saved successfully!');
      sessionStorage.removeItem('straightShotGame');
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

  const isWin = gameState.totalShots > 0 && gameState.totalShots <= 20;
  const isAuthenticated = !!identity;

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate({ to: '/' })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        <h1 className="text-2xl font-bold">Straight Shot Drill</h1>
        <div className="w-24" />
      </div>

      {/* Session Info */}
      <Card>
        <CardHeader>
          <CardTitle>Session Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground">Player</div>
            <div className="text-lg font-semibold">{gameState.playerName}</div>
          </div>
          {gameState.notes && (
            <div>
              <div className="text-sm text-muted-foreground">Notes</div>
              <div className="text-sm">{gameState.notes}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Total Shots Input */}
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
              className="text-2xl font-bold"
            />
          </div>

          {gameState.totalShots > 0 && (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <span className="font-medium">Result:</span>
              <Badge variant={isWin ? 'default' : 'secondary'} className="text-lg">
                {isWin ? 'Win' : 'Loss'}
              </Badge>
            </div>
          )}
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
              <StraightShotRulesPanel />
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
        disabled={gameState.totalShots === 0}
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
        title="End Straight Shot Session?"
        description="Your session will be saved to history."
        confirmText="Save Session"
        isPending={saveMatch.isPending}
        disabled={!isAuthenticated}
      />
    </div>
  );
}
