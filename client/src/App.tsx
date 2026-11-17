import { useEffect, useRef, useState } from 'react';
import type { Message } from './types';
import { UsernameForm } from './components/UsernameForm';
import { MessageList } from './components/MessageList';
import { MessageForm } from './components/MessageForm';

export const App = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [username, setUsername] = useState<string>(
    () => localStorage.getItem('username') || '',
  );
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:3005');
    socketRef.current = socket;

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
  }, []);

  function handleLogin(name: string) {
    localStorage.setItem('username', name);
    setUsername(name);
  }

  function handleSend(text: string) {
    const message = { author: username, text };
    socketRef.current?.send(JSON.stringify(message));
  }

  if (!username) {
    return <UsernameForm onSubmit={handleLogin} />;
  }

  return (
    <section>
      <h1>Chat * {username}</h1>
      <MessageList messages={messages} />
      <MessageForm onSend={handleSend} />
    </section>
  );
};
