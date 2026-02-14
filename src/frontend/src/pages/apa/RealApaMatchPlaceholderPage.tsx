import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Trophy, Save } from 'lucide-react';
import { useSaveMatch } from '../../hooks/useQueries';
import { buildOfficialApaMatchLog } from '../../lib/matches/matchBuilders';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { toast } from 'sonner';

export default function RealApaMatchPlaceholderPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const saveMatchMutation = useSaveMatch();

  // Form state
  const [matchDate, setMatchDate] = useState('');
  const [opponentName, setOpponentName] = useState('');
  const [yourScore, setYourScore] = useState('');
  const [theirScore, setTheirScore] = useState('');
  const [points, setPoints] = useState('');
  const [innings, setInnings] = useState('');
  const [defensiveShots, setDefensiveShots] = useState('');
  const [notes, setNotes] = useState('');

  // Validation errors
  const [yourScoreError, setYourScoreError] = useState('');
  const [theirScoreError, setTheirScoreError] = useState('');
  const [pointsError, setPointsError] = useState('');
  const [inningsError, setInningsError] = useState('');
  const [defensiveShotsError, setDefensiveShotsError] = useState('');

  // Validation helper
  const validateNumericField = (value: string, setter: (error: string) => void) => {
    if (value === '') {
      setter('');
      return;
    }
    const num = Number(value);
    if (isNaN(num) || num < 0) {
      setter('Value must be 0 or greater');
    } else {
      setter('');
    }
  };

  const handleYourScoreChange = (value: string) => {
    setYourScore(value);
    validateNumericField(value, setYourScoreError);
  };

  const handleTheirScoreChange = (value: string) => {
    setTheirScore(value);
    validateNumericField(value, setTheirScoreError);
  };

  const handlePointsChange = (value: string) => {
    setPoints(value);
    validateNumericField(value, setPointsError);
  };

  const handleInningsChange = (value: string) => {
    setInnings(value);
    validateNumericField(value, setInningsError);
  };

  const handleDefensiveShotsChange = (value: string) => {
    setDefensiveShots(value);
    validateNumericField(value, setDefensiveShotsError);
  };

  const hasValidationErrors = () => {
    return !!(yourScoreError || theirScoreError || pointsError || inningsError || defensiveShotsError);
  };

  const handleSaveClick = async () => {
    if (!identity) {
      toast.error('You must be logged in to save a match');
      return;
    }

    if (hasValidationErrors()) {
      toast.error('Please fix validation errors before saving');
      return;
    }

    try {
      const { matchId, matchRecord } = buildOfficialApaMatchLog({
        date: matchDate,
        opponentName,
        myScore: yourScore,
        theirScore,
        points,
        innings,
        defensiveShots,
        notes,
        identity,
      });

      await saveMatchMutation.mutateAsync({ matchId, matchRecord });
      toast.success('Match saved');
      navigate({ to: `/history/${matchId}` });
    } catch (error) {
      console.error('Error saving match:', error);
      toast.error('Failed to save match. Please try again.');
    }
  };

  const isSaving = saveMatchMutation.isPending;

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-8">
      <Button
        onClick={() => navigate({ to: '/' })}
        variant="ghost"
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Button>

      <Card className="border-emerald-500/50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <Trophy className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl">Official APA Match Log</CardTitle>
          <CardDescription className="text-base">
            Enter match data after the fact (not for live scoring)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {/* Match Date */}
            <div className="space-y-2">
              <Label htmlFor="matchDate">Match Date</Label>
              <Input
                id="matchDate"
                type="date"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                className="w-full"
                disabled={isSaving}
              />
            </div>

            {/* Opponent Name */}
            <div className="space-y-2">
              <Label htmlFor="opponentName">Opponent Name</Label>
              <Input
                id="opponentName"
                type="text"
                placeholder="Enter opponent's name"
                value={opponentName}
                onChange={(e) => setOpponentName(e.target.value)}
                className="w-full"
                disabled={isSaving}
              />
            </div>

            {/* Score Section */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="yourScore">Your Score</Label>
                <Input
                  id="yourScore"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={yourScore}
                  onChange={(e) => handleYourScoreChange(e.target.value)}
                  className={yourScoreError ? 'border-destructive' : ''}
                  disabled={isSaving}
                />
                {yourScoreError && (
                  <p className="text-sm text-destructive">{yourScoreError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="theirScore">Their Score</Label>
                <Input
                  id="theirScore"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={theirScore}
                  onChange={(e) => handleTheirScoreChange(e.target.value)}
                  className={theirScoreError ? 'border-destructive' : ''}
                  disabled={isSaving}
                />
                {theirScoreError && (
                  <p className="text-sm text-destructive">{theirScoreError}</p>
                )}
              </div>
            </div>

            {/* Points */}
            <div className="space-y-2">
              <Label htmlFor="points">Points</Label>
              <Input
                id="points"
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={points}
                onChange={(e) => handlePointsChange(e.target.value)}
                className={pointsError ? 'border-destructive' : ''}
                disabled={isSaving}
              />
              {pointsError && (
                <p className="text-sm text-destructive">{pointsError}</p>
              )}
            </div>

            {/* Innings */}
            <div className="space-y-2">
              <Label htmlFor="innings">Innings</Label>
              <Input
                id="innings"
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={innings}
                onChange={(e) => handleInningsChange(e.target.value)}
                className={inningsError ? 'border-destructive' : ''}
                disabled={isSaving}
              />
              {inningsError && (
                <p className="text-sm text-destructive">{inningsError}</p>
              )}
            </div>

            {/* Defensive Shots */}
            <div className="space-y-2">
              <Label htmlFor="defensiveShots">Defensive Shots</Label>
              <Input
                id="defensiveShots"
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={defensiveShots}
                onChange={(e) => handleDefensiveShotsChange(e.target.value)}
                className={defensiveShotsError ? 'border-destructive' : ''}
                disabled={isSaving}
              />
              {defensiveShotsError && (
                <p className="text-sm text-destructive">{defensiveShotsError}</p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any observations or notes about the match..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px] resize-y"
                disabled={isSaving}
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="space-y-3 pt-4">
            <Button
              onClick={handleSaveClick}
              className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
              disabled={isSaving || hasValidationErrors()}
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Match'}
            </Button>
          </div>

          {/* Return to Home */}
          <div className="pt-2">
            <Button
              onClick={() => navigate({ to: '/' })}
              variant="outline"
              className="w-full gap-2"
              disabled={isSaving}
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
