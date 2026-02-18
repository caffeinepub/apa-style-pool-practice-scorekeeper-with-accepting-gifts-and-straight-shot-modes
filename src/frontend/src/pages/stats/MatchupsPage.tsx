import { useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { useGetAllMatches } from '../../hooks/useQueries';
import type { ApiMatch } from '../../backend';
import { normalizePlayerName } from '../../utils/playerName';
import { getEffectiveMatchTimestamp, formatEffectiveMatchDate } from '../../lib/matches/effectiveMatchDate';

type MatchupMode = 'all' | 'acceptingGifts' | 'straightShot' | 'apaPractice' | 'officialApa';

export default function MatchupsPage() {
  const navigate = useNavigate();
  const { data: matches = [], isLoading } = useGetAllMatches();
  const [selectedOpponent, setSelectedOpponent] = useState<string>('');
  const [modeFilter, setModeFilter] = useState<MatchupMode>('all');

  // BUILD 4 & 7: Extract distinct opponent names from all match types
  const opponentList = useMemo(() => {
    const opponentSet = new Set<string>();

    for (const match of matches) {
      // Official APA: opponentName field
      if (match.officialApaMatchLogData?.opponentName) {
        const name = match.officialApaMatchLogData.opponentName.trim();
        if (name) {
          opponentSet.add(normalizePlayerName(name));
        }
      }

      // APA Practice: extract non-self player name
      if (match.apaMatchInfo && match.players.length === 2) {
        const player1Name = match.players[0]?.name || '';
        const player2Name = match.players[1]?.name || '';

        // Assume the first player is the logged-in user; opponent is the second
        if (player2Name.trim()) {
          opponentSet.add(normalizePlayerName(player2Name));
        }
      }

      // Accepting Gifts and Straight Shot: solo drills, no opponent
      // (skip these for opponent list)
    }

    return Array.from(opponentSet).sort();
  }, [matches]);

  // Filter matches by selected opponent and mode
  const filteredMatches = useMemo(() => {
    if (!selectedOpponent) return [];

    const normalizedOpponent = normalizePlayerName(selectedOpponent);

    return matches.filter((match) => {
      // Mode filter
      if (modeFilter !== 'all') {
        if (modeFilter === 'officialApa' && !match.officialApaMatchLogData) return false;
        if (modeFilter === 'apaPractice' && !match.apaMatchInfo) return false;
        if (modeFilter === 'acceptingGifts' && match.mode !== 'acceptingGifts') return false;
        if (modeFilter === 'straightShot' && match.mode !== 'straightShot') return false;
      }

      // Opponent filter
      if (match.officialApaMatchLogData?.opponentName) {
        const name = normalizePlayerName(match.officialApaMatchLogData.opponentName);
        if (name === normalizedOpponent) return true;
      }

      if (match.apaMatchInfo && match.players.length === 2) {
        const player2Name = normalizePlayerName(match.players[1]?.name || '');
        if (player2Name === normalizedOpponent) return true;
      }

      return false;
    });
  }, [matches, selectedOpponent, modeFilter]);

  // Compute matchup stats
  const matchupStats = useMemo(() => {
    let wins = 0;
    let losses = 0;
    let totalMatches = filteredMatches.length;

    for (const match of filteredMatches) {
      // Official APA: use didWin field
      if (match.officialApaMatchLogData) {
        if (match.officialApaMatchLogData.didWin === true) wins++;
        else if (match.officialApaMatchLogData.didWin === false) losses++;
      }

      // APA Practice: use isPlayerOfMatch
      if (match.apaMatchInfo) {
        const players = match.apaMatchInfo.players.filter((p) => p !== null);
        if (players.length === 2) {
          const player1 = players[0];
          if (player1?.isPlayerOfMatch) wins++;
          else losses++;
        }
      }
    }

    const winPercentage = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;

    return { wins, losses, totalMatches, winPercentage };
  }, [filteredMatches]);

  // Sort filtered matches by timestamp (newest first)
  const sortedMatches = useMemo(() => {
    return [...filteredMatches].sort((a, b) => {
      const tsA = getEffectiveMatchTimestamp(a);
      const tsB = getEffectiveMatchTimestamp(b);
      return tsB - tsA;
    });
  }, [filteredMatches]);

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Loading match history...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate({ to: '/stats' })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Stats
        </Button>
        <h1 className="text-2xl font-bold">Matchups</h1>
        <div className="w-24" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Opponent</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Opponent</label>
              <Select value={selectedOpponent} onValueChange={setSelectedOpponent}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an opponent" />
                </SelectTrigger>
                <SelectContent>
                  {opponentList.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No opponents found
                    </SelectItem>
                  ) : (
                    opponentList.map((opponent) => (
                      <SelectItem key={opponent} value={opponent}>
                        {opponent}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Mode Filter</label>
              <Select value={modeFilter} onValueChange={(v) => setModeFilter(v as MatchupMode)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="officialApa">Official APA</SelectItem>
                  <SelectItem value="apaPractice">APA Practice</SelectItem>
                  <SelectItem value="acceptingGifts">Accepting Gifts</SelectItem>
                  <SelectItem value="straightShot">Straight Shot</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedOpponent && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Matchup Summary vs {selectedOpponent}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <div className="text-sm text-muted-foreground">Total Matches</div>
                  <div className="text-2xl font-bold">{matchupStats.totalMatches}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Wins</div>
                  <div className="text-2xl font-bold text-green-600">{matchupStats.wins}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Losses</div>
                  <div className="text-2xl font-bold text-red-600">{matchupStats.losses}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Win %</div>
                  <div className="text-2xl font-bold">{matchupStats.winPercentage.toFixed(0)}%</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Match History</CardTitle>
            </CardHeader>
            <CardContent>
              {sortedMatches.length === 0 ? (
                <p className="text-center text-muted-foreground">No matches found for this opponent and mode filter.</p>
              ) : (
                <div className="space-y-2">
                  {sortedMatches.map((match) => {
                    const date = formatEffectiveMatchDate(match);
                    let result = '—';
                    let modeLabel = '';

                    if (match.officialApaMatchLogData) {
                      modeLabel = 'Official APA';
                      if (match.officialApaMatchLogData.didWin === true) result = 'Win';
                      else if (match.officialApaMatchLogData.didWin === false) result = 'Loss';
                    } else if (match.apaMatchInfo) {
                      modeLabel = 'APA Practice';
                      const players = match.apaMatchInfo.players.filter((p) => p !== null);
                      if (players.length === 2 && players[0]) {
                        result = players[0].isPlayerOfMatch ? 'Win' : 'Loss';
                      }
                    } else if (match.mode === 'acceptingGifts') {
                      modeLabel = 'Accepting Gifts';
                    } else if (match.mode === 'straightShot') {
                      modeLabel = 'Straight Shot';
                    }

                    return (
                      <div key={match.matchId} className="flex items-center justify-between rounded-md border p-3 hover:bg-muted/50">
                        <div>
                          <div className="font-medium">{date}</div>
                          <div className="text-sm text-muted-foreground">{modeLabel}</div>
                        </div>
                        <div className={`font-semibold ${result === 'Win' ? 'text-green-600' : result === 'Loss' ? 'text-red-600' : ''}`}>{result}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
