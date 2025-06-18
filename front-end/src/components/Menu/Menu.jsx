import { useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import styles from './Menu.module.scss';
import { useState } from 'react';
import cn from 'classnames';
import api from '../../services/api';

const BASE_URL = import.meta.env.VITE_API_URL;

export const Menu = () => {
  const {
    fetchRooms,
    rooms,
    joinedChatIds,
    fetchJoinedRooms,
    handleRoomSelect,
  } = useAppContext();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [isEditingName, setIsEditingName] = useState(0);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    fetchRooms();
    fetchJoinedRooms();
  }, []);

  const isJoined = (chatId) => joinedChatIds.includes(chatId);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post(`${BASE_URL}/rooms`, {
        roomName,
      });

      setIsFormVisible(false);
      fetchRooms();
    } catch (error) {
      console.error(
        'Failed to create room:',
        error.response?.data || error.message,
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`${BASE_URL}/rooms/${id}`);

      fetchRooms();
    } catch (error) {
      console.error(
        'Failed to delete room:',
        error.response?.data || error.message,
      );
    }
  };

  const handleChangeName = async (id) => {
    try {
      await api.patch(`${BASE_URL}/rooms/${id}`, {
        newRoomName: newName,
      });

      fetchRooms();
      setIsEditingName(false);
    } catch (error) {
      console.error(
        'Failed to update room name:',
        error.response?.data || error.message,
      );
    }
  };

  const handleJoin = async (id) => {
    try {
      await api.post(`${BASE_URL}/rooms/${id}/join`);

      // fetchRooms();
      fetchJoinedRooms();
    } catch (error) {
      console.error(
        'Failed to delete room:',
        error.response?.data || error.message,
      );
    }
  };

  // const handleSelect = (room) => {
  //   handleRoomSelect
  // }

  return (
    <section className={styles.menu}>
      <h1 className={styles.menu__title}>Rooms</h1>

      <ul className={styles.menu__list}>
        {rooms.map((room) => (
          <li
            className={styles.menu__item}
            key={room.id}
            onClick={() => handleRoomSelect(room)}
          >
            {isEditingName === room.id ? (
              <input
                type="text"
                value={newName}
                className={`${styles['menu__input-rename']}`}
                onBlur={() => setIsEditingName(false)}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleChangeName(room.id);
                  }
                }}
                autoFocus
              ></input>
            ) : (
              <div
                onDoubleClick={() => {
                  setIsEditingName(room.id);
                  setNewName(room.roomName);
                }}
              >
                {room.roomName}
              </div>
            )}

            {isJoined(room.id) ? (
              <button
                className={`${styles['menu__item-delete']}`}
                onClick={() => handleDelete(room.id)}
              >
                Delete
              </button>
            ) : (
              <button
                className={`${styles['menu__item-join']}`}
                onClick={() => handleJoin(room.id)}
              >
                Join
              </button>
            )}
          </li>
        ))}
      </ul>

      <button
        className={`${styles['menu__item-create']}`}
        onClick={() => setIsFormVisible(!isFormVisible)}
      >
        +
      </button>

      <form
        className={cn(styles.menu__form, { hidden: !isFormVisible })}
        onSubmit={handleSubmit}
      >
        <input
          id="roomName"
          name="roomName"
          className={`${styles['menu__input-create']}`}
          type="text"
          placeholder="Enter room name"
          onChange={(e) => setRoomName(e.target.value)}
        />

        <button type="submit">Add</button>
      </form>
    </section>
  );
};
