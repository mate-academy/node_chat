import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:4000';

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');
  const username = localStorage.getItem('username');
  const navigate = useNavigate();

  const fetchRooms = async () => {
    const res = await axios.get(`${API_URL}/rooms`);
    setRooms(res.data);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    await axios.post(`${API_URL}/rooms`, { name: newRoomName });
    setNewRoomName('');
    fetchRooms();
  };

  const handleDeleteRoom = async (roomId) => {
    await axios.delete(`${API_URL}/rooms/${roomId}`);
    fetchRooms();
  };

  const handleRenameRoom = async (roomId) => {
    const newName = prompt('Enter new room name:');
    if (!newName) return;
    await axios.put(`${API_URL}/rooms/${roomId}`, { name: newName });
    fetchRooms();
  };

  const handleJoinRoom = (roomId) => {
    navigate(`/rooms/${roomId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    navigate('/');
  };

  return (
    <section className="section">
      <div className="container">
        <div className="is-flex is-justify-content-space-between is-align-items-center mb-4">
          <h2 className="title">Hello, {username}</h2>
          <button className="button is-light" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <h3 className="subtitle">Available rooms:</h3>
        <ul>
          {rooms.map((room) => (
            <li
              key={room.id}
              className="box is-flex is-align-items-center is-justify-content-space-between"
            >
              <strong>{room.name}</strong>
              <div>
                <button
                  className="button is-small is-info mr-2"
                  onClick={() => handleJoinRoom(room.id)}
                >
                  Join
                </button>
                <button
                  className="button is-small is-warning mr-2"
                  onClick={() => handleRenameRoom(room.id)}
                >
                  Rename
                </button>
                <button
                  className="button is-small is-danger"
                  onClick={() => handleDeleteRoom(room.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>

        <form onSubmit={handleCreateRoom} className="mt-5">
          <div className="field has-addons">
            <div className="control is-expanded">
              <input
                className="input"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="New room name"
              />
            </div>
            <div className="control">
              <button className="button is-primary" type="submit">
                Create
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default RoomList;

