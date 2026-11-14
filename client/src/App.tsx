import { useCallback, useEffect, useState } from 'react';

import Header from './components/Header/Header';
import RoomList from './components/RoomList/RoomList';
import Chat from './components/Chat/Chat';
import UsernameModal from './components/UsernameModal/UsernameModal';

import { getRooms, createRoom, renameRoom, deleteRoom } from './services/api';

import { sendMessage as emitMessage } from './services/socket';
import { useChatSocket } from './hooks/useChatSocket';

import type { Room, Message } from './types';

function App() {
  const [username, setUsername] = useState(
    () => localStorage.getItem('username') || '',
  );

  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // Load rooms
  useEffect(() => {
    const loadRooms = async () => {
      try {
        const data = await getRooms();

        setRooms(data);

        if (data.length > 0) {
          setActiveRoom(data[0]);
        }
      } catch (error) {
        console.error('Failed to load rooms:', error);
      }
    };

    loadRooms();
  }, []);

  // Save username
  const handleUsernameSubmit = (value: string) => {
    localStorage.setItem('username', value);
    setUsername(value);
  };

  // Clear messages when room changes
  useEffect(() => {
    setMessages([]);
  }, [activeRoom?.id]);

  // Handle incoming messages
  const handleReceiveMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const handleReceiveHistory = useCallback((history: Message[]) => {
    setMessages(history);
  }, []);

  // Socket connection
  useChatSocket({
    username,
    roomId: activeRoom?.id ?? null,
    onMessage: handleReceiveMessage,
    onHistory: handleReceiveHistory,
  });

  // Create room
  const handleCreateRoom = async () => {
    const name = window.prompt('Enter room name:');

    if (!name?.trim()) return;

    try {
      const room = await createRoom(name.trim());

      setRooms((prev) => [...prev, room]);
      setActiveRoom(room);
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  // Rename room
  const handleRenameRoom = async (room: Room) => {
    const name = window.prompt('Enter new room name:', room.name);

    if (!name?.trim()) return;

    try {
      const updatedRoom = await renameRoom(room.id, name.trim());

      setRooms((prev) =>
        prev.map((item) => (item.id === updatedRoom.id ? updatedRoom : item)),
      );

      if (activeRoom?.id === updatedRoom.id) {
        setActiveRoom(updatedRoom);
      }
    } catch (error) {
      console.error('Failed to rename room:', error);
    }
  };

  // Delete room
  const handleDeleteRoom = async (room: Room) => {
    const confirmed = window.confirm(`Delete room "${room.name}"?`);

    if (!confirmed) return;

    try {
      await deleteRoom(room.id);

      const updatedRooms = rooms.filter((item) => item.id !== room.id);

      setRooms(updatedRooms);

      if (activeRoom?.id === room.id) {
        setActiveRoom(updatedRooms[0] ?? null);
      }
    } catch (error) {
      console.error('Failed to delete room:', error);
    }
  };

  // Send message
  const handleSendMessage = (text: string) => {
    if (!activeRoom) return;

    emitMessage(activeRoom.id, text);
  };

  return (
    <div className="flex min-h-screen flex-col">
      {username && <Header username={username} />}

      {username && (
        <div className="flex flex-1 overflow-hidden">
          <RoomList
            rooms={rooms}
            activeRoomId={activeRoom?.id ?? null}
            onSelect={setActiveRoom}
            onCreate={handleCreateRoom}
            onRename={handleRenameRoom}
            onDelete={handleDeleteRoom}
          />

          <Chat
            room={activeRoom}
            messages={messages}
            username={username}
            onSend={handleSendMessage}
          />
        </div>
      )}

      {!username && <UsernameModal onSubmit={handleUsernameSubmit} />}
    </div>
  );
}

export default App;
