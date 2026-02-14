import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
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
import AuthGate from './components/auth/AuthGate';

const rootRoute = createRootRoute({
  component: () => (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthGate>
        <AppLayout />
      </AuthGate>
      <Toaster />
    </ThemeProvider>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const practiceStartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/apa-practice/start',
  component: PracticeStartPage,
});

const practiceGameRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/apa-practice/game',
  component: PracticeGamePage,
});

const acceptingGiftsStartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/accepting-gifts/start',
  component: AcceptingGiftsStartPage,
});

const acceptingGiftsGameRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/accepting-gifts/game',
  component: AcceptingGiftsGamePage,
});

const straightShotStartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/straight-shot/start',
  component: StraightShotStartPage,
});

const straightShotGameRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/straight-shot/game',
  component: StraightShotGamePage,
});

const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/history',
  component: MatchHistoryPage,
});

const matchDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/history/$matchId',
  component: MatchDetailsPage,
});

const playerStatsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/players/$playerName',
  component: PlayerAggregateStatsPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  practiceStartRoute,
  practiceGameRoute,
  acceptingGiftsStartRoute,
  acceptingGiftsGameRoute,
  straightShotStartRoute,
  straightShotGameRoute,
  historyRoute,
  matchDetailsRoute,
  playerStatsRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
