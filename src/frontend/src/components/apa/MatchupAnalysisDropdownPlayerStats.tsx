import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Users } from 'lucide-react';
import type { ApiMatch } from '../../backend';

interface MatchupAnalysisDropdownProps {
  matches: ApiMatch[];
  onSelectOpponent: (opponentName: string) => void;
}

export default function MatchupAnalysisDropdown({ matches, onSelectOpponent }: MatchupAnalysisDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

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
    onSelectOpponent(opponentName);
    setIsOpen(false);
  };

  if (opponentNames.length === 0) {
    return (
      <Button variant="outline" disabled className="gap-2">
        <Users className="h-4 w-4" />
        Matchup Analysis
      </Button>
    );
  }

  return (
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
  );
}
