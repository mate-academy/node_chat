import { useCallback, useEffect, useState } from 'react';
import './App.css';
import { MessageForm } from './components/MessageForm.js';
import { MessageList } from './components/MessageList.js';
import { Message } from './types/message';
import { createRoom, deleteRoom, getMessages, getRooms, renameRoom } from './api.js';
import { WebSocketLoader } from './dataLoader/index.js';
import { UserNameForm } from './components/UserNameForm.js';
import { RoomList } from './components/RoomList.js';
import { Room } from './types/room.js';

export function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState('general');
  const [username, setUsername] = useState(
    localStorage.getItem('username') ?? '',
  );

   async function loadRooms() {
    const roomsFromServer = await getRooms();

    setRooms(roomsFromServer);
  }

  async function loadMessages(roomId = selectedRoomId) {
    const messagesFromServer = await getMessages(roomId);

    setMessages(messagesFromServer);
  }

  const addMessage = useCallback((message: Message) => {
    setMessages(currentMessages => {
      if (message.roomId !== selectedRoomId) {
        return currentMessages;
      }

      const alreadyExists = currentMessages.some(
        currentMessage => currentMessage.time === message.time,
      );

      if (alreadyExists) {
        return currentMessages;
      }

      return [...currentMessages, message];
    });
  }, [selectedRoomId]);

  async function handleCreateRoom(name: string) {
    await createRoom(name);
    await loadRooms();
  }

  async function handleRenameRoom(roomId: string, name: string) {
    await renameRoom(roomId, name);
    await loadRooms();
  }

  async function handleDeleteRoom(roomId: string) {
    await deleteRoom(roomId);
    await loadRooms();

    if (selectedRoomId === roomId) {
      setSelectedRoomId('general');
      await loadMessages('general');
    }
  }

  function handleJoinRoom(roomId: string) {
    setSelectedRoomId(roomId);
  }

  useEffect(() => {
    if (username) {
      loadRooms();
    }
  }, [username]);

  useEffect(() => {
    if (username && selectedRoomId) {
      loadMessages(selectedRoomId);
    }
  }, [username, selectedRoomId]);

  if (!username) {
    return (
      <section className="section content">
        <h1 className="title">Chat application</h1>
        <h2 className="subtitle">Enter your username</h2>

        <UserNameForm onUsernameSaved={setUsername} />
      </section>
    );
  }

  const selectedRoom = rooms.find(room => room.id === selectedRoomId);

  return (
    <section className="section content">
      <h1 className="title">Chat application</h1>
      <p>
        Your username: <strong>{username}</strong>
      </p>

      <WebSocketLoader onMessage={addMessage} />

      <RoomList
        rooms={rooms}
        selectedRoomId={selectedRoomId}
        onJoin={handleJoinRoom}
        onCreate={handleCreateRoom}
        onRename={handleRenameRoom}
        onDelete={handleDeleteRoom}
      />

      <h2 className="subtitle">
        Current room: {selectedRoom?.name ?? selectedRoomId}
      </h2>

      <MessageForm
        username={username}
        roomId={selectedRoomId}
        onMessageSent={() => loadMessages(selectedRoomId)}
      />

      <MessageList messages={messages} />
    </section>
  );
}
