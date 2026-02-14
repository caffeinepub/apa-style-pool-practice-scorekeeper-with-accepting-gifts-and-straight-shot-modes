import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from '@tanstack/react-router';
import { type ApiMatch, MatchMode } from '../../backend';
import { Calendar, Users } from 'lucide-react';

interface MatchSummaryCardProps {
  match: ApiMatch;
}

export default function MatchSummaryCard({ match }: MatchSummaryCardProps) {
  const navigate = useNavigate();

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getModeLabel = (mode: MatchMode) => {
    if (match.officialApaMatchLogData) {
      return 'Official APA Match Log';
    }
    switch (mode) {
      case MatchMode.apaPractice:
        return 'APA 9-Ball';
      case MatchMode.acceptingGifts:
        return 'Accepting Gifts';
      case MatchMode.straightShot:
        return 'Straight Shot';
      default:
        return 'Unknown';
    }
  };

  const getModeColor = (mode: MatchMode) => {
    if (match.officialApaMatchLogData) {
      return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
    }
    switch (mode) {
      case MatchMode.apaPractice:
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
      case MatchMode.acceptingGifts:
        return 'bg-teal-500/10 text-teal-700 dark:text-teal-400';
      case MatchMode.straightShot:
        return 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getSummary = () => {
    if (match.officialApaMatchLogData) {
      const data = match.officialApaMatchLogData;
      const displayDate = data.date || formatDate(match.dateTime);
      return `vs ${data.opponentName || 'Unknown'} • ${data.myScore || '0'}-${data.theirScore || '0'} • ${data.points || '0'} pts, ${data.innings || '0'} inn`;
    }

    if (match.mode === MatchMode.apaPractice && match.apaMatchInfo) {
      const players = match.apaMatchInfo.players.filter(p => p !== null);
      if (players.length >= 2 && players[0] && players[1]) {
        const p1 = players[0];
        const p2 = players[1];
        const p1Name = match.players[0]?.name || 'Player 1';
        const p2Name = match.players[1]?.name || 'Player 2';
        return `${p1Name} ${Number(p1.pointsEarnedRunningTotal)} - ${Number(p2.pointsEarnedRunningTotal)} ${p2Name}`;
      }
    }

    if (match.mode === MatchMode.acceptingGifts) {
      const startCount = match.startingObjectBallCount !== undefined ? Number(match.startingObjectBallCount) : 'N/A';
      const endCount = match.endingObjectBallCount !== undefined ? Number(match.endingObjectBallCount) : 'N/A';
      const playerScore = match.finalSetScorePlayer !== undefined ? Number(match.finalSetScorePlayer) : 0;
      const ghostScore = match.finalSetScoreGhost !== undefined ? Number(match.finalSetScoreGhost) : 0;
      return `You ${playerScore} – ${ghostScore} Ghost • Balls: ${startCount} → ${endCount}`;
    }

    if (match.mode === MatchMode.straightShot) {
      const shots = match.shots !== undefined ? Number(match.shots) : 0;
      const made = match.ballsMade !== undefined ? Number(match.ballsMade) : 0;
      return `${shots} strokes • ${made} balls made`;
    }

    return 'No summary available';
  };

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md"
      onClick={() => navigate({ to: `/history/${match.matchId}` })}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Badge className={getModeColor(match.mode)} variant="secondary">
                {getModeLabel(match.mode)}
              </Badge>
            </div>
            <p className="text-sm font-medium">{getSummary()}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {match.officialApaMatchLogData?.date || formatDate(match.dateTime)}
              </span>
              {!match.officialApaMatchLogData && (
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {match.players.length} player{match.players.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
