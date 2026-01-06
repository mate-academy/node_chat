import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import Chat from './components/Chat';
import RoomList from './components/RoomList';
import './App.css';

export interface Message {
  author: string;
  time: string;
  text: string;
}

export const socket: Socket = io('http://localhost:3001');
socket.on('connect', () => {
  console.log('✅ Conectado ao backend!', socket.id);
});

socket.on('disconnect', () => {
  console.log('❌ Desconectado do backend');
});

function App() {
  const [username, setUsername] = useState<string>(localStorage.getItem('username') || '');
  const [currentRoom, setCurrentRoom] = useState<string>('');
  const [rooms, setRooms] = useState<string[]>([]);

  useEffect(() => {
    socket.on('roomList', setRooms);
    return () => {
      socket.off('roomList');
    };
  }, []);

  const saveUsername = (name: string) => {
    if (name.trim()) {
      setUsername(name);
      localStorage.setItem('username', name);
    }
  };

  return (
    <div className="app-container">
      {!username ? (
        <div className="username-container">
          <h2>Digite seu nome</h2>
          <input
            type="text"
            onBlur={(e) => saveUsername(e.target.value)}
            placeholder="Seu nome"
          />
        </div>
      ) : (
        <>
          <div className="sidebar">
            <RoomList
              rooms={rooms}
              currentRoom={currentRoom}
              setCurrentRoom={setCurrentRoom}
              socket={socket}
            />
          </div>
          {currentRoom && (
            <div className="chat-container">
              <Chat socket={socket} username={username} room={currentRoom} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
