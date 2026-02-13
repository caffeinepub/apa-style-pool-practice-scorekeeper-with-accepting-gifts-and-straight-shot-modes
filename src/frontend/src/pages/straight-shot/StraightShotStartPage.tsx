import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Play, TrendingUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import StraightShotRulesPanel from './StraightShotRulesPanel';
import { useGetAllMatches } from '../../hooks/useQueries';
import { MatchMode } from '../../backend';

export default function StraightShotStartPage() {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState('');
  const [notes, setNotes] = useState('');
  const [rulesOpen, setRulesOpen] = useState(false);
  const { data: matches } = useGetAllMatches();

  const handleStart = () => {
    if (playerName.trim()) {
      const gameState = {
        playerName: playerName.trim(),
        notes: notes.trim() || undefined,
        strokes: 0,
        scratches: 0,
        ballsMade: 0,
        eightBallPocketed: false,
        scratchOnBreak: false,
      };
      sessionStorage.setItem('straightShotGame', JSON.stringify(gameState));
      navigate({ to: '/straight-shot/game' });
    }
  };

  // Calculate moving average from last 10 Straight Shot sessions
  const straightShotMatches = matches?.filter(m => m.mode === MatchMode.straightShot) || [];
  const recentMatches = straightShotMatches
    .sort((a, b) => Number(b.dateTime - a.dateTime))
    .slice(0, 10);
  
  const movingAverage = recentMatches.length > 0
    ? recentMatches.reduce((sum, m) => sum + Number(m.totalScore || 0), 0) / recentMatches.length
    : null;

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
          <CardTitle>Start Straight Shot Strokes Drill</CardTitle>
          <CardDescription>
            Count your strokes to clear the table - win at 20 or under
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {movingAverage !== null && (
            <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950">
              <CardContent className="flex items-center justify-between pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                      Moving Average
                    </p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                      Last {recentMatches.length} session{recentMatches.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
                    {movingAverage.toFixed(1)}
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">strokes</p>
                </div>
              </CardContent>
            </Card>
          )}

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
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this session..."
              rows={3}
            />
          </div>

          <Collapsible open={rulesOpen} onOpenChange={setRulesOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                View Rules
                <ChevronDown className={`h-4 w-4 transition-transform ${rulesOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <StraightShotRulesPanel />
            </CollapsibleContent>
          </Collapsible>

          <Button
            onClick={handleStart}
            disabled={!playerName.trim()}
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
