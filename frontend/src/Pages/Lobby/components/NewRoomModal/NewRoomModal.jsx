import styles from './NewRoomModal.module.scss';
import { X } from 'lucide-react';
import { roomsService } from '../../../../services/roomsService.js';
import { useContext, useState } from 'react';
import { UserContext } from '../../../../Context/UserContext.jsx';

export const NewRoomModal = ({
  closeModal,
  setErrorMessage,
  setErrorMessageOpen,
}) => {
  const { user } = useContext(UserContext);
  const [roomName, setRoomName] = useState('');

  return (
    <div className={styles.modalContainer}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h1 className={styles.title}>New room</h1>
          <div className={styles.iconContainer} onClick={closeModal}>
            <X className={styles.icon} />
          </div>
        </div>
        <input
          type="text"
          value={roomName}
          placeholder="Title (for example: Gaming)"
          className={styles.input}
          onChange={(e) => setRoomName(e.target.value)}
        />
        <div className={styles.buttons}>
          <button
            className={`${styles.button} ${styles.cancelBtn}`}
            onClick={closeModal}
          >
            Cancel
          </button>
          <button
            className={`${styles.button} ${styles.createBtn}`}
            onClick={async () => {
              try {
                await roomsService.createRoom(roomName, user);
              } catch (error) {
                setErrorMessageOpen(true);
                setErrorMessage(error.response?.data?.message);
              } finally {
                closeModal();
              }
            }}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};
