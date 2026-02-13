import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Play } from 'lucide-react';

export default function StraightShotStartPage() {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState('');
  const [notes, setNotes] = useState('');

  const handleStart = () => {
    if (playerName.trim()) {
      const gameState = {
        playerName: playerName.trim(),
        notes: notes.trim() || undefined,
        attempts: 0,
        makes: 0,
        currentStreak: 0,
        bestStreak: 0,
      };
      sessionStorage.setItem('straightShotGame', JSON.stringify(gameState));
      navigate({ to: '/straight-shot/game' });
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
          <CardTitle>Start Straight Shot Session</CardTitle>
          <CardDescription>
            Track your straight shot accuracy and build consistency
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
