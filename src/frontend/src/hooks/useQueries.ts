import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { type ApiMatch, type MatchLogRecord, type UserProfile, type UserApprovalInfo, ApprovalStatus } from '../backend';
import { Principal } from '@dfinity/principal';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetAllMatches() {
  const { actor, isFetching } = useActor();

  return useQuery<ApiMatch[]>({
    queryKey: ['matches'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMatches();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMatch(matchId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<ApiMatch | null>({
    queryKey: ['match', matchId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMatch(matchId);
    },
    enabled: !!actor && !isFetching && !!matchId,
  });
}

export function useSaveMatch() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ matchId, matchRecord }: { matchId: string; matchRecord: MatchLogRecord }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveMatch(matchId, matchRecord);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}

export function useUpdateMatch() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ matchId, matchRecord }: { matchId: string; matchRecord: MatchLogRecord }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateMatch(matchId, matchRecord);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['match', variables.matchId] });
    },
  });
}

export function useDeleteMatch() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (matchId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteMatch(matchId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}

// Accepting Gifts persistence hooks
export function useGetCurrentObjectBallCount() {
  const { actor, isFetching } = useActor();

  return useQuery<number>({
    queryKey: ['acceptingGiftsBaseline'],
    queryFn: async () => {
      if (!actor) return 3;
      const count = await actor.getCurrentObjectBallCount();
      return Number(count);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetCurrentObjectBallCount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newCount: number) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.setCurrentObjectBallCount(BigInt(newCount));
      return Number(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acceptingGiftsBaseline'] });
    },
  });
}

export function useCompleteSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (finalCount: number) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.completeSession(BigInt(finalCount));
      return Number(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acceptingGiftsBaseline'] });
    },
  });
}

// Access control hooks with graceful error handling
export function useIsCallerApproved() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isApproved'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerApproved();
      } catch (error) {
        // If authorization fails, treat as not approved but don't block
        console.warn('Failed to check approval status:', error);
        return false;
      }
    },
    enabled: !!actor && !isFetching,
    retry: 1,
    staleTime: 30000,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch (error) {
        // If authorization fails, treat as not admin
        console.warn('Failed to check admin status:', error);
        return false;
      }
    },
    enabled: !!actor && !isFetching,
    retry: 1,
    staleTime: 30000,
  });
}

export function useRequestApproval() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.requestApproval();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isApproved'] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
  });
}

export function useGetInviteOnlyMode() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['inviteOnlyMode'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.getInviteOnlyMode();
      } catch (error) {
        // If we can't read invite-only mode, default to public mode (false)
        console.warn('Failed to check invite-only mode, defaulting to public:', error);
        return false;
      }
    },
    enabled: !!actor && !isFetching,
    retry: 1,
    staleTime: 30000,
  });
}

export function useSetInviteOnlyMode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setInviteOnlyMode(enabled);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inviteOnlyMode'] });
      queryClient.invalidateQueries({ queryKey: ['isApproved'] });
    },
  });
}

export function useListApprovals() {
  const { actor, isFetching } = useActor();

  return useQuery<UserApprovalInfo[]>({
    queryKey: ['approvals'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listApprovals();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetApproval() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, status }: { user: Principal; status: ApprovalStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setApproval(user, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      queryClient.invalidateQueries({ queryKey: ['isApproved'] });
    },
  });
}

export function useRejectAllPending() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pendingUsers: UserApprovalInfo[]) => {
      if (!actor) throw new Error('Actor not available');
      
      // Reject all pending users in sequence
      for (const userInfo of pendingUsers) {
        if (userInfo.status === ApprovalStatus.pending) {
          await actor.setApproval(userInfo.principal, ApprovalStatus.rejected);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
  });
}
