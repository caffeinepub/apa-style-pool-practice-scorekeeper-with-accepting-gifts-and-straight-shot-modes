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
        return 'APA Practice';
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
    if (match.mode === MatchMode.straightShot && match.attempts !== undefined && match.makes !== undefined) {
      const percentage = match.attempts > 0 ? ((Number(match.makes) / Number(match.attempts)) * 100).toFixed(1) : '0.0';
      return `${match.makes}/${match.attempts} (${percentage}%)`;
    }
    if (match.mode === MatchMode.acceptingGifts && match.score !== undefined) {
      return `Score: ${match.score}`;
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
