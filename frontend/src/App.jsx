import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import { MessageForm } from './MessageForm.jsx';
import { MessageList } from './MessageList.jsx';
// #endregion

const API_BASE = 'http://localhost:3005';

const DataLoader = ({ onData }) => {
  useEffect(() => {
    const socket = new WebSocket('ws://localhost:3005');

    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      onData(message);
    });

    return () => socket.close();
  }, [onData]);

  return null;
};

function App() {
  const [messages, setMessages] = useState([]);
  const [room, setRoom] = useState('general');
  const [newRoom, setNewRoom] = useState('');
  const [username, setUsername] = useState(
    () => localStorage.getItem('username') || ''
  );

  function saveUsername(name) {
    localStorage.setItem('username', name);
    setUsername(name);
  }

  function saveData(message) {
    if (message.room === room) {
      setMessages((prev) => [message, ...prev]);
    }
  }

  async function loadRoomMessages(selectedRoom) {
    try {
      const response = await axios.get(
        `${API_BASE}/rooms/${selectedRoom}/messages`
      );

      setMessages(response.data.reverse());
    } catch {
      setMessages([]);
    }
  }

  useEffect(() => {
    loadRoomMessages(room);
  }, [room]);

  if (!username) {
    return (
      <section className="section content">
        <h1 className="title">Enter your name</h1>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            saveUsername(event.target.username.value);
          }}
        >
          <input
            name="username"
            className="input"
            placeholder="Your name"
            required
          />
          <button className="button">Enter</button>
        </form>
      </section>
    );
  }

  return (
    <section className="section content">
      <DataLoader onData={saveData} />

      <h1 className="title">Chat – room: {room}</h1>

      <div style={{ marginBottom: '16px' }}>
        <input
          className="input"
          placeholder="Room name"
          value={newRoom}
          onChange={(e) => setNewRoom(e.target.value)}
        />

        <button
          className="button"
          style={{ marginLeft: '8px' }}
          onClick={() => {
            if (!newRoom) return;
            setRoom(newRoom);
            setNewRoom('');
          }}
        >
          Enter room
        </button>
      </div>

      <MessageForm room={room} username={username} />
      <MessageList messages={messages} />
    </section>
  );
}

export default App;
