import { useState } from 'react';

const RoomItem = ({ room, selected, busy, onSelect, onRename, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(room.name);

  const handleRename = async (event) => {
    event.preventDefault();

    if (await onRename(room.id, name.trim())) {
      setEditing(false);
    }
  };

  return (
    <li className={`room-item ${selected ? 'selected' : ''}`}>
      {editing ? (
        <form className="inline-form" onSubmit={handleRename}>
          <input
            aria-label="New room name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={255}
            required
            autoFocus
          />

          <button disabled={busy || !name.trim()}>Save</button>

          <button
            type="button"
            disabled={busy}
            onClick={() => setEditing(false)}
          >
            Cancel
          </button>
        </form>
      ) : (
        <>
          <button
            className="room-select"
            aria-pressed={selected}
            onClick={() => onSelect(room.id)}
          >
            # {room.name}
          </button>

          <div className="room-actions">
            <button
              disabled={busy}
              onClick={() => {
                setName(room.name);
                setEditing(true);
              }}
            >
              Rename
            </button>

            <button disabled={busy} onClick={() => onDelete(room.id)}>
              Delete
            </button>
          </div>
        </>
      )}
    </li>
  );
};

export const RoomsSidebar = ({
  rooms,
  activeRoomId,
  loading,
  busy,
  onSelect,
  onCreate,
  onRename,
  onDelete,
  onRefresh,
}) => {
  const [name, setName] = useState('');

  const handleCreate = async (event) => {
    event.preventDefault();

    if (await onCreate(name.trim())) {
      setName('');
    }
  };

  return (
    <aside className="sidebar">
      <div className="section-heading">
        <h2>Rooms</h2>

        <button disabled={loading || busy} onClick={onRefresh}>
          Refresh
        </button>
      </div>

      <form className="inline-form" onSubmit={handleCreate}>
        <input
          aria-label="New room name"
          placeholder="New room"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={255}
          required
        />

        <button disabled={busy || loading || !name.trim()}>Create</button>
      </form>

      {loading && <p className="muted">Loading rooms…</p>}

      {!loading && rooms.length === 0 && (
        <p className="muted">Create your first room</p>
      )}

      <ul className="room-list">
        {rooms.map((room) => (
          <RoomItem
            key={room.id}
            room={room}
            selected={activeRoomId === room.id}
            busy={busy}
            onSelect={onSelect}
            onRename={onRename}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </aside>
  );
};