import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import type { ApiMatch } from '../../backend';
import { buildMatchResultsNarrative } from '../../lib/history/matchHistoryRowModel';
import { getEffectiveMatchTimestamp } from '../../lib/matches/effectiveMatchDate';
import { computeOfficialApaAppiWithContext } from '../../lib/apa/officialApaPpi';
import { useDeleteMatches } from '../../hooks/useQueries';
import { toast } from 'sonner';
import { extractErrorText } from '../../utils/errorText';
import ModePill from '../ModePill';

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
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No matches found
                </TableCell>
              </TableRow>
            ) : (
              matches.map((match) => {
                const effectiveTimestamp = getEffectiveMatchTimestamp(match);
                const dateStr = new Date(Number(effectiveTimestamp)).toLocaleDateString();
                const narrative = buildMatchResultsNarrative(match);

                let ppiCell = '—';
                let appiCell = '—';

                if (match.officialApaMatchLogData) {
                  const data = match.officialApaMatchLogData;
                  const myScore = parseInt(data.myScore) || 0;
                  const innings = parseInt(data.innings) || 0;

                  ppiCell = innings > 0 ? (myScore / innings).toFixed(2) : '—';

                  const appiResult = computeOfficialApaAppiWithContext(match, matches);
                  if (appiResult.appi !== null && appiResult.appi !== undefined && isFinite(appiResult.appi)) {
                    appiCell = appiResult.appi.toFixed(2);
                  } else if (data.didWin !== undefined && data.didWin !== null) {
                    appiCell = '—';
                  }
                } else if (match.apaMatchInfo) {
                  const players = match.apaMatchInfo.players;
                  if (players.length >= 2 && players[0] && players[1]) {
                    const p1Stats = players[0];
                    ppiCell = p1Stats.ppi.toFixed(2);
                  }
                  // Practice APA entries do not display aPPI — appiCell remains '—'
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
                      <span className="flex items-center gap-2 flex-wrap">
                        <ModePill label={narrative.modeName} />
                        {narrative.details && (
                          <span className="text-sm">{narrative.details}</span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">{ppiCell}</TableCell>
                    <TableCell className="text-center">{appiCell}</TableCell>
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
