import React, { useState } from 'react';
import { useChat } from '../../hooks/useChat';
import cn from 'classnames';
import styles from './Sidebar.module.scss';

interface SidebarProps {
  onSelectRoom: (id: number) => void;
  activeRoomId: number | null;
  userId: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onSelectRoom,
  activeRoomId,
  userId,
}) => {
  const { rooms, createRoom } = useChat();
  const [newRoomName, setNewRoomName] = useState('');

  const handleCreateRoom = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newRoomName.trim()) return;

    try {
      createRoom(newRoomName, userId);
      setNewRoomName('');
    } catch (err) {
      alert('Не вдалося створити кімнату');
      console.log('Не вдалося створити кімнату', err);
    }
  };

  return (
    <div className={styles.sidebar}>
      <h3>Чати</h3>
      <ul className={styles.room_list}>
        {rooms.map((room) => (
          <li
            key={room.id}
            className={cn(styles.room_item, {
              [styles.active]: activeRoomId === room.id,
            })}
            // className={`room-item ${activeRoomId === room.id ? 'active' : ''}`}
            onClick={() => onSelectRoom(room.id)}
          >
            # {room.name}
          </li>
        ))}
      </ul>

      <form className={styles.create_room_form} onSubmit={handleCreateRoom}>
        <input
          type="text"
          placeholder="Нова кімната..."
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
        />
        <button type="submit">+</button>
      </form>
    </div>
  );
};
