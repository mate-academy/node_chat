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

  async function handleRename(room) {
    const newName = window.prompt(`Rename "${room}" to:`, room);

    if (!newName || newName === room) return;

    try {
      await axios.patch(`${API_URL}/${room}`, { name: newName });
      setRooms((prev) => prev.map((r) => (r === room ? newName : r)));
    } catch (err) {
      setError(err.response?.status === 409 ? 'Room already exists' : 'Failed to rename room');
    }
  }

  async function handleCreate(event) {
    event.preventDefault();

    try {
      await axios.post(API_URL, { name });
      setRooms((prev) => [...prev, name]);
      setName('');
    } catch (err) {
      setError(err.response?.status === 409 ? 'Room already exists' : 'Failed to create room');
    }
  }

  async function handleDelete(room) {
    if (!window.confirm(`Delete room "${room}"?`)) return;

    try {
      await axios.delete(`${API_URL}/${room}`);
      setRooms((prev) => prev.filter((r) => r !== room));
    } catch {
      setError('Failed to delete room');
    }
  }

  return (
    <>
      <ul className="rooms">
        {rooms.map((room) => (
          <li key={room} className="field is-horizontal">
            <span className="room-name">{room}</span>
            <button className="button" onClick={() => onJoin(room)}>
              Join
            </button>
            <button className="button" onClick={() => handleRename(room)}>
              ✎
            </button>
            <button
              className="button is-danger"
              onClick={() => handleDelete(room)}
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      <form className="field is-horizontal" onSubmit={handleCreate}>
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
