import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Home, History } from 'lucide-react';

export default function SmokeCheckPage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <CardTitle>Deployment Verification</CardTitle>
              <CardDescription>Quick smoke check for core navigation</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <h3 className="font-semibold">Verification Checklist</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-600 flex-shrink-0" />
                <span>App loaded successfully (you're seeing this page)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-600 flex-shrink-0" />
                <span>Router initialized without errors</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-4 w-4 mt-0.5 flex-shrink-0">→</span>
                <span>Test navigation to Home page using button below</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-4 w-4 mt-0.5 flex-shrink-0">→</span>
                <span>Test navigation to Match History using button below</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-4 w-4 mt-0.5 flex-shrink-0">→</span>
                <span>From Home, navigate to Match History</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-4 w-4 mt-0.5 flex-shrink-0">→</span>
                <span>From Match History, navigate back to Home</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3 pt-4 border-t">
            <h3 className="font-semibold">Quick Navigation</h3>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                onClick={() => navigate({ to: '/' })}
                variant="default"
                className="gap-2 flex-1"
                data-testid="smoke-check-home-button"
              >
                <Home className="h-4 w-4" />
                Go to Home
              </Button>
              <Button
                onClick={() => navigate({ to: '/history' })}
                variant="outline"
                className="gap-2 flex-1"
                data-testid="smoke-check-history-button"
              >
                <History className="h-4 w-4" />
                Go to Match History
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t text-xs text-muted-foreground">
            <p>
              <strong>Note:</strong> This page is for post-deployment verification only. 
              If all navigation works correctly, the deployment is successful.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
