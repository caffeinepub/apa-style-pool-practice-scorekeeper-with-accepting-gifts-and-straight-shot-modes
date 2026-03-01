import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Trophy } from 'lucide-react';
import RealApaMatchForm from '../../components/apa/RealApaMatchForm';

export default function RealApaMatchPlaceholderPage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-8">
      <Button
        onClick={() => navigate({ to: '/' })}
        variant="ghost"
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Button>

      <Card className="border-emerald-500/50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <Trophy className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl">Official APA Match Log</CardTitle>
          <CardDescription className="text-base">
            Enter match data after the fact (not for live scoring)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RealApaMatchForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
