import { useState, useEffect } from 'react';
import { socket } from '../../socket';

function RoomList({ onJoinRoom }) {
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [renameInputRoomId, setRenameInputRoomId] = useState(null);
  const [renameText, setRenameText] = useState('');

  useEffect(() => {
    socket.on('room list', (rooms) => {
      setRooms(rooms);
    });
    socket.emit('get rooms');

    return () => {
      socket.off('room list');
    };
  }, []);

  const handleCreateRoom = (e) => {
    e.preventDefault();

    const trimmed = newRoomName.trim();

    if (!trimmed) {
      return;
    }

    socket.emit('create room', trimmed);
    setNewRoomName('');
  };

  const handleRenameRoom = (roomId, newName) => {
    const trimmed = newName.trim();

    if (!trimmed) {
      return;
    }

    socket.emit('rename room', { roomId, newName: trimmed });
    setRenameInputRoomId(null);
    setRenameText('');
  };

  const handleDeleteRoom = (roomId) => {
    socket.emit('delete room', { roomId });
  };

  return (
    <div className="room-list">
      <ul>
        {rooms.map((room) => (
          <li className="room-item" key={room.id}>
            {renameInputRoomId !== room.id ? (
              <span
                className="room-name"
                onClick={() => onJoinRoom(room.id)}
              >
                {room.name}
              </span>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleRenameRoom(room.id, renameText);
                }}
              >
                <input
                  type="text"
                  value={renameText}
                  onChange={(e) => setRenameText(e.target.value)}
                  placeholder="Enter new name"
                  autoFocus
                />
                <button type="submit">Змінити назву</button>
              </form>
            )}

            <button
              className="icon-btn"
              onClick={() => {
                setRenameInputRoomId(room.id);
                setRenameText(room.name);
              }}
            >
              ✏️
            </button>

            <button
              className="icon-btn"
              onClick={() => handleDeleteRoom(room.id)}
            >
              🗑️
            </button>
          </li>
        ))}
      </ul>

      <form className="create-room-form" onSubmit={handleCreateRoom}>
        <input
          type="text"
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
          placeholder="Enter new room"
        />

        <button type="submit">Add New Room</button>
      </form>
    </div>
  );
}

export default RoomList;
