import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type SubmitEvent,
} from 'react';
import { getChatSocket } from './chatSocket';
import {
  appendUniqueMessage,
  duplicateRoomMessage,
  getHashRoomName,
  markNewMessages,
  upsertRoom,
  usernameKey,
  type DisplayMessage,
} from './chatPageUtils';
import type { Room } from './types';

function useChatPage() {
  const storedUsername = localStorage.getItem(usernameKey);
  const username = storedUsername?.trim() || 'guest';
  const [rooms, setRooms] = useState<Room[]>([]);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [activeRoomName, setActiveRoomName] = useState(getHashRoomName());
  const [messageRoomName, setMessageRoomName] = useState('');
  const [messageText, setMessageText] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [error, setError] = useState('');
  const chatSocket = useMemo(() => getChatSocket(username), [username]);
  const activeRoomNameRef = useRef(activeRoomName);
  const loadedRoomNameRef = useRef<string | null>(null);
  const displayedMessages =
    activeRoomName &&
    activeRoomName.toLowerCase() === messageRoomName.toLowerCase()
      ? messages
      : [];
  const joinedRooms = useMemo(
    () => rooms.filter((room) => room.joined),
    [rooms],
  );

  const activeRoom = useMemo(
    () => rooms.find((room) => room.name === activeRoomName),
    [activeRoomName, rooms],
  );

  useEffect(() => {
    activeRoomNameRef.current = activeRoomName;
  }, [activeRoomName]);

  const showRooms = useCallback((nextRooms: Room[]) => {
    setRooms(nextRooms);

    const firstJoinedRoom = nextRooms.find((room) => room.joined);

    if (!getHashRoomName() && firstJoinedRoom) {
      globalThis.history.replaceState(
        null,
        '',
        `/chat#${encodeURIComponent(firstJoinedRoom.name)}`,
      );
      setActiveRoomName(firstJoinedRoom.name);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    chatSocket
      .fetchRooms()
      .then((nextRooms) => {
        if (ignore) {
          return;
        }

        showRooms(nextRooms);
      })
      .catch(() => {
        if (!ignore) {
          setError('Could not load rooms.');
        }
      });

    const stopRoomUpdates = chatSocket.on('rooms:update', (nextRooms) => {
      if (!ignore) {
        showRooms(nextRooms);
      }
    });

    const stopRoomRenames = chatSocket.on('room:renamed', (event) => {
      if (activeRoomNameRef.current !== event.oldName) {
        return;
      }

      globalThis.history.replaceState(
        null,
        '',
        `/chat#${encodeURIComponent(event.room.name)}`,
      );
      setActiveRoomName(event.room.name);
    });

    const stopRoomDeletes = chatSocket.on('room:deleted', (event) => {
      if (activeRoomNameRef.current !== event.name) {
        return;
      }

      globalThis.history.replaceState(null, '', '/chat');
      loadedRoomNameRef.current = null;
      setMessages([]);
      setMessageRoomName('');
      setActiveRoomName('');
    });

    const handleHashChange = () => {
      setActiveRoomName(getHashRoomName());
    };

    globalThis.addEventListener('hashchange', handleHashChange);

    return () => {
      ignore = true;
      stopRoomUpdates();
      stopRoomRenames();
      stopRoomDeletes();
      globalThis.removeEventListener('hashchange', handleHashChange);
    };
  }, [chatSocket, showRooms]);

  useEffect(() => {
    if (!activeRoomName) {
      return;
    }

    let ignore = false;

    chatSocket
      .joinRoom(activeRoomName)
      .then((room) => {
        if (ignore) {
          return;
        }

        if (activeRoomName !== room.name) {
          globalThis.history.replaceState(
            null,
            '',
            `/chat#${encodeURIComponent(room.name)}`,
          );
          setActiveRoomName(room.name);
        }

        setRooms((currentRooms) => upsertRoom(currentRooms, room));
      })
      .catch(() => {
        if (!ignore) {
          setError('Could not join that room.');
        }
      });

    return () => {
      ignore = true;
    };
  }, [activeRoomName, chatSocket]);

  useEffect(() => {
    if (!activeRoomName) {
      loadedRoomNameRef.current = null;
      return;
    }

    let ignore = false;

    chatSocket
      .fetchMessages(activeRoomName)
      .then((nextMessages) => {
        if (ignore) {
          return;
        }

        setMessageRoomName(activeRoomName);
        setMessages((currentMessages) =>
          markNewMessages(
            nextMessages,
            currentMessages,
            loadedRoomNameRef.current === activeRoomName,
          ),
        );
        loadedRoomNameRef.current = activeRoomName;
      })
      .catch(() => {
        if (!ignore) {
          setMessages([]);
          setMessageRoomName('');
          setError('Could not load messages.');
        }
      });

    return () => {
      ignore = true;
    };
  }, [activeRoomName, chatSocket]);

  useEffect(() => {
    return chatSocket.on('messages:created', (event) => {
      if (
        activeRoomNameRef.current.toLowerCase() !== event.roomName.toLowerCase()
      ) {
        return;
      }

      setMessages((currentMessages) =>
        appendUniqueMessage(currentMessages, {
          ...event.message,
          shouldAnimate: true,
        }),
      );
      setMessageRoomName(event.roomName);
      loadedRoomNameRef.current = event.roomName;
    });
  }, [chatSocket]);

  const handleCreateRoom = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get('roomName') || '').trim();

    if (!name) {
      setError('Enter a room name.');

      return;
    }

    try {
      const room = await chatSocket.createRoom(name);

      setRooms((currentRooms) => upsertRoom(currentRooms, room));
      setIsCreatingRoom(false);
      setError('');
      form.reset();
      globalThis.location.hash = encodeURIComponent(room.name);
      setActiveRoomName(room.name);
    } catch (error) {
      setError(
        error instanceof Error && error.message === duplicateRoomMessage
          ? error.message
          : 'Could not create that room.',
      );
    }
  };

  const handlePostMessage = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const body = messageText.trim();

    if (!activeRoomName || !body) {
      return;
    }

    try {
      await chatSocket.postMessage(activeRoomName, body);

      setMessageText('');
    } catch {
      setError('Could not send your message.');
    }
  };

  const handleLeaveActiveRoom = async () => {
    if (!activeRoom) {
      return;
    }

    try {
      await chatSocket.leaveRoom(activeRoom.name);
      globalThis.location.assign('/rooms');
    } catch {
      setError('Could not leave that room.');
    }
  };

  return {
    activeRoom,
    activeRoomName,
    displayedMessages,
    error,
    handleCreateRoom,
    handleLeaveActiveRoom,
    handlePostMessage,
    isCreatingRoom,
    joinedRooms,
    messageText,
    setIsCreatingRoom,
    setMessageText,
    username,
  };
}

export default useChatPage;
