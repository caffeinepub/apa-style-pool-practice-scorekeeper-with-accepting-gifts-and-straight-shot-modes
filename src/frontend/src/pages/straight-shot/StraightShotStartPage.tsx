import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Play, Info, ChevronDown, TrendingUp, AlertCircle, RotateCcw } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import StraightShotRulesPanel from './StraightShotRulesPanel';
import { useGetAllMatches } from '../../hooks/useQueries';
import { SESSION_KEYS, hasInProgressSession, clearInProgressSession } from '@/lib/session/inProgressSessions';
import EndMatchDialog from '../../components/matches/EndMatchDialog';
import type { ApiMatch } from '../../backend';

export default function StraightShotStartPage() {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState('');
  const [notes, setNotes] = useState('');
  const [rulesOpen, setRulesOpen] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const { data: allMatches } = useGetAllMatches();

  const hasInProgress = hasInProgressSession(SESSION_KEYS.STRAIGHT_SHOT);

  // Calculate moving average from last 10 Straight Shot sessions
  const straightShotMatches = (allMatches || []).filter(m => m.mode === 'straightShot');
  const last10 = straightShotMatches.slice(-10);
  const movingAverage = last10.length > 0
    ? last10.reduce((sum, m) => {
        const totalShots = m.strokes && m.strokes.length > 0 ? Number(m.strokes[0]) : (m.totalScore ? Number(m.totalScore) : 0);
        return sum + totalShots;
      }, 0) / last10.length
    : null;

  const handleStartClick = () => {
    if (playerName.trim()) {
      // Check if there's an in-progress game
      if (hasInProgress) {
        setShowConfirmDialog(true);
      } else {
        startNewSession();
      }
    }
  };

  const startNewSession = () => {
    const gameState = {
      playerName: playerName.trim(),
      notes: notes.trim() || undefined,
      totalShots: 0,
      completed: false,
    };
    sessionStorage.setItem(SESSION_KEYS.STRAIGHT_SHOT, JSON.stringify(gameState));
    navigate({ to: '/straight-shot/game' });
  };

  const handleConfirmNewSession = () => {
    clearInProgressSession(SESSION_KEYS.STRAIGHT_SHOT);
    setShowConfirmDialog(false);
    startNewSession();
  };

  const handleResume = () => {
    navigate({ to: '/straight-shot/game' });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/' })}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Start Straight Shot Session</CardTitle>
          <CardDescription>
            Clear all balls in 20 shots or under to win
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {movingAverage !== null && (
            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Your last 10 sessions average:</span>
                  <span className="text-lg font-semibold">{movingAverage.toFixed(1)} shots</span>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="playerName">Your Name</Label>
              <Input
                id="playerName"
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this session..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>

          <Button
            onClick={handleStartClick}
            disabled={!playerName.trim()}
            className="w-full gap-2"
            size="lg"
          >
            <Play className="h-4 w-4" />
            Start Session
          </Button>

          {hasInProgress && (
            <Button
              onClick={handleResume}
              variant="outline"
              className="w-full gap-2"
              size="lg"
            >
              <RotateCcw className="h-4 w-4" />
              Resume Session
            </Button>
          )}

          <Collapsible open={rulesOpen} onOpenChange={setRulesOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full gap-2">
                <Info className="h-4 w-4" />
                {rulesOpen ? 'Hide' : 'Show'} Rules
                <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${rulesOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              <StraightShotRulesPanel />
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      <EndMatchDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleConfirmNewSession}
        title="End Current Session?"
        description="You have a session in progress. Starting a new session will end your current one. Are you sure?"
        confirmText="End Current & Start New"
      />
    </div>
  );
}
