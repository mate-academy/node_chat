'use client';

import {
  type InfiniteData,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';

import { getMessages } from '@/lib/api';
import type { ChatMessage, MessagesPage } from '@/types/chat';

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:3000';

const MESSAGES_PAGE_SIZE = 30;

type UseRoomMessagesOptions = {
  roomId: string;
  userId: string;
  enabled: boolean;
};

type MessagesQueryData = InfiniteData<MessagesPage, string | null>;

type DeletedMessageEvent = {
  id: string;
  roomId: string;
  deletedAt: string;
};

export function useRoomMessages({
  roomId,
  userId,
  enabled,
}: UseRoomMessagesOptions) {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [socketError, setSocketError] = useState<string | null>(null);

  const queryKey = useMemo(
    () => ['messages', roomId, userId] as const,
    [roomId, userId],
  );

  const messagesQuery = useInfiniteQuery({
    queryKey,

    queryFn: ({ pageParam }) =>
      getMessages(roomId, userId, {
        before: pageParam ?? undefined,
        limit: MESSAGES_PAGE_SIZE,
      }),

    initialPageParam: null as string | null,

    getNextPageParam: (lastPage) =>
      lastPage.hasMore && lastPage.nextCursor ? lastPage.nextCursor : undefined,

    enabled,
  });

  const messages = useMemo(() => {
    const pages = messagesQuery.data?.pages ?? [];
    const uniqueMessages = new Map<string, ChatMessage>();

    [...pages]
      .reverse()
      .flatMap((page) => page.items)
      .forEach((message) => {
        uniqueMessages.set(message.id, message);
      });

    return [...uniqueMessages.values()];
  }, [messagesQuery.data]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const socket = io(SOCKET_URL);

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(false);
      setSocketError(null);

      socket.emit('room:join', {
        roomId,
        userId,
      });
    });

    socket.on('room:joined', () => {
      setIsConnected(true);
      setSocketError(null);
    });

    socket.on('message:created', (message: ChatMessage) => {
      if (message.roomId !== roomId) {
        return;
      }

      queryClient.setQueryData<MessagesQueryData>(queryKey, (currentData) => {
        if (!currentData) {
          return {
            pages: [
              {
                items: [message],
                nextCursor: null,
                hasMore: false,
              },
            ],
            pageParams: [null],
          };
        }

        const messageExists = currentData.pages.some((page) =>
          page.items.some((currentMessage) => currentMessage.id === message.id),
        );

        if (messageExists) {
          return currentData;
        }

        const [latestPage, ...olderPages] = currentData.pages;

        if (!latestPage) {
          return currentData;
        }

        return {
          ...currentData,
          pages: [
            {
              ...latestPage,
              items: [...latestPage.items, message],
            },
            ...olderPages,
          ],
        };
      });
    });

    socket.on('message:updated', (message: ChatMessage) => {
      if (message.roomId !== roomId) {
        return;
      }

      queryClient.setQueryData<MessagesQueryData>(queryKey, (currentData) => {
        if (!currentData) {
          return currentData;
        }

        return {
          ...currentData,
          pages: currentData.pages.map((page) => ({
            ...page,
            items: page.items.map((currentMessage) =>
              currentMessage.id === message.id ? message : currentMessage,
            ),
          })),
        };
      });
    });

    socket.on('message:deleted', (deletedMessage: DeletedMessageEvent) => {
      if (deletedMessage.roomId !== roomId) {
        return;
      }

      queryClient.setQueryData<MessagesQueryData>(queryKey, (currentData) => {
        if (!currentData) {
          return currentData;
        }

        return {
          ...currentData,
          pages: currentData.pages.map((page) => ({
            ...page,
            items: page.items.filter(
              (message) => message.id !== deletedMessage.id,
            ),
          })),
        };
      });
    });

    socket.on(
      'room:members-changed',
      ({ roomId: changedRoomId }: { roomId: string }) => {
        void queryClient.invalidateQueries({
          queryKey: ['rooms', userId],
        });

        void queryClient.invalidateQueries({
          queryKey: ['room', changedRoomId, userId],
        });
      },
    );

    socket.on('exception', (error: unknown) => {
      const message =
        typeof error === 'object' && error !== null && 'message' in error
          ? String(error.message)
          : 'WebSocket error';

      setSocketError(message);
    });

    socket.on('connect_error', (error) => {
      setIsConnected(false);
      setSocketError(error.message || 'Unable to connect');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [enabled, queryClient, queryKey, roomId, userId]);

  const sendMessage = useCallback(
    (text: string) => {
      const normalizedText = text.trim();
      const socket = socketRef.current;

      if (!socket?.connected || !normalizedText) {
        return false;
      }

      setSocketError(null);

      socket.emit('message:send', {
        roomId,
        authorId: userId,
        clientMessageId: crypto.randomUUID(),
        text: normalizedText,
      });

      return true;
    },
    [roomId, userId],
  );

  const editMessage = useCallback(
    (messageId: string, text: string) => {
      const normalizedText = text.trim();
      const socket = socketRef.current;

      if (!socket?.connected || !normalizedText) {
        return false;
      }

      setSocketError(null);

      socket.emit('message:edit', {
        roomId,
        messageId,
        requesterId: userId,
        text: normalizedText,
      });

      return true;
    },
    [roomId, userId],
  );

  const deleteMessage = useCallback(
    (messageId: string) => {
      const socket = socketRef.current;

      if (!socket?.connected) {
        return false;
      }

      setSocketError(null);

      socket.emit('message:delete', {
        roomId,
        messageId,
        requesterId: userId,
      });

      return true;
    },
    [roomId, userId],
  );

  return {
    messages,
    isLoading: messagesQuery.isPending,
    historyError: messagesQuery.error?.message ?? null,
    hasOlderMessages: Boolean(messagesQuery.hasNextPage),
    isLoadingOlderMessages: messagesQuery.isFetchingNextPage,
    loadOlderMessages: messagesQuery.fetchNextPage,
    isConnected,
    socketError,
    sendMessage,
    editMessage,
    deleteMessage,
  };
}
