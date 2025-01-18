import { useEffect, useState } from 'react';
import styles from '../rooms/rooms.module.css';
import { useNavigate } from 'react-router-dom';

const Rooms = ({ socket }) => {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState('');
  const [rooms, setRooms] = useState({});
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [newRoomName, setNewRoomName] = useState('');

  useEffect(() => {
    socket.emit('getRoomList');

    socket.on('roomList', (data) => {
      setRooms(data);
    });

    return () => {
      socket.off('roomList');
    };
  }, [socket]);

  const handleCreateRoom = () => {
    if (roomName.trim()) {
      socket.emit('createRoom', { roomName });
      setRoomName('');
    }
  };

  const handleDeleteRoom = (roomId) => {
    socket.emit('deleteRoom', { roomId });
  };

  const handleEditRoom = (roomId) => {
    setEditingRoomId(roomId);
    setNewRoomName(rooms[roomId].roomName);
  };

  const handleSaveRoomName = (roomId) => {
    setEditingRoomId(null);

    if (newRoomName !== rooms[roomId].roomName) {
      socket.emit('editRoomName', { roomId, newRoomName });
    }
  };

  const handleJoinRoom = (roomId) => {
    socket.emit('joinRoom', { roomId });

    navigate(`/room/${roomId}`);
  };

  return (
    <div className={styles.container}>
      <h2>Rooms</h2>
      <ul className={styles.ul}>
        {Object.values(rooms).length > 0 ? (
          Object.values(rooms).map((room) => (
            <li key={room.roomId}>
              {editingRoomId === room.roomId ? (
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  onBlur={() => handleSaveRoomName(room.roomId)}
                />
              ) : (
                <h4 onDoubleClick={() => handleEditRoom(room.roomId)}>
                  {room.roomName}
                </h4>
              )}
              <button
                className={styles.btnDelete}
                onClick={() => handleDeleteRoom(room.roomId)}
              >
                Delete
              </button>
              <button
                className={styles.btnJoin}
                onClick={() => handleJoinRoom(room.roomId)}
              >
                Join
              </button>
            </li>
          ))
        ) : (
          <li>No rooms available.</li>
        )}
      </ul>

      <div className="create">
        <input
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />
        <button onClick={handleCreateRoom}>Create</button>
      </div>
    </div>
  );
};

export default Rooms;
