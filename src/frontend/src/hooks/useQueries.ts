import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { ApiMatch, UserProfile, MatchLogRecord, UserApprovalInfo, UserRole } from '../backend';
import { ApprovalStatus } from '../backend';
import { Principal } from '@dfinity/principal';
import { extractErrorText } from '../utils/errorText';

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
        return await actor.saveMatch(matchId, matchRecord);
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
        return await actor.updateMatch(matchId, matchRecord);
      } catch (error) {
        const errorText = extractErrorText(error);
        throw new Error(`Failed to update match: ${errorText}`);
      }
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
      if (!actor) throw new Error('Actor not available');
      return actor.setCurrentObjectBallCount(newCount);
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
      if (!actor) throw new Error('Actor not available');
      return actor.completeSession(finalCount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentObjectBallCount'] });
    },
  });
}

export function useIsCallerApproved() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerApproved'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerApproved();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    retry: false,
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
    retry: false,
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
      queryClient.invalidateQueries({ queryKey: ['isCallerApproved'] });
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
    },
  });
}

export function useRejectAllPending() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pendingUsers: Principal[]) => {
      if (!actor) throw new Error('Actor not available');
      await Promise.all(
        pendingUsers.map((user) => actor.setApproval(user, ApprovalStatus.rejected))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
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
    },
  });
}
