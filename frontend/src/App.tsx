import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import AuthScreen from './components/AuthScreen/AuthScreen';
import LobbyScreen from './components/LobbyScreen/LobbyScreen';
import ChatScreen from './components/ChatScreen/ChatScreen';
import type { User, Room } from './types';
import './App.css';

const socket: Socket = io('http://localhost:3000');

const App: React.FC = () => {
  const [user, setUser] = useState<User>({
    username: localStorage.getItem('pixel_username') || '',
    avatar: localStorage.getItem('pixel_avatar') || '/avatars/avatar1.jpg'
  });

  const [screen, setScreen] = useState<'auth' | 'lobby' | 'chat'>(
    user.username ? 'lobby' : 'auth'
  );

  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);

  useEffect(() => {
    socket.on('update:rooms', (updatedRooms: Room[]) => {
      setRooms(updatedRooms);

      setCurrentRoom((prevCurrentRoom) => {
        if (!prevCurrentRoom) return null;
        const matchingRoom = updatedRooms.find((r) => r.id === prevCurrentRoom.id);
        return matchingRoom || prevCurrentRoom;
      });
    });

    return () => {
      socket.off('update:rooms');
    };
  }, []);

  const handleLogin = (username: string, avatar: string) => {
    localStorage.setItem('pixel_username', username);
    localStorage.setItem('pixel_avatar', avatar);
    setUser({ username, avatar });
    setScreen('lobby');
  };

  const handleLeaveRoom = () => {
    if (currentRoom) {
      socket.emit('join:room', { roomId: '', username: user.username, avatar: user.avatar });
    }
    setScreen('lobby');
    setCurrentRoom(null);
  };

  return (
    <div className="pixel-container">
      {screen === 'auth' && (
        <AuthScreen onLogin={handleLogin} initialAvatar={user.avatar} />
      )}

      {screen === 'lobby' && (
        <LobbyScreen
          socket={socket}
          user={user}
          rooms={rooms}
          onJoinRoom={(room) => {
            setCurrentRoom(room);
            setScreen('chat');
          }}
        />
      )}

      {screen === 'chat' && currentRoom && (
        <ChatScreen
          socket={socket}
          user={user}
          room={currentRoom}
          onLeave={handleLeaveRoom}
        />
      )}
    </div>
  );
};

export default App;
