import { useState, useEffect } from 'react';
import './App.css';
import { MessageForm } from './MessageForm.jsx';
import { MessageList } from './MessageList.jsx';
import { NameForm } from './NameForm.jsx';
import { RoomList } from './RoomList.jsx';

const DataLoader = ({ room, onData }) => {
  useEffect(() => {
    const socket = new WebSocket(`ws://127.0.0.1:3000?room=${room}`);

    socket.addEventListener('message', (event) => {
      onData(JSON.parse(event.data));
    });

    return () => socket.close();
  }, [room]);

  return null;
};

export function App() {
  const [messages, setMessages] = useState([]);
  const [room, setRoom] = useState('');

  const [username, setUsername] = useState(
    () => localStorage.getItem('username') || '',
  );

  function saveData(message) {
    setMessages((current) => [...current, message]);
  }

  function handleLogin(name) {
    localStorage.setItem('username', name);
    setUsername(name);
  }

  function handleJoinRoom(name) {
    setMessages([]);
    setRoom(name);
  }

  return (
    <section className="section content">
      {!username ? (
        <NameForm onSubmit={handleLogin} />
      ) : !room ? (
        <RoomList onJoin={handleJoinRoom} />
      ) : (
        <>
          <DataLoader room={room} onData={saveData} />
          <button className="button" onClick={() => setRoom('')}>
            Leave
          </button>
          <MessageForm username={username} room={room} />
          <MessageList messages={messages} />
        </>
      )}
    </section>
  );
}
