import ModeCard from '../components/navigation/ModeCard';
import { Target, Gift, Zap, History } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="text-center">
        <h1 className="mb-2 text-4xl font-bold tracking-tight">Pool Scorekeeper</h1>
        <p className="text-lg text-muted-foreground">
          Track your practice games and improve your skills
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ModeCard
          title="APA Practice"
          description="Track APA-style practice matches with detailed scoring"
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
          title="Straight Shot"
          description="Track your straight shot accuracy and consistency"
          icon={<Zap className="h-6 w-6" />}
          path="/straight-shot/start"
        />
      </div>

      <div className="flex justify-center pt-4">
        <Button
          onClick={() => navigate({ to: '/history' })}
          variant="outline"
          size="lg"
          className="gap-2"
        >
          <History className="h-5 w-5" />
          View Match History
        </Button>
      </div>
    </div>
  );
}
