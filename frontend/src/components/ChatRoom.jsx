import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { MessageForm } from '../components/MessageForm.jsx';
import { MessageList } from '../components/MessageList.jsx';
import { WebSocketLoader } from '../components/WebSocket.jsx';
import './ChatRoom.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const ChatRoom = ({ userName }) => {
  const [messages, setMessages] = useState([]);
  const [roomName, setRoomName] = useState('');
  const { id: roomId } = useParams();

  const saveData = useCallback(
    (message) => {
      if (message.roomId !== roomId) {
        return;
      }

      setMessages((prevMessages) => {
        if (prevMessages.some((item) => item.id === message.id)) {
          return prevMessages;
        }

        return [message, ...prevMessages];
      });
    },
    [roomId],
  );

  useEffect(() => {
    let ignoreResponse = false;

    setMessages([]);
    setRoomName('');

    const loadRoom = async () => {
      try {
        const [roomResponse, messagesResponse] = await Promise.all([
          axios.get(`${API_URL}/room/${roomId}`),
          axios.get(`${API_URL}/messages`, {
            params: { roomId, userName },
          }),
        ]);

        if (ignoreResponse) {
          return;
        }

        setRoomName(roomResponse.data.name);
        setMessages((currentMessages) => {
          const currentIds = new Set(currentMessages.map((message) => message.id));
          const history = [...messagesResponse.data]
            .reverse()
            .filter((message) => !currentIds.has(message.id));

          return [...currentMessages, ...history];
        });
      } catch (error) {
        if (!ignoreResponse) {
          console.error(error);
        }
      }
    };

    loadRoom();

    return () => {
      ignoreResponse = true;
    };
  }, [roomId, userName]);

  return (
    <section className="chat-room">
      <Link to="/" className="app-button chat-room__back-link">
        Back to lobby
      </Link>
      <p className="chat-room__user">Signed in as: {userName}</p>
      <h2 className="chat-room__title">
        Chat messages{roomName && ` — ${roomName}`}
      </h2>
      <WebSocketLoader onData={saveData} roomId={roomId} userName={userName} />
      <MessageList messages={messages} userName={userName} />
      <MessageForm roomId={roomId} userName={userName} />
    </section>
  );
};
