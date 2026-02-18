import { useNavigate, useParams } from '@tanstack/react-router';
import { useGetMatch } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import RealApaMatchForm from '../../components/apa/RealApaMatchForm';

export default function RealApaMatchEditPage() {
  const navigate = useNavigate();
  const { matchId } = useParams({ from: '/apa/official/edit/$matchId' });
  const { data: match, isLoading } = useGetMatch(matchId);

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Loading match...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!match || !match.officialApaMatchLogData) {
    return (
      <div className="container mx-auto max-w-4xl p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Match not found or not an Official APA match</p>
            <Button onClick={() => navigate({ to: '/history' })} className="mt-4">
              Back to History
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const data = match.officialApaMatchLogData;

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate({ to: `/history/${matchId}` })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Match Details
        </Button>
        <h1 className="text-2xl font-bold">Edit Official APA Match</h1>
        <div className="w-24" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Match Log</CardTitle>
        </CardHeader>
        <CardContent>
          <RealApaMatchForm
            mode="edit"
            matchId={matchId}
            initialData={{
              matchDate: data.date,
              opponentName: data.opponentName,
              yourSkillLevel: data.playerOneSkillLevel ? data.playerOneSkillLevel.toString() : '',
              opponentSkillLevel: data.playerTwoSkillLevel ? data.playerTwoSkillLevel.toString() : '',
              yourScore: data.myScore,
              theirScore: data.theirScore,
              innings: data.innings,
              defensiveShots: data.defensiveShots,
              notes: data.notes,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
