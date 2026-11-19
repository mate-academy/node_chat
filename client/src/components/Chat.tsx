import { useState } from 'react';
import { useRooms } from '../hooks/useRooms';
import { RoomList } from './RoomList';
import { ChatWindow } from './ChatWindow';

interface Props {
  username: string;
}

export function Chat({ username }: Props) {
  const rooms = useRooms();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedRoom = rooms.find((room) => room.id === selectedId) ?? null;

  return (
    <div className="chat">
      <aside className="sidebar">
        <div className="sidebar-header">
          Signed in as <strong>{username}</strong>
        </div>
        <RoomList
          rooms={rooms}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </aside>

      <main className="chat-main">
        {selectedRoom ? (
          <ChatWindow
            key={selectedRoom.id}
            room={selectedRoom}
            username={username}
          />
        ) : (
          <p className="muted">Select a room</p>
        )}
      </main>
    </div>
  );
}
