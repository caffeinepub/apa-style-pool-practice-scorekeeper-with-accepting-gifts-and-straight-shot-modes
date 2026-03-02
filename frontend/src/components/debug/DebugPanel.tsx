import { useState, useEffect } from 'react';
import { useActor } from '../../hooks/useActor';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';

interface DebugResult {
  label: string;
  value: string | null;
  status: 'loading' | 'success' | 'error';
}

interface DebugPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DebugPanel({ isOpen, onClose }: DebugPanelProps) {
  const { actor } = useActor();
  const [results, setResults] = useState<DebugResult[]>([
    { label: 'getOwner()', value: null, status: 'loading' },
    { label: 'getCallerPrincipal()', value: null, status: 'loading' },
    { label: 'isCallerAdmin()', value: null, status: 'loading' },
    { label: 'isCallerApproved()', value: null, status: 'loading' },
    { label: 'getCallerRole()', value: null, status: 'loading' },
  ]);
  const [isFetching, setIsFetching] = useState(false);

  const runDiagnostics = async () => {
    if (!actor) {
      setResults(prev =>
        prev.map(r => ({ ...r, value: 'Error: Actor not available', status: 'error' as const }))
      );
      return;
    }

    setIsFetching(true);
    setResults([
      { label: 'getOwner()', value: null, status: 'loading' },
      { label: 'getCallerPrincipal()', value: null, status: 'loading' },
      { label: 'isCallerAdmin()', value: null, status: 'loading' },
      { label: 'isCallerApproved()', value: null, status: 'loading' },
      { label: 'getCallerRole()', value: null, status: 'loading' },
    ]);

    // Run each call independently so one failure doesn't block others
    const calls: Array<{ label: string; fn: () => Promise<string> }> = [
      {
        label: 'getOwner()',
        fn: async () => {
          const result = await actor.getOwner();
          if (result === null || result === undefined) return 'null (no owner set)';
          return String(result);
        },
      },
      {
        label: 'getCallerPrincipal()',
        fn: async () => {
          const result = await actor.getCallerPrincipal();
          return String(result);
        },
      },
      {
        label: 'isCallerAdmin()',
        fn: async () => {
          const result = await actor.isCallerAdmin();
          return String(result);
        },
      },
      {
        label: 'isCallerApproved()',
        fn: async () => {
          const result = await actor.isCallerApproved();
          return String(result);
        },
      },
      {
        label: 'getCallerRole()',
        fn: async () => {
          const result = await actor.getCallerRole();
          return String(result);
        },
      },
    ];

    await Promise.all(
      calls.map(async ({ label, fn }) => {
        try {
          const value = await fn();
          setResults(prev =>
            prev.map(r => (r.label === label ? { ...r, value, status: 'success' as const } : r))
          );
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          setResults(prev =>
            prev.map(r =>
              r.label === label ? { ...r, value: `Error: ${msg}`, status: 'error' as const } : r
            )
          );
        }
      })
    );

    setIsFetching(false);
  };

  useEffect(() => {
    if (isOpen && actor) {
      runDiagnostics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, actor]);

  return (
    <Sheet open={isOpen} onOpenChange={open => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            🔍 Debug Panel
          </SheetTitle>
          <SheetDescription>
            Live canister state diagnostics. Raw values from the backend.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Diagnostic Results</span>
            <Button
              variant="outline"
              size="sm"
              onClick={runDiagnostics}
              disabled={isFetching || !actor}
            >
              {isFetching ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-1" />
              )}
              Refresh
            </Button>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 divide-y divide-border">
            {results.map(result => (
              <div key={result.label} className="px-4 py-3">
                <div className="text-xs font-mono font-semibold text-muted-foreground mb-1">
                  {result.label}
                </div>
                <div className="text-sm font-mono break-all">
                  {result.status === 'loading' ? (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      loading…
                    </span>
                  ) : result.status === 'error' ? (
                    <span className="text-destructive">{result.value}</span>
                  ) : (
                    <span className="text-foreground">{result.value}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {!actor && (
            <p className="text-xs text-muted-foreground text-center">
              Actor not available — please log in first.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
