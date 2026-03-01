import { useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useGetMatch } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy } from 'lucide-react';
import RealApaMatchForm from '../../components/apa/RealApaMatchForm';

export default function RealApaMatchEditPage() {
  const navigate = useNavigate();
  const { matchId } = useParams({ from: '/real-apa-match/$matchId/edit' });
  const { data: match, isLoading, isFetched } = useGetMatch(matchId);

  // Redirect if match not found after loading
  useEffect(() => {
    if (isFetched && !match) {
      navigate({ to: '/history' });
    }
  }, [isFetched, match, navigate]);

  if (isLoading || !isFetched) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 pb-8">
        <Button
          onClick={() => navigate({ to: '/history' })}
          variant="ghost"
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to History
        </Button>
        <Card className="border-emerald-500/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <Trophy className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl">Edit Official APA Match Log</CardTitle>
            <CardDescription className="text-base">
              Loading match data...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!match || !match.officialApaMatchLogData) {
    return null;
  }

  const initialData = {
    matchDate: match.officialApaMatchLogData.date,
    opponentName: match.officialApaMatchLogData.opponentName,
    yourSkillLevel: match.officialApaMatchLogData.playerOneSkillLevel?.toString() || '',
    opponentSkillLevel: match.officialApaMatchLogData.playerTwoSkillLevel?.toString() || '',
    yourScore: match.officialApaMatchLogData.myScore,
    theirScore: match.officialApaMatchLogData.theirScore,
    innings: match.officialApaMatchLogData.innings,
    defensiveShots: match.officialApaMatchLogData.defensiveShots,
    notes: match.officialApaMatchLogData.notes,
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-8">
      <Button
        onClick={() => navigate({ to: `/history/${matchId}` })}
        variant="ghost"
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Match Details
      </Button>

      <Card className="border-emerald-500/50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <Trophy className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl">Edit Official APA Match Log</CardTitle>
          <CardDescription className="text-base">
            Update match data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RealApaMatchForm mode="edit" matchId={matchId} initialData={initialData} />
        </CardContent>
      </Card>
    </div>
  );
}
