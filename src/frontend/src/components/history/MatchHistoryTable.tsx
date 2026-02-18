import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import type { ApiMatch } from '../../backend';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2 } from 'lucide-react';
import { useDeleteMatches } from '../../hooks/useQueries';
import { toast } from 'sonner';
import { extractErrorText } from '../../utils/errorText';
import { getEffectiveMatchTimestamp, formatEffectiveMatchDate } from '../../lib/matches/effectiveMatchDate';
import { buildMatchResultsNarrative } from '../../lib/history/matchHistoryRowModel';
import { classifyMatchBucket, deriveMatchOutcome } from '../../lib/history/matchWinLoss';
import { calculatePPI } from '../../lib/apa/apaScoring';
import { computeOfficialApaAppiWithContext, formatOfficialAppi } from '../../lib/apa/officialApaPpi';

interface MatchHistoryTableProps {
  matches: ApiMatch[];
  allMatches: ApiMatch[];
}

interface RunningWinLoss {
  wins: number;
  losses: number;
  totalMatches: number;
  winPercentage: number;
}

// Compute running W-L and Win% for each row
function computeRunningWinLoss(sortedMatches: ApiMatch[]): RunningWinLoss[] {
  const bucketStats = {
    officialApa: { wins: 0, losses: 0 },
    apaPractice: { wins: 0, losses: 0 },
    acceptingGifts: { wins: 0, losses: 0 },
    straightShot: { wins: 0, losses: 0 },
  };

  const results: RunningWinLoss[] = [];

  for (const match of sortedMatches) {
    const bucket = classifyMatchBucket(match);
    const outcome = deriveMatchOutcome(match);

    if (bucket && outcome !== 'unknown') {
      if (outcome === 'win') {
        bucketStats[bucket].wins++;
      } else if (outcome === 'loss') {
        bucketStats[bucket].losses++;
      }
    }

    const totalWins = bucketStats.officialApa.wins + bucketStats.apaPractice.wins + bucketStats.acceptingGifts.wins + bucketStats.straightShot.wins;
    const totalLosses = bucketStats.officialApa.losses + bucketStats.apaPractice.losses + bucketStats.acceptingGifts.losses + bucketStats.straightShot.losses;
    const totalMatches = totalWins + totalLosses;
    const winPercentage = totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0;

    results.push({
      wins: totalWins,
      losses: totalLosses,
      totalMatches,
      winPercentage,
    });
  }

  return results;
}

