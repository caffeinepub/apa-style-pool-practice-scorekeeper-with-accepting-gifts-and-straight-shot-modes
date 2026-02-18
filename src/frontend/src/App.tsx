import { StrictMode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import AppLayout from './components/layout/AppLayout';
import AuthGate from './components/auth/AuthGate';
import HomePage from './pages/HomePage';
import MatchHistoryPage from './pages/history/MatchHistoryPage';
import MatchDetailsPage from './pages/history/MatchDetailsPage';
import PracticeStartPage from './pages/apa/PracticeStartPage';
import PracticeGamePage from './pages/apa/PracticeGamePage';
import AcceptingGiftsStartPage from './pages/accepting-gifts/AcceptingGiftsStartPage';
import AcceptingGiftsGamePage from './pages/accepting-gifts/AcceptingGiftsGamePage';
import StraightShotStartPage from './pages/straight-shot/StraightShotStartPage';
import StraightShotGamePage from './pages/straight-shot/StraightShotGamePage';
import AccessNotAllowedPage from './pages/auth/AccessNotAllowedPage';
import OwnerApprovalsPage from './pages/owner/OwnerApprovalsPage';
import RealApaMatchPlaceholderPage from './pages/apa/RealApaMatchPlaceholderPage';
import RealApaMatchEditPage from './pages/apa/RealApaMatchEditPage';
import PlayerAggregateStatsPage from './pages/players/PlayerAggregateStatsPage';
import StatsPage from './pages/stats/StatsPage';
import MatchupsPage from './pages/stats/MatchupsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

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

const accessNotAllowedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/access-not-allowed',
  component: AccessNotAllowedPage,
});

const ownerApprovalsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/owner/approvals',
  component: OwnerApprovalsPage,
});

const realApaMatchCreateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/apa/official/create',
  component: RealApaMatchPlaceholderPage,
});

const realApaMatchEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/apa/official/edit/$matchId',
  component: RealApaMatchEditPage,
});

const playerAggregateStatsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/players/$playerName',
  component: PlayerAggregateStatsPage,
});

const statsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/stats',
  component: StatsPage,
});

const matchupsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/stats/matchups',
  component: MatchupsPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  historyRoute,
  matchDetailsRoute,
  practiceStartRoute,
  practiceGameRoute,
  acceptingGiftsStartRoute,
  acceptingGiftsGameRoute,
  straightShotStartRoute,
  straightShotGameRoute,
  accessNotAllowedRoute,
  ownerApprovalsRoute,
  realApaMatchCreateRoute,
  realApaMatchEditRoute,
  playerAggregateStatsRoute,
  statsRoute,
  matchupsRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>
  );
}
