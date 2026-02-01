import { useEffect, useState } from 'react';
import { socket } from './soket';
import type { Message } from './types/message';
import { MessageList } from './components/MessageList';
import { MessageForm } from './components/MessageForm';
import './App.css';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const onHistory = (history: Message[]) => setMessages(history);
    const onNew = (m: Message) => setMessages((prev) => [...prev, m]);

    socket.on('room:history', onHistory);
    socket.on('message:new', onNew);

    return () => {
      socket.off('room:history', onHistory);
      socket.off('message:new', onNew);
    };
  }, []);

  return (
    <section className="section">
    <div className="container" style={{ maxWidth: 720 }}>
      <div className="box">

        <div className="block">
          <MessageForm onSend={(text) => socket.emit('message:send', text)} />
        </div>

        <MessageList messages={messages} />
      </div>
    </div>
  </section>
  );
}
