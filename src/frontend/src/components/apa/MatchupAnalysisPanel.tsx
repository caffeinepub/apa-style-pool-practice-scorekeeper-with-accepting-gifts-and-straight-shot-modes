import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import type { ApiMatch } from '../../backend';
import { MatchMode } from '../../backend';
import { computeOfficialApaPpi } from '../../lib/apa/officialApaPpi';
import { getEffectiveMatchTimestamp } from '../../lib/matches/effectiveMatchDate';
import { getPointsToWin } from '../../lib/apa/apaEqualizer';
import { normalizePlayerName } from '../../utils/playerName';

interface MatchupAnalysisPanelProps {
  opponentName: string;
  matches: ApiMatch[];
  allMatches: ApiMatch[];
  playerName: string;
  onClose: () => void;
}

export default function MatchupAnalysisPanel({ opponentName, matches, allMatches, playerName, onClose }: MatchupAnalysisPanelProps) {
  const normalizedPlayerName = normalizePlayerName(playerName);
  const normalizedOpponentName = normalizePlayerName(opponentName);

  // Collect both practice and official APA matches against this opponent
  const allMatchupMatches: Array<{ match: ApiMatch; isPractice: boolean }> = [];

  // Add official matches
  for (const match of matches) {
    if (match.officialApaMatchLogData) {
      allMatchupMatches.push({ match, isPractice: false });
    }
  }

  // Add practice matches
  for (const match of allMatches) {
    if (match.mode === MatchMode.apaPractice && match.apaMatchInfo) {
      const player1 = match.players[0];
      const player2 = match.players[1];

      if (!player1 || !player2) continue;

      const normalizedP1 = normalizePlayerName(player1.name);
      const normalizedP2 = normalizePlayerName(player2.name);

      // Check if this match involves both the player and the opponent
      const hasPlayer = normalizedP1 === normalizedPlayerName || normalizedP2 === normalizedPlayerName;
      const hasOpponent = normalizedP1 === normalizedOpponentName || normalizedP2 === normalizedOpponentName;

      if (hasPlayer && hasOpponent) {
        allMatchupMatches.push({ match, isPractice: true });
      }
    }
  }

  // Sort matches chronologically
  const sortedMatches = allMatchupMatches.sort((a, b) => 
    getEffectiveMatchTimestamp(a.match) - getEffectiveMatchTimestamp(b.match)
  );

  // Helper function to extract outcome and PPI from both official and practice matches
  function getMatchOutcomeAndPpi(entry: { match: ApiMatch; isPractice: boolean }) {
    const { match, isPractice } = entry;

    // OFFICIAL
    if (!isPractice && match.officialApaMatchLogData) {
      const d = match.officialApaMatchLogData;

      const ppiResult = computeOfficialApaPpi(d.myScore, d.innings, d.defensiveShots);
      const ppi = ppiResult.isValid && ppiResult.ppi !== null ? ppiResult.ppi : null;

      const didWin = d.didWin === true;
      const didLose = d.didWin === false;

      return { didWin, didLose, ppi };
    }

    // PRACTICE
    if (isPractice && match.apaMatchInfo) {
      const player1 = match.players[0];
      const player2 = match.players[1];
      if (!player1 || !player2) return { didWin: false, didLose: false, ppi: null };

      const normalizedP1 = normalizePlayerName(player1.name);
      const isPlayer1 = normalizedP1 === normalizedPlayerName;

      const playerStats = match.apaMatchInfo.players[isPlayer1 ? 0 : 1];
      const opponentStats = match.apaMatchInfo.players[isPlayer1 ? 1 : 0];
      if (!playerStats || !opponentStats) return { didWin: false, didLose: false, ppi: null };

      const innings = String(Number(playerStats.innings) || 0);
      const defShots = String(Number(playerStats.defensiveShots) || 0);
      const yourPoints = String(Number(playerStats.totalScore) || 0);

      const mySkillLevel = player1.skillLevel ? Number(player1.skillLevel) : 0;
      const theirSkillLevel = player2.skillLevel ? Number(player2.skillLevel) : 0;

      const myTarget = isPlayer1 ? getPointsToWin(mySkillLevel) : getPointsToWin(theirSkillLevel);
      const theirTarget = isPlayer1 ? getPointsToWin(theirSkillLevel) : getPointsToWin(mySkillLevel);

      const oppPoints = Number(opponentStats.totalScore) || 0;

      const didWin = Number(yourPoints) >= myTarget && oppPoints < theirTarget;
      const didLose = oppPoints >= theirTarget && Number(yourPoints) < myTarget;

      const ppiResult = computeOfficialApaPpi(yourPoints, innings, defShots);
      const ppi = ppiResult.isValid && ppiResult.ppi !== null ? ppiResult.ppi : null;

      return { didWin, didLose, ppi };
    }

    return { didWin: false, didLose: false, ppi: null };
  }

  // Calculate head-to-head stats (now includes both official and practice)
  let wins = 0;
  let losses = 0;
  let totalWithOutcome = 0;

  for (const entry of sortedMatches) {
    const { didWin, didLose } = getMatchOutcomeAndPpi(entry);

    if (didWin) {
      wins++;
      totalWithOutcome++;
    } else if (didLose) {
      losses++;
      totalWithOutcome++;
    }
  }

  const winRate = totalWithOutcome > 0 ? (wins / totalWithOutcome) * 100 : null;

  // Calculate PPI averages (now includes both official and practice)
  const ppisChronological: number[] = [];

  for (const entry of sortedMatches) {
    const { ppi } = getMatchOutcomeAndPpi(entry);
    if (ppi !== null) ppisChronological.push(ppi);
  }

  // Last 10 avg
  const last10 = ppisChronological.slice(-10);
  const last10AvgPpi =
    last10.length > 0 ? last10.reduce((s, v) => s + v, 0) / last10.length : null;

  // Best 10 of last 20 avg
  const last20 = ppisChronological.slice(-20);
  const best10 = [...last20].sort((a, b) => b - a).slice(0, 10);
  const best10of20AvgPpi =
    best10.length > 0 ? best10.reduce((s, v) => s + v, 0) / best10.length : null;

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>vs {opponentName}</CardTitle>
            <CardDescription>Head-to-head record</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Record</p>
            <p className="text-2xl font-bold">{wins}-{losses}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Win Rate</p>
            <p className="text-2xl font-bold">
              {winRate !== null ? `${winRate.toFixed(1)}%` : '—'}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Avg PPI</p>
            <p className="text-2xl font-bold">
              {last10AvgPpi !== null ? last10AvgPpi.toFixed(2) : '—'}
            </p>
            <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
              <div>Last 10</div>
              <div>
                Best 10 of last 20{best10of20AvgPpi !== null ? `: ${best10of20AvgPpi.toFixed(2)}` : ''}
              </div>
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Match History</p>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {sortedMatches.length > 0 ? (
              sortedMatches.map(({ match, isPractice }) => {
                if (isPractice && match.apaMatchInfo) {
                  // Practice match
                  const player1 = match.players[0];
                  const player2 = match.players[1];
                  if (!player1 || !player2) return null;

                  const normalizedP1 = normalizePlayerName(player1.name);
                  const isPlayer1 = normalizedP1 === normalizedPlayerName;
                  
                  const playerStats = match.apaMatchInfo.players[isPlayer1 ? 0 : 1];
                  const opponentStats = match.apaMatchInfo.players[isPlayer1 ? 1 : 0];

                  if (!playerStats || !opponentStats) return null;

                  const innings = Number(playerStats.innings) || 0;
                  const defensiveShots = Number(playerStats.defensiveShots) || 0;
                  const yourPoints = Number(playerStats.totalScore) || 0;
                  const opponentPoints = Number(opponentStats.totalScore) || 0;

                  const mySkillLevel = player1.skillLevel ? Number(player1.skillLevel) : 0;
                  const theirSkillLevel = player2.skillLevel ? Number(player2.skillLevel) : 0;
                  const myTarget = isPlayer1 ? getPointsToWin(mySkillLevel) : getPointsToWin(theirSkillLevel);
                  const theirTarget = isPlayer1 ? getPointsToWin(theirSkillLevel) : getPointsToWin(mySkillLevel);

                  const didWin = yourPoints >= myTarget && opponentPoints < theirTarget;
                  const didLose = opponentPoints >= theirTarget && yourPoints < myTarget;
                  const outcome = didWin ? 'W' : didLose ? 'L' : '—';

                  return (
                    <div
                      key={match.matchId}
                      className="flex items-center justify-between p-2 rounded-md bg-muted/50 text-sm gap-2"
                    >
                      <Badge variant="secondary" className="shrink-0">Practice</Badge>
                      <div className="flex-1">
                        <span className="font-mono">
                          Innings: {innings}  Def: {defensiveShots}  Score: {yourPoints}/{myTarget} - {opponentPoints}/{theirTarget}  {outcome}
                        </span>
                      </div>
                    </div>
                  );
                } else if (!isPractice && match.officialApaMatchLogData) {
                  // Official match
                  const data = match.officialApaMatchLogData;
                  const myScoreNum = parseInt(data.myScore) || 0;
                  const theirScoreNum = parseInt(data.theirScore) || 0;
                  const inningsNum = parseInt(data.innings) || 0;
                  const defShotsNum = parseInt(data.defensiveShots) || 0;
                  
                  // Get targets from skill levels
                  const myTarget = data.playerOneSkillLevel ? getPointsToWin(Number(data.playerOneSkillLevel)) : 0;
                  const theirTarget = data.playerTwoSkillLevel ? getPointsToWin(Number(data.playerTwoSkillLevel)) : 0;
                  
                  const didWin = data.didWin === true;
                  const didLose = data.didWin === false;
                  const outcome = didWin ? 'W' : didLose ? 'L' : '—';
                  
                  return (
                    <div
                      key={match.matchId}
                      className="flex items-center justify-between p-2 rounded-md bg-muted/50 text-sm gap-2"
                    >
                      <Badge variant="default" className="shrink-0">Official</Badge>
                      <div className="flex-1">
                        <span className="font-mono">
                          Innings: {inningsNum}  Def: {defShotsNum}  Score: {myScoreNum}/{myTarget} - {theirScoreNum}/{theirTarget}  {outcome}
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No matches found
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
