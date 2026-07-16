import { useState } from 'react';
import { Room } from '../types/room';

interface Props {
  rooms: Room[];
  selectedRoomId: string;
  onJoin: (roomId: string) => void;
  onCreate: (name: string) => void;
  onRename: (roomId: string, name: string) => void;
  onDelete: (roomId: string) => void;
}

export const RoomList = ({
  rooms,
  selectedRoomId,
  onJoin,
  onCreate,
  onRename,
  onDelete,
}: Props) => {
  const [newRoomName, setNewRoomName] = useState('');

  function handleCreate(event: React.FormEvent) {
    event.preventDefault();

    const name = newRoomName.trim();

    if (!name) {
      return;
    }

    onCreate(name);
    setNewRoomName('');
  }

  return (
    <div>
      <h2 className="subtitle">Rooms</h2>

      <form className="field is-horizontal" onSubmit={handleCreate}>
        <input
          className="input"
          placeholder="New room name"
          value={newRoomName}
          onChange={event => setNewRoomName(event.target.value)}
        />

        <button className="button">Create</button>
      </form>

      <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
        {rooms.map(room => (
          <li key={room.id}>
            <button
              className={
                room.id === selectedRoomId
                  ? 'button is-small is-primary'
                  : 'button is-small'
              }
              onClick={() => onJoin(room.id)}
            >
              Join {room.name}
            </button>

           {room.id !== 'general' && (
            <button
              className="button is-small"
              onClick={() => {
                const name = prompt('New room name', room.name);

                if (name?.trim()) {
                  onRename(room.id, name.trim());
                }
              }}
            >
              Rename
            </button>
          )}

            {room.id !== 'general' && (
              <button
                className="button is-small is-danger"
                onClick={() => onDelete(room.id)}
              >
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
