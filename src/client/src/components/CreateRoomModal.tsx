import React, { useState } from 'react';
import { client } from '../services/client';

export const CreateRoomModal = ({
  onRoomCreated,
}: {
  onRoomCreated: () => void;
}) => {
  const [nameU, setName] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nameU.trim()) {
      return;
    }

    try {
      await client.createRoom(nameU);
      setName('');
      onRoomCreated();
    } catch (error) {
      return error;
    }
  };

  return (
    <form onSubmit={handleCreate} style={{ marginBottom: '20px' }}>
      <input
        value={nameU}
        onChange={(e) => setName(e.target.value)}
        placeholder="Назва нової кімнати"
        style={{
          padding: '8px',
          marginRight: '10px',
          background: '#222',
          color: '#fff',
          border: '1px solid #555',
        }}
      />
      <button
        type="submit"
        style={{
          padding: '8px 15px',
          background: '#444',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Створити
      </button>
    </form>
  );
};
