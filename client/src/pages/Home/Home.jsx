import classNames from 'classnames';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

export const Home = ({ username, setUsername, room, setRoom, socket, rooms, setRooms }) => {
  const navigate = useNavigate();

  const joinRoom = () => {
    if (room && username) {
      socket.emit('join_room', { username, room });

      const isRoom = rooms.find(val => val.title === room);
      const id = [...rooms].sort((a, b) => b.id - a.id)[0].id + 1;

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

      navigate('/chat', { replace: true });
    }
  };

  const isDisabled = !username || !room;

  return (
    <div className="container">
      <div className="formContainer">
        <h1>{`ChatRooms`}</h1>
        <input
          className="input"
          placeholder='Username...'
          onChange={(e) => {
            setUsername(e.target.value)
            localStorage.setItem('user', e.target.value);
          }}
        />

        <input
          className="input"
          placeholder='Create new room'
          onChange={(e) => {
            setRoom(e.target.value)
            localStorage.setItem('room', e.target.value.toLowerCase());
          }}
        />

        <select
          className="input"
          onChange={(e) => {
            setRoom(e.target.value.toLowerCase());
            localStorage.setItem('room', e.target.value.toLowerCase());
          }}
        >
          <option>-- Select Room --</option>
          {rooms.map(room => (
            <option value={room.title} key={room.id}>{room.title}</option>
          ))}
        </select>

        <button
          className={classNames(
            'btn btn-secondary btn-home',
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
