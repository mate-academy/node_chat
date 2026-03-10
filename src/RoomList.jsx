import { useState } from 'react';
import PropTypes from 'prop-types';

export const RoomList = ({
  rooms,
  currentRoomId,
  onJoin,
  onCreate,
  onRename,
  onDelete,
}) => {
  const [newRoomName, setNewRoomName] = useState('');
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  function handleCreate(e) {
    e.preventDefault();

    if (!newRoomName.trim()) {
      return;
    }
    onCreate(newRoomName.trim());
    setNewRoomName('');
  }

  function handleRename(e, roomId) {
    e.preventDefault();

    if (!renameValue.trim()) {
      return;
    }
    onRename(roomId, renameValue.trim());
    setRenamingId(null);
    setRenameValue('');
  }

  return (
    <aside className="sidebar">
      <p className="sidebar-title">Rooms</p>

      {rooms.map((room) => (
        <div key={room.id}>
          {renamingId === room.id ? (
            <form
              onSubmit={(e) => handleRename(e, room.id)}
              className="rename-form"
            >
              <input
                className="input"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                maxLength={13}
                autoFocus
              />
              <button className="button is-small is-success">✓</button>
              <button
                className="button is-small"
                type="button"
                onClick={() => setRenamingId(null)}
              >
                ✕
              </button>
            </form>
          ) : (
            <div
              className={`room-item ${room.id === currentRoomId ? 'active' : ''}`}
            >
              <span className="room-name" onClick={() => onJoin(room.id)}>
                {room.name}
              </span>
              {room.id !== 'general' && (
                <div className="room-actions">
                  <button
                    className="icon-btn"
                    onClick={() => {
                      setRenamingId(room.id);
                      setRenameValue(room.name);
                    }}
                  >
                    ✎
                  </button>
                  <button
                    className="icon-btn danger"
                    onClick={() => onDelete(room.id)}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      <div className="new-room-form">
        <p className="new-room-label">New Room</p>
        <form onSubmit={handleCreate} className="field">
          <input
            className="input"
            placeholder="Room name..."
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            maxLength={13}
          />
          <button className="button is-small">+</button>
        </form>
      </div>
    </aside>
  );
};

RoomList.propTypes = {
  rooms: PropTypes.array.isRequired,
  currentRoomId: PropTypes.string.isRequired,
  onJoin: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  onRename: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
