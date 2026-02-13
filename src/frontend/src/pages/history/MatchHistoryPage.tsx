import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllMatches } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, History } from 'lucide-react';
import MatchSummaryCard from '../../components/matches/MatchSummaryCard';
import { MatchMode } from '../../backend';

export default function MatchHistoryPage() {
  const navigate = useNavigate();
  const { data: matches, isLoading } = useGetAllMatches();
  const [activeTab, setActiveTab] = useState<'all' | MatchMode>('all');

  const filteredMatches = matches?.filter(match => 
    activeTab === 'all' || match.mode === activeTab
  ).sort((a, b) => Number(b.dateTime - a.dateTime)) || [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/' })}
        className="gap-2"
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value={MatchMode.apaPractice}>APA</TabsTrigger>
              <TabsTrigger value={MatchMode.acceptingGifts}>Gifts</TabsTrigger>
              <TabsTrigger value={MatchMode.straightShot}>Straight</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="mt-6">
              {isLoading ? (
                <div className="py-12 text-center text-muted-foreground">
                  Loading matches...
                </div>
              ) : filteredMatches.length === 0 ? (
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
                  {filteredMatches.map(match => (
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
