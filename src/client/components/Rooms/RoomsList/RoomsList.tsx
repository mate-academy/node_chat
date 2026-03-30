import cn from 'classnames';
import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';

import styles from './RoomsList.module.scss';
import { useChat } from '../../ChatContext';

export const RoomsList = () => {
  const { rooms, getAllRooms, currentUser } = useChat();

  useEffect(() => {
    if (!currentUser?.id || currentUser.id === -1) {
      return;
    }

    getAllRooms();
  }, [currentUser.id]);

  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(styles.room_item, {
      [styles.is_active]: isActive,
    });

  return (
    <div className={styles.rooms_list}>
      {rooms &&
        rooms.map((room, index) => (
          <NavLink
            to={`/rooms/${room.id}`}
            className={getLinkClass}
            key={room.id}
          >
            <div
              className={cn(styles.room_name, `room_name_color_${index % 5}`)}
            >
              <p className={styles.room_name_text}>{room.name}</p>
            </div>
            <p className={styles.room_members}>
              {room.users.map((m) => m.username).join(', ')}
            </p>
          </NavLink>
        ))}
    </div>
  );
};
