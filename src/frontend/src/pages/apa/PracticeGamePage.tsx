import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ApaRackScoringPanel from '@/components/apa/ApaRackScoringPanel';
import ApaResultsSummary from '@/components/apa/ApaResultsSummary';
import EndMatchDialog from '@/components/matches/EndMatchDialog';
import { SESSION_KEYS, getInProgressSession, setInProgressSession, clearInProgressSession } from '@/lib/session/inProgressSessions';
import { getPointsToWin } from '@/lib/apa/apaEqualizer';
import { useSaveMatch } from '@/hooks/useQueries';
import { buildApaNineBallMatch } from '@/lib/matches/matchBuildersOriginal';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { computeApaPracticeMatchOutcome } from '@/lib/apa/apaPracticeMatchOutcome';

interface RackData {
  player1Points: number;
  player2Points: number;
  deadBalls: number;
  player1Innings: number;
  player2Innings: number;
  player1DefensiveShots: number;
  player2DefensiveShots: number;
}

interface SessionState {
  player1Name: string;
  player2Name: string;
  player1SkillLevel: number;
  player2SkillLevel: number;
  lagWinner: 'A' | 'B';
  bottomPlayer: 'A' | 'B';
  activePlayer: 'A' | 'B';
  racks: RackData[];
  sharedInnings: number;
}

