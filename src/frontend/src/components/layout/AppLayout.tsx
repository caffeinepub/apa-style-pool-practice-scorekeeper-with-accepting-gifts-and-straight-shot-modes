import { Outlet, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Shield, BarChart3, Loader2 } from 'lucide-react';
import LoginButton from '../auth/LoginButton';
import ProfileSetupDialog from '../auth/ProfileSetupDialog';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useIsCallerAdmin, useGetCallerUserProfile } from '../../hooks/useQueries';
import { useActor } from '../../hooks/useActor';

export default function AppLayout() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const { actor, isFetching: actorFetching } = useActor();
  const { isLoading: profileLoading } = useGetCallerUserProfile();
  const isAuthenticated = !!identity;

  // Show connecting indicator when authenticated but actor/profile not ready
  const isConnecting = isAuthenticated && (actorFetching || (!actor && !profileLoading));

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
              <span className="text-xl font-bold text-white">9</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">APA 9-Ball Scorekeeper</h1>
          </div>
          <div className="flex items-center gap-2">
            {isConnecting && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mr-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Connecting...</span>
              </div>
            )}
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate({ to: '/stats' })}
                title="My Stats"
              >
                <BarChart3 className="h-5 w-5" />
              </Button>
            )}
            {isAuthenticated && isAdmin && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate({ to: '/owner/approvals' })}
                title="Access Management"
              >
                <Shield className="h-5 w-5" />
              </Button>
            )}
            <ProfileSetupDialog />
            <LoginButton />
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <footer className="mt-16 border-t border-border/40 py-8">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} APA 9-Ball Scorekeeper. Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
