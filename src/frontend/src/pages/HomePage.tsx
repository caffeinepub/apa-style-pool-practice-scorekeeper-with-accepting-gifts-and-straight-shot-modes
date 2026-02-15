import ModeCard from '../components/navigation/ModeCard';
import { Target, Gift, Zap, History, Trophy } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="text-center">
        <h1 className="mb-2 text-4xl font-bold tracking-tight">APA 9-Ball Scorekeeper</h1>
        <p className="text-lg text-muted-foreground">
          Track your APA 9-ball practice games with Equalizer scoring and improve your skills
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <ModeCard
          title="APA 9-Ball Practice"
          description="Track APA 9-ball matches with Equalizer scoring, PPI, and match-point conversion"
          icon={<Target className="h-6 w-6" />}
          path="/apa-practice/start"
          variant="accent"
        />
        <ModeCard
          title="Accepting Gifts"
          description="Practice the Accepting Gifts drill and track your progress"
          icon={<Gift className="h-6 w-6" />}
          path="/accepting-gifts/start"
        />
        <ModeCard
          title="Straight Shot (Strokes Drill)"
          description="Count your strokes to clear the table - win at 20 or under"
          icon={<Zap className="h-6 w-6" />}
          path="/straight-shot/start"
        />
        <ModeCard
          title="Official APA Match Log"
          description="Log your real APA league matches (Coming Soon)"
          icon={<Trophy className="h-6 w-6" />}
          path="/real-apa-match"
        />
      </div>

      <div className="flex justify-center pt-4">
        <Button
          onClick={() => navigate({ to: '/history' })}
          variant="outline"
          size="lg"
          className="gap-2"
          data-testid="home-view-history-button"
        >
          <History className="h-5 w-5" />
          View Match History
        </Button>
      </div>
    </div>
  );
}
