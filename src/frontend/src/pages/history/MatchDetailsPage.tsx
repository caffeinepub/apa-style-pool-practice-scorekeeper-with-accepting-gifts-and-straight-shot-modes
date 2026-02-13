import { useNavigate, useParams } from '@tanstack/react-router';
import { useGetMatch } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Users, Target, Shield, Activity } from 'lucide-react';
import DeleteMatchButton from '../../components/matches/DeleteMatchButton';
import { MatchMode } from '../../backend';

export default function MatchDetailsPage() {
  const navigate = useNavigate();
  const { matchId } = useParams({ from: '/history/$matchId' });
  const { data: match, isLoading } = useGetMatch(matchId);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Loading match details...</p>
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
        return 'APA 9-Ball Practice';
      case MatchMode.acceptingGifts:
        return 'Accepting Gifts';
      case MatchMode.straightShot:
        return 'Straight Shot Strokes Drill';
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

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button variant="ghost" onClick={() => navigate({ to: '/history' })} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to History
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle>{getModeLabel(match.mode)}</CardTitle>
              <CardDescription>{formatDate(match.dateTime)}</CardDescription>
            </div>
            <Badge className={getModeColor(match.mode)} variant="secondary">
              {getModeLabel(match.mode)}
            </Badge>
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
                <p key={idx} className="text-sm text-muted-foreground">
                  {player.name}
                  {player.skillLevel !== undefined && ` (SL ${player.skillLevel})`}
                </p>
              ))}
            </div>
          </div>

          {match.mode === MatchMode.apaPractice && match.apaMatchInfo && (
            <div>
              <h3 className="mb-3 font-semibold">APA 9-Ball Match Results</h3>
              <div className="space-y-4">
                {match.apaMatchInfo.players.filter(p => p !== null).map((player, idx) => (
                  player && (
                    <Card key={idx} className={player.isPlayerOfMatch ? 'ring-2 ring-emerald-500' : ''}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">
                          {match.players[idx]?.name || `Player ${idx + 1}`}
                          {player.isPlayerOfMatch && ' 🏆'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Skill Level</span>
                          <Badge variant="secondary">SL {Number(player.skillLevel)}</Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            <Target className="mr-1 inline h-4 w-4" />
                            Points Needed
                          </span>
                          <span className="font-semibold">{Number(player.pointsNeeded)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Points Earned</span>
                          <span className="text-xl font-bold text-emerald-600">{Number(player.totalScore)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            <Shield className="mr-1 inline h-4 w-4" />
                            Defensive Shots
                          </span>
                          <span className="font-semibold">{Number(player.defensiveShots)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            <Activity className="mr-1 inline h-4 w-4" />
                            Innings
                          </span>
                          <span className="font-semibold">{Number(player.innings)}</span>
                        </div>
                        <div className="flex justify-between rounded-lg border bg-muted/50 p-2">
                          <span className="text-sm font-medium">PPI</span>
                          <span className="font-bold">{player.ppi.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Team Match Points</span>
                          <span className="font-semibold">{Number(player.pointsWonConverted)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )
                ))}
              </div>
            </div>
          )}

          {match.mode === MatchMode.straightShot && match.totalScore !== undefined && (
            <div>
              <h3 className="mb-3 font-semibold">Strokes Drill Results</h3>
              <div className="space-y-3">
                <div className="flex justify-between rounded-lg border p-3">
                  <span className="text-muted-foreground">Total Strokes</span>
                  <span className="text-2xl font-bold">{Number(match.totalScore)}</span>
                </div>
                <div className="flex justify-between rounded-lg border p-3">
                  <span className="text-muted-foreground">Result</span>
                  <span className={`font-semibold ${Number(match.totalScore) <= 20 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {Number(match.totalScore) <= 20 ? 'Win (20 or under) ✓' : 'Over 20'}
                  </span>
                </div>
                {match.scratchStrokes && match.scratchStrokes.length > 0 && (
                  <div className="flex justify-between rounded-lg border p-3">
                    <span className="text-muted-foreground">Scratches</span>
                    <span className="font-semibold">
                      {match.scratchStrokes.length} ({match.scratchStrokes.length * 2} strokes)
                    </span>
                  </div>
                )}
                {match.ballsMade !== undefined && (
                  <div className="flex justify-between rounded-lg border p-3">
                    <span className="text-muted-foreground">Balls Made</span>
                    <span className="font-semibold">{Number(match.ballsMade)} / 15</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {match.mode === MatchMode.acceptingGifts && match.score !== undefined && (
            <div>
              <h3 className="mb-3 font-semibold">Drill Results</h3>
              <div className="space-y-3">
                <div className="flex justify-between rounded-lg border p-3">
                  <span className="text-muted-foreground">Score</span>
                  <span className="text-2xl font-bold">{Number(match.score)}</span>
                </div>
                {match.completionStatus !== undefined && (
                  <div className="flex justify-between rounded-lg border p-3">
                    <span className="text-muted-foreground">Status</span>
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
              <p className="text-sm text-muted-foreground">{match.notes}</p>
            </div>
          )}

          <div className="pt-4">
            <DeleteMatchButton matchId={match.matchId} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
