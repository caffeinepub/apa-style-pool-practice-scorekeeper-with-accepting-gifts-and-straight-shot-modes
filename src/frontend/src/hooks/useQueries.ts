import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { type ApiMatch, type MatchRecord, type UserProfile } from '../backend';

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
    mutationFn: async ({ matchId, matchRecord }: { matchId: string; matchRecord: MatchRecord }) => {
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
    mutationFn: async ({ matchId, matchRecord }: { matchId: string; matchRecord: MatchRecord }) => {
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
