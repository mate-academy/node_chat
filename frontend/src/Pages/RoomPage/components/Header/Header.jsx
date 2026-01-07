import styles from './Header.module.scss';
import { ArrowLeft, Hash } from 'lucide-react';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoomsContext } from '../../../../Context/RoomsContext';

export const Header = ({ membersCount, currentRoom, roomId }) => {
  const navigate = useNavigate();
  const { sendMessage } = useContext(RoomsContext);

  return (
    <div className={styles.header}>
      <div className={styles.info}>
        <button
          className={`${styles.button} ${styles.closeBtn}`}
          onClick={() => {
            sendMessage('LEAVE_ROOM', { roomId });
            navigate('/lobby');
          }}
        >
          <ArrowLeft />
        </button>
        <div className={styles.container}>
          <div className={styles.titleContainer}>
            <Hash size={16} className={styles.hashIcon} />
            <h1 className={styles.title}>{currentRoom.roomName}</h1>
          </div>
          <p className={styles.metaInfo}>Members in chat: {membersCount}</p>
        </div>
      </div>
      <button
        className={`${styles.button} ${styles.leaveBtn}`}
        onClick={() => {
          sendMessage('LEAVE_ROOM', { roomId });
          navigate('/lobby');
        }}
      >
        Leave
      </button>
    </div>
  );
};
