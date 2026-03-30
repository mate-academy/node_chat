import { useNavigate } from 'react-router-dom';

import styles from './Rooms.module.scss';
import { useChat } from '../ChatContext';

import { RoomsList } from './RoomsList';

export const Rooms = () => {
  const navigate = useNavigate();
  const { logout, currentUser } = useChat();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={styles.rooms}>
      <div className={styles.rooms_header}>
        <p className="title is-4" style={{ margin: 0 }}>
          Rooms
        </p>
        <div
          className={styles.add_button}
          onClick={() => navigate('add/join')}
          title="Create or Join a room"
        >
          <i className="icon fa-solid fa-circle-plus fa-xl" />
        </div>
      </div>

      <RoomsList />

      <div className={styles.rooms_footer}>
        <p className="subtitle" style={{ margin: 0 }}>
          {currentUser.username}
        </p>
        <button
          className="button"
          onClick={handleLogout}
          style={{ height: '35px' }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};
