import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { useGetAgLevelIndex, useGetCallerUserProfile } from '../../hooks/useQueries';
import { getLevelByIndex, ACCEPTING_GIFTS_LEVELS } from '../../lib/accepting-gifts/acceptingGiftsLevels';
import AcceptingGiftsRulesPanel from './AcceptingGiftsRulesPanel';
import type { GameState } from '../../lib/accepting-gifts/acceptingGiftsSession';
import { SESSION_KEYS } from '@/lib/session/inProgressSessions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function AcceptingGiftsStartPage() {
  const navigate = useNavigate();
  const { data: baselineLevelIndex, isLoading: levelLoading } = useGetAgLevelIndex();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const [selectedLevelIndex, setSelectedLevelIndex] = useState<number>(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (baselineLevelIndex !== undefined && baselineLevelIndex !== null) {
      setSelectedLevelIndex(Number(baselineLevelIndex));
    }
  }, [baselineLevelIndex]);

  const handleStartSession = () => {
    const existingSession = sessionStorage.getItem(SESSION_KEYS.ACCEPTING_GIFTS);
    if (existingSession) {
      setShowConfirmDialog(true);
    } else {
      startNewSession();
    }
  };

  const startNewSession = () => {
    const newSession: GameState = {
      playerName: userProfile?.name || 'Player',
      notes: '',
      baselineLevelIndex: selectedLevelIndex,
      levelPlayedIndex: selectedLevelIndex,
      playerSetScore: 0,
      ghostSetScore: 0,
      totalAttempts: 0,
      setsCompleted: 0,
      completed: false,
      attemptSequence: [], // BUILD 1: Initialize empty sequence
    };

    sessionStorage.setItem(SESSION_KEYS.ACCEPTING_GIFTS, JSON.stringify(newSession));
    navigate({ to: '/accepting-gifts/game' });
  };

  const handleResumeSession = () => {
    navigate({ to: '/accepting-gifts/game' });
  };

  const isLoading = levelLoading || profileLoading;
  const hasInProgressSession = !!sessionStorage.getItem(SESSION_KEYS.ACCEPTING_GIFTS);

  const baselineLevel = getLevelByIndex(selectedLevelIndex);
  const selectedLevel = getLevelByIndex(selectedLevelIndex);

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

      <AcceptingGiftsRulesPanel />

      <Card>
        <CardHeader>
          <CardTitle>Session Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Player Name</label>
            <div className="rounded-md border bg-muted px-3 py-2 text-sm">
              {isLoading ? 'Loading...' : userProfile?.name || 'Player'}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Your profile name is used for this session</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Your Current Baseline Level</label>
            <div className="rounded-md border bg-muted px-3 py-2 text-sm font-semibold">
              {isLoading ? 'Loading...' : baselineLevel.label}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              This is your current level. You can choose to play at this level or select a different one below.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Select Level to Play</label>
            <Select
              value={selectedLevelIndex.toString()}
              onValueChange={(value) => setSelectedLevelIndex(parseInt(value, 10))}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACCEPTING_GIFTS_LEVELS.map((level, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-1 text-xs text-muted-foreground">
              Choose the level you want to practice at. Your baseline level will only change based on match results.
            </p>
          </div>

          <div className="space-y-2 pt-4">
            <Button onClick={handleStartSession} className="w-full" size="lg" disabled={isLoading}>
              Start New Game
            </Button>
            {hasInProgressSession && (
              <Button onClick={handleResumeSession} variant="outline" className="w-full" size="lg">
                Resume Game
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start New Session?</AlertDialogTitle>
            <AlertDialogDescription>
              You have an in-progress session. Starting a new session will discard your current progress. Do you want to continue?
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
