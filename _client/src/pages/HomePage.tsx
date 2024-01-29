import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import './styles/HomePage.scss';
import { Room } from '../helpers/types/Room';
import { saveUserName } from '../helpers/utils/manageLocalState';

type Props = {
  userName: string,
  setUserName: (userName: string) => void,
  chatRooms: Room[],
};

export const HomePage: React.FC<Props> = ({
  userName,
  setUserName,
  chatRooms,
}) => {
  const [selectedRoomId, setSelectedRoomId] = useState(0);

  const navigate = useNavigate();

  const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
  };

  const handleRoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRoomId(+e.target.value);
  };

  const handleManageRoomsClick = () => {
    navigate('/rooms', { replace: true });
  };

  const handleJoinRoomClick = () => {
    const selectedRoom = chatRooms
      .find(currRoom => currRoom.id === selectedRoomId);

    if (userName && selectedRoom) {
      saveUserName(userName);

      navigate(`/chat/${selectedRoom.id}`, { replace: true });
    }
  };

  return (
    <div className="HomePage">
      <h1 className="HomePage__title">Test Chat</h1>

      <div className="HomePage__content">
        <input
          className="HomePage__input"
          placeholder="Please, enter Username"
          value={userName}
          onChange={handleUserNameChange}
        />
        <div className="HomePage__rooms">
          <select
            className="HomePage__select"
            value={selectedRoomId}
            onChange={handleRoomChange}
          >
            <option value="0">-- Please, select a Room --</option>
            {chatRooms.map(chatRoom => (
              <option
                key={chatRoom.id}
                value={chatRoom.id}
              >
                {chatRoom.roomName}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="HomePage__button HomePage__button--short"
            onClick={handleManageRoomsClick}
          >
            Manage Rooms
          </button>
        </div>

        <button
          type="button"
          className="HomePage__button"
          onClick={handleJoinRoomClick}
        >
          Join Room
        </button>
      </div>
    </div>
  );
};
