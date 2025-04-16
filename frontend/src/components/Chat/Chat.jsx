import { useEffect, useRef, useState } from 'react';
import api from '../../utils/api.js';
import { ChatHeader } from '../ChatHeader/ChatHeader.jsx';
import { NewMessageForm } from '../NewMessageForm/NewMessageForm.jsx';
import { ChatMessages } from '../ChatMessages/ChatMessages.jsx';
import './Chat.css';

export const Chat = () => {
  const [messages, setMessages] = useState([]);
  const socket = useRef();

  const fetchMessages = async () => {
    const messages = await api.getAllMessages();
    console.log('fetchMessages', messages);

    setMessages(messages);
    // fetchMessages();
  };

  useEffect(() => {
    fetchMessages();
    socket.current = new WebSocket('ws://localhost:5000');

    socket.current.onopen = () => {
      console.log('Socket opened');
    };
    socket.current.onmessage = (ev) => {
      const message = JSON.parse(ev.data);
      console.log('message', message);
      if (message.event === 'error') {
        console.log('Error', message);
        return;
      }
      if (message.event === 'message/delete') {
        setMessages((prev) => prev.filter((m) => m.id !== message.id));
        return;
      }
      if (message.event === 'message/update') {
        const updatedMessage = message.message;
        setMessages((prev) =>
          prev.map((m) => (m.id === updatedMessage.id ? updatedMessage : m)),
        );
        return;
      }
      setMessages((prev) => [message, ...prev]);
    };
    socket.current.onerror = (ev) => {
      console.log('socket error', ev);
    };
    socket.current.onclose = () => {
      console.log('Socket closed');
    };

    return () => {
      socket.current.close();
    };
  }, []);

  return (
    <div className="Chat">
      <h1 className="Chat__title">Chat</h1>

      <ChatHeader />

      <NewMessageForm socket={socket} />

      <ChatMessages socket={socket} messages={messages} />
    </div>
  );
};
