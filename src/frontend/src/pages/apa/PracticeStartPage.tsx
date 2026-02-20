import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { useGetCallerUserProfile } from '@/hooks/useQueries';
import { SESSION_KEYS, getInProgressSession, setInProgressSession } from '@/lib/session/inProgressSessions';
import { normalizePlayerName } from '@/utils/playerName';

export default function PracticeStartPage() {
  const navigate = useNavigate();
  const { data: userProfile } = useGetCallerUserProfile();

  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [player1SkillLevel, setPlayer1SkillLevel] = useState<number>(5);
  const [player2SkillLevel, setPlayer2SkillLevel] = useState<number>(5);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showLagDialog, setShowLagDialog] = useState(false);
  const [hasExistingSession, setHasExistingSession] = useState(false);

  // Auto-load skill levels from user profile
  useEffect(() => {
    if (userProfile?.apaSkillLevel) {
      setPlayer1SkillLevel(Number(userProfile.apaSkillLevel));
    }
  }, [userProfile]);

  // Check for existing session
  useEffect(() => {
    const existingSession = getInProgressSession(SESSION_KEYS.APA_PRACTICE);
    setHasExistingSession(!!existingSession);
  }, []);

  const handleStartMatch = () => {
    // Validate names
    if (!player1Name.trim() || !player2Name.trim()) {
      alert('Please enter both player names');
      return;
    }

    // Check for duplicate names (case-insensitive)
    if (normalizePlayerName(player1Name) === normalizePlayerName(player2Name)) {
      alert('Player names must be different');
      return;
    }

    // Check if there's an existing session
    if (hasExistingSession) {
      setShowConfirmDialog(true);
    } else {
      setShowLagDialog(true);
    }
  };

  const handleConfirmNewMatch = () => {
    setShowConfirmDialog(false);
    setShowLagDialog(true);
  };

  const handleLagSelection = (lagWinner: 'A' | 'B') => {
    // FIX 1: Set seat-based values
    // lagWinner = original player identity ('A' = Player1, 'B' = Player2)
    // activePlayer = 'A' (LEFT seat always shoots first)
    // bottomPlayer = 'B' (RIGHT seat increments innings)
    
    const newSession = {
      player1Name: player1Name.trim(),
      player2Name: player2Name.trim(),
      player1SkillLevel,
      player2SkillLevel,
      lagWinner, // Original player identity
      activePlayer: 'A' as 'A' | 'B', // LEFT seat shoots first
      bottomPlayer: 'B' as 'A' | 'B', // RIGHT seat increments innings
      racks: [],
      sharedInnings: 0,
    };

    setInProgressSession(SESSION_KEYS.APA_PRACTICE, newSession);
    setShowLagDialog(false);
    navigate({ to: '/apa-practice/game' });
  };

  const handleResumeGame = () => {
    navigate({ to: '/apa-practice/game' });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">APA 9-Ball Practice Match</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Player 1 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Player 1</h3>
            <div className="space-y-2">
              <Label htmlFor="player1Name">Name</Label>
              <Input
                id="player1Name"
                value={player1Name}
                onChange={(e) => setPlayer1Name(e.target.value)}
                placeholder="Enter player 1 name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="player1SkillLevel">Skill Level</Label>
              <Select
                value={player1SkillLevel.toString()}
                onValueChange={(value) => setPlayer1SkillLevel(Number(value))}
              >
                <SelectTrigger id="player1SkillLevel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
                    <SelectItem key={level} value={level.toString()}>
                      SL {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Player 2 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Player 2</h3>
            <div className="space-y-2">
              <Label htmlFor="player2Name">Name</Label>
              <Input
                id="player2Name"
                value={player2Name}
                onChange={(e) => setPlayer2Name(e.target.value)}
                placeholder="Enter player 2 name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="player2SkillLevel">Skill Level</Label>
              <Select
                value={player2SkillLevel.toString()}
                onValueChange={(value) => setPlayer2SkillLevel(Number(value))}
              >
                <SelectTrigger id="player2SkillLevel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
                    <SelectItem key={level} value={level.toString()}>
                      SL {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <Button onClick={handleStartMatch} className="w-full" size="lg">
              Start Match
            </Button>
            {hasExistingSession && (
              <Button
                onClick={handleResumeGame}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Resume Game
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog for Existing Session */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start New Match?</AlertDialogTitle>
            <AlertDialogDescription>
              You have a match in progress. Starting a new match will replace the current session.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmNewMatch}>
              Start New Match
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Lag Selection Dialog */}
      <AlertDialog open={showLagDialog} onOpenChange={setShowLagDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Who won the lag?</AlertDialogTitle>
            <AlertDialogDescription>
              The lag winner will shoot first and appear on the left during gameplay.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              onClick={() => handleLagSelection('A')}
              className="w-full sm:w-auto"
              variant="default"
            >
              Player 1
            </Button>
            <Button
              onClick={() => handleLagSelection('B')}
              className="w-full sm:w-auto"
              variant="secondary"
            >
              Player 2
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
