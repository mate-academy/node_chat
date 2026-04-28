import { useState } from 'react';
import { roomService } from '../services/roomService.js';

export const RoomList = ({ rooms, onJoin, onUpdate }) => {
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState(null);

  const handleRename = async (id) => {
    try {
      await roomService.rename(id, editName);
      onUpdate();
      setEditId(null);
      setError(null);
    } catch {
      setError('Failed to rename room. Try again.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await roomService.remove(id);
      onUpdate();
    } catch {
      setError('Failed to delete room. Try again.');
    }
  };

  const handleStartEdit = (room) => {
    setEditId(room.id);
    setEditName(room.name);
  };

  return (
    <>
      {error && <p className="help is-danger">{error}</p>}
      <ul>
        {rooms.map(room => (
          <li key={room.id}>
            {editId === room.id ? (
              <>
                <input value={editName} onChange={e => setEditName(e.target.value)} />
                <button onClick={() => handleRename(room.id)}>Save</button>
                <button onClick={() => setEditId(null)}>Cancel</button>
              </>
            ) : (
              <>
                {room.name}
                {' '}<button onClick={() => onJoin(room)}>Join</button>
                {' '}<button onClick={() => handleStartEdit(room)}>Rename</button>
                {' '}<button onClick={() => handleDelete(room.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </>
  );
};
