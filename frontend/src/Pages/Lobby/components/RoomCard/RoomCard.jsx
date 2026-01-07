import { Link } from 'react-router-dom';
import styles from './RoomCard.module.scss';
import { Mails, Pencil, Trash } from 'lucide-react';
import { useState } from 'react';
import { roomsService } from '../../../../services/roomsService';
import { useContext } from 'react';
import { UserContext } from '../../../../Context/UserContext';

export const RoomCard = ({ roomName, authorName, id }) => {
  const [updating, setUpdating] = useState(false);
  const [newNameRoom, setNewNameRoom] = useState(roomName);
  const { user } = useContext(UserContext);

  return (
    <Link to={`/room/${id}`} className={styles.roomCard}>
      <div className={styles.icons}>
        <div className={styles.iconContainer}>
          <Mails size={24} />
        </div>
        {user === authorName && (
          <div
            className={styles.iconContainer}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              roomsService.deleteRoom(id, user);
            }}
          >
            <Trash size={24} />
          </div>
        )}
      </div>
      {updating ? (
        <form
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onSubmit={async (e) => {
            e.preventDefault();
            await roomsService.renameRoom(id, newNameRoom, authorName);
            setUpdating(false);
          }}
        >
          <input
            className={styles.input}
            type="text"
            value={newNameRoom}
            onChange={(e) => setNewNameRoom(e.target.value)}
            autoFocus
          />
        </form>
      ) : (
        <div className={styles.titleContainer}>
          <h1 className={styles.title}>{roomName}</h1>
          {user === authorName && (
            <div
              className={styles.iconContainer}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setUpdating(true);
              }}
            >
              <Pencil size={20} />
            </div>
          )}
        </div>
      )}
      <span className={styles.author}>{authorName}</span>
    </Link>
  );
};
