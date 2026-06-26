import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:3000/rooms';

export const RoomList = ({ onJoin }) => {
  const [rooms, setRooms] = useState([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  function loadRooms() {
    return axios.get(API_URL).then((response) => setRooms(response.data));
  }

  useEffect(() => {
    loadRooms();
  }, []);

  return (
    <>
      <ul className="rooms">
        {rooms.map((room) => (
          <li key={room} className="field is-horizontal">
            <span className="room-name">{room}</span>
            <button className="button" onClick={() => onJoin(room)}>
              Join
            </button>
          </li>
        ))}
      </ul>

      <form
        className="field is-horizontal"
        onSubmit={async (event) => {
          event.preventDefault();

          try {
            await axios.post(API_URL, { name });
            setRooms((prev) => [...prev, name]);
            setName('');
          } catch (err) {
            if (err.response?.status === 409) {
              setError('Room already exists');
            } else {
              setError('Failed to create room');
            }
          }
        }}
      >
        <input
          type="text"
          className="input"
          placeholder="New room name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setError('');
          }}
        />
        <button className="button">Create</button>
        {error && <p className="help is-danger">{error}</p>}
      </form>
    </>
  );
};
