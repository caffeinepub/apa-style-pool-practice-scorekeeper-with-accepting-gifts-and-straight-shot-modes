import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllMatches } from '../../hooks/useQueries';
import { MatchMode } from '../../backend';
import type { ApiMatch } from '../../backend';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LayoutGrid, Table as TableIcon } from 'lucide-react';
import MatchSummaryCard from '../../components/matches/MatchSummaryCard';
import MatchHistoryTable from '../../components/history/MatchHistoryTable';
import { getEffectiveMatchTimestamp } from '../../lib/matches/effectiveMatchDate';

type ViewMode = 'cards' | 'table';

export default function MatchHistoryPage() {
  const navigate = useNavigate();
  const { data: matches = [], isLoading } = useGetAllMatches();
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // Sort all matches by effective timestamp (descending, newest first)
  const sortedMatches = [...matches].sort((a, b) => {
    const tsA = getEffectiveMatchTimestamp(a);
    const tsB = getEffectiveMatchTimestamp(b);
    return tsB - tsA;
  });

  // Filter functions
  const apaMatches = sortedMatches.filter(
    (m) => m.apaMatchInfo || m.officialApaMatchLogData
  );
  const giftsMatches = sortedMatches.filter((m) => m.mode === MatchMode.acceptingGifts);
  const straightMatches = sortedMatches.filter((m) => m.mode === MatchMode.straightShot);

  const renderContent = (filteredMatches: ApiMatch[]) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading matches...</p>
        </div>
      );
    }

    if (filteredMatches.length === 0) {
      return (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">No matches found</p>
        </div>
      );
    }

    if (viewMode === 'cards') {
      return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMatches.map((match) => (
            <MatchSummaryCard key={match.matchId} match={match} />
          ))}
        </div>
      );
    }

    return <MatchHistoryTable matches={filteredMatches} allMatches={sortedMatches} />;
  };

  return (
    <div className="container mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/' })}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Match History</h1>
        </div>

        <div className="flex gap-2">
          <Button
            variant={viewMode === 'cards' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('cards')}
            aria-label="Card view"
          >
            <LayoutGrid className="h-5 w-5" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('table')}
            aria-label="Table view"
          >
            <TableIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="apa">APA</TabsTrigger>
          <TabsTrigger value="gifts">Gifts</TabsTrigger>
          <TabsTrigger value="straight">Straight</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {renderContent(sortedMatches)}
        </TabsContent>

        <TabsContent value="apa" className="mt-6">
          {renderContent(apaMatches)}
        </TabsContent>

        <TabsContent value="gifts" className="mt-6">
          {renderContent(giftsMatches)}
        </TabsContent>

        <TabsContent value="straight" className="mt-6">
          {renderContent(straightMatches)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
