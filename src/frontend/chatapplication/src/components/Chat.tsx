import { useEffect, useState, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { Message } from '../types';
import MessageInput from './MessageInput';

interface ChatProps {
  socket: Socket;
  username: string;
  room: string;
}

export default function Chat({ socket, username, room }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.emit('joinRoom', room);

    const handlePrevious = (msgs: Message[]) => setMessages(msgs);
    const handleNew = (msg: Message) => setMessages((prev) => [...prev, msg]);

    socket.on('previousMessages', handlePrevious);
    socket.on('newMessage', handleNew);

    return () => {
      socket.off('previousMessages', handlePrevious);
      socket.off('newMessage', handleNew);
    };
  }, [room, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (text.trim()) {
      socket.emit('sendMessage', { roomId: room, author: username, text });
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">{room}</div>
      <div className="messages">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`message ${m.author === username ? 'me' : 'other'}`}
          >
            <strong>{m.author}</strong>: {m.text}
            <div className="message-time">{m.time}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput sendMessage={sendMessage} />
    </div>
  );
}