export default function PracticeGamePage() {
  const navigate = useNavigate();
  const saveMatchMutation = useSaveMatch();
  const { identity } = useInternetIdentity();

  const [session, setSession] = useState<SessionState | null>(null);
  const [currentRackNumber, setCurrentRackNumber] = useState(1);
  const [player1TotalScore, setPlayer1TotalScore] = useState(0);
  const [player2TotalScore, setPlayer2TotalScore] = useState(0);
  const [liveRackPoints, setLiveRackPoints] = useState({ player1: 0, player2: 0 });
  const [matchComplete, setMatchComplete] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);

  // Load session on mount
  useEffect(() => {
    const existingSession = getInProgressSession<SessionState>(SESSION_KEYS.APA_PRACTICE);
    if (!existingSession) {
      navigate({ to: '/apa-practice/start' });
      return;
    }
    setSession(existingSession);
    setCurrentRackNumber(existingSession.racks.length + 1);

    // Calculate totals from existing racks
    const player1Total = existingSession.racks.reduce((sum, rack) => sum + rack.player1Points, 0);
    const player2Total = existingSession.racks.reduce((sum, rack) => sum + rack.player2Points, 0);
    setPlayer1TotalScore(player1Total);
    setPlayer2TotalScore(player2Total);
  }, [navigate]);

  if (!session) {
    return null;
  }

  const player1Target = getPointsToWin(session.player1SkillLevel);
  const player2Target = getPointsToWin(session.player2SkillLevel);

  // Display mapping: lag winner on left, lag loser on right
  const leftPlayerName = session.lagWinner === 'A' ? session.player1Name : session.player2Name;
  const rightPlayerName = session.lagWinner === 'A' ? session.player2Name : session.player1Name;
  const leftPlayerSkillLevel = session.lagWinner === 'A' ? session.player1SkillLevel : session.player2SkillLevel;
  const rightPlayerSkillLevel = session.lagWinner === 'A' ? session.player2SkillLevel : session.player1SkillLevel;
  const leftPlayerScore = session.lagWinner === 'A' ? player1TotalScore : player2TotalScore;
  const rightPlayerScore = session.lagWinner === 'A' ? player2TotalScore : player1TotalScore;
  const leftPlayerTarget = session.lagWinner === 'A' ? player1Target : player2Target;
  const rightPlayerTarget = session.lagWinner === 'A' ? player2Target : player1Target;
  const leftPlayerLiveRack = session.lagWinner === 'A' ? liveRackPoints.player1 : liveRackPoints.player2;
  const rightPlayerLiveRack = session.lagWinner === 'A' ? liveRackPoints.player2 : liveRackPoints.player1;

  const handleRackComplete = (data: {
    player1Points: number;
    player2Points: number;
    deadBalls: number;
    player1Innings: number;
    player2Innings: number;
    player1DefensiveShots: number;
    player2DefensiveShots: number;
    activePlayer: 'A' | 'B';
    sharedInnings: number;
  }) => {
    // Remap rack results from seat-based to original Player1/Player2
    // data.player1Points = LEFT seat points
    // data.player2Points = RIGHT seat points
    
    let originalPlayer1Points: number;
    let originalPlayer2Points: number;
    let originalPlayer1DefensiveShots: number;
    let originalPlayer2DefensiveShots: number;

    if (session.lagWinner === 'A') {
      // Player 1 is on LEFT, Player 2 is on RIGHT
      originalPlayer1Points = data.player1Points;
      originalPlayer2Points = data.player2Points;
      originalPlayer1DefensiveShots = data.player1DefensiveShots;
      originalPlayer2DefensiveShots = data.player2DefensiveShots;
    } else {
      // Player 2 is on LEFT, Player 1 is on RIGHT
      originalPlayer1Points = data.player2Points;
      originalPlayer2Points = data.player1Points;
      originalPlayer1DefensiveShots = data.player2DefensiveShots;
      originalPlayer2DefensiveShots = data.player1DefensiveShots;
    }

    const newRack: RackData = {
      player1Points: originalPlayer1Points,
      player2Points: originalPlayer2Points,
      deadBalls: data.deadBalls,
      player1Innings: data.player1Innings,
      player2Innings: data.player2Innings,
      player1DefensiveShots: originalPlayer1DefensiveShots,
      player2DefensiveShots: originalPlayer2DefensiveShots,
    };

    const updatedRacks = [...session.racks, newRack];
    const newPlayer1Total = player1TotalScore + originalPlayer1Points;
    const newPlayer2Total = player2TotalScore + originalPlayer2Points;

    // Check if match is complete
    const player1Won = newPlayer1Total >= player1Target;
    const player2Won = newPlayer2Total >= player2Target;
    const isComplete = player1Won || player2Won;

    const updatedSession: SessionState = {
      ...session,
      racks: updatedRacks,
      activePlayer: data.activePlayer,
      sharedInnings: data.sharedInnings,
    };

    setSession(updatedSession);
    setInProgressSession(SESSION_KEYS.APA_PRACTICE, updatedSession);
    setPlayer1TotalScore(newPlayer1Total);
    setPlayer2TotalScore(newPlayer2Total);
    setLiveRackPoints({ player1: 0, player2: 0 });

    if (isComplete) {
      setMatchComplete(true);
    } else {
      setCurrentRackNumber(currentRackNumber + 1);
    }
  };

  const handleLiveRackUpdate = (data: { player1Points: number; player2Points: number }) => {
    // Remap live rack updates from seat-based to original Player1/Player2
    // data.player1Points = LEFT seat points
    // data.player2Points = RIGHT seat points
    
    let originalPlayer1LivePoints: number;
    let originalPlayer2LivePoints: number;

    if (session.lagWinner === 'A') {
      // Player 1 is on LEFT, Player 2 is on RIGHT
      originalPlayer1LivePoints = data.player1Points;
      originalPlayer2LivePoints = data.player2Points;
    } else {
      // Player 2 is on LEFT, Player 1 is on RIGHT
      originalPlayer1LivePoints = data.player2Points;
      originalPlayer2LivePoints = data.player1Points;
    }

    setLiveRackPoints({ 
      player1: originalPlayer1LivePoints, 
      player2: originalPlayer2LivePoints 
    });
  };

  const handleSaveMatch = async () => {
    if (!session || !identity) return;

    // Use authoritative values directly from state without recalculation
    const totalPlayer1Innings = session.sharedInnings;
    const totalPlayer2Innings = session.sharedInnings;
    const totalPlayer1DefensiveShots = session.racks.reduce((sum, rack) => sum + rack.player1DefensiveShots, 0);
    const totalPlayer2DefensiveShots = session.racks.reduce((sum, rack) => sum + rack.player2DefensiveShots, 0);

    // Validation: defensive shots must be <= innings when a winner exists
    const player1Won = player1TotalScore >= player1Target;
    const player2Won = player2TotalScore >= player2Target;
    const hasWinner = player1Won || player2Won;

    if (hasWinner) {
      if (totalPlayer1DefensiveShots > totalPlayer1Innings || totalPlayer2DefensiveShots > totalPlayer2Innings) {
        alert('Defensive shots cannot exceed innings when a winner exists. Please correct the rack data.');
        return;
      }
    }

    const player1Ppi = totalPlayer1Innings > 0 ? player1TotalScore / totalPlayer1Innings : 0;
    const player2Ppi = totalPlayer2Innings > 0 ? player2TotalScore / totalPlayer2Innings : 0;

    const { matchId, matchRecord } = buildApaNineBallMatch({
      playerOneName: session.player1Name,
      playerOneSkillLevel: session.player1SkillLevel,
      playerTwoName: session.player2Name,
      playerTwoSkillLevel: session.player2SkillLevel,
      playerOneScore: player1TotalScore,
      playerTwoScore: player2TotalScore,
      playerOneInnings: totalPlayer1Innings,
      playerTwoInnings: totalPlayer2Innings,
      playerOneDefensiveShots: totalPlayer1DefensiveShots,
      playerTwoDefensiveShots: totalPlayer2DefensiveShots,
      playerOnePpi: player1Ppi,
      playerTwoPpi: player2Ppi,
      identity,
    });

    await saveMatchMutation.mutateAsync({ matchId, matchRecord });
    clearInProgressSession(SESSION_KEYS.APA_PRACTICE);
    navigate({ to: '/history' });
  };

  const handleEndWithoutSaving = () => {
    clearInProgressSession(SESSION_KEYS.APA_PRACTICE);
    navigate({ to: '/apa-practice/start' });
  };

  const totalPlayer1Innings = session.sharedInnings;
  const totalPlayer2Innings = session.sharedInnings;
  const totalPlayer1DefensiveShots = session.racks.reduce((sum, rack) => sum + rack.player1DefensiveShots, 0);
  const totalPlayer2DefensiveShots = session.racks.reduce((sum, rack) => sum + rack.player2DefensiveShots, 0);

  const player1Ppi = totalPlayer1Innings > 0 ? player1TotalScore / totalPlayer1Innings : 0;
  const player2Ppi = totalPlayer2Innings > 0 ? player2TotalScore / totalPlayer2Innings : 0;

  const outcomeResult = computeApaPracticeMatchOutcome({
    player1Points: player1TotalScore,
    player2Points: player2TotalScore,
    player1SL: session.player1SkillLevel,
    player2SL: session.player2SkillLevel,
    player1Target,
    player2Target,
  });

  const player1Won = player1TotalScore >= player1Target;
  const player2Won = player2TotalScore >= player2Target;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">APA 9-Ball Practice</CardTitle>
              <Badge variant={matchComplete ? 'default' : 'secondary'}>
                {matchComplete ? 'Match Complete' : `Rack ${currentRackNumber}`}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Player (Lag Winner) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{leftPlayerName}</span>
                <Badge variant="outline">SL {leftPlayerSkillLevel}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-muted-foreground">Score</span>
                  <span className="text-4xl font-bold text-emerald-600">
                    {leftPlayerScore + leftPlayerLiveRack}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-muted-foreground">Target</span>
                  <span className="text-2xl font-semibold">{leftPlayerTarget}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Player (Lag Loser) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{rightPlayerName}</span>
                <Badge variant="outline">SL {rightPlayerSkillLevel}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-muted-foreground">Score</span>
                  <span className="text-4xl font-bold text-emerald-600">
                    {rightPlayerScore + rightPlayerLiveRack}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-muted-foreground">Target</span>
                  <span className="text-2xl font-semibold">{rightPlayerTarget}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rack Scoring Panel - Only render when match is NOT complete */}
        {!matchComplete && (
          <ApaRackScoringPanel
            rackNumber={currentRackNumber}
            player1Name={leftPlayerName}
            player2Name={rightPlayerName}
            onRackComplete={handleRackComplete}
            onLiveRackUpdate={handleLiveRackUpdate}
            matchContext={{
              player1CurrentPoints: leftPlayerScore,
              player2CurrentPoints: rightPlayerScore,
              player1Target: leftPlayerTarget,
              player2Target: rightPlayerTarget,
              matchComplete,
              activePlayer: session.activePlayer,
              sharedInnings: session.sharedInnings,
              bottomPlayer: session.bottomPlayer,
            }}
          />
        )}

        {/* Match Complete Summary */}
        {matchComplete && (
          <ApaResultsSummary
            player1={{
              name: session.player1Name,
              skillLevel: session.player1SkillLevel,
              pointsNeeded: player1Target,
              pointsEarned: player1TotalScore,
              defensiveShots: totalPlayer1DefensiveShots,
              innings: totalPlayer1Innings,
              ppi: player1Ppi,
              isWinner: player1Won,
            }}
            player2={{
              name: session.player2Name,
              skillLevel: session.player2SkillLevel,
              pointsNeeded: player2Target,
              pointsEarned: player2TotalScore,
              defensiveShots: totalPlayer2DefensiveShots,
              innings: totalPlayer2Innings,
              ppi: player2Ppi,
              isWinner: player2Won,
            }}
            matchPointOutcome={outcomeResult.outcome}
          />
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {matchComplete ? (
            <>
              <Button
                onClick={handleSaveMatch}
                className="flex-1"
                size="lg"
                disabled={saveMatchMutation.isPending}
              >
                {saveMatchMutation.isPending ? 'Saving...' : 'Save Match'}
              </Button>
              <Button
                onClick={handleEndWithoutSaving}
                variant="outline"
                className="flex-1"
                size="lg"
                disabled={saveMatchMutation.isPending}
              >
                End Without Saving
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setShowEndDialog(true)}
              variant="outline"
              className="w-full"
              size="lg"
            >
              End Session Without Saving
            </Button>
          )}
        </div>
      </div>

      {/* End Match Dialog */}
      <EndMatchDialog
        open={showEndDialog}
        onOpenChange={setShowEndDialog}
        onConfirm={handleEndWithoutSaving}
        title="End Session Without Saving?"
        description="This will discard the current session. This action cannot be undone."
      />
    </div>
  );
}
