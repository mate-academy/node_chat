import React, { useContext, useState } from 'react';
import { Icon } from '../Icon/Icon';
import style from './RoomList.module.scss';
import { Modal } from '../Modal/Modal';
import { RoomModal } from '../Modal/RoomModal/RoomModal';
import { SocketContext } from '../../context/SocketProvider';
import { socketService } from '../../services/socetService';
import { UserContext } from '../../context/UserContext';
import type { Room } from '../../type/Room';
import { ListItem } from '../ListItem/ListItem';

type Props = {
  rooms: Room[];
  currentRoom: Room | null;
  onSetCurrentRoomId: (id: string) => void;
};

export const RoomList: React.FC<Props> = ({
  rooms,
  currentRoom,
  onSetCurrentRoomId,
}) => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [nameNewRoom, setNameNewRoom] = useState('');
  const [openedEditRoomId, setOpenedEditRoomId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const { socket } = useContext(SocketContext);
  const { userId } = useContext(UserContext);

  const handleClose = () => {
    setIsOpenModal(false);
    setError('');
    setNameNewRoom('');
  };

  const setEditRoomId = (id: string | null) => setOpenedEditRoomId(id);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement, HTMLInputElement>,
  ) => {
    const value = event.target.value;
    setNameNewRoom(value);
  };

  const handleCreateRoom = () => {
    const normalizedName = nameNewRoom.trim();

    if (!normalizedName) {
      setError('Room name cann`t be empty!');

      return;
    }

    if (!userId) {
      return;
    }

    const message = socketService.createSystemMessage('CREATE_ROOM', {
      roomName: normalizedName,
      creatorId: userId,
    });

    if (!socket) {
      return;
    }

    socket.send(message);

    handleClose();
  };

  return (
    <div className={style.roomList}>
      <div className={style['roomList__container']}>
        <div className={style['roomList__add']}>
          <span className={style['roomList__add-info']}>ROOMS</span>

          <button
            className={style['roomList__add-button']}
            onClick={() => setIsOpenModal(true)}
          >
            <Icon
              className={style['roomList__icon-add-room']}
              nameIcon="plus"
            />
          </button>

          <Modal isOpen={isOpenModal} closeModal={handleClose}>
            <RoomModal
              label="Room name"
              placeholder="Enter room name"
              handleChange={handleChange}
              handleCreate={handleCreateRoom}
              inputValue={nameNewRoom}
              closeModal={handleClose}
              error={error}
              title="Create new room"
            />
          </Modal>
        </div>

        <ul className={style.roomList__list}>
          {rooms?.map((room) => (
            <ListItem
              room={room}
              key={room.id}
              currentRoom={currentRoom}
              onSetCurrentRoomId={onSetCurrentRoomId}
              openedEditRoomId={openedEditRoomId}
              setEditRoomId={setEditRoomId}
            />
          ))}
        </ul>
      </div>
    </div>
  );
};
