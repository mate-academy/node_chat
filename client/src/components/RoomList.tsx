import type React from 'react';
import { RoomItem } from './RoomItem.js';
import type { Room } from '../types/types.js';
import { useState } from 'react';

interface Props {
  rooms: { [key: string]: Room };
  currentRoomId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onCreateRoom: (name: string) => void;
  onLogout: () => void;
}

export const RoomList: React.FC<Props> = ({
  rooms,
  currentRoomId,
  onSelect,
  onDelete,
  onRename,
  onCreateRoom,
  onLogout,
}) => {
  const [newRoomName, setNewRoomName] = useState<string>('');

  const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (newRoomName.trim()) {
      onCreateRoom(newRoomName.trim());
      setNewRoomName('');
    }
  };

  return (
    <div className="sidebar">
      <h3>Rooms</h3>

      <ul className="room-list-container">
        {Object.entries(rooms).map(([id, roomData]) => (
          <RoomItem
            key={id}
            id={id}
            name={roomData.name}
            isActive={id === currentRoomId}
            onSelect={onSelect}
            onDelete={onDelete}
            onRename={onRename}
          />
        ))}
      </ul>

      <form onSubmit={handleCreate} className="create-room-form">
        <input
          type="text"
          value={newRoomName}
          onChange={(event) => setNewRoomName(event.target.value)}
          placeholder="The name of the new room..."
        />
        <button type="submit">Create room</button>
      </form>
      <div className="user-controls">
        <button onClick={onLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </div>
  );
};
