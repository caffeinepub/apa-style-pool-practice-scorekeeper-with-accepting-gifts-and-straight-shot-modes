import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Play, User, AlertCircle, RotateCcw } from 'lucide-react';
import { APA_SKILL_LEVELS, getPointsToWin, formatSkillLevel, isValidSkillLevel } from '../../lib/apa/apaEqualizer';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import { isSamePlayer } from '../../utils/playerName';
import { SESSION_KEYS, hasInProgressSession, clearInProgressSession } from '@/lib/session/inProgressSessions';
import EndMatchDialog from '../../components/matches/EndMatchDialog';
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
  const [player2SLTouched, setPlayer2SLTouched] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const myName = userProfile?.name || '';
  const mySkillLevel = userProfile?.apaSkillLevel ? Number(userProfile.apaSkillLevel) : null;

  const hasInProgress = hasInProgressSession(SESSION_KEYS.APA_PRACTICE);

  // Auto-load skill level when Player 1 name matches profile name
  useEffect(() => {
    if (myName && mySkillLevel && isValidSkillLevel(mySkillLevel) && !player1SLTouched) {
      if (isSamePlayer(player1, myName)) {
        setPlayer1SL(mySkillLevel);
      }
    }
  }, [player1, myName, mySkillLevel, player1SLTouched]);

  // Auto-load skill level when Player 2 name matches profile name
  useEffect(() => {
    if (myName && mySkillLevel && isValidSkillLevel(mySkillLevel) && !player2SLTouched) {
      if (isSamePlayer(player2, myName)) {
        setPlayer2SL(mySkillLevel);
      }
    }
  }, [player2, myName, mySkillLevel, player2SLTouched]);

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

  const handlePlayer1Change = (value: string) => {
    setPlayer1(value);
    // Reset manual override when name changes
    setPlayer1SLTouched(false);
  };

  const handlePlayer2Change = (value: string) => {
    setPlayer2(value);
    // Reset manual override when name changes
    setPlayer2SLTouched(false);
  };

  const handlePlayer1SLChange = (value: string) => {
    setPlayer1SL(parseInt(value));
    setPlayer1SLTouched(true);
  };

  const handlePlayer2SLChange = (value: string) => {
    setPlayer2SL(parseInt(value));
    setPlayer2SLTouched(true);
  };

  // Check for duplicate names (ensure boolean type)
  const hasDuplicateNames = Boolean(player1.trim() && player2.trim() && isSamePlayer(player1, player2));

  const handleStartClick = () => {
    // Defensive guard: prevent starting with duplicate names
    if (hasDuplicateNames) {
      return;
    }

    if (player1.trim() && player2.trim()) {
      // Check if there's an in-progress game
      if (hasInProgress) {
        setShowConfirmDialog(true);
      } else {
        startNewGame();
      }
    }
  };

  const startNewGame = () => {
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
      activePlayer: 'A' as const,
      sharedInnings: 0,
    };
    sessionStorage.setItem(SESSION_KEYS.APA_PRACTICE, JSON.stringify(gameState));
    navigate({ to: '/apa-practice/game' });
  };

  const handleConfirmNewGame = () => {
    clearInProgressSession(SESSION_KEYS.APA_PRACTICE);
    setShowConfirmDialog(false);
    startNewGame();
  };

  const handleResume = () => {
    navigate({ to: '/apa-practice/game' });
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
                    onChange={(e) => handlePlayer1Change(e.target.value)}
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
                    onChange={(e) => handlePlayer2Change(e.target.value)}
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
                <Select value={player2SL.toString()} onValueChange={handlePlayer2SLChange}>
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

          {hasDuplicateNames && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Player 1 and Player 2 cannot be the same name.
              </AlertDescription>
            </Alert>
          )}

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
            onClick={handleStartClick}
            disabled={!player1.trim() || !player2.trim() || hasDuplicateNames}
            className="w-full"
            size="lg"
          >
            <Play className="mr-2 h-5 w-5" />
            Start Match
          </Button>

          {hasInProgress && (
            <Button
              onClick={handleResume}
              variant="outline"
              className="w-full gap-2"
              size="lg"
            >
              <RotateCcw className="h-4 w-4" />
              Resume Game
            </Button>
          )}
        </CardContent>
      </Card>

      <EndMatchDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleConfirmNewGame}
        title="End Current Game?"
        description="You have a game in progress. Starting a new match will end your current game. Are you sure?"
        confirmText="End Current & Start New"
      />
    </div>
  );
}
