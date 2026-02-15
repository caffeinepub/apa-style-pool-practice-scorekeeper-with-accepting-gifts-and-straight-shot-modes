import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { ApiMatch, UserProfile, MatchLogRecord, UserApprovalInfo, UserRole } from '../backend';
import { ApprovalStatus } from '../backend';
import { Principal } from '@dfinity/principal';
import { extractErrorText } from '../utils/errorText';
import { withTimeout } from '../utils/withTimeout';

// Timeout for save/update operations (30 seconds)
const MUTATION_TIMEOUT_MS = 30000;

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
      if (!actor) {
        throw new Error('Backend connection not ready. Please wait and try again.');
      }
      try {
        return await withTimeout(
          actor.saveMatch(matchId, matchRecord),
          MUTATION_TIMEOUT_MS,
          'Save operation is taking too long. Please try again.'
        );
      } catch (error) {
        const errorText = extractErrorText(error);
        throw new Error(`Failed to save match: ${errorText}`);
      }
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
      if (!actor) {
        throw new Error('Backend connection not ready. Please wait and try again.');
      }
      try {
        return await withTimeout(
          actor.updateMatch(matchId, matchRecord),
          MUTATION_TIMEOUT_MS,
          'Update operation is taking too long. Please try again.'
        );
      } catch (error) {
        const errorText = extractErrorText(error);
        throw new Error(`Failed to update match: ${errorText}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}

export function useDeleteMatch() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (matchId: string) => {
      if (!actor) {
        throw new Error('Backend connection not ready. Please wait and try again.');
      }
      try {
        return await actor.deleteMatch(matchId);
      } catch (error) {
        const errorText = extractErrorText(error);
        throw new Error(`Failed to delete match: ${errorText}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}

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
      if (!actor) {
        throw new Error('Backend connection not ready. Please wait and try again.');
      }
      try {
        return await actor.saveCallerUserProfile(profile);
      } catch (error) {
        const errorText = extractErrorText(error);
        throw new Error(`Failed to save profile: ${errorText}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetInviteOnlyMode() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['inviteOnlyMode'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.getInviteOnlyMode();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetInviteOnlyMode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!actor) {
        throw new Error('Backend connection not ready. Please wait and try again.');
      }
      try {
        return await actor.setInviteOnlyMode(enabled);
      } catch (error) {
        const errorText = extractErrorText(error);
        throw new Error(`Failed to update invite-only mode: ${errorText}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inviteOnlyMode'] });
    },
  });
}

export function useIsCallerApproved() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isApproved'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerApproved();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRequestApproval() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) {
        throw new Error('Backend connection not ready. Please wait and try again.');
      }
      try {
        return await actor.requestApproval();
      } catch (error) {
        const errorText = extractErrorText(error);
        throw new Error(`Failed to request approval: ${errorText}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isApproved'] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
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
      if (!actor) {
        throw new Error('Backend connection not ready. Please wait and try again.');
      }
      try {
        return await actor.setApproval(user, status);
      } catch (error) {
        const errorText = extractErrorText(error);
        throw new Error(`Failed to set approval: ${errorText}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: ['userRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAssignCallerUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, role }: { user: Principal; role: UserRole }) => {
      if (!actor) {
        throw new Error('Backend connection not ready. Please wait and try again.');
      }
      try {
        return await actor.assignCallerUserRole(user, role);
      } catch (error) {
        const errorText = extractErrorText(error);
        throw new Error(`Failed to assign role: ${errorText}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userRole'] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
  });
}

export function useGetCurrentObjectBallCount() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['currentObjectBallCount'],
    queryFn: async () => {
      if (!actor) return BigInt(2);
      return actor.getCurrentObjectBallCount();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetCurrentObjectBallCount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newCount: bigint) => {
      if (!actor) {
        throw new Error('Backend connection not ready. Please wait and try again.');
      }
      try {
        return await actor.setCurrentObjectBallCount(newCount);
      } catch (error) {
        const errorText = extractErrorText(error);
        throw new Error(`Failed to set ball count: ${errorText}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentObjectBallCount'] });
    },
  });
}

export function useCompleteSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (finalCount: bigint) => {
      if (!actor) {
        throw new Error('Backend connection not ready. Please wait and try again.');
      }
      try {
        return await actor.completeSession(finalCount);
      } catch (error) {
        const errorText = extractErrorText(error);
        throw new Error(`Failed to complete session: ${errorText}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentObjectBallCount'] });
    },
  });
}
