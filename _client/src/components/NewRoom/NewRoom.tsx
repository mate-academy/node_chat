import { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';

import './NewRoom.scss';
import { Room } from '../../helpers/types/Room';
import { roomsApi } from '../../helpers/api/roomsApi';

type Props = {
  chatRooms: Room[],
  setChatRooms: (chatRooms: Room[]) => void,
};

export const NewRoom: React.FC<Props> = ({
  chatRooms,
  setChatRooms,
}) => {
  const editRef = useRef<HTMLInputElement | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [isExist, setIsExist] = useState(false);

  useEffect(() => {
    if (isEditing) {
      editRef.current?.focus();
    }
  }, [isEditing]);

  const handleAddButton = () => {
    setIsEditing(true);
  };

  const handleRoomNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewRoomName(event.target.value);
    setIsExist(false);
  };

  const saveNewRoom = async () => {
    const trimmedRoomName = newRoomName.trim();
    const existingRoom = chatRooms
      .find(currRoom => currRoom.roomName === trimmedRoomName);

    if (existingRoom) {
      setIsExist(true);

      return;
    }

    if (trimmedRoomName.length !== 0) {
      const newRoom = await roomsApi.createRoom(trimmedRoomName);

      setIsEditing(false);

      setChatRooms([
        ...chatRooms,
        newRoom,
      ]);
    } else {
      setIsEditing(false);
    }

    setNewRoomName('');
  };

  const handleRoomNameKeyUp = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === 'Escape') {
      setIsEditing(false);
      setNewRoomName('');
      setIsExist(false);
    }

    if (event.key === 'Enter') {
      saveNewRoom();
    }
  };

  return (
    <li className="NewRoom">
      {!isEditing ? (
        <button
          type="button"
          className="NewRoom__add"
          onClick={handleAddButton}
        >
          +
        </button>
      ) : (
        <input
          ref={editRef}
          className={classNames('NewRoom__edit', {
            'NewRoom__edit--warning': isExist,
          })}
          placeholder="Add new room"
          value={newRoomName}
          onChange={handleRoomNameChange}
          onKeyUp={handleRoomNameKeyUp}
          onBlur={saveNewRoom}
        />
      )}

      {isExist && (
        <p className="NewRoom__warning">Room already exist</p>
      )}
    </li>
  );
};
