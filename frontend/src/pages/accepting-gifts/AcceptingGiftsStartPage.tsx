import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useGetAgLevelIndex, useGetCallerUserProfile } from '../../hooks/useQueries';
import { getLevelByIndex, ACCEPTING_GIFTS_LEVELS } from '../../lib/accepting-gifts/acceptingGiftsLevels';
import AcceptingGiftsRulesPanel from './AcceptingGiftsRulesPanel';
import { SESSION_KEYS } from '@/lib/session/inProgressSessions';
import { GameState } from '../../lib/accepting-gifts/acceptingGiftsSession';

export default function AcceptingGiftsStartPage() {
  const navigate = useNavigate();
  const { data: baselineLevelIndex, isLoading: levelLoading } = useGetAgLevelIndex();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const [selectedLevelIndex, setSelectedLevelIndex] = useState<number>(0);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [hasInProgressSession, setHasInProgressSession] = useState(false);

  useEffect(() => {
    if (baselineLevelIndex !== undefined) {
      setSelectedLevelIndex(Number(baselineLevelIndex));
    }
  }, [baselineLevelIndex]);

  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEYS.ACCEPTING_GIFTS);
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

    const newSession: GameState = {
      playerName: userProfile.name,
      notes: '',
      baselineLevelIndex: selectedLevelIndex,
      levelPlayedIndex: selectedLevelIndex,
      playerSetScore: 0,
      ghostSetScore: 0,
      totalAttempts: 0,
      setsCompleted: 0,
      completed: false,
    };

    sessionStorage.setItem(SESSION_KEYS.ACCEPTING_GIFTS, JSON.stringify(newSession));
    navigate({ to: '/accepting-gifts/game' });
  };

  const handleResumeSession = () => {
    navigate({ to: '/accepting-gifts/game' });
  };

  if (levelLoading || profileLoading) {
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

  const baselineLevel = getLevelByIndex(selectedLevelIndex);

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

          <div className="space-y-2">
            <Label htmlFor="level">Select Level</Label>
            <Select
              value={selectedLevelIndex.toString()}
              onValueChange={(value) => setSelectedLevelIndex(parseInt(value))}
            >
              <SelectTrigger id="level">
                <SelectValue placeholder="Select a level" />
              </SelectTrigger>
              <SelectContent>
                {ACCEPTING_GIFTS_LEVELS.map((level, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <div className="text-sm font-medium">Baseline Level</div>
            <div className="text-lg font-semibold">{baselineLevel.label}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Your current baseline level based on previous sessions
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
              <AcceptingGiftsRulesPanel />
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
