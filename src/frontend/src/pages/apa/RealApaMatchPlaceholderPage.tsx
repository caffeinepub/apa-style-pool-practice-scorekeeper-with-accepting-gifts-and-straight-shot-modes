import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Trophy } from 'lucide-react';

export default function RealApaMatchPlaceholderPage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
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
          <CardTitle className="text-2xl">Official APA Match Logging</CardTitle>
          <CardDescription className="text-base">
            Coming Soon
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            This feature will allow you to log your official APA league matches with detailed tracking including:
          </p>
          <ul className="space-y-2 text-left text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Match date and opponent information</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Innings and points tracking</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Defensive shots count</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Match notes and observations</span>
            </li>
          </ul>
          <div className="pt-4">
            <Button
              onClick={() => navigate({ to: '/' })}
              variant="outline"
              className="gap-2"
            >
              Return to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
