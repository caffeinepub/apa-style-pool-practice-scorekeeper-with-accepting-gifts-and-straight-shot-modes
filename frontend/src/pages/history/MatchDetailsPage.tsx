import { useNavigate, useParams } from '@tanstack/react-router';
import { useGetMatch, useGetAllMatches } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, User, Activity, Edit } from 'lucide-react';
import { MatchMode } from '../../backend';
import DeleteMatchButton from '../../components/matches/DeleteMatchButton';
import { getPointsToWin } from '../../lib/apa/apaEqualizer';
import { getOfficialApaOutcome } from '../../lib/apa/officialApaOutcome';
import { computeOfficialApaPpi, formatOfficialPpi, computeOfficialApaAppiWithContext, formatOfficialAppi } from '../../lib/apa/officialApaPpi';
import { setNavigationOrigin } from '../../utils/urlParams';

export default function MatchDetailsPage() {
  const navigate = useNavigate();
  const { matchId } = useParams({ from: '/history/$matchId' });
  const { data: match, isLoading } = useGetMatch(matchId);
  const { data: allMatches } = useGetAllMatches();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Loading match details...</p>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Match not found</p>
        <Button onClick={() => navigate({ to: '/history' })}>Back to History</Button>
      </div>
    );
  }

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleNavigateToPlayerAggregate = (playerName: string) => {
    setNavigationOrigin('history');
    navigate({ to: `/players/${encodeURIComponent(playerName)}/aggregate` });
  };

  const renderModeSpecificDetails = () => {
    if (match.mode === MatchMode.apaPractice && match.apaMatchInfo) {
      const player1 = match.apaMatchInfo.players[0];
      const player2 = match.apaMatchInfo.players[1];

      if (!player1 || !player2) return null;

      return (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{match.players[0]?.name || 'Player 1'}</CardTitle>
                <CardDescription>Skill Level {player1.skillLevel.toString()}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Points Earned:</span>
                  <span className="font-semibold">{player1.pointsEarnedRunningTotal.toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Innings:</span>
                  <span className="font-semibold">{player1.innings.toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Defensive Shots:</span>
                  <span className="font-semibold">{player1.defensiveShots.toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PPI:</span>
                  <span className="font-semibold">{player1.ppi.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Match Points:</span>
                  <span className="font-semibold">{player1.pointsWonConverted.toString()}</span>
                </div>
                {player1.isPlayerOfMatch && (
                  <Badge className="mt-2 w-full justify-center bg-emerald-600">Winner</Badge>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{match.players[1]?.name || 'Player 2'}</CardTitle>
                <CardDescription>Skill Level {player2.skillLevel.toString()}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Points Earned:</span>
                  <span className="font-semibold">{player2.pointsEarnedRunningTotal.toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Innings:</span>
                  <span className="font-semibold">{player2.innings.toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Defensive Shots:</span>
                  <span className="font-semibold">{player2.defensiveShots.toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PPI:</span>
                  <span className="font-semibold">{player2.ppi.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Match Points:</span>
                  <span className="font-semibold">{player2.pointsWonConverted.toString()}</span>
                </div>
                {player2.isPlayerOfMatch && (
                  <Badge className="mt-2 w-full justify-center bg-emerald-600">Winner</Badge>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    if (match.mode === MatchMode.acceptingGifts) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Session Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Starting Ball Count:</span>
              <span className="font-semibold">{match.startingObjectBallCount?.toString() || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ending Ball Count:</span>
              <span className="font-semibold">{match.endingObjectBallCount?.toString() || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Attempts:</span>
              <span className="font-semibold">{match.totalAttempts?.toString() || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sets Completed:</span>
              <span className="font-semibold">{match.setsCompleted?.toString() || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Final Set Score:</span>
              <span className="font-semibold">
                {match.finalSetScorePlayer?.toString() || '0'} - {match.finalSetScoreGhost?.toString() || '0'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant={match.completionStatus ? 'default' : 'secondary'}>
                {match.completionStatus ? 'Completed' : 'In Progress'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (match.mode === MatchMode.straightShot) {
      // Prefer strokes[0], fallback to totalScore for backward compatibility
      const totalShots = match.strokes?.[0] !== undefined ? Number(match.strokes[0]) : Number(match.totalScore ?? 0);
      const isWin = totalShots > 0 && totalShots <= 20;
      const isLoss = totalShots > 20;

      return (
        <Card>
          <CardHeader>
            <CardTitle>Session Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Shots:</span>
              <span className="font-semibold text-lg">{totalShots > 0 ? totalShots : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Result:</span>
              {isWin && <Badge variant="default">Win</Badge>}
              {isLoss && <Badge variant="destructive">Loss</Badge>}
              {!isWin && !isLoss && <span className="font-semibold">—</span>}
            </div>
          </CardContent>
        </Card>
      );
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

      const ppiResult = computeOfficialApaPpi(data.myScore, data.innings, data.defensiveShots);
      const appiResult = allMatches
        ? computeOfficialApaAppiWithContext(match, allMatches)
        : { appi: ppiResult.ppi, isValid: ppiResult.isValid };

      return (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">You</CardTitle>
                {data.playerOneSkillLevel !== undefined && (
                  <CardDescription>
                    Skill Level {data.playerOneSkillLevel.toString()}
                    {yourPointsToWin !== null && ` (${yourPointsToWin} to win)`}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Score:</span>
                  <span className="font-semibold">
                    {data.myScore || '—'}
                    {yourPointsToWin !== null && ` / ${yourPointsToWin}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Innings:</span>
                  <span className="font-semibold">{data.innings || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Defensive Shots:</span>
                  <span className="font-semibold">{data.defensiveShots || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PPI:</span>
                  <span className="font-semibold">{formatOfficialPpi(ppiResult)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">aPPI:</span>
                  <span className="font-semibold">{formatOfficialAppi(appiResult)}</span>
                </div>
                {outcome === 'win' && (
                  <Badge className="mt-2 w-full justify-center bg-emerald-600">Winner</Badge>
                )}
                {outcome === 'loss' && <Badge className="mt-2 w-full justify-center" variant="destructive">Loser</Badge>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{data.opponentName || 'Opponent'}</CardTitle>
                {data.playerTwoSkillLevel !== undefined && (
                  <CardDescription>
                    Skill Level {data.playerTwoSkillLevel.toString()}
                    {theirPointsToWin !== null && ` (${theirPointsToWin} to win)`}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Score:</span>
                  <span className="font-semibold">
                    {data.theirScore || '—'}
                    {theirPointsToWin !== null && ` / ${theirPointsToWin}`}
                  </span>
                </div>
                {outcome === 'win' && <Badge className="mt-2 w-full justify-center" variant="destructive">Loser</Badge>}
                {outcome === 'loss' && (
                  <Badge className="mt-2 w-full justify-center bg-emerald-600">Winner</Badge>
                )}
              </CardContent>
            </Card>
          </div>

          {data.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{data.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      );
    }

    return null;
  };

  // FIX (REQ-3): Determine mode label — check officialApaMatchLogData first to prevent
  // "APA PracticeOfficial APA" concatenation (backend sets mode=#apaPractice for official logs)
  const getModeLabel = () => {
    if (match.officialApaMatchLogData) return 'Official APA';
    if (match.mode === MatchMode.apaPractice) return 'APA Practice';
    if (match.mode === MatchMode.acceptingGifts) return 'Accepting Gifts';
    if (match.mode === MatchMode.straightShot) return 'Straight Shot';
    return '';
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate({ to: '/history' })} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to History
        </Button>
        <div className="flex gap-2">
          {match.officialApaMatchLogData && (
            <Button
              variant="outline"
              size="sm"
              // FIX (REQ-4): Corrected route path to match App.tsx route definition '/real-apa-match/$matchId/edit'
              onClick={() => navigate({ to: `/real-apa-match/${matchId}/edit` })}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          )}
          <DeleteMatchButton matchId={matchId} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Match Details</CardTitle>
              <CardDescription className="mt-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(match.dateTime)}
              </CardDescription>
            </div>
            {/* FIX (REQ-3): Use getModeLabel() to show exactly one label */}
            <Badge variant="outline" className="text-base">
              {getModeLabel()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {match.mode === MatchMode.apaPractice && match.players.length > 0 && !match.officialApaMatchLogData && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Players:</span>
              </div>
              <div className="ml-6 space-y-1">
                {match.players.map((player, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleNavigateToPlayerAggregate(player.name)}
                    className="block text-sm text-primary hover:underline"
                  >
                    {player.name}
                    {player.skillLevel !== undefined && ` (SL ${player.skillLevel.toString()})`}
                  </button>
                ))}
              </div>
            </div>
          )}
          {match.notes && match.mode !== MatchMode.straightShot && !match.officialApaMatchLogData && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Notes:</span>
              </div>
              <p className="ml-6 text-sm text-muted-foreground whitespace-pre-wrap">{match.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {renderModeSpecificDetails()}
    </div>
  );
}
