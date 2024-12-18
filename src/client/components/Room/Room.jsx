import { useEffect, useRef, useState } from 'react';
import styles from './room.module.css';

export const Room = ({ room, socket }) => {
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(room);

  const controller = useRef(null);

  useEffect(() => {
    const handleClickOutside = (evt) => {
      if (controller.current && !controller.current.contains(evt.target)) {
        setEditing(false);

        const newRoomName = newName.trim();

        if (newRoomName !== room) {
          const action = { type: 'rename', room, newRoomName };

          socket.send(JSON.stringify(action));
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [room, socket, newName]);

  const onClickHandlerDelete = () => {
    const action = { type: 'remove', room };

    socket.send(JSON.stringify(action));
  };

  return (
    <div className={styles.room}>
      <p className={styles.room__desc}>Current room:</p>
      {editing ? (
        <div className={styles.room__controller} ref={controller}>
          <input
            type="text"
            className={styles.room__input}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button className="button" onClick={onClickHandlerDelete}>
            Delete
          </button>
        </div>
      ) : (
        <p className={styles.room__name} onDoubleClick={() => setEditing(true)}>
          {room}
        </p>
      )}
    </div>
  );
};
