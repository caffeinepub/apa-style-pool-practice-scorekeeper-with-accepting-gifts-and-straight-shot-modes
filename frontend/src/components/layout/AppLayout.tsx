import { useState } from 'react';
import { Outlet, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Shield, BarChart3, Loader2, KeyRound } from 'lucide-react';
import LoginButton from '../auth/LoginButton';
import ProfileSetupDialog from '../auth/ProfileSetupDialog';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useIsCallerAdmin, useGetCallerUserProfile, useClaimOwnership, useGetOwner } from '../../hooks/useQueries';
import { useActor } from '../../hooks/useActor';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import DebugPanel from '../debug/DebugPanel';

export default function AppLayout() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isFetched: isAdminFetched } = useIsCallerAdmin();
  const { actor, isFetching: actorFetching } = useActor();
  const { isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: owner, isFetched: isOwnerFetched } = useGetOwner();
  const claimOwnership = useClaimOwnership();
  const isAuthenticated = !!identity;
  const [isDebugPanelOpen, setIsDebugPanelOpen] = useState(false);

  // Show connecting indicator when authenticated but actor/profile not ready
  const isConnecting = isAuthenticated && (actorFetching || (!actor && !profileLoading));

  // Show claim ownership button when:
  // - user is authenticated
  // - actor is ready
  // - admin status has been fetched and user is not already admin
  // - owner query has been fetched and no owner has been claimed yet
  const showClaimOwnership =
    isAuthenticated &&
    !!actor &&
    !actorFetching &&
    isAdminFetched &&
    !isAdmin &&
    isOwnerFetched &&
    owner === null;

  const handleClaimOwnership = async () => {
    try {
      await claimOwnership.mutateAsync();
    } catch {
      // Error is handled silently; the button state reflects the result
    }
  };

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
            {showClaimOwnership && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleClaimOwnership}
                      disabled={claimOwnership.isPending}
                      title="Claim Ownership"
                    >
                      {claimOwnership.isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <KeyRound className="h-5 w-5 text-amber-500" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Claim admin ownership</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
          <p className="mt-2">
            <button
              onClick={() => setIsDebugPanelOpen(prev => !prev)}
              className="text-xs text-muted-foreground/50 hover:text-muted-foreground underline underline-offset-2 transition-colors"
            >
              Debug
            </button>
          </p>
        </div>
      </footer>
      <DebugPanel isOpen={isDebugPanelOpen} onClose={() => setIsDebugPanelOpen(false)} />
    </div>
  );
}
