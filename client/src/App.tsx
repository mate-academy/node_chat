import { useEffect, useRef, useState } from 'react';
import type { Message, Room } from './types';
import { getRooms, createRoom, renameRoom, deleteRoom } from './api/rooms';
import { UsernameForm } from './components/UsernameForm';
import { MessageList } from './components/MessageList';
import { MessageForm } from './components/MessageForm';
import { RoomList } from './components/RoomList';

export const App = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [username, setUsername] = useState<string>(
    () => localStorage.getItem('username') || '',
  );
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentId, setCurrentId] = useState<string>('general');
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!username) {
      return;
    }

    const socket = new WebSocket('ws://localhost:3005');
    socketRef.current = socket;
    socket.onopen = () => {
      socket.send(
        JSON.stringify({ type: 'join', roomId: currentId, username }),
      );
    };

    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.type === 'history') {
        setMessages(data.messages);
      }

      if (data.type === 'message') {
        setMessages((current) => [...current, data.message]);
      }

      if (data.type === 'rooms') {
        setRooms(data.rooms);
        if (!data.rooms.some((room: Room) => room.id === currentId)) {
          setCurrentId('general');
        }
      }
    };

    return () => socket.close();
  }, [currentId, username]);

  useEffect(() => {
    getRooms().then(setRooms);
  }, []);

  //#region Handle logic
  function handleLogin(name: string) {
    localStorage.setItem('username', name);
    setUsername(name);
  }

  function handleSend(text: string) {
    socketRef.current?.send(JSON.stringify({ type: 'message', text }));
  }

  function handleCreate(name: string) {
    createRoom(name);
  }

  function handleRename(id: string) {
    const newName = window.prompt('New name');
    if (!newName) {
      return null;
    }

    renameRoom(id, newName);
  }

  function handleDelete(id: string) {
    deleteRoom(id);
  }

  //#endregion

  if (!username) {
    return <UsernameForm onSubmit={handleLogin} />;
  }

  return (
    <section>
      <h1>Chat * {username}</h1>
      <RoomList
        rooms={rooms}
        currentId={currentId}
        onSelect={setCurrentId}
        onCreate={handleCreate}
        onRemove={handleDelete}
        onRename={handleRename}
      />
      <MessageList messages={messages} />
      <MessageForm onSend={handleSend} />
    </section>
  );
};
