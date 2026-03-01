import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useGetAllMatches, useGetCallerUserProfile } from '../../hooks/useQueries';
import { MatchMode } from '../../backend';
import StraightShotRulesPanel from './StraightShotRulesPanel';
import { SESSION_KEYS } from '@/lib/session/inProgressSessions';

export default function StraightShotStartPage() {
  const navigate = useNavigate();
  const { data: matches, isLoading: matchesLoading } = useGetAllMatches();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const [rulesOpen, setRulesOpen] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [hasInProgressSession, setHasInProgressSession] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEYS.STRAIGHT_SHOT);
    setHasInProgressSession(!!saved);
  }, []);

  const handleStartSession = () => {
    if (hasInProgressSession) {
      setShowConfirmDialog(true);
    } else {
      startNewSession();
    }
  };

  const startNewSession = () => {
    if (!userProfile?.name) {
      return;
    }

    const newSession = {
      playerName: userProfile.name,
      notes: '',
      totalShots: 0,
    };

    sessionStorage.setItem(SESSION_KEYS.STRAIGHT_SHOT, JSON.stringify(newSession));
    navigate({ to: '/straight-shot/game' });
  };

  const handleResumeSession = () => {
    navigate({ to: '/straight-shot/game' });
  };

  if (matchesLoading || profileLoading) {
    return (
      <div className="container mx-auto max-w-4xl p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const straightShotMatches = matches?.filter((m) => m.mode === MatchMode.straightShot) || [];
  const recentMatches = straightShotMatches
    .sort((a, b) => Number(b.dateTime - a.dateTime))
    .slice(0, 10);

  const validShots = recentMatches
    .map((m) => m.strokes?.[0] ?? m.totalScore ?? 0)
    .filter((s) => Number(s) > 0)
    .map(Number);

  const movingAverage = validShots.length > 0
    ? (validShots.reduce((sum, s) => sum + s, 0) / validShots.length).toFixed(1)
    : null;

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
          <CardTitle>Start New Session</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Player Name</Label>
            <div className="rounded-md border border-input bg-muted px-3 py-2 text-sm">
              {userProfile?.name || 'Loading...'}
            </div>
            <p className="text-xs text-muted-foreground">
              Player name is locked to your profile for this drill.
            </p>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <div className="text-sm font-medium">Moving Average (Last 10)</div>
            <div className="text-lg font-semibold">
              {movingAverage !== null ? `${movingAverage} shots` : '--'}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Your average shot count over the last 10 sessions
            </p>
          </div>

          <Button onClick={handleStartSession} className="w-full" size="lg" disabled={!userProfile?.name}>
            Start Session
          </Button>

          {hasInProgressSession && (
            <Button onClick={handleResumeSession} variant="outline" className="w-full" size="lg">
              Resume Session
            </Button>
          )}
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

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start New Session?</AlertDialogTitle>
            <AlertDialogDescription>
              You have a session in progress. Starting a new session will replace it. Do you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={startNewSession}>Start New Session</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
