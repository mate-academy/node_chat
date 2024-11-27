import React, { useEffect, useState } from 'react';
import { MessageList } from './MessageList';
import { MessageForm } from './MessageForm';

export const ChatRoom = ({ roomId, roomName, username, socket }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadMessages = async () => {
    try {
      const response = await fetch(`http://localhost:3005/rooms/${roomId}/messages`);
      if (!response.ok) {
        throw new Error('Ошибка при загрузке сообщений');
      }
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Loading error:', error);
      setErrorMessage('Message download failed');
    }
  };

  useEffect(() => {
    if (roomId) {
      loadMessages();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const sendMessage = () => {
    if (!newMessage.trim()) {
      setErrorMessage('Введите сообщение');
      return;
    }

    if (!username || username.trim() === "") {
      setErrorMessage('Пожалуйста, введите ваше имя');
      return;
    }

    if (socket && roomId) {
      const messageData = {
        action: 'sendMessage',
        roomId,
        username,
        messageText: newMessage,
        time: new Date().toLocaleString()
      };

      socket.send(JSON.stringify(messageData));
      setNewMessage('');
      setErrorMessage('');
    } else {
      setErrorMessage('Ошибка соединения');
    }
  };

  useEffect(() => {
    if (socket && roomId) {
      socket.send(JSON.stringify({ action: 'joinRoom', roomId }));

      socket.onmessage = (event) => {
        console.log('Received WebSocket message:', event.data);
        const response = JSON.parse(event.data);

        if (response.history) {
          setMessages(response.history);
        } else if (response.newMessage) {
          setMessages((prevMessages) => [...prevMessages, response.newMessage]);
        } else if (response.error) {
          setErrorMessage(response.error);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setErrorMessage('WebSocket connection error');
      };

      socket.onclose = () => {
        console.log('WebSocket connection closed');
        setErrorMessage('WebSocket connection closed');
      };
    }
  }, [roomId, socket]);

  return (
    <div>
      <h2>{roomName}</h2>
      <MessageList messages={messages} username={username} roomId={roomId} />
      <MessageForm
        messageText={newMessage}
        setMessageText={setNewMessage}
        sendMessage={sendMessage}
      />

      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </div>
  );
};

