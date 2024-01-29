import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import classNames from 'classnames';

import './RoomInfo.scss';
import { User } from '../../helpers/types/User';
import { Room } from '../../helpers/types/Room';

type Props = {
  userName: string,
  room: Room,
  socket: Socket,
};

export const RoomInfo: React.FC<Props> = ({
  userName,
  room,
  socket,
}) => {
  const [roomUsers, setRoomUsers] = useState<User[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    socket.on('chatroom_users', (data) => {
      setRoomUsers(data);
    });

    return () => {
      socket.off('chatroom_users');
    };
  });

  const leaveRoom = () => {
    socket.emit('leave_room', { userName, roomId: room.id });
    navigate('/', { replace: true });
  };

  return (
    <div className="RoomInfo">
      <h2 className="RoomInfo__title">{room.roomName}</h2>

      {roomUsers.length > 0 && (
        <>
          <h3 className="RoomInfo__subtitle">Users:</h3>

          <ul className="RoomInfo__users">
            {roomUsers.map(user => (
              <li
                key={user.id}
                className={classNames('RoomInfo__user', {
                  'RoomInfo__user--active': user.userName === userName,
                })}
              >
                {user.userName}
              </li>
            ))}
          </ul>
        </>
      )}

      <button type="button" className="RoomInfo__leave" onClick={leaveRoom}>
        Leave
      </button>
    </div>
  );
};
