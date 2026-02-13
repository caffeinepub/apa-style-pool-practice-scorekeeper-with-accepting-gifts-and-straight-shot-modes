import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const getModeLabel = (mode: MatchMode) => {
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
    if (match.mode === MatchMode.straightShot && match.totalScore !== undefined) {
      const strokes = Number(match.totalScore);
      const isWin = strokes <= 20;
      return (
        <span className={isWin ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
          {strokes} strokes {isWin ? '✓' : ''}
        </span>
      );
    }
    if (match.mode === MatchMode.acceptingGifts && match.score !== undefined) {
      return `Score: ${match.score}`;
    }
    if (match.mode === MatchMode.apaPractice && match.apaMatchInfo) {
      const players = match.apaMatchInfo.players.filter(p => p !== null);
      if (players.length >= 2) {
        const p1 = players[0]!;
        const p2 = players[1]!;
        return `${Number(p1.totalScore)} - ${Number(p2.totalScore)} pts | PPI: ${p1.ppi.toFixed(2)} - ${p2.ppi.toFixed(2)}`;
      }
    }
    return null;
  };

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md"
      onClick={() => navigate({ to: '/history/$matchId', params: { matchId: match.matchId } })}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base font-semibold">{getModeLabel(match.mode)}</CardTitle>
          <Badge className={getModeColor(match.mode)} variant="secondary">
            {getModeLabel(match.mode)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(match.dateTime)} at {formatTime(match.dateTime)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{match.players.map(p => p.name).join(', ')}</span>
        </div>
        {getSummary() && (
          <div className="mt-2 text-sm font-medium text-foreground">
            {getSummary()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
