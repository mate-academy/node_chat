import { useEffect, useState, useRef } from 'react';
import './styles.css';
import { useNavigate, useParams } from 'react-router-dom';

export default function ChatRoom({ username }) {
  const [messages, setMessages] = useState([]);
  const [roomName, setRoomName] = useState('');
  const [text, setText] = useState('');
  const ws = useRef(null);
  const messagesEndRef = useRef(null);
  const { roomId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!username?.trim()) {
      navigate('/login');
    }
  }, [username, navigate]);

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:5000');

    ws.current.onopen = () => {
      if (username?.trim()) {
        ws.current.send(
          JSON.stringify({ type: 'SET_USERNAME', username: username.trim() })
        );
      }

      if (roomId) {
        ws.current.send(JSON.stringify({ type: 'JOIN_ROOM', roomId }));
      }
    };

    ws.current.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch (e) {
        return e;
      }

      switch (data.type) {
        case 'WELCOME':
        case 'INFO':
          setMessages((prev) => [
            ...prev,
            {
              author: 'System',
              text: data.message,
              time: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
            },
          ]);
          break;

        case 'ROOM_HISTORY':
          setMessages(data.messages);
          setRoomName(data.room);
          break;

        case 'NEW_MESSAGE':
          setMessages((prev) => [...prev, data.message]);
          break;

        default:
          console.warn('Unknown message type:', data.type);
      }
    };

    ws.current.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    return () => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN && roomId) {
      ws.current.send(JSON.stringify({ type: 'JOIN_ROOM', roomId }));
    }
  }, [roomId]);

  const handleSend = () => {
    if (!text.trim() || !ws.current || ws.current.readyState !== WebSocket.OPEN)
      return;

    ws.current.send(JSON.stringify({ type: 'SEND_MESSAGE', text }));
    setText('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h2>{roomName ? `${roomName} Chat` : 'Chat'}</h2>
        <span className="chat-room-name">{username}</span>
      </header>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className="message">
            <span className="message-author">
              {username === msg.author ? 'Me' : msg.author}
            </span>
            <div className="message-text">{msg.text}</div>
            <span className="message-time">{msg.time}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button onClick={handleSend} disabled={!text.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}
