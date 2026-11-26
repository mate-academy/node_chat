import { useState } from 'react';

const DEFAULT_ROOM = 'general';

export const RoomList = ({
  rooms,
  activeId,
  onJoin,
  onCreate,
  onRename,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  function startEdit(room) {
    setEditingId(room.id);
    setEditName(room.name);
  }

  function submitEdit(event) {
    event.preventDefault();

    if (editName.trim()) {
      onRename(editingId, editName.trim());
    }

    setEditingId(null);
  }

  function renderRoom(room) {
    if (room.id === editingId) {
      return (
        <form onSubmit={submitEdit}>
          <input
            className="input is-small"
            aria-label="Room name"
            value={editName}
            onChange={(event) => setEditName(event.target.value)}
          />
          <button type="submit" className="button is-small is-link">
            Save
          </button>
          <button
            type="button"
            className="button is-small"
            onClick={() => setEditingId(null)}
          >
            Cancel
          </button>
        </form>
      );
    }

    return (
      <>
        <button
          type="button"
          className={`button is-small is-fullwidth ${
            room.id === activeId ? 'is-link' : ''
          }`}
          onClick={() => onJoin(room.id)}
        >
          {room.name}
        </button>
        <button
          type="button"
          className="button is-small is-light"
          onClick={() => startEdit(room)}
        >
          Rename
        </button>
        {room.id !== DEFAULT_ROOM && (
          <button
            type="button"
            className="button is-small is-danger is-light"
            onClick={() => onDelete(room.id)}
          >
            Delete
          </button>
        )}
      </>
    );
  }

  return (
    <aside>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {rooms.map((room) => (
          <li key={room.id} style={{ marginBottom: 6 }}>
            {renderRoom(room)}
          </li>
        ))}
      </ul>

      <form
        onSubmit={(event) => {
          event.preventDefault();

          if (!name.trim()) {
            return;
          }

          onCreate(name.trim());
          setName('');
        }}
      >
        <input
          className="input is-small"
          aria-label="New room"
          placeholder="New room"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <button type="submit" className="button is-small is-fullwidth">
          Create
        </button>
      </form>
    </aside>
  );
};