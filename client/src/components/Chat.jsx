import React, { useEffect, useState } from 'react';
import MessageList from './MessageList';
import MessageForm from './MessageForm';
import {
  getRoomMessages,
} from '../services/chatService';
import {
  createWebSocket,
} from '../services/websocketService';

const Chat = ({
  room,
  user,
  onLeave,
}) => {
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let ws;

    const loadChat = async () => {
      try {
        setLoading(true);
        setError('');

        // 1. Завантажуємо старі повідомлення
        const oldMessages =
          await getRoomMessages(room.id);

        setMessages(oldMessages);

        // 2. Створюємо WebSocket
        ws = createWebSocket();

        ws.onopen = () => {
          setConnected(true);

          // 3. Повідомляємо серверу,
          // що користувач зайшов у room
          ws.send(
            JSON.stringify({
              type: 'join-room',
              userId: user.id,
              roomId: room.id,
            }),
          );
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);

          if (data.type === 'message') {
            setMessages((prev) => [
              ...prev,
              data.message,
            ]);
          }

          if (data.type === 'error') {
            setError(data.message);
          }
        };

        ws.onerror = () => {
          setError('WebSocket connection error');
        };

        ws.onclose = () => {
          setConnected(false);
        };

        setSocket(ws);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadChat();

    return () => {
      if (ws) {
        ws.close();
      }

      setSocket(null);
      setConnected(false);
    };
  }, [room.id, user.id]);

  const handleSendMessage = (text) => {
    if (!socket) {
      return;
    }

    if (socket.readyState !== WebSocket.OPEN) {
      return;
    }

    socket.send(
      JSON.stringify({
        type: 'message',
        userId: user.id,
        roomId: room.id,
        author: user.name,
        text,
      }),
    );
  };

  const handleLeave = () => {
    if (socket) {
      socket.close();
    }

    onLeave(room);
  };

  if (loading) {
    return (
      <div className="has-text-centered p-6">
        <button className="button is-loading is-white">
          Loading
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        height: 'calc(100vh - 52px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div className="navbar px-4">
        <div className="navbar-brand">
          <div className="navbar-item">
            <strong>
              {room.name}
            </strong>
          </div>
        </div>

        <div className="navbar-end">
          <div className="navbar-item">
            <span
              className={`tag ${
                connected
                  ? 'is-success'
                  : 'is-danger'
              }`}
            >
              {connected
                ? 'Connected'
                : 'Disconnected'}
            </span>
          </div>

          <div className="navbar-item">
            <button
              className="button is-light"
              onClick={handleLeave}
            >
              Leave
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="notification is-danger is-light m-3">
          {error}
        </div>
      )}

      <div style={{ flex: 1, minHeight: 0 }}>
        <MessageList
          messages={messages}
          currentUserId={user.id}
        />
      </div>

      <div className="p-4">
        <MessageForm
          onSend={handleSendMessage}
          disabled={!connected}
        />
      </div>
    </div>
  );
};

export default Chat;
