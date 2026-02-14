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
      setStartingObjectBallCount(persistedBaseline);
    }
  }, [persistedBaseline, baselineLoading]);

  const handleStart = async () => {
    if (playerName.trim()) {
      // Persist the chosen starting count as the new baseline
      try {
        await setBaselineMutation.mutateAsync(startingObjectBallCount);
      } catch (error) {
        console.error('Failed to persist baseline:', error);
      }

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
    }
  };

  const handleResetBaseline = async () => {
    try {
      await setBaselineMutation.mutateAsync(startingObjectBallCount);
      toast.success(`Baseline set to ${startingObjectBallCount} object balls`);
    } catch (error) {
      toast.error('Failed to set baseline');
      console.error('Failed to set baseline:', error);
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
            Practice the Accepting Gifts drill and track your progress
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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

          <div className="space-y-2">
            <Label htmlFor="playerName">Player Name</Label>
            <Input
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startingBalls">Starting Object Balls (2-7)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="startingBalls"
                type="number"
                min={2}
                max={7}
                value={startingObjectBallCount}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val >= 2 && val <= 7) {
                    setStartingObjectBallCount(val);
                  }
                }}
                className="w-24"
                disabled={baselineLoading}
              />
              <span className="text-sm text-muted-foreground flex-1">
                balls + 8-ball
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetBaseline}
                disabled={setBaselineMutation.isPending || baselineLoading}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Set Baseline
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Your last session ended at {persistedBaseline ?? 3} balls. Adjust and click "Set Baseline" to save a new starting point.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this session..."
              rows={3}
            />
          </div>

          <Button
            onClick={handleStart}
            disabled={!playerName.trim() || baselineLoading}
            className="w-full"
            size="lg"
          >
            <Play className="mr-2 h-5 w-5" />
            Start Session
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
