import type React from 'react';
import { Icon } from '../Icon/Icon';
import style from './ListItem.module.scss';
import type { Room } from '../../type/Room';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../context/UserContext';
import { socketService } from '../../services/socetService';
import { SocketContext } from '../../context/SocketProvider';
import { Modal } from '../Modal/Modal';
import { RoomModal } from '../Modal/RoomModal/RoomModal';
import { DeleteRoom } from '../Modal/DeleteRoom/DeleteRoom';

type Props = {
  room: Room;
  currentRoom: Room | null;
  openedEditRoomId: string | null;
  onSetCurrentRoomId: (id: string) => void;
  setEditRoomId: (id: string | null) => void;
};

export const ListItem: React.FC<Props> = ({
  room,
  currentRoom,
  onSetCurrentRoomId,
  setEditRoomId,
  openedEditRoomId,
}) => {
  const [isModal, setIsModal] = useState(false);
  const [isModalDel, setIsModalDel] = useState(false);
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const { userName, userId } = useContext(UserContext);
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    setEditRoomId(null);
  }, [currentRoom]);

  const isCurrentRoom = room.id === currentRoom?.id;

  if (!userName) {
    return;
  }
  const isJoined = room.users.includes(userName);
  const isCreator = room.creatorId === userId;
  const canManageRoom = isCreator && isCurrentRoom;
  const isOpenEdit = openedEditRoomId === room.id;

  const toggleMenuEdit = () => {
    setEditRoomId(isOpenEdit ? null : room.id);
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement, HTMLInputElement>,
  ) => {
    const value = event.target.value;
    setValue(value);
  };

  const handleClose = () => {
    setIsModal(false);
    setError('');
    setValue('');
  };

  const handleCloseDelModal = () => setIsModalDel(false);

  const onJoin = (id: string) => {
    const message = socketService.createSystemMessage('JOIN_ROOM', {
      roomId: id,
    });

    socket?.send(message);
  };

  const handleRename = () => {
    const normalizedName = value.trim();

    if (!normalizedName) {
      setError('Room name cann`t be empty!');

      return;
    }

    if (!userId || !socket) {
      return;
    }

    const message = socketService.createSystemMessage('NEWNAME_ROOM', {
      userId,
      roomId: room.id,
      newName: normalizedName,
    });

    socket?.send(message);
    handleClose();
  };

  const handleDeletRoom = () => {
    if (!userId || !socket || !currentRoom?.id) {
      return;
    }

    const message = socketService.createSystemMessage('DELETE_ROOM', {
      userId,
      roomId: room.id,
    });

    socket.send(message);
    handleCloseDelModal();
  };

  return (
    <>
      <li className={style.item}>
        <div className={style.item__name}>
          <Icon nameIcon="iconTag" className={style.item__icon} />
          <span className={style.item__text}>{room.roomName}</span>
        </div>

        {isCurrentRoom ? (
          <>
            {canManageRoom && (
              <button
                className={style.item__buttonMenu}
                onClick={() => toggleMenuEdit()}
              >
                <Icon nameIcon="vert" className={style.item__menu} />
              </button>
            )}
          </>
        ) : (
          <>
            {isJoined ? (
              <button
                className={style.item__button}
                onClick={() => onSetCurrentRoomId(room.id)}
              >
                Open
              </button>
            ) : (
              <button
                className={style.item__button}
                onClick={() => onJoin(room.id)}
              >
                Join
              </button>
            )}
          </>
        )}
      </li>
      {isOpenEdit && (
        <ul className={style.item__editList}>
          <li
            className={style.item__editItem}
            onClick={() => {
              // setEditRoomId(null);
              setIsModal(true);
            }}
          >
            <Icon nameIcon="editLine" className={style.item__editIcon} />
            <span>Rename</span>
          </li>

          <Modal isOpen={isModal} closeModal={() => setIsModal(false)}>
            <RoomModal
              placeholder="New room name"
              label="Enter new name"
              inputValue={value}
              handleChange={handleChange}
              error={error}
              closeModal={handleClose}
              handleCreate={handleRename}
              title="Change room name"
            />
          </Modal>

          <li
            className={style.item__editItem}
            onClick={() => {
              // setEditRoomId(null);
              setIsModalDel(true);
            }}
          >
            <Icon nameIcon="delete" className={style.item__deleteIcon} />
            <span>Delete</span>
          </li>

          <Modal isOpen={isModalDel} closeModal={handleCloseDelModal}>
            <DeleteRoom
              closeModal={handleCloseDelModal}
              handleDeleteRoom={handleDeletRoom}
            />
          </Modal>
        </ul>
      )}
    </>
  );
};
