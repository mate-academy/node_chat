// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import RoomList from './pages/RoomList';
import ChatRoom from './pages/ChatRoom';

const App = () => {
  const username = localStorage.getItem('username');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          username ? <Navigate to="/rooms" /> : <Login />
        } />
        <Route path="/rooms" element={<RoomList />} />
        <Route path="/rooms/:roomId" element={<ChatRoom />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
