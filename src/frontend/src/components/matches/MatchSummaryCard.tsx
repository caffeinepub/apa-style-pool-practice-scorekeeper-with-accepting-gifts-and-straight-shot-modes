import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import type { ApiMatch } from '../../backend';
import { MatchMode } from '../../backend';
import { getPointsToWin } from '../../lib/apa/apaEqualizer';
import { getOfficialApaOutcome } from '../../lib/apa/officialApaOutcome';
import { formatEffectiveMatchDate } from '../../lib/matches/effectiveMatchDate';

interface MatchSummaryCardProps {
  match: ApiMatch;
}

export default function MatchSummaryCard({ match }: MatchSummaryCardProps) {
  const navigate = useNavigate();

  const getModeLabel = (mode: MatchMode) => {
    switch (mode) {
      case MatchMode.apaPractice:
        return match.officialApaMatchLogData ? 'Official APA' : 'APA Practice';
      case MatchMode.acceptingGifts:
        return 'Accepting Gifts';
      case MatchMode.straightShot:
        return 'Straight Shot';
      default:
        return 'Unknown';
    }
  };

  const getSummaryText = () => {
    if (match.mode === MatchMode.apaPractice && match.apaMatchInfo) {
      const player1 = match.apaMatchInfo.players[0];
      const player2 = match.apaMatchInfo.players[1];
      if (player1 && player2) {
        const winner = player1.isPlayerOfMatch ? match.players[0]?.name : match.players[1]?.name;
        return `${match.players[0]?.name} vs ${match.players[1]?.name} • Winner: ${winner}`;
      }
    }

    if (match.mode === MatchMode.acceptingGifts) {
      const status = match.completionStatus ? 'Completed' : 'In Progress';
      return `${match.players[0]?.name || 'Player'} • ${status}`;
    }

    if (match.mode === MatchMode.straightShot) {
      const result = (match.totalScore ?? 0) <= 20 ? 'Win' : 'Loss';
      return `${match.players[0]?.name || 'Player'} • ${result}`;
    }

    if (match.officialApaMatchLogData) {
      const data = match.officialApaMatchLogData;
      const outcome = getOfficialApaOutcome(
        data.didWin,
        data.playerOneSkillLevel,
        data.playerTwoSkillLevel,
        data.myScore,
        data.theirScore
      );

      const yourPointsToWin = data.playerOneSkillLevel ? getPointsToWin(Number(data.playerOneSkillLevel)) : null;
      const theirPointsToWin = data.playerTwoSkillLevel ? getPointsToWin(Number(data.playerTwoSkillLevel)) : null;

      let summaryParts: string[] = [];

      if (data.playerOneSkillLevel !== undefined && data.playerTwoSkillLevel !== undefined) {
        summaryParts.push(`SL ${data.playerOneSkillLevel} vs SL ${data.playerTwoSkillLevel}`);
      }

      // Build score display with "out of" targets when both skill levels are present
      if (yourPointsToWin !== null && theirPointsToWin !== null) {
        summaryParts.push(`Score: ${data.myScore || '?'}/${yourPointsToWin}–${data.theirScore || '?'}/${theirPointsToWin}`);
      } else {
        summaryParts.push(`Score: ${data.myScore || '?'}–${data.theirScore || '?'}`);
      }

      if (outcome === 'win') {
        summaryParts.push('• Win');
      } else if (outcome === 'loss') {
        summaryParts.push('• Loss');
      }

      return summaryParts.join(' ');
    }

    return 'Match details';
  };

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{getModeLabel(match.mode)}</Badge>
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formatEffectiveMatchDate(match)}
              </span>
            </div>
            <p className="text-sm">{getSummaryText()}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: `/history/${match.matchId}` })}
          >
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
