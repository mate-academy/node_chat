import {
  useContext,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { MessageCircle, Plus } from 'lucide-react';
import { RoomsItem } from './RoomsItem';
import { SocketContext } from '../context/SocketContext';
import type { Room } from '../types/Room';
import Modal from './Modal';
import { createSocketMessage } from '../services/createSocketMessage';
import { UsernameContext } from '../context/UsernameContext';
import { RoomModal } from './RoomModal';

type Props = {
  rooms: Room[];
  currentRoom: Room | null;
  onSetCurrentRoomId: Dispatch<SetStateAction<number | null>>;
};

export const RoomsList: React.FC<Props> = ({
  rooms,
  currentRoom,
  onSetCurrentRoomId,
}) => {
  const [modal, setModal] = useState(false);
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const { socket } = useContext(SocketContext);
  const { usernameId } = useContext(UsernameContext);
  const [openedMenuRoomId, setOpenedMenuRoomId] = useState<number | null>(null);

  const handleCloseModal = () => {
    setError('');
    setValue('');
    setModal(false);
  };

  const handleCreateRoom = () => {
    setError('');
    const normalizedValue = value.trim();

    if (!normalizedValue) {
      setError('Room name cannot be empty!');

      return;
    }

    if (!usernameId) {
      return;
    }

    const message = createSocketMessage('CREATE_ROOM', {
      roomName: normalizedValue,
      creatorId: usernameId,
    });

    if (!socket) {
      return;
    }

    socket.send(message);

    setValue('');
    handleCloseModal();
  };

  console.log(rooms);
  
  return (
    <div className="chat-rooms-list">
      <div className="rooms-list-container">
        <div className="rooms-list-add flex-row-center">
          <span className="text-gray">ROOMS</span>
          <button
            onClick={() => setModal(true)}
            className="rooms-list-add-button"
          >
            <Plus size={20} style={{ cursor: 'pointer' }} />
          </button>
          <Modal isOpen={modal} onClose={() => setModal(false)}>
            <RoomModal
              title="Create new room"
              subtitle="Room name"
              placeholder="Enter room name"
              buttonText="Create"
              value={value}
              error={error}
              onChange={setValue}
              onSubmit={handleCreateRoom}
              onClose={handleCloseModal}
            />
          </Modal>
        </div>
      </div>
      {rooms && rooms.length === 0 ? (
        <div className="no-rooms">
          <span className="no-rooms-icon">
            <MessageCircle />
          </span>
          <span className="no-rooms-title">
            <strong>No rooms yet</strong>
          </span>
          <span className="no-rooms-text">
            Create your first room to start chatting with others.
          </span>
          <button
            className="form-button no-rooms-button"
            onClick={() => setModal(true)}
          >
            <Plus size={18} />
            Create room
          </button>
        </div>
      ) : (
        <ul className="rooms-list">
          {rooms &&
            rooms.map((room) => (
              <RoomsItem
                room={room}
                key={room.id}
                currentRoom={currentRoom}
                onSetCurrentRoomId={onSetCurrentRoomId}
                openedMenuRoomId={openedMenuRoomId}
                setOpenedMenuRoomId={setOpenedMenuRoomId}
              />
            ))}
        </ul>
      )}
    </div>
  );
};
