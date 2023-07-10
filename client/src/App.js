import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home/Home';
import io from 'socket.io-client';
import './App.css';
import { Chat } from './pages/Chat/Chat';
import { useEffect } from 'react';

const socket = io.connect(process.env.REACT_APP_SERVER_URL);

export const App = () => {
  const [username, setUsername] = useState(localStorage.getItem('user') || '');
  const [room, setRoom] = useState(localStorage.getItem('room') || '');
  const [rooms, setRooms] = useState([]);
  const socketId = socket.id

  useEffect(() => {
    if (room !== '' && username !== '') {
      socket.emit('join_room', { username, room });
    }
  }, [socketId]);

  useEffect(() => {
    socket.on('rooms', (data) => {
      setRooms(data.rooms);
    });

    return () => socket.off('rooms');
  }, [socket]);

  return (
    <Router>
      <div className='App'>
        <Routes>
          <Route
            path='/'
            element={
              <Home
                username={username}
                setUsername={setUsername}
                room={room}
                setRoom={setRoom}
                socket={socket}
                rooms={rooms}
                setRooms={setRooms}
              />
            }
          />

          <Route
            path='/chat'
            element={
              <Chat
                username={username}
                room={room}
                socket={socket}
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}
