import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import type { ApiMatch } from '../../backend';
import { MatchMode } from '../../backend';
import { buildMatchResultsNarrative } from '../../lib/history/matchHistoryRowModel';
import { getEffectiveMatchTimestamp } from '../../lib/matches/effectiveMatchDate';
import { computeOfficialApaAppiWithContext } from '../../lib/apa/officialApaPpi';
import { useDeleteMatches } from '../../hooks/useQueries';
import { toast } from 'sonner';
import { extractErrorText } from '../../utils/errorText';
import React from 'react';

interface MatchHistoryTableProps {
  matches: ApiMatch[];
}

export default function MatchHistoryTable({ matches }: MatchHistoryTableProps) {
  const navigate = useNavigate();
  const deleteMatches = useDeleteMatches();
  const [selectedMatchIds, setSelectedMatchIds] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMatchIds(new Set(matches.map(m => m.matchId)));
    } else {
      setSelectedMatchIds(new Set());
    }
  };

  const handleSelectMatch = (matchId: string, checked: boolean) => {
    const newSelection = new Set(selectedMatchIds);
    if (checked) {
      newSelection.add(matchId);
    } else {
      newSelection.delete(matchId);
    }
    setSelectedMatchIds(newSelection);
  };

  const handleDeleteSelected = async () => {
    try {
      await deleteMatches.mutateAsync(Array.from(selectedMatchIds));
      toast.success(`Deleted ${selectedMatchIds.size} match${selectedMatchIds.size > 1 ? 'es' : ''}`);
      setSelectedMatchIds(new Set());
      setShowDeleteDialog(false);
    } catch (error) {
      const errorMessage = extractErrorText(error);
      toast.error(`Failed to delete matches: ${errorMessage}`);
    }
  };

  const allSelected = matches.length > 0 && selectedMatchIds.size === matches.length;
  const someSelected = selectedMatchIds.size > 0 && selectedMatchIds.size < matches.length;

  return (
    <div className="space-y-4">
      {selectedMatchIds.size > 0 && (
        <div className="flex items-center justify-between rounded-lg border bg-muted p-3">
          <span className="text-sm font-medium">
            {selectedMatchIds.size} match{selectedMatchIds.size > 1 ? 'es' : ''} selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            disabled={deleteMatches.isPending}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Selected
          </Button>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all matches"
                  className={someSelected ? 'data-[state=checked]:bg-primary/50' : ''}
                />
              </TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Match Results</TableHead>
              <TableHead className="text-center">PPI</TableHead>
              <TableHead className="text-center">aPPI</TableHead>
              <TableHead className="text-center">APA 10/20</TableHead>
              <TableHead className="text-center">W-L</TableHead>
              <TableHead className="text-center">Win %</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  No matches found
                </TableCell>
              </TableRow>
            ) : (
              matches.map((match) => {
                const effectiveTimestamp = getEffectiveMatchTimestamp(match);
                const dateStr = new Date(Number(effectiveTimestamp)).toLocaleDateString();
                const narrative = buildMatchResultsNarrative(match);

                let modeBadge: React.ReactElement | null = null;
                if (match.mode === MatchMode.acceptingGifts) {
                  modeBadge = <Badge variant="outline" className="ml-2">AG</Badge>;
                } else if (match.mode === MatchMode.straightShot) {
                  modeBadge = <Badge variant="outline" className="ml-2">SS</Badge>;
                }

                let ppiCell = '—';
                let appiCell = '—';
                let apaWLCell = '—';
                let winPercentCell = '—';

                if (match.officialApaMatchLogData) {
                  const data = match.officialApaMatchLogData;
                  const myScore = parseInt(data.myScore) || 0;
                  const theirScore = parseInt(data.theirScore) || 0;
                  const innings = parseInt(data.innings) || 1;
                  const defensiveShots = parseInt(data.defensiveShots) || 0;

                  const ppi = innings > 0 ? (myScore / innings).toFixed(2) : '—';
                  ppiCell = ppi;

                  const appiResult = computeOfficialApaAppiWithContext(match, matches);
                  if (appiResult.appi !== null && appiResult.appi !== undefined && isFinite(appiResult.appi)) {
                    appiCell = appiResult.appi.toFixed(2);
                  } else if (data.didWin !== undefined && data.didWin !== null) {
                    appiCell = '—';
                  }

                  if (data.didWin === true) {
                    apaWLCell = 'W';
                  } else if (data.didWin === false) {
                    apaWLCell = 'L';
                  }

                  const last20Matches = matches
                    .filter(m => m.officialApaMatchLogData)
                    .sort((a, b) => Number(getEffectiveMatchTimestamp(b)) - Number(getEffectiveMatchTimestamp(a)))
                    .slice(0, 20);

                  const wins = last20Matches.filter(m => m.officialApaMatchLogData?.didWin === true).length;
                  const total = last20Matches.length;
                  if (total > 0) {
                    const winRate = (wins / total) * 100;
                    winPercentCell = `${winRate.toFixed(0)}%`;
                  }
                } else if (match.apaMatchInfo) {
                  const players = match.apaMatchInfo.players;
                  if (players.length >= 2 && players[0] && players[1]) {
                    const p1Stats = players[0];
                    const p2Stats = players[1];
                    ppiCell = p1Stats.ppi.toFixed(2);

                    const innings = Number(p1Stats.innings);
                    const defensiveShots = Number(p1Stats.defensiveShots);
                    const yourPoints = Number(p1Stats.totalScore);

                    if (innings > 0 && defensiveShots >= 0 && yourPoints >= 0) {
                      const adjustedInnings = Math.max(1, innings - defensiveShots);
                      const computedAppi = yourPoints / adjustedInnings;
                      if (isFinite(computedAppi)) {
                        appiCell = computedAppi.toFixed(2);
                      }
                    }
                  }
                }

                const isSelected = selectedMatchIds.has(match.matchId);

                return (
                  <TableRow key={match.matchId}>
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectMatch(match.matchId, checked as boolean)}
                        aria-label={`Select match ${match.matchId}`}
                      />
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{dateStr}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {narrative}
                        {modeBadge}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{ppiCell}</TableCell>
                    <TableCell className="text-center">{appiCell}</TableCell>
                    <TableCell className="text-center">—</TableCell>
                    <TableCell className="text-center">{apaWLCell}</TableCell>
                    <TableCell className="text-center">{winPercentCell}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate({ to: `/history/${match.matchId}` })}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Matches?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedMatchIds.size} match{selectedMatchIds.size > 1 ? 'es' : ''}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSelected}
              disabled={deleteMatches.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMatches.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
