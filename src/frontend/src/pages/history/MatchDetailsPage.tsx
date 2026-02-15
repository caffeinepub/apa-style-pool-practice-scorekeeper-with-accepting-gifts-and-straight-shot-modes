import { useNavigate, useParams } from '@tanstack/react-router';
import { useGetMatch } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, User, Trophy, Target, Activity, Edit } from 'lucide-react';
import { MatchMode } from '../../backend';
import DeleteMatchButton from '../../components/matches/DeleteMatchButton';
import { getPointsToWin } from '../../lib/apa/apaEqualizer';
import { getOfficialApaOutcome } from '../../lib/apa/officialApaOutcome';
import { computeOfficialApaPpi, formatOfficialPpi, computeOfficialApaAppi, formatOfficialAppi } from '../../lib/apa/officialApaPpi';
import { setNavigationOrigin } from '../../utils/urlParams';

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
      const appiResult = computeOfficialApaAppi(data.myScore, data.innings, data.defensiveShots);

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
                {outcome === 'loss' && (
                  <Badge className="mt-2 w-full justify-center" variant="destructive">Loser</Badge>
                )}
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
                {outcome === 'loss' && (
                  <Badge className="mt-2 w-full justify-center bg-emerald-600">Winner</Badge>
                )}
                {outcome === 'win' && (
                  <Badge className="mt-2 w-full justify-center" variant="destructive">Loser</Badge>
                )}
              </CardContent>
            </Card>
          </div>

          {data.notes && data.notes.trim() !== '' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
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

  const getMatchTitle = () => {
    if (match.officialApaMatchLogData) {
      return 'Official APA Match Log';
    }
    if (match.mode === MatchMode.apaPractice) {
      return 'APA 9-Ball Practice';
    }
    if (match.mode === MatchMode.acceptingGifts) {
      return 'Accepting Gifts';
    }
    if (match.mode === MatchMode.straightShot) {
      return 'Straight Shot';
    }
    return 'Match Details';
  };

  const canEdit = match.officialApaMatchLogData !== undefined;

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate({ to: '/history' })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to History
        </Button>
        <div className="flex gap-2">
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: `/real-apa-match/${matchId}/edit` })}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
          <DeleteMatchButton matchId={match.matchId} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{getMatchTitle()}</CardTitle>
            <Badge variant="outline">{match.officialApaMatchLogData ? 'Official APA Match Log' : getMatchTitle()}</Badge>
          </div>
          <CardDescription className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {match.officialApaMatchLogData?.date || formatDate(match.dateTime)}
          </CardDescription>
        </CardHeader>
      </Card>

      {renderModeSpecificDetails()}

      {match.mode === MatchMode.apaPractice && match.players.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Players</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {match.players.map((player, index) => (
                <button
                  key={index}
                  onClick={() => handleNavigateToPlayerAggregate(player.name)}
                  className="flex w-full items-center gap-2 rounded-lg border p-3 text-left transition-colors hover:bg-accent"
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{player.name}</span>
                  {player.skillLevel !== undefined && (
                    <Badge variant="secondary">Level {player.skillLevel.toString()}</Badge>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
