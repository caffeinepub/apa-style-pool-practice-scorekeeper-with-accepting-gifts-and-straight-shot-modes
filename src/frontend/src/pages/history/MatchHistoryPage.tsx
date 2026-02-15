import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllMatches } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, History, ArrowUpDown } from 'lucide-react';
import MatchSummaryCard from '../../components/matches/MatchSummaryCard';
import { MatchMode } from '../../backend';
import { getEffectiveMatchTimestamp } from '../../lib/matches/effectiveMatchDate';

type SortOrder = 'newest' | 'oldest';

export default function MatchHistoryPage() {
  const navigate = useNavigate();
  const { data: matches, isLoading } = useGetAllMatches();
  const [activeTab, setActiveTab] = useState<'all' | MatchMode>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
  };

  const filteredMatches = matches?.filter(match => 
    activeTab === 'all' || match.mode === activeTab
  ) || [];

  const sortedMatches = [...filteredMatches].sort((a, b) => {
    const timestampA = getEffectiveMatchTimestamp(a);
    const timestampB = getEffectiveMatchTimestamp(b);
    
    return sortOrder === 'newest' 
      ? timestampB - timestampA 
      : timestampA - timestampB;
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/' })}
        className="gap-2"
        data-testid="history-back-to-home-button"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <History className="h-6 w-6" />
            </div>
            <div>
              <CardTitle>Match History</CardTitle>
              <CardDescription>View and manage your past games</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
              <TabsList className="grid w-full grid-cols-4 sm:max-w-md">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value={MatchMode.apaPractice}>APA</TabsTrigger>
                <TabsTrigger value={MatchMode.acceptingGifts}>Gifts</TabsTrigger>
                <TabsTrigger value={MatchMode.straightShot}>Straight</TabsTrigger>
              </TabsList>
              
              {sortedMatches.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSortOrder}
                  className="gap-2 whitespace-nowrap w-full sm:w-auto"
                >
                  <ArrowUpDown className="h-4 w-4" />
                  {sortOrder === 'newest' ? 'Newest first' : 'Oldest first'}
                </Button>
              )}
            </div>

            <TabsContent value={activeTab} className="mt-6">
              {isLoading ? (
                <div className="py-12 text-center text-muted-foreground">
                  Loading matches...
                </div>
              ) : sortedMatches.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">No matches found</p>
                  <Button
                    onClick={() => navigate({ to: '/' })}
                    variant="outline"
                    className="mt-4"
                  >
                    Start a New Game
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedMatches.map(match => (
                    <MatchSummaryCard key={match.matchId} match={match} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
