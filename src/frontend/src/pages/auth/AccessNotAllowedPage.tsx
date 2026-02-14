import { useState } from 'react';
import { useRequestApproval } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function AccessNotAllowedPage() {
  const requestApproval = useRequestApproval();
  const [requestSent, setRequestSent] = useState(false);

  const handleRequestAccess = async () => {
    try {
      await requestApproval.mutateAsync();
      setRequestSent(true);
    } catch (error: any) {
      // Handle errors gracefully
      if (error.message?.includes('already approved') || error.message?.includes('already requested')) {
        setRequestSent(true);
      }
      // Silently handle other errors to avoid exposing internal details
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600">
            <AlertCircle className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Access Not Allowed</CardTitle>
          <CardDescription>
            This app is currently invite-only. You need approval from the owner to access it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {requestSent ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="font-medium text-emerald-900 dark:text-emerald-100">
                    Access request submitted
                  </p>
                  <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
                    The owner will review your request. Please check back later.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <Button
              onClick={handleRequestAccess}
              disabled={requestApproval.isPending}
              className="w-full"
              size="lg"
            >
              {requestApproval.isPending ? 'Requesting...' : 'Request Access'}
            </Button>
          )}
          <p className="text-center text-sm text-muted-foreground">
            If you believe this is an error, please contact the app owner.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
