import { useState } from 'react';
import type { Room } from '../types';

type Props = {
  rooms: Room[];
  currentId: string;
  onSelect: (id: string) => void;
  onCreate: (name: string) => void;
  onRename: (id: string) => void;
  onRemove: (id: string) => void;
};

export const RoomList = ({
  rooms,
  currentId,
  onSelect,
  onCreate,
  onRemove,
  onRename,
}: Props) => {
  const [name, setName] = useState('');

  return (
    <>
      <ul>
        {rooms.map((room) => (
          <li key={room.id}>
            <p>{room.name}</p>
            <button
              disabled={room.id === currentId}
              onClick={() => onSelect(room.id)}
            >
              Join
            </button>
            <button onClick={() => onRename(room.id)}>Rename</button>
            {room.id !== 'general' && (
              <button onClick={() => onRemove(room.id)}>X</button>
            )}
          </li>
        ))}
      </ul>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim()) return;
          onCreate(name.trim());
          setName('');
        }}
      >
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="New room"
        />
        <button>Create</button>
      </form>
    </>
  );
};
