export function RoomList({ rooms, currentRoomId, onSelect, onCreate, onRename, onDelete }) {
  function handleCreate() {
    const name = window.prompt('New room name:');

    if (name && name.trim()) {
      onCreate(name.trim());
    }
  }

  function handleRename(room) {
    const name = window.prompt(`Rename "${room.name}" to:`, room.name);

    if (name && name.trim() && name.trim() !== room.name) {
      onRename(room.id, name.trim());
    }
  }

  function handleDelete(room) {
    if (window.confirm(`Delete room "${room.name}"?`)) {
      onDelete(room.id);
    }
  }

  return (
    <aside className="rooms-panel">
      <div className="rooms-header">
        <h2>Rooms</h2>
        <button type="button" className="create-room-btn" onClick={handleCreate}>
          +
        </button>
      </div>

      <ul className="rooms-list">
        {rooms.map((room) => (
          <li
            key={room.id}
            className={`room-item${room.id === currentRoomId ? ' active' : ''}`}
          >
            <span className="room-name" onClick={() => onSelect(room.id)}>
              {room.name}
            </span>
            <span className="room-actions">
              <button type="button" title="Rename room" onClick={() => handleRename(room)}>
                ✎
              </button>
              <button type="button" title="Delete room" onClick={() => handleDelete(room)}>
                ✕
              </button>
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
