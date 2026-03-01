import { useNavigate } from '@tanstack/react-router';
import { FileText, Gift, Target, TrendingUp } from 'lucide-react';
import ModeCard from '../components/navigation/ModeCard';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { SESSION_KEYS } from '../lib/session/inProgressSessions';
import { setNavigationOrigin } from '../utils/urlParams';

export default function HomePage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();

  const isAuthenticated = !!identity;

  const handleNavigateToHistory = () => {
    setNavigationOrigin('home');
    navigate({ to: '/history' });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">APA 9-Ball Scorekeeper</h1>
        <p className="text-lg text-muted-foreground">
          Track your practice, log official matches, and improve your game
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <ModeCard
          icon={<FileText className="h-8 w-8" />}
          title="Official APA Match Log"
          description="Log your official APA league match results"
          path="/real-apa-match"
          primaryCtaText="Log APA Match"
        />

        <ModeCard
          icon={<TrendingUp className="h-8 w-8" />}
          title="APA 9-Ball Practice"
          description="Practice match with full rack-by-rack scoring"
          path="/apa-practice/start"
          sessionKey={SESSION_KEYS.APA_PRACTICE}
          resumePath="/apa-practice/game"
          primaryCtaText="Start New Game"
        />

        <ModeCard
          icon={<Gift className="h-8 w-8" />}
          title="Accepting Gifts"
          description="Progressive drill from 2 to 7 balls"
          path="/accepting-gifts/start"
          sessionKey={SESSION_KEYS.ACCEPTING_GIFTS}
          resumePath="/accepting-gifts/game"
          primaryCtaText="Start New Game"
        />

        <ModeCard
          icon={<Target className="h-8 w-8" />}
          title="Straight Shot"
          description="Clear all balls in 20 shots or under"
          path="/straight-shot/start"
          sessionKey={SESSION_KEYS.STRAIGHT_SHOT}
          resumePath="/straight-shot/game"
          primaryCtaText="Start New Game"
        />
      </div>

      {isAuthenticated && (
        <div className="flex justify-center pt-4">
          <button
            onClick={handleNavigateToHistory}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
          >
            View Match History
          </button>
        </div>
      )}
    </div>
  );
}
