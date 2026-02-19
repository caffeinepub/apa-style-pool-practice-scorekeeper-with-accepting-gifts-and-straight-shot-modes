import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, ArrowUpDown, Table as TableIcon, LayoutGrid } from 'lucide-react';
import { useGetAllMatches } from '../../hooks/useQueries';
import MatchSummaryCard from '../../components/matches/MatchSummaryCard';
import MatchHistoryTable from '../../components/history/MatchHistoryTable';
import { MatchMode } from '../../backend';
import { getNavigationOrigin, clearNavigationOrigin } from '../../utils/urlParams';
import { getEffectiveMatchTimestamp } from '../../lib/matches/effectiveMatchDate';

export default function MatchHistoryPage() {
  const navigate = useNavigate();
  const { data: matches, isLoading } = useGetAllMatches();
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');

  const navOrigin = getNavigationOrigin();
  const backLabel = navOrigin === 'stats' ? 'Back to Stats' : 'Back to Home';
  const backPath = navOrigin === 'stats' ? '/stats' : '/';

  const handleBack = () => {
    clearNavigationOrigin();
    navigate({ to: backPath });
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
  };

  const sortedMatches = matches ? [...matches].sort((a, b) => {
    const aTime = getEffectiveMatchTimestamp(a);
    const bTime = getEffectiveMatchTimestamp(b);
    const comparison = aTime - bTime;
    return sortOrder === 'newest' ? -comparison : comparison;
  }) : [];

  const apaMatches = sortedMatches.filter(m => 
    m.mode === MatchMode.apaPractice || m.officialApaMatchLogData
  );
  const giftsMatches = sortedMatches.filter(m => m.mode === MatchMode.acceptingGifts);
  const straightMatches = sortedMatches.filter(m => m.mode === MatchMode.straightShot);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Loading match history...</p>
      </div>
    );
  }

  const renderMatchList = (matchList: typeof sortedMatches) => {
    if (matchList.length === 0) {
      return (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No matches found</p>
          </CardContent>
        </Card>
      );
    }

    if (viewMode === 'table') {
      return <MatchHistoryTable matches={matchList} />;
    }

    return (
      <div className="space-y-4">
        {matchList.map((match) => (
          <MatchSummaryCard key={match.matchId} match={match} />
        ))}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="gap-2"
          data-testid="back-to-home-button"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Button>
        <h1 className="text-2xl font-bold">Match History</h1>
        <div className="w-24" />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="apa">APA</TabsTrigger>
            <TabsTrigger value="gifts">Gifts</TabsTrigger>
            <TabsTrigger value="straight">Straight</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(prev => prev === 'cards' ? 'table' : 'cards')}
              className="gap-2"
            >
              {viewMode === 'cards' ? (
                <>
                  <TableIcon className="h-4 w-4" />
                  Table View
                </>
              ) : (
                <>
                  <LayoutGrid className="h-4 w-4" />
                  Card View
                </>
              )}
            </Button>
            {sortedMatches.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSortOrder}
                className="gap-2"
              >
                <ArrowUpDown className="h-4 w-4" />
                {sortOrder === 'newest' ? 'Newest first' : 'Oldest first'}
              </Button>
            )}
          </div>
        </div>

        <TabsContent value="all">
          {renderMatchList(sortedMatches)}
        </TabsContent>

        <TabsContent value="apa">
          {renderMatchList(apaMatches)}
        </TabsContent>

        <TabsContent value="gifts">
          {renderMatchList(giftsMatches)}
        </TabsContent>

        <TabsContent value="straight">
          {renderMatchList(straightMatches)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
