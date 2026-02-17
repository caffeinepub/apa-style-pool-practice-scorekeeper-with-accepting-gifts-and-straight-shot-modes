import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { MatchLogRecord, UserProfile, ApprovalStatus, UserApprovalInfo } from '../backend';
import { Principal } from '@icp-sdk/core/principal';

export function useGetAllMatches() {
  const { actor, isFetching } = useActor();

  return useQuery({
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

  return useQuery({
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

export function useDeleteMatches() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (matchIds: string[]) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteMatches(matchIds);
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

export function useGetAgLevelIndex() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['agLevelIndex'],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getAgLevelIndex();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetAgLevelIndex() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newLevel: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setAgLevelIndex(newLevel);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agLevelIndex'] });
    },
  });
}

export function useCompleteAgSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (finalLevel: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.completeAgSession(finalLevel);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agLevelIndex'] });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['callerUserRole'],
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
    mutationFn: async ({ user, role }: { user: Principal; role: any }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.assignCallerUserRole(user, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerUserRole'] });
    },
  });
}

export function useGetInviteOnlyMode() {
  const { actor, isFetching } = useActor();

  return useQuery({
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
      if (!actor) throw new Error('Actor not available');
      return actor.setInviteOnlyMode(enabled);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inviteOnlyMode'] });
    },
  });
}

export function useIsCallerApproved() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['isCallerApproved'],
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
      if (!actor) throw new Error('Actor not available');
      return actor.requestApproval();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isCallerApproved'] });
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
      if (!actor) throw new Error('Actor not available');
      return actor.setApproval(user, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      queryClient.invalidateQueries({ queryKey: ['isCallerApproved'] });
    },
  });
}
