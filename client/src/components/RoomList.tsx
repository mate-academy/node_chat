import { useState, type FormEvent } from 'react';
import { api, ApiError } from '../api';
import type { Room } from '../types';

interface Props {
  rooms: Room[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const getRoomError = (error: unknown) => {
  if (error instanceof ApiError && error.status === 409) {
    return 'Room name is already taken';
  }

  if (error instanceof ApiError) {
    return error.message;
  }

  return 'Cannot reach the server';
};

export function RoomList({ rooms, selectedId, onSelect }: Props) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();

    const trimmed = name.trim();

    if (!trimmed) {
      return;
    }

    setError('');

    try {
      const room = await api.createRoom(trimmed);

      setName('');
      onSelect(room.id);
    } catch (e) {
      setError(getRoomError(e));
    }
  };

  const startEdit = (room: Room) => {
    setError('');
    setEditingId(room.id);
    setEditName(room.name);
  };

  const cancelEdit = () => {
    setError('');
    setEditingId(null);
  };

  const handleRename = async (event: FormEvent) => {
    event.preventDefault();

    const trimmed = editName.trim();

    if (!trimmed || !editingId) {
      return;
    }

    setError('');

    try {
      await api.renameRoom(editingId, trimmed);
      setEditingId(null);
    } catch (e) {
      setError(getRoomError(e));
    }
  };

  const handleDelete = async (room: Room) => {
    if (!window.confirm(`Delete room "${room.name}" and all its messages?`)) {
      return;
    }

    setError('');

    try {
      await api.deleteRoom(room.id);
    } catch (e) {
      setError(getRoomError(e));
    }
  };

  return (
    <div className="room-list">
      {rooms.length === 0 && <p className="muted">No rooms yet</p>}

      <ul>
        {rooms.map((room) => (
          <li key={room.id} className="room-row">
            {editingId === room.id ? (
              <form className="room-edit" onSubmit={handleRename}>
                <input
                  value={editName}
                  onChange={(event) => {
                    setEditName(event.target.value);
                    setError('');
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                      cancelEdit();
                    }
                  }}
                  maxLength={100}
                  autoFocus
                />
                <button type="submit">Save</button>
                <button type="button" onClick={cancelEdit}>
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <button
                  className={room.id === selectedId ? 'room active' : 'room'}
                  onClick={() => onSelect(room.id)}
                >
                  {room.name}
                </button>
                <button
                  className="icon"
                  title="Rename"
                  onClick={() => startEdit(room)}
                >
                  ✎
                </button>
                <button
                  className="icon"
                  title="Delete"
                  onClick={() => handleDelete(room)}
                >
                  ✕
                </button>
              </>
            )}
          </li>
        ))}
      </ul>

      <form className="room-form" onSubmit={handleCreate}>
        <input
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setError('');
          }}
          onBlur={() => setError('')}
          placeholder="New room"
          maxLength={100}
        />
        <button type="submit">Create</button>
      </form>

      {error && <p className="error">{error}</p>}
    </div>
  );
}
