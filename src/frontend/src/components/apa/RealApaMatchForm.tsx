import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Save } from 'lucide-react';
import { useSaveMatch, useUpdateMatch } from '../../hooks/useQueries';
import { buildOfficialApaMatchLog } from '../../lib/matches/matchBuilders';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useActor } from '../../hooks/useActor';
import { toast } from 'sonner';
import { extractErrorText } from '../../utils/errorText';
import { getPointsToWin } from '../../lib/apa/apaEqualizer';

interface RealApaMatchFormProps {
  mode: 'create' | 'edit';
  matchId?: string;
  initialData?: {
    matchDate: string;
    opponentName: string;
    yourSkillLevel: string;
    opponentSkillLevel: string;
    yourScore: string;
    theirScore: string;
    innings: string;
    defensiveShots: string;
    notes: string;
  };
}

export default function RealApaMatchForm({ mode, matchId, initialData }: RealApaMatchFormProps) {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const saveMatchMutation = useSaveMatch();
  const updateMatchMutation = useUpdateMatch();

  // Form state
  const [matchDate, setMatchDate] = useState(initialData?.matchDate || '');
  const [opponentName, setOpponentName] = useState(initialData?.opponentName || '');
  const [yourSkillLevel, setYourSkillLevel] = useState<string>(initialData?.yourSkillLevel || '');
  const [opponentSkillLevel, setOpponentSkillLevel] = useState<string>(initialData?.opponentSkillLevel || '');
  const [yourScore, setYourScore] = useState(initialData?.yourScore || '');
  const [theirScore, setTheirScore] = useState(initialData?.theirScore || '');
  const [innings, setInnings] = useState(initialData?.innings || '');
  const [defensiveShots, setDefensiveShots] = useState(initialData?.defensiveShots || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [inningsUnknown, setInningsUnknown] = useState(initialData?.innings === '' || false);

  // Validation errors
  const [yourScoreError, setYourScoreError] = useState('');
  const [theirScoreError, setTheirScoreError] = useState('');
  const [inningsError, setInningsError] = useState('');
  const [defensiveShotsError, setDefensiveShotsError] = useState('');

  // Compute points-to-win targets
  const yourPointsToWin = yourSkillLevel ? getPointsToWin(parseInt(yourSkillLevel)) : null;
  const theirPointsToWin = opponentSkillLevel ? getPointsToWin(parseInt(opponentSkillLevel)) : null;

  // Validation helper for numeric fields
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

  // Validation helper for score with skill level target check
  const validateScoreField = (
    value: string,
    setter: (error: string) => void,
    pointsToWin: number | null
  ) => {
    if (value === '') {
      setter('');
      return;
    }
    const num = Number(value);
    if (isNaN(num) || num < 0) {
      setter('Value must be 0 or greater');
      return;
    }
    // Only validate against target if skill level is selected
    if (pointsToWin !== null && num > pointsToWin) {
      setter(`Score cannot exceed ${pointsToWin} (points-to-win for this skill level)`);
      return;
    }
    setter('');
  };

  const handleYourScoreChange = (value: string) => {
    setYourScore(value);
    validateScoreField(value, setYourScoreError, yourPointsToWin);
  };

  const handleTheirScoreChange = (value: string) => {
    setTheirScore(value);
    validateScoreField(value, setTheirScoreError, theirPointsToWin);
  };

  const handleInningsChange = (value: string) => {
    setInnings(value);
    if (!inningsUnknown) {
      validateNumericField(value, setInningsError);
    }
  };

  const handleDefensiveShotsChange = (value: string) => {
    setDefensiveShots(value);
    validateNumericField(value, setDefensiveShotsError);
  };

  const handleInningsUnknownChange = (checked: boolean) => {
    setInningsUnknown(checked);
    if (checked) {
      setInnings('');
      setInningsError('');
    }
  };

  // Re-validate scores when skill levels change
  const handleYourSkillLevelChange = (value: string) => {
    setYourSkillLevel(value);
    // Re-validate your score with new target
    if (yourScore) {
      const newTarget = getPointsToWin(parseInt(value));
      validateScoreField(yourScore, setYourScoreError, newTarget);
    }
  };

  const handleOpponentSkillLevelChange = (value: string) => {
    setOpponentSkillLevel(value);
    // Re-validate their score with new target
    if (theirScore) {
      const newTarget = getPointsToWin(parseInt(value));
      validateScoreField(theirScore, setTheirScoreError, newTarget);
    }
  };

  const hasValidationErrors = () => {
    return !!(yourScoreError || theirScoreError || inningsError || defensiveShotsError);
  };

  const hasRequiredFields = () => {
    return !!(
      matchDate &&
      opponentName.trim() &&
      yourScore &&
      theirScore &&
      defensiveShots &&
      (inningsUnknown || innings)
    );
  };

  const handleSubmit = async () => {
    if (!identity) {
      toast.error('You must be logged in to save a match');
      return;
    }

    if (!actor) {
      toast.error('Backend connection not ready. Please wait and try again.');
      return;
    }

    if (!hasRequiredFields()) {
      const missingFields: string[] = [];
      if (!matchDate) missingFields.push('Match Date');
      if (!opponentName.trim()) missingFields.push('Opponent Name');
      if (!yourScore) missingFields.push('Your Score');
      if (!theirScore) missingFields.push('Their Score');
      if (!inningsUnknown && !innings) missingFields.push('Innings');
      if (!defensiveShots) missingFields.push('Defensive Shots');
      
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    if (hasValidationErrors()) {
      toast.error('Please fix validation errors before saving');
      return;
    }

    try {
      if (mode === 'create') {
        const { matchId: newMatchId, matchRecord } = buildOfficialApaMatchLog({
          date: matchDate,
          opponentName,
          myScore: yourScore,
          theirScore,
          innings: inningsUnknown ? '' : innings,
          defensiveShots,
          notes,
          identity,
          player1SkillLevel: yourSkillLevel ? parseInt(yourSkillLevel) : undefined,
          player2SkillLevel: opponentSkillLevel ? parseInt(opponentSkillLevel) : undefined,
        });

        await saveMatchMutation.mutateAsync({ matchId: newMatchId, matchRecord });
        toast.success('Match saved');
        navigate({ to: `/history/${newMatchId}` });
      } else {
        // Edit mode
        if (!matchId) {
          toast.error('Match ID is missing');
          return;
        }

        const { matchRecord } = buildOfficialApaMatchLog({
          date: matchDate,
          opponentName,
          myScore: yourScore,
          theirScore,
          innings: inningsUnknown ? '' : innings,
          defensiveShots,
          notes,
          identity,
          player1SkillLevel: yourSkillLevel ? parseInt(yourSkillLevel) : undefined,
          player2SkillLevel: opponentSkillLevel ? parseInt(opponentSkillLevel) : undefined,
          existingMatchId: matchId,
        });

        await updateMatchMutation.mutateAsync({ matchId, matchRecord });
        toast.success('Match updated successfully');
        navigate({ to: `/history/${matchId}` });
      }
    } catch (error) {
      const errorText = extractErrorText(error);
      toast.error(errorText);
      console.error('Error saving match:', error);
    }
  };

  const isSubmitting = saveMatchMutation.isPending || updateMatchMutation.isPending;
  const isActorReady = !!actor && !actorFetching;
  const isSubmitDisabled = !isActorReady || isSubmitting || hasValidationErrors() || !hasRequiredFields();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* Match Date */}
        <div className="space-y-2">
          <Label htmlFor="matchDate">
            Match Date <span className="text-destructive">*</span>
          </Label>
          <Input
            id="matchDate"
            type="date"
            value={matchDate}
            onChange={(e) => setMatchDate(e.target.value)}
            className="w-full"
            disabled={isSubmitting}
          />
        </div>

        {/* Opponent Name */}
        <div className="space-y-2">
          <Label htmlFor="opponentName">
            Opponent Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="opponentName"
            type="text"
            placeholder="Enter opponent's name"
            value={opponentName}
            onChange={(e) => setOpponentName(e.target.value)}
            className="w-full"
            disabled={isSubmitting}
          />
        </div>

        {/* Skill Levels Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="yourSkillLevel">Your Skill Level (1–9)</Label>
            <Select
              value={yourSkillLevel}
              onValueChange={handleYourSkillLevelChange}
              disabled={isSubmitting}
            >
              <SelectTrigger id="yourSkillLevel">
                <SelectValue placeholder="Select SL" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((sl) => (
                  <SelectItem key={sl} value={sl.toString()}>
                    SL {sl}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {yourPointsToWin !== null && (
              <p className="text-xs text-muted-foreground">
                Points to win: {yourPointsToWin}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="opponentSkillLevel">Opponent Skill Level (1–9)</Label>
            <Select
              value={opponentSkillLevel}
              onValueChange={handleOpponentSkillLevelChange}
              disabled={isSubmitting}
            >
              <SelectTrigger id="opponentSkillLevel">
                <SelectValue placeholder="Select SL" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((sl) => (
                  <SelectItem key={sl} value={sl.toString()}>
                    SL {sl}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {theirPointsToWin !== null && (
              <p className="text-xs text-muted-foreground">
                Points to win: {theirPointsToWin}
              </p>
            )}
          </div>
        </div>

        {/* Scores Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="yourScore">
              Your Score <span className="text-destructive">*</span>
            </Label>
            <Input
              id="yourScore"
              type="number"
              min="0"
              placeholder="0"
              value={yourScore}
              onChange={(e) => handleYourScoreChange(e.target.value)}
              className="w-full"
              disabled={isSubmitting}
            />
            {yourScoreError && (
              <p className="text-xs text-destructive">{yourScoreError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="theirScore">
              Their Score <span className="text-destructive">*</span>
            </Label>
            <Input
              id="theirScore"
              type="number"
              min="0"
              placeholder="0"
              value={theirScore}
              onChange={(e) => handleTheirScoreChange(e.target.value)}
              className="w-full"
              disabled={isSubmitting}
            />
            {theirScoreError && (
              <p className="text-xs text-destructive">{theirScoreError}</p>
            )}
          </div>
        </div>

        {/* Innings Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="innings">
              Innings {!inningsUnknown && <span className="text-destructive">*</span>}
            </Label>
            <div className="flex items-center gap-2">
              <Checkbox
                id="inningsUnknown"
                checked={inningsUnknown}
                onCheckedChange={handleInningsUnknownChange}
                disabled={isSubmitting}
              />
              <Label htmlFor="inningsUnknown" className="text-sm font-normal cursor-pointer">
                Unknown
              </Label>
            </div>
          </div>
          <Input
            id="innings"
            type="number"
            min="0"
            placeholder="0"
            value={innings}
            onChange={(e) => handleInningsChange(e.target.value)}
            className="w-full"
            disabled={isSubmitting || inningsUnknown}
          />
          {inningsError && (
            <p className="text-xs text-destructive">{inningsError}</p>
          )}
        </div>

        {/* Defensive Shots */}
        <div className="space-y-2">
          <Label htmlFor="defensiveShots">
            Defensive Shots <span className="text-destructive">*</span>
          </Label>
          <Input
            id="defensiveShots"
            type="number"
            min="0"
            placeholder="0"
            value={defensiveShots}
            onChange={(e) => handleDefensiveShotsChange(e.target.value)}
            className="w-full"
            disabled={isSubmitting}
          />
          {defensiveShotsError && (
            <p className="text-xs text-destructive">{defensiveShotsError}</p>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Optional notes about the match..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full min-h-[100px]"
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => navigate({ to: '/history' })}
          disabled={isSubmitting}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          className="flex-1 gap-2"
        >
          <Save className="h-4 w-4" />
          {!isActorReady ? 'Connecting...' : isSubmitting ? 'Saving...' : mode === 'create' ? 'Save Match' : 'Update Match'}
        </Button>
      </div>
    </div>
  );
}
