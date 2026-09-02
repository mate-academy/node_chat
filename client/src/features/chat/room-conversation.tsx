'use client';

import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

import type { ChatProfile, ChatRoom } from '@/types/chat';

import { JoinRoomPrompt } from './conversation/join-room-prompt';
import { MessageComposer } from './conversation/message-composer';
import { MessageList } from './conversation/message-list';
import { useRoomMessages } from './use-room-messages';

type RoomConversationProps = {
  profile: ChatProfile;
  room: ChatRoom;
};

type ScrollSnapshot = {
  scrollHeight: number;
  scrollTop: number;
};

const NEAR_BOTTOM_DISTANCE = 120;
const LOAD_OLDER_ROOT_MARGIN = '120px 0px 0px';

export function RoomConversation({ profile, room }: RoomConversationProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const topSentinelRef = useRef<HTMLDivElement | null>(null);
  const initialScrollCompletedRef = useRef(false);
  const isNearBottomRef = useRef(true);
  const scrollSnapshotRef = useRef<ScrollSnapshot | null>(null);

  const isMember = room.members.some((member) => member.userId === profile.id);

  const {
    messages,
    isLoading,
    historyError,
    hasOlderMessages,
    isLoadingOlderMessages,
    loadOlderMessages,
    isConnected,
    socketError,
    sendMessage,
    editMessage,
    deleteMessage,
  } = useRoomMessages({
    roomId: room.id,
    userId: profile.id,
    enabled: isMember,
  });

  const loadOlder = useCallback(async () => {
    const container = scrollContainerRef.current;

    if (
      !container ||
      !hasOlderMessages ||
      isLoadingOlderMessages ||
      scrollSnapshotRef.current
    ) {
      return;
    }

    scrollSnapshotRef.current = {
      scrollHeight: container.scrollHeight,
      scrollTop: container.scrollTop,
    };

    try {
      const result = await loadOlderMessages();

      if (result.isError) {
        scrollSnapshotRef.current = null;
      }
    } catch {
      scrollSnapshotRef.current = null;
    }
  }, [hasOlderMessages, isLoadingOlderMessages, loadOlderMessages]);

  useLayoutEffect(() => {
    const container = scrollContainerRef.current;

    if (!container || isLoading) {
      return;
    }

    const snapshot = scrollSnapshotRef.current;

    if (snapshot) {
      const addedHeight = container.scrollHeight - snapshot.scrollHeight;

      container.scrollTop = snapshot.scrollTop + addedHeight;
      scrollSnapshotRef.current = null;

      return;
    }

    if (!initialScrollCompletedRef.current) {
      container.scrollTop = container.scrollHeight;
      initialScrollCompletedRef.current = true;
      isNearBottomRef.current = true;

      return;
    }

    if (isNearBottomRef.current) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [isLoading, messages.length]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    const sentinel = topSentinelRef.current;

    if (!container || !sentinel || !initialScrollCompletedRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void loadOlder();
        }
      },
      {
        root: container,
        rootMargin: LOAD_OLDER_ROOT_MARGIN,
        threshold: 0,
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [loadOlder, messages.length]);

  function handleScroll() {
    const container = scrollContainerRef.current;

    if (!container) {
      return;
    }

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    isNearBottomRef.current = distanceFromBottom < NEAR_BOTTOM_DISTANCE;
  }

  function handleMessageSent() {
    isNearBottomRef.current = true;
  }

  if (!isMember) {
    return <JoinRoomPrompt roomId={room.id} userId={profile.id} />;
  }

  const errorMessage = historyError ?? socketError;
  const hasMessages = messages.length > 0;
  const isConversationEmpty = !isLoading && !hasMessages;
  const isBeginningVisible = !hasOlderMessages && hasMessages;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 [scrollbar-gutter:stable] sm:px-5 sm:py-5 lg:px-8 lg:py-6"
        onScroll={handleScroll}
        ref={scrollContainerRef}
      >
        <div className="mx-auto w-full max-w-4xl">
          <div aria-hidden="true" className="h-px" ref={topSentinelRef} />

          {isLoadingOlderMessages && (
            <p
              aria-live="polite"
              className="pb-4 text-center text-xs text-muted-foreground sm:pb-5 sm:text-sm"
            >
              Loading older messages...
            </p>
          )}

          {isBeginningVisible && (
            <p className="pb-2 text-center text-xs text-muted-foreground">
              Beginning of conversation
            </p>
          )}

          {isLoading && (
            <p
              aria-live="polite"
              className="py-6 text-center text-sm text-muted-foreground"
            >
              Loading messages...
            </p>
          )}

          {errorMessage && (
            <p
              aria-live="polite"
              className="mb-3 rounded-xl bg-destructive/5 px-3 py-2.5 text-sm text-destructive sm:mb-4 sm:px-4 sm:py-3"
            >
              {errorMessage}
            </p>
          )}

          {isConversationEmpty && (
            <div className="px-4 py-10 text-center text-muted-foreground sm:py-12">
              <p className="text-sm sm:text-base">No messages yet.</p>

              <p className="mt-1 text-xs sm:text-sm">
                Send the first message in this room.
              </p>
            </div>
          )}

          <MessageList
            currentUserId={profile.id}
            messages={messages}
            onDelete={deleteMessage}
            onEdit={editMessage}
          />
        </div>
      </div>

      <MessageComposer
        isConnected={isConnected}
        onMessageSent={handleMessageSent}
        onSend={sendMessage}
        roomName={room.name}
      />
    </div>
  );
}
