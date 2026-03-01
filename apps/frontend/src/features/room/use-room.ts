import type { Room } from '@playgrid/shared/schemas';
import type {
  CreateRoomResponse,
  GenerateInviteResponse,
  JoinRoomResponse,
  RevokeInvitePayload,
} from './room-service';
import { queryOptions, useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useRoomSession } from '@/features/room/room-store';
import { useGameMode } from '@/hooks/use-game-mode';
import { logger } from '@/utils/logger';
import { createGameRoom, generateInviteToken, getRoomById, joinGameRoom, revokeInviteToken, validateInviteToken } from './room-service';

interface UseCreateRoomProps {
  onSuccess?: (data: CreateRoomResponse) => void;
}

export function useCreateRoom({ onSuccess }: UseCreateRoomProps = {}) {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { setSession } = useRoomSession();

  return useMutation({
    mutationFn: createGameRoom,
    onSuccess: (data) => {
      if (data.hostPlayer && data.credentials) {
        setSession({
          roomId: data.id,
          playerId: data.hostPlayer.id,
          playerName: data.hostPlayer.name,
          credentials: data.credentials,
          initialGameState: data.initialGameState || null,
          inviteToken: data.inviteToken || null,
          inviteExpiresAt: data.inviteExpiresAt || null,
        });
      }
      else {
        logger.warn('No hostPlayer or credentials in create room response');
      }

      onSuccess?.(data);
      const gameType = data.gameType;
      const lang = i18n.language;
      navigate(`/${lang}/${gameType}?mode=multiplayer&room=${data.id}&host=true`);
    },
  });
}

interface UseJoinRoomProps {
  onSuccess?: (data: JoinRoomResponse) => void;
}

export function useJoinRoom({ onSuccess }: UseJoinRoomProps = {}) {
  const { setSession } = useRoomSession();

  return useMutation({
    mutationFn: async (variables: { roomId: string; playerName: string }) => {
      const response = await joinGameRoom(variables.roomId, {
        playerName: variables.playerName,
      });

      if (response.player && response.credentials && variables.roomId) {
        setSession({
          roomId: variables.roomId,
          playerId: response.player.id,
          playerName: response.player.name,
          credentials: response.credentials,
          initialGameState: null,
        });
      }
      else {
        logger.warn('No player or credentials in join room response');
      }

      return response;
    },
    onSuccess: (data) => {
      onSuccess?.(data);
    },
  });
}

interface UseRoomStatsOptions {
  roomId?: Room['id'] | null;
}

export function roomStatsQueryOptions(roomId?: Room['id'] | null) {
  return queryOptions({
    queryKey: ['room', roomId],
    queryFn: () => {
      if (!roomId) {
        throw new Error('Room ID is required');
      }
      return getRoomById(roomId);
    },
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
    refetchInterval: 5000,
  });
}

export function useRoomStats({ roomId }: UseRoomStatsOptions) {
  const { mode } = useGameMode();
  const query = useQuery({
    ...roomStatsQueryOptions(roomId),
    enabled: mode === 'multiplayer' && !!roomId,
  });

  return {
    room: query.data,
    isError: query.isError,
    error: query.error,
    isPending: query.isPending,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
  };
}

interface UseGenerateInviteProps {
  onSuccess?: (data: GenerateInviteResponse) => void;
}

export function useGenerateInvite({ onSuccess }: UseGenerateInviteProps = {}) {
  return useMutation({
    mutationFn: async ({ roomId, expiresInMinutes }: { roomId: string; expiresInMinutes?: number }) => {
      const payload = expiresInMinutes !== undefined ? { expiresInMinutes } : undefined;
      return generateInviteToken(roomId, payload);
    },
    onSuccess: (data) => {
      onSuccess?.(data);
    },
  });
}

interface UseRevokeInviteProps {
  onSuccess?: () => void;
}

export function useRevokeInvite({ onSuccess }: UseRevokeInviteProps = {}) {
  return useMutation({
    mutationFn: async ({ roomId, inviteToken }: { roomId: string; inviteToken: string }) => {
      return revokeInviteToken(roomId, { inviteToken } as RevokeInvitePayload);
    },
    onSuccess: () => {
      onSuccess?.();
    },
  });
}

export function useValidateInvite({ roomId, token }: { roomId?: string | null; token?: string | null }) {
  const query = useQuery({
    queryKey: ['invite', roomId, token],
    queryFn: async () => {
      if (!roomId || !token) {
        throw new Error('Room ID and token are required');
      }
      return validateInviteToken(roomId, token);
    },
    enabled: !!roomId && !!token,
    retry: false,
  });

  return {
    isValid: query.data?.valid ?? false,
    inviteRoomId: query.data?.roomId,
    expiresAt: query.data?.expiresAt,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
