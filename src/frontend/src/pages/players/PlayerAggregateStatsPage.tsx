import { useNavigate, useParams } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { useGetAllMatches } from '../../hooks/useQueries';
import { extractPlayerApaMatches, computeBest10Of20Average } from '../../lib/apa/apaAggregateStats';
import { getNavigationOrigin, clearNavigationOrigin } from '../../utils/urlParams';
import { getApaPpiSkillLevelDetailed, getApaAppiSkillLevelDetailed } from '../../lib/apa/apaSkillLevelPrediction';
import MatchupAnalysisDropdown from '../../components/apa/MatchupAnalysisDropdownPlayerStats';

export default function PlayerAggregateStatsPage() {
  const navigate = useNavigate();
  const { playerName } = useParams({ from: '/players/$playerName' });
  const { data: allMatches, isLoading } = useGetAllMatches();

  const decodedPlayerName = decodeURIComponent(playerName);

  const navOrigin = getNavigationOrigin();
  const backLabel = navOrigin === 'stats' ? 'Back to Stats' : 'Back to History';
  const backPath = navOrigin === 'stats' ? '/stats' : '/history';

  const handleBack = () => {
    clearNavigationOrigin();
    navigate({ to: backPath });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Loading player stats...</p>
      </div>
    );
  }

  if (!allMatches) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">No match data available</p>
        <Button onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {backLabel}
        </Button>
      </div>
    );
  }

  // Extract only official APA matches for all calculations on this page
  const officialPlayerDataPoints = extractPlayerApaMatches(allMatches, decodedPlayerName, true);

  if (officialPlayerDataPoints.length === 0) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Button>
          <h1 className="text-2xl font-bold">{decodedPlayerName}</h1>
          <div className="w-24" />
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium mb-2">No Official APA Match Data</p>
            <p className="text-muted-foreground">
              No official APA matches found for {decodedPlayerName}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalMatches = officialPlayerDataPoints.length;
  const wins = officialPlayerDataPoints.filter(dp => dp.didWin === true).length;
  const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : null;

  // Both PPI and aPPI use best 10 of last 20 from official matches only
  const best10Of20Ppi = computeBest10Of20Average(officialPlayerDataPoints.map(dp => dp.ppi));
  const best10Of20Appi = computeBest10Of20Average(officialPlayerDataPoints.map(dp => dp.appi));

  const predictedSkillLevelPpi = best10Of20Ppi !== null ? getApaPpiSkillLevelDetailed(best10Of20Ppi) : null;
  const predictedSkillLevelAppi = best10Of20Appi !== null ? getApaAppiSkillLevelDetailed(best10Of20Appi) : null;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Button>
        <h1 className="text-2xl font-bold">{decodedPlayerName}</h1>
        <div className="w-24" />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalMatches}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Official APA matches
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Win Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            {winRate !== null ? (
              <>
                <div className="text-3xl font-bold">{winRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {wins} wins of {totalMatches}
                </p>
              </>
            ) : (
              <>
                <div className="text-3xl font-bold text-muted-foreground">—</div>
                <p className="text-xs text-muted-foreground mt-1">
                  No data
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average PPI
            </CardTitle>
          </CardHeader>
          <CardContent>
            {best10Of20Ppi !== null ? (
              <>
                <div className="text-3xl font-bold">{best10Of20Ppi.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Best 10 of last 20
                </p>
              </>
            ) : (
              <>
                <div className="text-3xl font-bold text-muted-foreground">—</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Not enough data
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average aPPI
            </CardTitle>
          </CardHeader>
          <CardContent>
            {best10Of20Appi !== null ? (
              <>
                <div className="text-3xl font-bold">{best10Of20Appi.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Best 10 of last 20
                </p>
              </>
            ) : (
              <>
                <div className="text-3xl font-bold text-muted-foreground">—</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Not enough data
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Predicted Skill Level (PPI)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {predictedSkillLevelPpi !== null ? (
              <>
                <div className="text-3xl font-bold">SL {predictedSkillLevelPpi}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on best 10 of 20 PPI
                </p>
              </>
            ) : (
              <>
                <div className="text-3xl font-bold text-muted-foreground">—</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Not enough data
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Predicted Skill Level (aPPI)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {predictedSkillLevelAppi !== null ? (
              <>
                <div className="text-3xl font-bold">SL {predictedSkillLevelAppi}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on best 10 of 20 aPPI
                </p>
              </>
            ) : (
              <>
                <div className="text-3xl font-bold text-muted-foreground">—</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Not enough data
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Matchup Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <MatchupAnalysisDropdown
            matches={allMatches}
            playerName={decodedPlayerName}
            onSelectOpponent={() => {}}
          />
        </CardContent>
      </Card>
    </div>
  );
}
