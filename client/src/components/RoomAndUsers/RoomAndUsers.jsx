import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './RoomAndUsers.css';

export const RoomAndUsers = ({ socket, username, room }) => {
  const [roomUsers, setRoomUsers] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    socket.on('chatroom_users', (data) => {
      setRoomUsers(data);
    });

    return () => socket.off('chatroom_users');
  }, [socket]);

  const leaveRoom = () => {
    const createdtime = Date.now();
    socket.emit('leave_room', { username, room, createdtime });

    localStorage.removeItem('room');
    localStorage.removeItem('user');

    navigate('/', { replace: true });
  };

  return (
    <div className="roomAndUsersColumn">
      <h2 className="roomTitle">{room}</h2>

      <div>
        {roomUsers.length > 0 && <h5 className="usersTitle">Users:</h5>}
        <ul className="usersList">
          {roomUsers.map((user) => (
            <li
              className="userItem"
              key={user.id}
            >
              {user.username}
            </li>
          ))}
        </ul>
      </div>

      <button className='btn btn-outline' onClick={leaveRoom}>
        Leave
      </button>
    </div>
  );
};
