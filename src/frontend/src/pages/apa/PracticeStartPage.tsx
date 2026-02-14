import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Play, User } from 'lucide-react';
import { APA_SKILL_LEVELS, getPointsToWin, formatSkillLevel, isValidSkillLevel } from '../../lib/apa/apaEqualizer';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import type { RackData } from '../../lib/apa/apaScoring';

export default function PracticeStartPage() {
  const navigate = useNavigate();
  const { data: userProfile } = useGetCallerUserProfile();
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [player1SL, setPlayer1SL] = useState<number>(5);
  const [player2SL, setPlayer2SL] = useState<number>(5);
  const [notes, setNotes] = useState('');
  const [player1SLTouched, setPlayer1SLTouched] = useState(false);

  const myName = userProfile?.name || '';

  // Auto-fill Player 1 skill level from profile on mount (one-time)
  useEffect(() => {
    if (userProfile?.apaSkillLevel && !player1SLTouched) {
      const profileSL = Number(userProfile.apaSkillLevel);
      if (isValidSkillLevel(profileSL)) {
        setPlayer1SL(profileSL);
      }
    }
  }, [userProfile, player1SLTouched]);

  const handleUseMyNamePlayer1 = () => {
    if (myName) {
      setPlayer1(myName);
    }
  };

  const handleUseMyNamePlayer2 = () => {
    if (myName) {
      setPlayer2(myName);
    }
  };

  const handlePlayer1SLChange = (value: string) => {
    setPlayer1SL(parseInt(value));
    setPlayer1SLTouched(true);
  };

  const handleStart = () => {
    if (player1.trim() && player2.trim()) {
      const gameState = {
        player1: player1.trim(),
        player2: player2.trim(),
        player1SL,
        player2SL,
        player1Target: getPointsToWin(player1SL),
        player2Target: getPointsToWin(player2SL),
        notes: notes.trim() || undefined,
        player1Points: 0,
        player2Points: 0,
        player1Innings: 0,
        player2Innings: 0,
        player1DefensiveShots: 0,
        player2DefensiveShots: 0,
        racks: [] as RackData[],
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
          <CardTitle>Start APA 9-Ball Practice Match</CardTitle>
          <CardDescription>
            Enter player names and skill levels to begin tracking your APA 9-ball practice game
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="player1">Player 1 Name</Label>
                <div className="flex gap-2">
                  <Input
                    id="player1"
                    value={player1}
                    onChange={(e) => setPlayer1(e.target.value)}
                    placeholder="Enter player 1 name"
                    className="flex-1"
                  />
                  {myName && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleUseMyNamePlayer1}
                      title="Use my name"
                    >
                      <User className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="player1-sl">Player 1 Skill Level</Label>
                <Select value={player1SL.toString()} onValueChange={handlePlayer1SLChange}>
                  <SelectTrigger id="player1-sl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {APA_SKILL_LEVELS.map(sl => (
                      <SelectItem key={sl} value={sl.toString()}>
                        {formatSkillLevel(sl)} - {getPointsToWin(sl)} points
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-lg border bg-muted/50 p-3 text-center">
                <p className="text-sm text-muted-foreground">Points to Win</p>
                <p className="text-2xl font-bold text-emerald-600">{getPointsToWin(player1SL)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="player2">Player 2 Name</Label>
                <div className="flex gap-2">
                  <Input
                    id="player2"
                    value={player2}
                    onChange={(e) => setPlayer2(e.target.value)}
                    placeholder="Enter player 2 name"
                    className="flex-1"
                  />
                  {myName && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleUseMyNamePlayer2}
                      title="Use my name"
                    >
                      <User className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="player2-sl">Player 2 Skill Level</Label>
                <Select value={player2SL.toString()} onValueChange={(v) => setPlayer2SL(parseInt(v))}>
                  <SelectTrigger id="player2-sl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {APA_SKILL_LEVELS.map(sl => (
                      <SelectItem key={sl} value={sl.toString()}>
                        {formatSkillLevel(sl)} - {getPointsToWin(sl)} points
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-lg border bg-muted/50 p-3 text-center">
                <p className="text-sm text-muted-foreground">Points to Win</p>
                <p className="text-2xl font-bold text-emerald-600">{getPointsToWin(player2SL)}</p>
              </div>
            </div>
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
            disabled={!player1.trim() || !player2.trim()}
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
