import { useState } from 'react';
import styles from './Lobby.module.scss';
import { Plus } from 'lucide-react';
import { NewRoomModal } from './components/NewRoomModal/NewRoomModal';
import { RoomCard } from './components/RoomCard';
import { useContext } from 'react';
import { RoomsContext } from '../../Context/RoomsContext';
import { Error } from '../../components/Error/Error';

export const Lobby = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const { rooms } = useContext(RoomsContext);
  const [errorMessage, setErrorMessage] = useState('');
  const [isErrorMessageOpen, setErrorMessageOpen] = useState(false);

  return (
    <div className={styles.lobby}>
      <div className={styles.header}>
        <div className={styles.info}>
          <h1 className={styles.title}>Lobbies</h1>
          <span className={styles.subtitle}>
            Choose a chat room or create your own
          </span>
        </div>
        <button className={styles.createBtn} onClick={() => setModalOpen(true)}>
          <Plus />
          New room
        </button>
      </div>
      <div className={styles.rooms}>
        {rooms.length > 0 &&
          rooms.map((room) => (
            <RoomCard
              key={room.id}
              roomName={room.roomName}
              authorName={room.authorName}
              id={room.id}
            />
          ))}
      </div>
      <Error
        errorMessage={errorMessage}
        isErrorMessageOpen={isErrorMessageOpen}
        closeErrorMessage={() => setErrorMessageOpen(false)}
      />
      {isModalOpen && (
        <NewRoomModal
          closeModal={() => setModalOpen(false)}
          setErrorMessage={(value) => setErrorMessage(value)}
          setErrorMessageOpen={() => setErrorMessageOpen(true)}
        />
      )}
    </div>
  );
};
