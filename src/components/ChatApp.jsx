/* eslint-disable max-len */
import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './ChatApp.css';

const socket = io('http://localhost:3000', {
  transports: ['websocket', 'polling'],
}); // Connect to your backend server

function ChatApp() {
  const [username, setUsername] = useState(
    window.localStorage.getItem('username') || '',
  );
  const [room, setRoom] = useState('');
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    socket.on('loadMessages', (prevMessages) => setMessages(prevMessages));
    socket.on('newMessage', (msg) => setMessages((prev) => [...prev, msg]));

    return () => {
      socket.off('loadMessages');
      socket.off('newMessage');
    };
  }, []);

  const joinRoom = () => {
    socket.emit('setUsername', username);
    socket.emit('joinRoom', room);

    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('room', room);
    }
    setMessages([]);
  };

  const sendMessage = () => {
    if (message.trim() !== '') {
      socket.emit('sendMessage', { room, message });
      setMessage('');
    }
  };

  return (
    <div className="chat-container">
      <input
        type="text"
        className="input-field"
        id="username"
        autoComplete="username"
        placeholder="Enter username"
        value={username}
        onChange={(e) => {
          setUsername(e.target.value);
          window.localStorage.setItem('username', e.target.value);
        }}
      />
      <input
        type="text"
        id="room"
        autoComplete="off"
        className="input-field"
        placeholder="Enter room"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
      />
      <button className="button" onClick={joinRoom}>
        Join Room
      </button>
      <div className="message-list">
        {messages.map((msg, idx) => (
          <p key={idx} className="message">
            <b>{msg.author}</b> [{new Date(msg.time).toLocaleTimeString()}]:{' '}
            {msg.text}
          </p>
        ))}
      </div>
      <input
        type="text"
        className="input-field"
        id="message"
        autoComplete="off"
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button className="button" onClick={sendMessage}>
        Send
      </button>
    </div>
  );
}

export default ChatApp;
