import React, { useState } from 'react';
import { Socket } from 'socket.io-client';
import type { User, Room } from '../../types';

const COVERS = [
  { path: '/covers/cover1.jpg', name: 'Street' },
  { path: '/covers/cover2.jpg', name: 'Koi Lake' },
  { path: '/covers/cover3.jpg', name: 'Sakura' },
];

interface LobbyScreenProps {
  socket: Socket;
  user: User;
  rooms: Room[];
  onJoinRoom: (room: Room) => void;
}

const LobbyScreen: React.FC<LobbyScreenProps> = ({ socket, user, rooms, onJoinRoom }) => {
  const [roomName, setRoomName] = useState<string>('');
  const [roomCover, setRoomCover] = useState<string>('/covers/cover1.jpg');

  const handleCreateRoom = () => {
    if (!roomName.trim()) return alert('Enter room name!');

    socket.emit('create:room', {
      name: roomName.trim(),
      cover: roomCover, 
      creator: user.username
    });

    setRoomName('');
  };

  return (
    <div className="screen box-retro">
      <div className="lobby-header">
        <span className="user-profile">
          <img src={user.avatar} alt="Your Avatar" className="msg-avatar-img" />
          {user.username}
        </span>
        <h2>LOBBY</h2>
      </div>

      <div className="lobby-layout">
        <div className="rooms-section">
          <h3>AVAILABLE ROOMS</h3>
          <div className="rooms-list pixel-scroll">
            {rooms.length === 0 ? (
              <div className="no-rooms" style={{ color: '#666', padding: '10px' }}>
                No rooms found...
              </div>
            ) : (
              rooms.map(room => (
                <div key={room.id} className="room-item box-retro-inner">
                  <span className="room-item-title">
                    <img src={room.cover} alt="" className="room-list-img" />
                    {room.name} <small>by {room.creator}</small>
                  </span>
                  <button
                    className="btn-retro small action"
                    onClick={() => onJoinRoom(room)}
                  >
                    JOIN
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="create-section box-retro-inner">
          <h3>NEW ROOM</h3>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Room name..."
          />
          <div className="cover-picker">
            <label>COVER:</label>
            <select
              value={roomCover}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRoomCover(e.target.value)}
            >
              {COVERS.map(c => (
                <option key={c.path} value={c.path}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <button className="btn-retro action" onClick={handleCreateRoom}>CREATE</button>
        </div>
      </div>
    </div>
  );
};

export default LobbyScreen;
