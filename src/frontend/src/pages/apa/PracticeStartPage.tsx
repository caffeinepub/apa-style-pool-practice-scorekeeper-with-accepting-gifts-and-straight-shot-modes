import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Play } from 'lucide-react';

export default function PracticeStartPage() {
  const navigate = useNavigate();
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [target, setTarget] = useState('');
  const [notes, setNotes] = useState('');

  const handleStart = () => {
    if (player1.trim() && player2.trim() && target) {
      const gameState = {
        player1: player1.trim(),
        player2: player2.trim(),
        target: parseInt(target),
        notes: notes.trim() || undefined,
        score1: 0,
        score2: 0,
        innings: [] as Array<{ player: number; points: number; description: string }>,
      };
      sessionStorage.setItem('apaPracticeGame', JSON.stringify(gameState));
      navigate({ to: '/apa-practice/game' });
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
          <CardTitle>Start APA Practice Match</CardTitle>
          <CardDescription>
            Enter player names and match target to begin tracking your practice game
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="player1">Player 1 Name</Label>
              <Input
                id="player1"
                value={player1}
                onChange={(e) => setPlayer1(e.target.value)}
                placeholder="Enter player 1 name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="player2">Player 2 Name</Label>
              <Input
                id="player2"
                value={player2}
                onChange={(e) => setPlayer2(e.target.value)}
                placeholder="Enter player 2 name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target">Match Target (Race to)</Label>
            <Input
              id="target"
              type="number"
              min="1"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g., 5"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this practice session..."
              rows={3}
            />
          </div>

          <Button
            onClick={handleStart}
            disabled={!player1.trim() || !player2.trim() || !target}
            className="w-full"
            size="lg"
          >
            <Play className="mr-2 h-5 w-5" />
            Start Match
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
