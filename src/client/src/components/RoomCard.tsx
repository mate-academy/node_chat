import { useState } from 'react';
import { Link } from 'react-router-dom';
import { client } from '../services/client';
import type { Room } from '../types';

type Props = {
  room: Room;
  onRoomChanged: () => void;
};

export const RoomCard = ({ room, onRoomChanged }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(room.name);

  const handleUpdate = async () => {
    if (!newName.trim() || newName === room.name) {
      setIsEditing(false);

      return;
    }

    try {
      await client.updateRoom(room._id, newName);
      setIsEditing(false);
      onRoomChanged();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(`Ви впевнені, що хочете видалити кімнату "${room.name}"?`)
    ) {
      return;
    }

    try {
      await client.deleteRoom(room._id);
      onRoomChanged();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };

  return (
    <div
      style={{
        border: '1px solid #ddd',
        padding: '15px',
        marginBottom: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: '8px',
      }}
    >
      {isEditing ? (
        <div
          style={{
            display: 'flex',
            gap: '10px',
            flexGrow: 1,
            marginRight: '15px',
          }}
        >
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            style={{
              padding: '8px',
              flexGrow: 1,
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          <button
            onClick={handleUpdate}
            style={{
              background: '#28a745',
              color: '#fff',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Зберегти
          </button>
          <button
            onClick={() => setIsEditing(false)}
            style={{
              background: '#6c757d',
              color: '#fff',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Скасувати
          </button>
        </div>
      ) : (
        <>
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
            {room.name}
          </span>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <Link
              to={`/chat/${room._id}`}
              style={{
                color: '#007bff',
                textDecoration: 'none',
                fontWeight: 'bold',
              }}
            >
              Увійти
            </Link>
            <button
              onClick={() => setIsEditing(true)}
              style={{
                background: '#ffc107',
                color: '#000',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Редагувати
            </button>
            <button
              onClick={handleDelete}
              style={{
                background: '#dc3545',
                color: '#fff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Видалити
            </button>
          </div>
        </>
      )}
    </div>
  );
};
