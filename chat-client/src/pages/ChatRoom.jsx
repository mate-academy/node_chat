import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const WS_URL = 'ws://localhost:4000';

const ChatRoom = () => {
  const { roomId } = useParams();
  const username = localStorage.getItem('username');
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const ws = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!username) {
      navigate('/');
      return;
    }

    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      ws.current.send(
        JSON.stringify({
          type: 'join',
          username,
          roomId,
        })
      );
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'history') {
        setMessages(data.messages);
      }

      if (data.type === 'message') {
        setMessages((prev) => [...prev, data.message]);
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket closed');
    };

    return () => {
      ws.current.close();
    };
  }, [roomId, username, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    ws.current.send(
      JSON.stringify({
        type: 'message',
        text: text.trim(),
      })
    );
    setText('');
  };

  const handleLogout = () => {
  console.log('Logout clicked');
  localStorage.removeItem('username');
  navigate('/');
};

  return (
    <section className="section">
      <div className="container">
        <div className="is-flex is-justify-content-space-between is-align-items-center mb-4">
          <button className="button is-link" onClick={() => navigate('/rooms')}>
            Back to rooms
          </button>
          <button className="button is-light" onClick={handleLogout}>
            Logout
          </button>
        </div>
        <h2 className="title">Room: {roomId}</h2>

        <div
          className="box"
          style={{ height: '400px', overflowY: 'auto', padding: '1rem', marginBottom: '1rem' }}
        >
          {messages.map((msg, i) => (
            <div key={i} className="mb-3">
              <b>{msg.author}</b>{' '}
              <small>{new Date(msg.time).toLocaleTimeString()}</small>
              <div>{msg.text}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="is-flex">
          <input
            className="input is-expanded"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your message..."
            autoFocus
          />
          <button className="button is-primary ml-2" type="submit">
            Send
          </button>
        </form>
      </div>
    </section>
  );
};

export default ChatRoom;