export default function MatchHistoryTable({ matches, allMatches }: MatchHistoryTableProps) {
  const navigate = useNavigate();
  const deleteMatches = useDeleteMatches();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Sort by numeric timestamp using getEffectiveMatchTimestamp (descending, newest first)
  const sortedMatches = useMemo(() => {
    return [...matches].sort((a, b) => {
      const tsA = getEffectiveMatchTimestamp(a);
      const tsB = getEffectiveMatchTimestamp(b);
      return tsB - tsA;
    });
  }, [matches]);

  // Precompute running W-L and Win% for each row
  const rowsWithRunningStats = useMemo(() => {
    const runningStats = computeRunningWinLoss(sortedMatches);
    return sortedMatches.map((match, idx) => ({
      match,
      runningWL: runningStats[idx],
    }));
  }, [sortedMatches]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(sortedMatches.map((m) => m.matchId)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (matchId: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) {
      newSet.add(matchId);
    } else {
      newSet.delete(matchId);
    }
    setSelectedIds(newSet);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    const confirmed = window.confirm(`Delete ${selectedIds.size} selected match(es)?`);
    if (!confirmed) return;

    try {
      await deleteMatches.mutateAsync(Array.from(selectedIds));
      toast.success(`Deleted ${selectedIds.size} match(es)`);
      setSelectedIds(new Set());
    } catch (error) {
      const errorMessage = extractErrorText(error);
      toast.error(`Failed to delete matches: ${errorMessage}`);
    }
  };

  const allSelected = sortedMatches.length > 0 && selectedIds.size === sortedMatches.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < sortedMatches.length;

  // Helper to format full date+time for hover
  const formatFullDateTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Helper to compute PPI for APA Practice rows
  const computeApaPracticePPI = (match: ApiMatch): string => {
    if (!match.apaMatchInfo) return '—';
    
    const players = match.apaMatchInfo.players.filter((p) => p !== null);
    if (players.length === 0) return '—';

    const playerStats = players[0];
    if (!playerStats) return '—';

    const innings = Number(playerStats.innings);
    const totalScore = Number(playerStats.totalScore);

    if (innings === 0 || totalScore === 0) return '—';

    const ppi = calculatePPI(totalScore, innings);
    return ppi.toFixed(2);
  };

  return (
    <div className="space-y-4">
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between rounded-md border bg-muted/50 p-3">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={deleteMatches.isPending}>
            <Trash2 className="mr-2 h-4 w-4" />
            {deleteMatches.isPending ? 'Deleting...' : 'Delete Selected'}
          </Button>
        </div>
      )}

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox checked={allSelected || someSelected} onCheckedChange={handleSelectAll} aria-label="Select all" />
              </TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Match Results</TableHead>
              <TableHead className="text-right">PPI</TableHead>
              <TableHead className="text-right">aPPI</TableHead>
              <TableHead className="text-right">W-L</TableHead>
              <TableHead className="text-right">Win%</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rowsWithRunningStats.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No matches found
                </TableCell>
              </TableRow>
            ) : (
              rowsWithRunningStats.map(({ match, runningWL }) => {
                const isSelected = selectedIds.has(match.matchId);
                const narrative = buildMatchResultsNarrative(match);

                const timestamp = getEffectiveMatchTimestamp(match);
                const dateDisplay = formatEffectiveMatchDate(match);
                const fullDateTime = formatFullDateTime(timestamp);

                const bucket = classifyMatchBucket(match);

                // PPI/aPPI logic
                let ppiDisplay = '—';
                let appiDisplay = '—';

                if (bucket === 'officialApa') {
                  // Official APA: show PPI and aPPI
                  const data = match.officialApaMatchLogData;
                  if (data) {
                    const innings = data.innings.trim();
                    const myScore = data.myScore.trim();
                    const defensiveShots = data.defensiveShots.trim();

                    if (innings && myScore && defensiveShots && innings !== '0' && myScore !== '0') {
                      const inningsNum = parseInt(innings, 10);
                      const scoreNum = parseInt(myScore, 10);
                      const defShotsNum = parseInt(defensiveShots, 10);

                      if (!isNaN(inningsNum) && !isNaN(scoreNum) && !isNaN(defShotsNum)) {
                        const denominator = inningsNum - defShotsNum;
                        if (denominator > 0) {
                          const ppi = scoreNum / denominator;
                          ppiDisplay = ppi.toFixed(2);
                        }
                      }
                    }

                    // Compute aPPI using context-aware helper
                    const appiResult = computeOfficialApaAppiWithContext(match, allMatches);
                    appiDisplay = formatOfficialAppi(appiResult);
                  }
                } else if (bucket === 'apaPractice') {
                  // APA Practice: show PPI only
                  ppiDisplay = computeApaPracticePPI(match);
                }

                return (
                  <TableRow
                    key={match.matchId}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate({ to: `/history/${match.matchId}` })}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectRow(match.matchId, !!checked)}
                        aria-label={`Select match ${match.matchId}`}
                      />
                    </TableCell>
                    <TableCell title={fullDateTime}>{dateDisplay}</TableCell>
                    <TableCell>{narrative}</TableCell>
                    <TableCell className="text-right">{ppiDisplay}</TableCell>
                    <TableCell className="text-right">{appiDisplay}</TableCell>
                    <TableCell className="text-right">
                      {runningWL.wins}-{runningWL.losses}
                    </TableCell>
                    <TableCell className="text-right">{runningWL.winPercentage.toFixed(0)}%</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
