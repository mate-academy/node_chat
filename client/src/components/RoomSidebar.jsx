import { useState } from 'react';

export function RoomSidebar({
  username,
  rooms,
  activeRoomId,
  connectionStatus,
  onChangeUsername,
  onCreateRoom,
  onJoinRoom,
  onRenameRoom,
  onDeleteRoom,
}) {
  const [newRoomName, setNewRoomName] = useState('');
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [editingRoomName, setEditingRoomName] = useState('');

  function createRoom(event) {
    event.preventDefault();
    const name = newRoomName.trim();

    if (name && onCreateRoom(name)) {
      setNewRoomName('');
    }
  }

  function saveRoomName(event) {
    event.preventDefault();
    const name = editingRoomName.trim();

    if (name && editingRoomId && onRenameRoom(editingRoomId, name)) {
      setEditingRoomId(null);
      setEditingRoomName('');
    }
  }

  function deleteRoom(roomId) {
    if (window.confirm('Delete this room and its messages?')) {
      onDeleteRoom(roomId);
    }
  }

  return (
    <aside className="sidebar">
      <div className="profile">
        <div className="avatar">{username.charAt(0).toUpperCase()}</div>
        <div className="profile-copy">
          <span className="muted small">SIGNED IN AS</span>
          <strong>{username}</strong>
        </div>
        <button
          className="icon-button"
          type="button"
          onClick={onChangeUsername}
          title="Change username"
          aria-label="Change username"
        >
          ↗
        </button>
      </div>

      <div className="sidebar-heading">
        <h2>Rooms</h2>
        <span className="room-count">{rooms.length}</span>
      </div>

      <form className="room-create-form" onSubmit={createRoom}>
        <input
          aria-label="New room name"
          maxLength={48}
          placeholder="Create a room"
          value={newRoomName}
          onChange={event => setNewRoomName(event.target.value)}
        />
        <button
          className="primary-button add-room"
          type="submit"
          aria-label="Create room"
          disabled={connectionStatus !== 'connected' || !newRoomName.trim()}
        >
          +
        </button>
      </form>

      <nav className="room-list" aria-label="Chat rooms">
        {rooms.map(room => (
          <div
            className={`room-item${room.id === activeRoomId ? ' room-item--active' : ''}`}
            key={room.id}
          >
            {editingRoomId === room.id ? (
              <form className="room-rename-form" onSubmit={saveRoomName}>
                <input
                  autoFocus
                  aria-label="Room name"
                  maxLength={48}
                  value={editingRoomName}
                  onChange={event => setEditingRoomName(event.target.value)}
                />
                <button type="submit" aria-label="Save room name">✓</button>
              </form>
            ) : (
              <>
                <button
                  className="room-select"
                  type="button"
                  onClick={() => onJoinRoom(room.id)}
                  disabled={connectionStatus !== 'connected'}
                >
                  <span className="hash">#</span>
                  <span className="room-name">{room.name}</span>
                </button>
                <div className="room-actions">
                  <button
                    type="button"
                    title="Rename room"
                    aria-label={`Rename ${room.name}`}
                    onClick={() => {
                      setEditingRoomId(room.id);
                      setEditingRoomName(room.name);
                    }}
                  >
                    …
                  </button>
                  <button
                    type="button"
                    title="Delete room"
                    aria-label={`Delete ${room.name}`}
                    onClick={() => deleteRoom(room.id)}
                  >
                    ×
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        {rooms.length === 0 && (
          <p className="empty-rooms">No rooms yet. Create one to get started.</p>
        )}
      </nav>
    </aside>
  );
}
