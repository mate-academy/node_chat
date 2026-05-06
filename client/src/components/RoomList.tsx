import { useState } from 'react';
import { deleteRoom, renameRoom } from '../api';
import { Room } from '../types/room';

interface Props {
  rooms: Room[];
  activeRoom: string;
  onSelect: (roomId: string) => void;
}
export const RoomList: React.FC<Props> = ({ rooms, activeRoom, onSelect }) => {
  const [newName, setNewName] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!newName) {
      return;
    }
    const room = rooms.find(room => room.id === activeRoom);

    if (!room) {
      console.log('room not found');
      return;
    }
    await renameRoom(newName, room.id);
  }

  async function handleDelete() {
    const room = rooms.find(room => room.id === activeRoom);

    if (!room) {
      console.log('room not found');
      return;
    }

    await deleteRoom(room.id);
  }
  return (
    <div>
      <h4>Rooms list</h4>
      {rooms.map(room => (
        <div
          onClick={() => onSelect(room.id)}
          style={{ borderLeft: '15px solid lightblue', margin: '20px' }}
          key={room.id}
        >
          <button>{room.name}</button>
        </div>
      ))}
      <div>
        <form onSubmit={handleSubmit} className="field is-horizontal">
          <input
            type="text"
            className="input"
            placeholder="Rename selected room"
            value={newName}
            onChange={event => setNewName(event.target.value)}
          />
          <button type="submit" className="button">
            Rename
          </button>
          <button className="button" onClick={handleDelete}>
            Delete selected room
          </button>
        </form>
      </div>
    </div>
  );
};
