import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type SubmitEvent,
} from 'react';
import { getChatSocket } from './chatSocket';
import type { Room } from './types';

const usernameKey = 'chat.username';
const duplicateRoomMessage = 'A room with that name already exists.';

function getUsernameKey(username: string) {
  return username.toLowerCase();
}

function getStoredUsername() {
  const storedUsername = localStorage.getItem(usernameKey);

  return storedUsername?.trim() || 'guest';
}

function useRoomsPage() {
  const username = getStoredUsername();
  const currentUsernameKey = getUsernameKey(username);
  const chatSocket = useMemo(() => getChatSocket(username), [username]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [search, setSearch] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [renameTarget, setRenameTarget] = useState<Room | null>(null);
  const [renameName, setRenameName] = useState('');
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Room | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState('');

  const visibleRooms = useMemo(
    () =>
      rooms.filter((room) =>
        room.name.toLowerCase().includes(search.trim().toLowerCase()),
      ),
    [rooms, search],
  );

  useEffect(() => {
    let ignore = false;

    chatSocket
      .fetchRooms()
      .then((nextRooms) => {
        if (!ignore) {
          setRooms(nextRooms);
        }
      })
      .catch(() => {
        if (!ignore) {
          setError('Could not load rooms.');
        }
      });

    const stopRoomUpdates = chatSocket.on('rooms:update', (nextRooms) => {
      if (!ignore) {
        setRooms(nextRooms);
      }
    });

    return () => {
      ignore = true;
      stopRoomUpdates();
    };
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

      setRooms((currentRooms) => {
        const roomExists = currentRooms.some(
          (currentRoom) => currentRoom.name === room.name,
        );

        if (roomExists) {
          return currentRooms.map((currentRoom) =>
            currentRoom.name === room.name ? room : currentRoom,
          );
        }

        return [...currentRooms, room];
      });
      setIsCreatingRoom(false);
      setError('');
      form.reset();
    } catch (error) {
      setError(
        error instanceof Error && error.message === duplicateRoomMessage
          ? error.message
          : 'Could not create that room.',
      );
    }
  };

  const canManageRoom = (room: Room) =>
    room.creatorUsernameKey === currentUsernameKey;

  const openRenameModal = (room: Room) => {
    setRenameTarget(room);
    setRenameName(room.name);
    setRenameDialogOpen(true);
  };

  const handleRenameDialogOpenChange = useCallback((open: boolean) => {
    setRenameDialogOpen(open);
    if (!open) {
      setRenameTarget(null);
      setRenameName('');
    }
  }, []);

  const renameRoom = async (roomToRename: Room, nextName: string) => {
    const cleanNextName = nextName.trim();

    if (!cleanNextName || cleanNextName === roomToRename.name) {
      return null;
    }

    try {
      const room = await chatSocket.renameRoom(
        roomToRename.name,
        cleanNextName,
      );

      setRooms((currentRooms) =>
        currentRooms.map((currentRoom) =>
          currentRoom.name === roomToRename.name ? room : currentRoom,
        ),
      );
      setError('');

      return room;
    } catch {
      setError('Could not rename that room.');

      return null;
    }
  };

  const handleRenameRoom = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!renameTarget) {
      return;
    }

    const room = await renameRoom(renameTarget, renameName);

    if (room) {
      setRenameDialogOpen(false);
    }
  };

  const openDeleteModal = (room: Room) => {
    setDeleteTarget(room);
    setDeleteConfirmation('');
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogOpenChange = useCallback((open: boolean) => {
    setDeleteDialogOpen(open);
    if (!open) {
      setDeleteTarget(null);
      setDeleteConfirmation('');
    }
  }, []);

  const handleDeleteRoom = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (deleteConfirmation !== deleteTarget?.name) {
      return;
    }

    try {
      await chatSocket.deleteRoom(deleteTarget.name);
      setRooms((currentRooms) =>
        currentRooms.filter((room) => room.name !== deleteTarget.name),
      );
      setDeleteDialogOpen(false);
      setError('');
    } catch {
      setError('Could not delete that room.');
    }
  };

  const handleLeaveRoom = async (room: Room) => {
    if (!room.joined) {
      return;
    }

    try {
      const nextRoom = await chatSocket.leaveRoom(room.name);

      setRooms((currentRooms) =>
        currentRooms.map((currentRoom) =>
          currentRoom.name === room.name ? nextRoom : currentRoom,
        ),
      );
      setError('');
    } catch {
      setError('Could not leave that room.');
    }
  };

  return {
    canManageRoom,
    deleteConfirmation,
    deleteDialogOpen,
    deleteTarget,
    error,
    handleCreateRoom,
    handleDeleteDialogOpenChange,
    handleDeleteRoom,
    handleLeaveRoom,
    handleRenameDialogOpenChange,
    handleRenameRoom,
    isCreatingRoom,
    openDeleteModal,
    openRenameModal,
    renameRoom,
    renameDialogOpen,
    renameName,
    renameTarget,
    search,
    setDeleteConfirmation,
    setIsCreatingRoom,
    setRenameName,
    setSearch,
    visibleRooms,
  };
}

export default useRoomsPage;
