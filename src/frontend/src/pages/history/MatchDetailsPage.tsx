import { useNavigate, useParams } from '@tanstack/react-router';
import { useGetMatch } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Users } from 'lucide-react';
import DeleteMatchButton from '../../components/matches/DeleteMatchButton';
import { MatchMode } from '../../backend';

export default function MatchDetailsPage() {
  const navigate = useNavigate();
  const { matchId } = useParams({ from: '/history/$matchId' });
  const { data: match, isLoading } = useGetMatch(matchId);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="text-muted-foreground">Loading match details...</p>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Button variant="ghost" onClick={() => navigate({ to: '/history' })} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to History
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Match not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
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

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button variant="ghost" onClick={() => navigate({ to: '/history' })} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to History
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{getModeLabel(match.mode)}</CardTitle>
              <CardDescription className="mt-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(match.dateTime)}
              </CardDescription>
            </div>
            <Badge variant="secondary">{getModeLabel(match.mode)}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="mb-2 flex items-center gap-2 font-semibold">
              <Users className="h-4 w-4" />
              Players
            </h3>
            <div className="space-y-1">
              {match.players.map((player, idx) => (
                <div key={idx} className="text-sm">
                  {player.name}
                  {player.skillLevel && <span className="ml-2 text-muted-foreground">SL {player.skillLevel}</span>}
                </div>
              ))}
            </div>
          </div>

          {match.mode === MatchMode.straightShot && match.attempts !== undefined && match.makes !== undefined && (
            <div>
              <h3 className="mb-2 font-semibold">Statistics</h3>
              <div className="space-y-2 rounded-lg border p-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Attempts:</span>
                  <span className="font-semibold">{match.attempts.toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Successful Shots:</span>
                  <span className="font-semibold">{match.makes.toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Accuracy:</span>
                  <span className="font-semibold">
                    {Number(match.attempts) > 0 
                      ? ((Number(match.makes) / Number(match.attempts)) * 100).toFixed(1) 
                      : '0.0'}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {match.mode === MatchMode.acceptingGifts && (
            <div>
              <h3 className="mb-2 font-semibold">Session Details</h3>
              <div className="space-y-2 rounded-lg border p-4">
                {match.score !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Score:</span>
                    <span className="font-semibold">{match.score.toString()}</span>
                  </div>
                )}
                {match.completionStatus !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={match.completionStatus ? 'default' : 'secondary'}>
                      {match.completionStatus ? 'Completed' : 'In Progress'}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          )}

          {match.notes && (
            <div>
              <h3 className="mb-2 font-semibold">Notes</h3>
              <p className="rounded-lg border p-4 text-sm text-muted-foreground">{match.notes}</p>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <DeleteMatchButton matchId={match.matchId} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
