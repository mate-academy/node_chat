import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home/Home';
import io from 'socket.io-client';
import './App.css';
import { Chat } from './pages/Chat/Chat';
import { useEffect } from 'react';

const socket = io.connect(process.env.REACT_APP_SERVER_URL);

export const App = () => {
  const [userName, setUserName] = useState(localStorage.getItem('user') || '');
  const [room, setRoom] = useState(localStorage.getItem('room') || '');
  const [rooms, setRooms] = useState([]);
  const socketId = socket.id;

  useEffect(() => {
    socket.on('rooms', (data) => {
      setRooms(data.rooms);
    });

    return () => socket.off('rooms');
  }, []);

  useEffect(() => {
    socket.on('rooms', (data) => {
      setRooms(data.rooms);
    });

    if (room && userName) {
      socket.emit('join_room', { userName, room });
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketId]);

  return (
    <Router>
      <div className='App'>
        <Routes>
          <Route
            path='/'
            element={
              <Home
                userName={userName}
                setUserName={setUserName}
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
                userName={userName}
                room={room}
                socket={socket}
                setRooms={setRooms}
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}
