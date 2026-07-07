/* eslint-disable no-console */
import { useEffect, useState } from 'react';
import { NavBar } from '../components/NavBar';
import { CreateUserModal } from '../components/AuthModal';
import { CreateRoomModal } from '../components/CreateRoomModal';
import { RoomList } from '../components/RoomList';
import { client } from '../services/client';
import type { User, Room } from '../types';

export const HomePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);

  const fetchRooms = async () => {
    try {
      const data = await client.getAllRooms();

      setRooms(data);
    } catch (error) {
      console.error('Помилка завантаження кімнат:', error);
    }
  };

  useEffect(() => {
    const storedUser = window.localStorage.getItem('user');

    if (storedUser) {
      setUser(JSON.parse(storedUser) as User);
      fetchRooms();
    }
  }, []);

  const handleLogout = () => {
    window.localStorage.removeItem('user');
    setUser(null);
    setRooms([]);
  };

  return (
    <div
      style={{
        backgroundColor: '#f5f5f5',
        color: '#333',
        flexGrow: 1,
        padding: '20px',
        minHeight: '100vh',
      }}
    >
      <NavBar />

      {!user ? (
        <CreateUserModal
          onSuccess={(u) => {
            setUser(u);
            fetchRooms();
          }}
        />
      ) : (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              padding: '15px',
              backgroundColor: '#fff',
              borderRadius: '8px',
              border: '1px solid #ddd',
            }}
          >
            <p style={{ margin: 0, fontSize: '18px' }}>
              Вітаємо, <strong>{user.name}</strong>
            </p>
            <button
              onClick={handleLogout}
              style={{
                background: '#dc3545',
                color: '#fff',
                border: 'none',
                padding: '8px 15px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Вийти з акаунту
            </button>
          </div>

          <CreateRoomModal onRoomCreated={fetchRooms} />

          <RoomList rooms={rooms} onRoomChanged={fetchRooms} />
        </div>
      )}
    </div>
  );
};
