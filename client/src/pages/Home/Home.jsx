import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

export const Home = ({ username, setUsername, room, setRoom, socket, rooms }) => {
  const navigate = useNavigate();
  console.log(room, username, socket)
  const joinRoom = () => {
    if (room !== '' && username !== '') {
      socket.emit('join_room', { username, room });

      navigate('/chat', { replace: true });
    }
  };

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
          className='btn btn-secondary btn-home'
          onClick={joinRoom}
        >
          Join Room
        </button>
      </div>
    </div>
  );
};
