import classNames from 'classnames';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

export const Home = ({ userName, setUserName, room, setRoom, socket, rooms, setRooms }) => {
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (!value.trim()) {
      return;
    }

    if (name === 'user') {
      setUserName(value);
    } else {
      setRoom(value);
    }
  }

  const joinRoom = () => {
    if (room && userName) {
      socket.emit('join_room', { userName, room });

      const isRoom = rooms.find(val => val.title === room);
      const id = rooms[rooms.length - 1].id + 1;

      if (!isRoom) {
        setRooms(prev => {
          return [
            ...prev,
            {
              createdAt: Date.now(),
              id,
              title: room,
              updatedAt: Date.now(),
            }]
        });
      }

      localStorage.setItem('room', room);
      localStorage.setItem('user', userName);

      navigate('/chat', { replace: true });
    }
  };

  const isDisabled = !userName || !room;

  return (
    <div className="container">
      <div className="form-container">
        <h1>{`ChatRooms`}</h1>
        <input
          name="user"
          className="input"
          placeholder='UserName...'
          onChange={handleChange}
        />

        <input
          name="room"
          className="input"
          placeholder='Create new room'
          onChange={handleChange}
        />

        <select
          name="room"
          className="input"
          onChange={handleChange}
        >
          <option>-- Select Room --</option>
          {rooms.map(room => (
            <option value={room.title} key={room.id}>{room.title}</option>
          ))}
        </select>

        <button
          className={classNames(
            'button button-secondary button-home',
             {'btn-disabled': isDisabled },
            )}
          onClick={joinRoom}
          disabled={isDisabled}
        >
          Join Room
        </button>
      </div>
    </div>
  );
};
