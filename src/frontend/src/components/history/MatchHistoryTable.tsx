import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import type { ApiMatch } from '../../backend';
import { MatchMode } from '../../backend';
import { buildMatchResultsText } from '../../lib/history/matchHistoryRowModel';
import { formatEffectiveMatchDate } from '../../lib/matches/effectiveMatchDate';
import { computeOfficialApaPpi, formatOfficialPpi, computeOfficialApaAppiWithContext, formatOfficialAppi } from '../../lib/apa/officialApaPpi';
import { extractOfficialApaWinRate } from '../../lib/apa/apaAggregateStats';
import { getOfficialApaOutcome } from '../../lib/apa/officialApaOutcome';

interface MatchHistoryTableProps {
  matches: ApiMatch[];
}

export default function MatchHistoryTable({ matches }: MatchHistoryTableProps) {
  const navigate = useNavigate();

  const handleViewMatch = (matchId: string) => {
    navigate({ to: `/history/${matchId}` });
  };

  // Compute win rate for the table (last 20 Official APA matches)
  const { wins, total, winRate } = extractOfficialApaWinRate(matches);

  const renderDerivedColumns = (match: ApiMatch) => {
    // Official APA Match Log
    if (match.officialApaMatchLogData) {
      const data = match.officialApaMatchLogData;
      const ppiResult = computeOfficialApaPpi(data.myScore, data.innings, data.defensiveShots);
      const appiResult = computeOfficialApaAppiWithContext(match, matches);

      // Determine outcome for win-only aPPI fallback
      const outcome = getOfficialApaOutcome(
        data.didWin,
        data.playerOneSkillLevel,
        data.playerTwoSkillLevel,
        data.myScore,
        data.theirScore
      );

      // For wins without valid PPI, still show aPPI if available
      const shouldShowAppi = appiResult.isValid && appiResult.appi !== null && outcome === 'win';

      return (
        <>
          <TableCell className="text-center">{formatOfficialPpi(ppiResult)}</TableCell>
          <TableCell className="text-center">
            {shouldShowAppi ? formatOfficialAppi(appiResult) : formatOfficialAppi(appiResult)}
          </TableCell>
          <TableCell className="text-center">—</TableCell>
          <TableCell className="text-center">—</TableCell>
          <TableCell className="text-center">{total > 0 ? `${wins} / ${total}` : '—'}</TableCell>
          <TableCell className="text-center">{winRate !== null ? `${winRate.toFixed(1)}%` : '—'}</TableCell>
        </>
      );
    }

    // APA Practice
    if (match.mode === MatchMode.apaPractice && match.apaMatchInfo) {
      const player1 = match.apaMatchInfo.players[0];
      if (player1) {
        const ppi = player1.ppi.toFixed(2);
        // For APA Practice, aPPI is computed the same way as PPI
        const innings = Number(player1.innings);
        const defensiveShots = Number(player1.defensiveShots);
        const adjustedInnings = Math.max(1, innings - defensiveShots);
        const appi = (Number(player1.totalScore) / adjustedInnings).toFixed(2);

        return (
          <>
            <TableCell className="text-center">{ppi}</TableCell>
            <TableCell className="text-center">{appi}</TableCell>
            <TableCell className="text-center">—</TableCell>
            <TableCell className="text-center">—</TableCell>
            <TableCell className="text-center">—</TableCell>
            <TableCell className="text-center">—</TableCell>
          </>
        );
      }
    }

    // Non-APA modes (Accepting Gifts, Straight Shot)
    return (
      <>
        <TableCell className="text-center">—</TableCell>
        <TableCell className="text-center">—</TableCell>
        <TableCell className="text-center">—</TableCell>
        <TableCell className="text-center">—</TableCell>
        <TableCell className="text-center">—</TableCell>
        <TableCell className="text-center">—</TableCell>
      </>
    );
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Date</TableHead>
            <TableHead>Match Results</TableHead>
            <TableHead className="text-center">PPI</TableHead>
            <TableHead className="text-center">Adjusted PPI</TableHead>
            <TableHead className="text-center">Rolling 10/20</TableHead>
            <TableHead className="text-center">APA 10/20</TableHead>
            <TableHead className="text-center">W/L</TableHead>
            <TableHead className="text-center">Win %</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {matches.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center">
                No matches found
              </TableCell>
            </TableRow>
          ) : (
            matches.map((match) => (
              <TableRow key={match.matchId}>
                <TableCell className="font-medium">{formatEffectiveMatchDate(match)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {match.mode === MatchMode.acceptingGifts && (
                      <Badge variant="outline" className="shrink-0">
                        AG
                      </Badge>
                    )}
                    {match.mode === MatchMode.straightShot && (
                      <Badge variant="outline" className="shrink-0">
                        SS
                      </Badge>
                    )}
                    {match.officialApaMatchLogData && (
                      <Badge variant="outline" className="shrink-0">
                        Official APA
                      </Badge>
                    )}
                    <span className="text-sm">{buildMatchResultsText(match)}</span>
                  </div>
                </TableCell>
                {renderDerivedColumns(match)}
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => handleViewMatch(match.matchId)}>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
