import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Play, Info, RotateCcw } from 'lucide-react';
import AcceptingGiftsRulesPanel from './AcceptingGiftsRulesPanel';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useGetCurrentObjectBallCount, useSetCurrentObjectBallCount } from '../../hooks/useQueries';
import { toast } from 'sonner';

export default function AcceptingGiftsStartPage() {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState('');
  const [notes, setNotes] = useState('');
  const [rulesOpen, setRulesOpen] = useState(false);
  const [startingObjectBallCount, setStartingObjectBallCount] = useState(3);

  const { data: persistedBaseline, isLoading: baselineLoading } = useGetCurrentObjectBallCount();
  const setBaselineMutation = useSetCurrentObjectBallCount();

  useEffect(() => {
    if (persistedBaseline !== undefined && !baselineLoading) {
      setStartingObjectBallCount(Number(persistedBaseline));
    }
  }, [persistedBaseline, baselineLoading]);

  const handleSetBaseline = async () => {
    try {
      await setBaselineMutation.mutateAsync(BigInt(startingObjectBallCount));
      toast.success(`Baseline set to ${startingObjectBallCount} object balls`);
    } catch (error) {
      toast.error('Failed to set baseline');
      console.error('Failed to set baseline:', error);
    }
  };

  const handleStart = async () => {
    if (!playerName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (startingObjectBallCount < 2 || startingObjectBallCount > 7) {
      toast.error('Object ball count must be between 2 and 7');
      return;
    }

    try {
      await setBaselineMutation.mutateAsync(BigInt(startingObjectBallCount));

      const gameState = {
        playerName: playerName.trim(),
        notes: notes.trim() || undefined,
        startingObjectBallCount,
        currentObjectBallCount: startingObjectBallCount,
        playerSetScore: 0,
        ghostSetScore: 0,
        totalAttempts: 0,
        setsCompleted: 0,
        completed: false,
      };

      sessionStorage.setItem('acceptingGiftsGame', JSON.stringify(gameState));
      navigate({ to: '/accepting-gifts/game' });
    } catch (error) {
      toast.error('Failed to start session');
      console.error('Failed to start session:', error);
    }
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
          <CardTitle>Start Accepting Gifts Session</CardTitle>
          <CardDescription>
            Progressive drill: run out object balls + 8-ball, adjust difficulty based on performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
              <Label htmlFor="startingCount">
                Starting Object Ball Count (2-7)
              </Label>
              <Input
                id="startingCount"
                type="number"
                min="2"
                max="7"
                value={startingObjectBallCount}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val)) {
                    setStartingObjectBallCount(Math.max(2, Math.min(7, val)));
                  }
                }}
              />
              <p className="text-sm text-muted-foreground">
                Current baseline: {baselineLoading ? 'Loading...' : Number(persistedBaseline || 3)} balls
              </p>
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

          <div className="flex gap-3">
            <Button
              onClick={handleSetBaseline}
              variant="outline"
              disabled={setBaselineMutation.isPending}
              className="flex-1 gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Set Baseline
            </Button>
            <Button
              onClick={handleStart}
              disabled={setBaselineMutation.isPending}
              className="flex-1 gap-2"
            >
              <Play className="h-4 w-4" />
              Start Session
            </Button>
          </div>
        </CardContent>
      </Card>

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
    </div>
  );
}
