import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Users } from 'lucide-react';
import type { ApiMatch } from '../../backend';
import { MatchMode } from '../../backend';
import { normalizePlayerName } from '../../utils/playerName';
import { getEffectiveMatchTimestamp } from '../../lib/matches/effectiveMatchDate';
import MatchupAnalysisPanel from './MatchupAnalysisPanel';

interface MatchupAnalysisDropdownProps {
  matches: ApiMatch[];
  playerName: string;
  onSelectOpponent: (opponentName: string) => void;
}

export default function MatchupAnalysisDropdown({
  matches,
  playerName,
  onSelectOpponent,
}: MatchupAnalysisDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOpponent, setSelectedOpponent] = useState<string | null>(null);
  const [includePractice, setIncludePractice] = useState(false);

  // Extract unique opponent names from official APA matches
  const opponentNames = Array.from(
    new Set(
      matches
        .filter(m => m.officialApaMatchLogData)
        .map(m => m.officialApaMatchLogData!.opponentName)
        .filter(name => name && name.trim() !== '')
    )
  ).sort();

  const handleSelectOpponent = (opponentName: string) => {
    setSelectedOpponent(opponentName);
    onSelectOpponent(opponentName);
    setIsOpen(false);
  };

  const handleClosePanel = () => {
    setSelectedOpponent(null);
    onSelectOpponent('');
  };

  // Filter matches based on toggle settings
  const getFilteredMatches = (opponentName: string): ApiMatch[] => {
    if (!opponentName) return [];

    const normalizedOpponentName = normalizePlayerName(opponentName);
    
    // Collect matches based on includePractice toggle
    let filteredMatches: ApiMatch[] = [];

    // Always include official matches
    const officialMatches = matches.filter(m => {
      if (m.officialApaMatchLogData) {
        return normalizePlayerName(m.officialApaMatchLogData.opponentName) === normalizedOpponentName;
      }
      return false;
    });

    filteredMatches = [...officialMatches];

    // Add practice matches if toggle is on
    if (includePractice) {
      const practiceMatches = matches.filter(m => {
        if (m.mode === MatchMode.apaPractice && m.apaMatchInfo) {
          const player1 = m.players[0];
          const player2 = m.players[1];
          if (!player1 || !player2) return false;

          const normalizedP1 = normalizePlayerName(player1.name);
          const normalizedP2 = normalizePlayerName(player2.name);

          return normalizedP1 === normalizedOpponentName || normalizedP2 === normalizedOpponentName;
        }
        return false;
      });

      filteredMatches = [...filteredMatches, ...practiceMatches];
    }

    // Sort chronologically
    filteredMatches.sort((a, b) => getEffectiveMatchTimestamp(a) - getEffectiveMatchTimestamp(b));

    // IMPORTANT: do NOT slice here.
    // Panel will compute Last 10 and Best 10/20 itself.
    return filteredMatches;
  };

  if (opponentNames.length === 0) {
    return (
      <Button variant="outline" disabled className="gap-2">
        <Users className="h-4 w-4" />
        Matchup Analysis
      </Button>
    );
  }

  const filteredMatches = selectedOpponent ? getFilteredMatches(selectedOpponent) : [];

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Users className="h-4 w-4" />
              Matchup Analysis
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-h-[300px] overflow-y-auto">
            {opponentNames.map((opponentName) => (
              <DropdownMenuItem
                key={opponentName}
                onClick={() => handleSelectOpponent(opponentName)}
              >
                {opponentName}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {selectedOpponent && (
          <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center justify-between">
              <Label htmlFor="practice-toggle" className="text-sm font-medium">
                Include Practice Games
              </Label>
              <Button
                id="practice-toggle"
                variant={includePractice ? "default" : "outline"}
                size="sm"
                onClick={() => setIncludePractice(!includePractice)}
                className="h-8"
              >
                {includePractice ? "Official + Practice" : "Official Only"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {selectedOpponent && (
        <MatchupAnalysisPanel
          opponentName={selectedOpponent}
          matches={filteredMatches}
          allMatches={filteredMatches}
          playerName={playerName}
          onClose={handleClosePanel}
        />
      )}
    </div>
  );
}
