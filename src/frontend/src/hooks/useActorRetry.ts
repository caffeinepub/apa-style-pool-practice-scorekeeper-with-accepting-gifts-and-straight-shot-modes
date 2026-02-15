import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

/**
 * Hook that provides a retry mechanism for actor initialization.
 * Clears the cached actor query and triggers a refetch without requiring a page refresh.
 */
export function useActorRetry() {
  const queryClient = useQueryClient();

  const retryConnection = useCallback(() => {
    // Remove the cached actor query to force a fresh fetch
    queryClient.removeQueries({ queryKey: ['actor'] });
    // Refetch the actor query
    queryClient.refetchQueries({ queryKey: ['actor'] });
  }, [queryClient]);

  return { retryConnection };
}
