import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';

import './RoomItem.scss';
import { Room } from '../../helpers/types/Room';
import { roomsApi } from '../../helpers/api/roomsApi';

type Props = {
  room: Room,
  chatRooms: Room[],
  setChatRooms: (chatRooms: Room[]) => void,
};

export const RoomItem: React.FC<Props> = ({
  room,
  chatRooms,
  setChatRooms,
}) => {
  const editRef = useRef<HTMLInputElement | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editedRoomName, setEditedRoomName] = useState(room.roomName);
  const [isExist, setIsExist] = useState(false);

  useEffect(() => {
    if (isEditing) {
      editRef.current?.focus();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleRemoveItem = async () => {
    await roomsApi.deleteRoom(room.id);

    setChatRooms(chatRooms.filter((currRoom) => currRoom.id !== room.id));
  };

  const handleRoomNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditedRoomName(event.target.value);
    setIsExist(false);
  };

  const saveRoomNameChange = async () => {
    if (editedRoomName === room.roomName) {
      setIsEditing(false);

      return;
    }

    const trimmedRoomName = editedRoomName.trim();

    const existingRoom = chatRooms
      .find(currRoom => currRoom.roomName === trimmedRoomName);

    if (existingRoom) {
      setIsExist(true);

      return;
    }

    if (trimmedRoomName.length !== 0) {
      await roomsApi.updateRoom(room.id, trimmedRoomName);

      setIsEditing(false);

      setChatRooms(
        chatRooms.map((currRoom) => {
          if (currRoom.id === room.id) {
            return {
              ...currRoom,
              roomName: trimmedRoomName,
            };
          }

          return { ...currRoom };
        }),
      );
    } else {
      handleRemoveItem();
    }
  };

  const handleRoomNameKeyUp = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === 'Escape') {
      setEditedRoomName(room.roomName);
      setIsEditing(false);
      setIsExist(false);
    }

    if (event.key === 'Enter') {
      saveRoomNameChange();
    }
  };

  return (
    <li className="RoomItem">
      {!isEditing ? (
        <>
          <span className="RoomItem__name" onDoubleClick={handleDoubleClick}>
            {room.roomName}
          </span>
          <button
            type="button"
            className="RoomItem__remove"
            onClick={handleRemoveItem}
          >
            ×
          </button>
        </>
      ) : (
        <input
          ref={editRef}
          className={classNames('RoomItem__edit', {
            'RoomItem__edit--warning': isExist,
          })}
          placeholder="Empty room name will be deleted"
          value={editedRoomName}
          onChange={handleRoomNameChange}
          onKeyUp={handleRoomNameKeyUp}
          onBlur={saveRoomNameChange}
        />
      )}

      {isExist && <p className="RoomItem__warning">Room already exist</p>}
    </li>
  );
};
