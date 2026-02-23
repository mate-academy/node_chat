import React, { useEffect } from 'react';
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import ChatWindow from './components/ChatWindow';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3005');

function App() {
  const [username, setUserName] = useState(localStorage.getItem('username') || '');
  const [tempName, setTempName] = useState('');

  const [rooms, setRooms] = useState(['General']);
  const [currentRoom, setCurrentRoom] = useState('General');
  const [messages, setMessages] = useState([
    { author: 'System', text: 'Welcome to the chat!', time: new Date().toLocaleTimeString() }
  ]);

  const [newMessage, setNewMessage] = useState('');

  const handleLogin = (event) => {
    event.preventDefault();
    if (tempName.trim()) {
      localStorage.setItem('username', tempName);
      setUserName(tempName);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    setUserName('');
  };

  const handleSendMessage = (event) => {
    event.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      author: username,
      text: newMessage,
      time: new Date().toLocaleTimeString(),
      room: currentRoom,
    };

    socket.emit('send_message', messageData);
    setNewMessage('');
  };

  const handleCreateRoom = () => {
    const roomName = prompt('Enter new room name:');
    if (roomName && !rooms.includes(roomName)) {
      socket.emit('create_room', roomName);
    }
  };

  const handleRenameRoom = (oldName) => {
    const newName = prompt(`Rename "${oldName}" to:`, oldName);

    if (newName && newName !== oldName && !rooms.includes(newName)) {
      socket.emit('rename_room', { oldName, newName });
    }
  };

  const handleDeleteRoom = (roomToDelete) => {
    if (roomToDelete === 'General') {
      return alert("Cannot delete general room!");
    }

    if (window.confirm(`Are you sure you want to delete ${roomToDelete}?`)) {
      socket.emit('delete_room', roomToDelete)
    }

    if (currentRoom === roomToDelete) {
      setCurrentRoom('General');
    }
  }

  useEffect(() => {
    socket.on('init_data', (data) => {
      setRooms(data.rooms);
      setMessages(data.messages);
    });

    socket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('update_rooms', (updatedRooms) => {
      setRooms(updatedRooms);
    });

    return () => {
      socket.off('init_data');
      socket.off('receive_message');
      socket.off('update_rooms');
    };
  }, []);

  if (!username) {
    return (
      <Login
        onLogin={handleLogin}
        tempName={tempName}
        onTempName={setTempName}
      />
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>

      <Sidebar
        rooms={rooms}
        currentRoom={currentRoom}
        onSelectRoom={setCurrentRoom}
        onCreateRoom={handleCreateRoom}
        onLogout={handleLogout}
        username={username}
        onRenameRoom={handleRenameRoom}
        onDeleteRoom={handleDeleteRoom}
      />

      <ChatWindow
        currentRoom={currentRoom}
        messages={messages}
        onSendMessage={handleSendMessage}
        newMessage={newMessage}
        onNewMessage={setNewMessage}
      />

    </div>
  )
}

export default App;
