import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, AlertCircle } from 'lucide-react';
import { validateRackTotal, getRackError, POINTS_PER_RACK } from '../../lib/apa/apaScoring';

interface RackScoringPanelProps {
  rackNumber: number;
  player1Name: string;
  player2Name: string;
  onRackComplete: (data: {
    player1Points: number;
    player2Points: number;
    deadBalls: number;
    player1Innings: number;
    player2Innings: number;
    player1DefensiveShots: number;
    player2DefensiveShots: number;
  }) => void;
}

export default function ApaRackScoringPanel({
  rackNumber,
  player1Name,
  player2Name,
  onRackComplete,
}: RackScoringPanelProps) {
  const [player1Points, setPlayer1Points] = useState('');
  const [player2Points, setPlayer2Points] = useState('');
  const [deadBalls, setDeadBalls] = useState('');
  const [player1Innings, setPlayer1Innings] = useState('');
  const [player2Innings, setPlayer2Innings] = useState('');
  const [player1DefensiveShots, setPlayer1DefensiveShots] = useState('0');
  const [player2DefensiveShots, setPlayer2DefensiveShots] = useState('0');

  const p1 = parseInt(player1Points) || 0;
  const p2 = parseInt(player2Points) || 0;
  const dead = parseInt(deadBalls) || 0;
  const total = p1 + p2 + dead;
  const error = getRackError(p1, p2, dead);
  const isValid = validateRackTotal(p1, p2, dead) && 
                  player1Innings.trim() !== '' && 
                  player2Innings.trim() !== '';

  const handleSubmit = () => {
    if (isValid) {
      onRackComplete({
        player1Points: p1,
        player2Points: p2,
        deadBalls: dead,
        player1Innings: parseInt(player1Innings) || 0,
        player2Innings: parseInt(player2Innings) || 0,
        player1DefensiveShots: parseInt(player1DefensiveShots) || 0,
        player2DefensiveShots: parseInt(player2DefensiveShots) || 0,
      });
      // Reset form
      setPlayer1Points('');
      setPlayer2Points('');
      setDeadBalls('');
      setPlayer1Innings('');
      setPlayer2Innings('');
      setPlayer1DefensiveShots('0');
      setPlayer2DefensiveShots('0');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rack {rackNumber} Scoring</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Each rack has {POINTS_PER_RACK} points total. Balls 1-8 = 1 point each, 9-ball = 2 points.
            Dead balls count as 0 points.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="p1-points">{player1Name} Points</Label>
            <Input
              id="p1-points"
              type="number"
              min="0"
              max="10"
              value={player1Points}
              onChange={(e) => setPlayer1Points(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p2-points">{player2Name} Points</Label>
            <Input
              id="p2-points"
              type="number"
              min="0"
              max="10"
              value={player2Points}
              onChange={(e) => setPlayer2Points(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dead-balls">Dead Balls</Label>
            <Input
              id="dead-balls"
              type="number"
              min="0"
              max="10"
              value={deadBalls}
              onChange={(e) => setDeadBalls(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        <div className="rounded-lg border p-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Rack Total:</span>
            <span className={`font-semibold ${total === POINTS_PER_RACK ? 'text-emerald-600' : 'text-amber-600'}`}>
              {total} / {POINTS_PER_RACK}
            </span>
          </div>
          {error && (
            <p className="mt-1 text-xs text-amber-600">{error}</p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="p1-innings">{player1Name} Innings</Label>
            <Input
              id="p1-innings"
              type="number"
              min="0"
              value={player1Innings}
              onChange={(e) => setPlayer1Innings(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p2-innings">{player2Name} Innings</Label>
            <Input
              id="p2-innings"
              type="number"
              min="0"
              value={player2Innings}
              onChange={(e) => setPlayer2Innings(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="p1-defensive">{player1Name} Defensive Shots</Label>
            <Input
              id="p1-defensive"
              type="number"
              min="0"
              value={player1DefensiveShots}
              onChange={(e) => setPlayer1DefensiveShots(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p2-defensive">{player2Name} Defensive Shots</Label>
            <Input
              id="p2-defensive"
              type="number"
              min="0"
              value={player2DefensiveShots}
              onChange={(e) => setPlayer2DefensiveShots(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!isValid}
          className="w-full"
          size="lg"
        >
          <Plus className="mr-2 h-5 w-5" />
          Complete Rack {rackNumber}
        </Button>
      </CardContent>
    </Card>
  );
}
