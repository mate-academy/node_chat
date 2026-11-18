import { useEffect, useRef, useState } from 'react';
import type { Message, Room } from './types';
import { getRooms } from './api/rooms';
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
    const socket = new WebSocket('ws://localhost:3005');
    socketRef.current = socket;
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'join', roomId: currentId }));
    };

    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.type === 'history') {
        setMessages(data.messages);
      }

      if (data.type === 'message') {
        setMessages((current) => [...current, data.message]);
      }
    };

    return () => socket.close();
  }, [currentId]);

  useEffect(() => {
    getRooms().then(setRooms);
  }, []);

  function handleLogin(name: string) {
    localStorage.setItem('username', name);
    setUsername(name);
  }

  function handleSend(text: string) {
    socketRef.current?.send(
      JSON.stringify({ type: 'message', author: username, text }),
    );
  }

  if (!username) {
    return <UsernameForm onSubmit={handleLogin} />;
  }

  return (
    <section>
      <h1>Chat * {username}</h1>
      <RoomList rooms={rooms} currentId={currentId} onSelect={setCurrentId} />
      <MessageList messages={messages} />
      <MessageForm onSend={handleSend} />
    </section>
  );
};
