import { useState } from 'react';
import classNames from 'classnames';
import './RoomList.css';

export const RoomList = ({
  rooms,
  activeRoomId,
  onJoin,
  onCreate,
  onRename,
  onDelete,
}) => {
  const [newRoomName, setNewRoomName] = useState('');

  return (
    <div className="room-list">
      <ul>
        {rooms.map((room) => (
          <li
            key={room.id}
            className={classNames('room-item', {
              'is-active': room.id === activeRoomId,
            })}
          >
            <span onClick={() => onJoin(room.id)}>{room.name}</span>

            <button
              onClick={() => {
                const name = prompt('New room name', room.name);
                if (name) onRename(room.id, name);
              }}
            >
              ✏️
            </button>

            <button onClick={() => onDelete(room.id)}>🗑️</button>
          </li>
        ))}
      </ul>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!newRoomName.trim()) return;

          onCreate(newRoomName);
          setNewRoomName('');
        }}
      >
        <input
          placeholder="New room name"
          value={newRoomName}
          onChange={(event) => setNewRoomName(event.target.value)}
        />
        <button className="button">+ Room</button>
      </form>
    </div>
  );
};