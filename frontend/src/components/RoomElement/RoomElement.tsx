import classNames from 'classnames';
import React from 'react';
import { Room } from '../../types/Room';

interface Props {
  room: Room;
  loading: boolean;
  onDelete: (id: string) => void;
  setPickedRoomId: (id: string) => void;
  setPickedRoomName: (name: string) => void;
  setEditedRoomId: (id: string | null) => void;
  setEditedRoomName: (name: string) => void;
  setNewRoom: (status: boolean) => void;
  newMessageFocus: () => void;
  setPickedRoomUser: (userId: string) => void;
}

export const RoomElement: React.FC<Props> = ({
  room,
  loading,
  onDelete,
  setPickedRoomId,
  setPickedRoomName,
  setEditedRoomId,
  setEditedRoomName,
  setNewRoom,
  newMessageFocus,
  setPickedRoomUser,
}) => {
  const handlePickRoom = () => {
    setPickedRoomId(room.id);
    setPickedRoomName(room.roomName);
    setEditedRoomId(null);
    setEditedRoomName('');
    setNewRoom(false);
    newMessageFocus();
    setPickedRoomUser(room.userId);
  };

  return (
    <div data-cy="element" className={classNames('element')}>
      <button className="element__title" onClick={() => handlePickRoom()}>
        {room.roomName}
      </button>

      <button
        type="button"
        className="element__remove"
        onClick={() => onDelete(room.id)}
      >
        ×
      </button>

      <div
        data-cy="elementLoader"
        className={classNames('modal overlay', {
          'is-active': loading,
        })}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};
