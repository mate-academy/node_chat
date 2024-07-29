import React, { useState } from 'react';
import './MainPage.scss';
import { RoomList } from '../../RoomList/RoomList.tsx';
import { MessageList } from '../../MessageList/MessageList.tsx';

type Props = {
  logout: (isLogined: boolean) => void,
};

export const MainPage: React.FC<Props> = ({ logout }) => {
  const [roomName, setRoomName] = useState('Choose Room');
  const [roomId, setRoomId] = useState(0);

  return (
    <div className="mainPage">
      <div className="mainPage__block">
        <div className="mainPage__leftBlock leftBlock">
          <RoomList
            chooseRoomName={setRoomName}
            chooseRoomId={setRoomId}
            logout={logout}
          />
        </div>
        <div className="mainPage__rightBlock rightBlock">
          <div className="rightBlock__roomNameBlock">
            {roomName}
          </div>
          <div className="rightBlock__messageList">
            <MessageList roomId={roomId} />
          </div>

        </div>
      </div>
    </div>
  );
};