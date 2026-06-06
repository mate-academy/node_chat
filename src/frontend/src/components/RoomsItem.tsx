import { EllipsisVertical, Hash, PencilLine, Trash } from 'lucide-react';
import type { Room } from '../types/Room';
import {
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { UsernameContext } from '../context/UsernameContext';
import { SocketContext } from '../context/SocketContext';
import { createSocketMessage } from '../services/createSocketMessage';
import Modal from './Modal';
import { RoomModal } from './RoomModal';
import { DeleteRoomModal } from './DeleteRoomModal';

type Props = {
  room: Room;
  currentRoom: Room | null;
  onSetCurrentRoomId: Dispatch<SetStateAction<number | null>>;
  openedMenuRoomId: number | null;
  setOpenedMenuRoomId: Dispatch<SetStateAction<number | null>>;
};

export const RoomsItem: React.FC<Props> = ({
  room,
  currentRoom,
  onSetCurrentRoomId,
  openedMenuRoomId,
  setOpenedMenuRoomId,
}) => {
  const { username, usernameId } = useContext(UsernameContext);
  const { socket } = useContext(SocketContext);
  const [modal, setModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setOpenedMenuRoomId(null);
  }, [currentRoom, setOpenedMenuRoomId]);

  if (!username) {
    return;
  }

  const isCurrentRoom = currentRoom?.id === room.id;
  const isJoined = room.users.includes(username);
  const isCreator = room.creatorId === usernameId;
  const canManageRoom = isCreator && isCurrentRoom;
  const isMenuOpen = openedMenuRoomId === room.id;

  const handleJoin = () => {
    const message = createSocketMessage('JOIN_ROOM', {
      roomId: room.id,
    });

    if (!socket) {
      return;
    }

    socket.send(message);

    onSetCurrentRoomId(room.id);
  };

  const handleOpenRoom = () => {
    if (isJoined) {
      onSetCurrentRoomId(room.id);
    } else {
      handleJoin();
    }
  };

  const handleCloseModal = () => {
    setError('');
    setValue('');
    setModal(false);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal(false);
  };

  const handleToggleMenu = () => {
    setOpenedMenuRoomId(openedMenuRoomId === room.id ? null : room.id);
  };

  const handleRenameRoom = () => {
    const normalizedValue = value.trim();

    if (!normalizedValue) {
      setError('Room name cannot be empty!');

      return;
    }

    if (!usernameId) {
      return;
    }

    const message = createSocketMessage('RENAME_ROOM', {
      roomId: room.id,
      newName: normalizedValue,
      userId: usernameId,
    });

    if (!socket) {
      return;
    }

    socket.send(message);

    handleCloseModal();
    setOpenedMenuRoomId(null);
  };

  const handleDeleteRoom = () => {
    if (!usernameId) {
      return;
    }

    const message = createSocketMessage('DELETE_ROOM', {
      roomId: room.id,
      userId: usernameId,
    });

    if (!socket) {
      return;
    }

    socket.send(message);

    handleCloseDeleteModal();
    setOpenedMenuRoomId(null);
  };

  return (
    <>
      <li
        className={`rooms-item ${isCurrentRoom ? 'rooms-item-active' : ''}`}
        onClick={handleOpenRoom}
      >
        <div className="rooms-item-name">
          <Hash size={15} />
          <span className="rooms-item-text">{room.name}</span>
        </div>

        {isCurrentRoom ? (
          <>
            {canManageRoom && (
              <button
                className="rooms-item-manage-button"
                onClick={handleToggleMenu}
              >
                <EllipsisVertical size={18} />
              </button>
            )}
          </>
        ) : (
          <>
            {isJoined ? (
              <button className="rooms-item-button">Open</button>
            ) : (
              <button className="rooms-item-button" onClick={handleJoin}>
                Join
              </button>
            )}
          </>
        )}
      </li>
      {isMenuOpen && (
        <ul className="rooms-item-dropdown">
          <li
            className="rooms-item-dropdown-item"
            onClick={() => setModal(true)}
          >
            <PencilLine size={20} />
            Rename
          </li>
          <Modal isOpen={modal} onClose={() => setModal(false)}>
            <RoomModal
              title="Rename room"
              subtitle="New room name"
              placeholder="Enter new name"
              buttonText="Save"
              value={value}
              error={error}
              onChange={setValue}
              onSubmit={handleRenameRoom}
              onClose={handleCloseModal}
            />
          </Modal>
          <li
            className="rooms-item-dropdown-item"
            onClick={() => setDeleteModal(true)}
          >
            <Trash size={20} color="red" />
            Delete
          </li>
          <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)}>
            <DeleteRoomModal
              title="Delete room"
              subtitle="Are you sure you want to delete this room? This action cannot be undone."
              buttonText="Delete"
              onClose={handleCloseDeleteModal}
              onSubmit={handleDeleteRoom}
            />
          </Modal>
        </ul>
      )}
    </>
  );
};
