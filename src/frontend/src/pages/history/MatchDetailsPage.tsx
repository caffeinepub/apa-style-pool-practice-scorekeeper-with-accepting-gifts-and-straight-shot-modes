import { useNavigate, useParams } from '@tanstack/react-router';
import { useGetMatch } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Users, Target, Shield, Activity, TrendingUp } from 'lucide-react';
import DeleteMatchButton from '../../components/matches/DeleteMatchButton';
import { MatchMode } from '../../backend';
import { getPlayerStatsRoute } from '../../utils/playerRoutes';

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
    if (match.officialApaMatchLogData) {
      return 'Official APA Match Log';
    }
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
              <CardDescription>
                {match.officialApaMatchLogData?.date || formatDate(match.dateTime)}
              </CardDescription>
            </div>
            <Badge className={getModeColor(match.mode)} variant="secondary">
              {getModeLabel(match.mode)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {match.officialApaMatchLogData && (
            <div>
              <h3 className="mb-3 font-semibold">Official APA Match Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Match Date</span>
                  <span className="font-semibold">{match.officialApaMatchLogData.date || 'Not specified'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Opponent Name</span>
                  <span className="font-semibold">{match.officialApaMatchLogData.opponentName || 'Not specified'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Your Score</span>
                  <span className="font-semibold">{match.officialApaMatchLogData.myScore || '0'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Their Score</span>
                  <span className="font-semibold">{match.officialApaMatchLogData.theirScore || '0'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Points</span>
                  <span className="font-semibold">{match.officialApaMatchLogData.points || '0'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Innings</span>
                  <span className="font-semibold">{match.officialApaMatchLogData.innings || '0'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Defensive Shots</span>
                  <span className="font-semibold">{match.officialApaMatchLogData.defensiveShots || '0'}</span>
                </div>
                {match.officialApaMatchLogData.notes && (
                  <div className="pt-2">
                    <h4 className="mb-1 text-sm font-semibold">Notes</h4>
                    <p className="text-sm text-muted-foreground">{match.officialApaMatchLogData.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {!match.officialApaMatchLogData && (
            <div>
              <h3 className="mb-2 flex items-center gap-2 font-semibold">
                <Users className="h-4 w-4" />
                Players
              </h3>
              <div className="space-y-2">
                {match.players.map((player, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {player.name}
                      {player.skillLevel !== undefined && ` (SL ${player.skillLevel})`}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate({ to: getPlayerStatsRoute(player.name) })}
                      className="gap-1"
                    >
                      <TrendingUp className="h-3 w-3" />
                      View Stats
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                          <span className="text-lg font-bold text-emerald-600">
                            {Number(player.pointsEarnedRunningTotal)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            <Shield className="mr-1 inline h-4 w-4" />
                            Defensive Shots
                          </span>
                          <span>{Number(player.defensiveShots)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            <Activity className="mr-1 inline h-4 w-4" />
                            Innings
                          </span>
                          <span>{Number(player.innings)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">PPI</span>
                          <span className="font-semibold">{player.ppi.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Match Points Converted</span>
                          <Badge variant="outline">{Number(player.pointsWonConverted)}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )
                ))}
              </div>
            </div>
          )}

          {match.mode === MatchMode.acceptingGifts && (
            <div>
              <h3 className="mb-3 font-semibold">Accepting Gifts Session</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Starting Object Balls</span>
                  <span className="font-semibold">{match.startingObjectBallCount !== undefined ? Number(match.startingObjectBallCount) : 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ending Object Balls</span>
                  <span className="font-semibold">{match.endingObjectBallCount !== undefined ? Number(match.endingObjectBallCount) : 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sets Completed</span>
                  <span className="font-semibold">{match.setsCompleted !== undefined ? Number(match.setsCompleted) : 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Attempts</span>
                  <span className="font-semibold">{match.totalAttempts !== undefined ? Number(match.totalAttempts) : 'N/A'}</span>
                </div>
                {match.finalSetScorePlayer !== undefined && match.finalSetScoreGhost !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Final Set Score</span>
                    <span className="font-semibold">
                      Player {Number(match.finalSetScorePlayer)} - Ghost {Number(match.finalSetScoreGhost)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Completion Status</span>
                  <Badge variant={match.completionStatus ? 'default' : 'secondary'}>
                    {match.completionStatus ? 'Completed' : 'In Progress'}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {match.mode === MatchMode.straightShot && (
            <div>
              <h3 className="mb-3 font-semibold">Straight Shot Strokes Drill</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Shots</span>
                  <span className="font-semibold">{match.shots !== undefined ? Number(match.shots) : 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Balls Made</span>
                  <span className="font-semibold">{match.ballsMade !== undefined ? Number(match.ballsMade) : 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Score</span>
                  <span className="font-semibold">{match.totalScore !== undefined ? Number(match.totalScore) : 'N/A'}</span>
                </div>
                {match.completionTime !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Completion Time</span>
                    <span className="font-semibold">{Number(match.completionTime)}s</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {match.notes && !match.officialApaMatchLogData && (
            <div>
              <h3 className="mb-2 font-semibold">Notes</h3>
              <p className="text-sm text-muted-foreground">{match.notes}</p>
            </div>
          )}

          <div className="flex justify-between border-t pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {match.officialApaMatchLogData?.date || formatDate(match.dateTime)}
            </div>
            <DeleteMatchButton matchId={match.matchId} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
