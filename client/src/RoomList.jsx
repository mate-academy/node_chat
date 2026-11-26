import { useState } from 'react';

export const RoomList = ({ rooms, activeId, onJoin, onCreate, onRename, onDelete }) => {
  const [name, setName] = useState('');

  return (
    <aside>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {rooms.map((room) => (
          <li key={room.id} style={{ marginBottom: 6 }}>
            <button
              className={`button is-small is-fullwidth ${
                room.id === activeId ? 'is-link' : ''
              }`}
              onClick={() => onJoin(room.id)}
            >
              {room.name}
            </button>
            <button
              className="button is-small is-light"
              onClick={() => {
                const newName = prompt('New room name', room.name);
                if (newName) onRename(room.id, newName);
              }}
            >
              Rename
            </button>
            {room.id !== 'general' && (
              <button
                className="button is-small is-danger is-light"
                onClick={() => onDelete(room.id)}
              >
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          onCreate(name);
          setName('');
        }}
      >
        <input
          className="input is-small"
          placeholder="New room"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="button is-small is-fullwidth">Create</button>
      </form>
    </aside>
  );
};