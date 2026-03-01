import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import type { ApiMatch } from '../../backend';
import { formatEffectiveMatchDate } from '../../lib/matches/effectiveMatchDate';
import { buildMatchResultsNarrative } from '../../lib/history/matchHistoryRowModel';
import ModePill from '../ModePill';

interface MatchSummaryCardProps {
  match: ApiMatch;
}

export default function MatchSummaryCard({ match }: MatchSummaryCardProps) {
  const navigate = useNavigate();
  const narrative = buildMatchResultsNarrative(match);

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <ModePill label={narrative.modeName} />
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formatEffectiveMatchDate(match)}
              </span>
            </div>
            {narrative.details && (
              <p className="text-sm">{narrative.details}</p>
            )}
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
