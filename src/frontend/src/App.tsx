import { RouterProvider, createRouter, createRoute, createRootRoute, ErrorComponent } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import AppLayout from './components/layout/AppLayout';
import HomePage from './pages/HomePage';
import PracticeStartPage from './pages/apa/PracticeStartPage';
import PracticeGamePage from './pages/apa/PracticeGamePage';
import AcceptingGiftsStartPage from './pages/accepting-gifts/AcceptingGiftsStartPage';
import AcceptingGiftsGamePage from './pages/accepting-gifts/AcceptingGiftsGamePage';
import StraightShotStartPage from './pages/straight-shot/StraightShotStartPage';
import StraightShotGamePage from './pages/straight-shot/StraightShotGamePage';
import MatchHistoryPage from './pages/history/MatchHistoryPage';
import MatchDetailsPage from './pages/history/MatchDetailsPage';
import PlayerAggregateStatsPage from './pages/players/PlayerAggregateStatsPage';
import OwnerApprovalsPage from './pages/owner/OwnerApprovalsPage';
import RealApaMatchPlaceholderPage from './pages/apa/RealApaMatchPlaceholderPage';
import RealApaMatchEditPage from './pages/apa/RealApaMatchEditPage';
import SmokeCheckPage from './pages/SmokeCheckPage';
import StatsPage from './pages/stats/StatsPage';
import AuthGate from './components/auth/AuthGate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

function RouteErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <CardTitle>Something went wrong</CardTitle>
              <CardDescription>An unexpected error occurred</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm font-mono text-muted-foreground">{error.message}</p>
          </div>
          <Button onClick={reset} className="w-full">
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

const rootRoute = createRootRoute({
  component: () => (
    <AuthGate>
      <AppLayout />
    </AuthGate>
  ),
  errorComponent: RouteErrorFallback,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
  errorComponent: RouteErrorFallback,
});

const apaPracticeStartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/apa-practice/start',
  component: PracticeStartPage,
  errorComponent: RouteErrorFallback,
});

const apaPracticeGameRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/apa-practice/game',
  component: PracticeGamePage,
  errorComponent: RouteErrorFallback,
});

const acceptingGiftsStartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/accepting-gifts/start',
  component: AcceptingGiftsStartPage,
  errorComponent: RouteErrorFallback,
});

const acceptingGiftsGameRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/accepting-gifts/game',
  component: AcceptingGiftsGamePage,
  errorComponent: RouteErrorFallback,
});

const straightShotStartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/straight-shot/start',
  component: StraightShotStartPage,
  errorComponent: RouteErrorFallback,
});

const straightShotGameRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/straight-shot/game',
  component: StraightShotGamePage,
  errorComponent: RouteErrorFallback,
});

const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/history',
  component: MatchHistoryPage,
  errorComponent: RouteErrorFallback,
});

const matchDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/history/$matchId',
  component: MatchDetailsPage,
  errorComponent: RouteErrorFallback,
});

const playerStatsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/players/$playerName',
  component: PlayerAggregateStatsPage,
  errorComponent: RouteErrorFallback,
});

const ownerApprovalsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/owner/approvals',
  component: OwnerApprovalsPage,
  errorComponent: RouteErrorFallback,
});

const realApaMatchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/real-apa-match',
  component: RealApaMatchPlaceholderPage,
  errorComponent: RouteErrorFallback,
});

const realApaMatchEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/real-apa-match/$matchId/edit',
  component: RealApaMatchEditPage,
  errorComponent: RouteErrorFallback,
});

const smokeCheckRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/smoke-check',
  component: SmokeCheckPage,
  errorComponent: RouteErrorFallback,
});

const statsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/stats',
  component: StatsPage,
  errorComponent: RouteErrorFallback,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  apaPracticeStartRoute,
  apaPracticeGameRoute,
  acceptingGiftsStartRoute,
  acceptingGiftsGameRoute,
  straightShotStartRoute,
  straightShotGameRoute,
  historyRoute,
  matchDetailsRoute,
  playerStatsRoute,
  ownerApprovalsRoute,
  realApaMatchRoute,
  realApaMatchEditRoute,
  smokeCheckRoute,
  statsRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
