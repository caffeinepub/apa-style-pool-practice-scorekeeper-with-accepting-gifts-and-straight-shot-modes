import { type ReactNode } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useIsCallerApproved, useIsCallerAdmin, useGetInviteOnlyMode } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AccessNotAllowedPage from '../../pages/auth/AccessNotAllowedPage';

interface AuthGateProps {
  children: ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const { identity, login, isLoggingIn, isInitializing } = useInternetIdentity();
  const { data: isApproved, isLoading: approvalLoading, isFetched: approvalFetched } = useIsCallerApproved();
  const { data: isAdmin, isLoading: adminLoading, isFetched: adminFetched } = useIsCallerAdmin();
  const { data: inviteOnlyMode, isLoading: modeLoading, isFetched: modeFetched } = useGetInviteOnlyMode();

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600">
              <span className="text-3xl font-bold text-white">9</span>
            </div>
            <CardTitle className="text-2xl">Welcome to APA 9-Ball Scorekeeper</CardTitle>
            <CardDescription>
              Track your APA 9-ball practice matches with Equalizer scoring, PPI tracking, and match-point conversion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={login}
              disabled={isLoggingIn}
              className="w-full"
              size="lg"
            >
              {isLoggingIn ? 'Logging in...' : 'Login to Continue'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check access control after authentication
  // Only show loading if queries are actively loading AND haven't fetched yet
  const accessLoading = (approvalLoading && !approvalFetched) || 
                        (adminLoading && !adminFetched) || 
                        (modeLoading && !modeFetched);
  
  if (accessLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="text-muted-foreground">Checking access...</p>
        </div>
      </div>
    );
  }

  // Determine effective invite-only mode (default to false if not fetched)
  const effectiveInviteOnlyMode = modeFetched ? (inviteOnlyMode ?? false) : false;
  const effectiveIsAdmin = adminFetched ? (isAdmin ?? false) : false;
  const effectiveIsApproved = approvalFetched ? (isApproved ?? false) : false;

  // If invite-only mode is enabled, check approval status
  if (effectiveInviteOnlyMode && !effectiveIsAdmin && !effectiveIsApproved) {
    return <AccessNotAllowedPage />;
  }

  return <>{children}</>;
}
