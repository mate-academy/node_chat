import { useEffect, useState, useRef } from 'react';
import './App.css';
import { MessageForm } from './MessageForm.jsx';
import { MessageList } from './MessageList.jsx';
import axios from 'axios';

const API = 'http://localhost:3005';

export function App() {
  const [rooms, setRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [newRoomName, setNewRoomName] = useState('');
  const [deletedRoom, setDeletedRoom] = useState(null);
  const socketRef = useRef(null);

  const fetchRooms = async () => {
    const res = await axios.get(`${API}/rooms`);
    setRooms(res.data);
  };

  const fetchMessages = async (room) => {
    const res = await axios.get(`${API}/rooms/${room}/messages`);
    setMessages(res.data.reverse());
  };

  const sendMessage = (text, room) => {
    const author = localStorage.getItem('username');

    return axios.post(`${API}/messages`, { text, author, room });
  }

  const saveData = (msg) => {
    setMessages((prev) => [msg, ...prev]);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (currentRoom) {
      fetchMessages(currentRoom);
      setDeletedRoom(null);
    }
  }, [currentRoom]);

  useEffect(() => {
    socketRef.current = new WebSocket('ws://localhost:3005');

    socketRef.current.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'message':
          if (data.payload.room === currentRoom) {
            saveData(data.payload);
          }
          break;

        case 'room-update':
          const payload = data.payload;

          fetchRooms();

          if (payload.action === 'deleted') {
            if (payload.name === currentRoom) {
              setDeletedRoom(currentRoom);
              setCurrentRoom(null);
            }
          }
          if (payload.action === 'renamed' && payload.oldName === currentRoom) {
            setCurrentRoom(payload.newName);
          }
          break;

        default:
          break;
      }
    });

    return () => {
      socketRef.current.close();
    };
  }, [currentRoom]);

  useEffect(() => {
    const savedName = localStorage.getItem('username');
    if (!savedName) {
      const name = prompt('Enter your username');
      localStorage.setItem('username', name);
    }
  }, []);

  const createRoom = async () => {
    if (!newRoomName) return;
    try {
      await axios.post(`${API}/rooms`, { name: newRoomName });
      setCurrentRoom(newRoomName);
      setNewRoomName('');
    } catch (e) {
      alert('Room already exists');
    }
  };

  const deleteRoom = async (name) => {
    await axios.delete(`${API}/rooms/${name}`);
    if (currentRoom === name) setCurrentRoom(null);
  };

  const renameRoom = async (oldName) => {
    const newName = prompt('Enter new name', oldName);
    if (!newName || newName === oldName) return;
    try {
      await axios.put(`${API}/rooms/${oldName}`, { newName });
    } catch (e) {
      alert('Failed to rename room');
    }
  };

  return (
    <section className="section">
      <div className="container">
        <h2 className="title is-4">Rooms</h2>

        {rooms.length === 0 ? (
          <p className="notification is-warning is-light">
            No rooms yet. Create one below 👇
          </p>
        ) : (
          <ul className="box">
            {rooms.map((room) => (
              <li key={room} className="level is-mobile">
                <div className="level-left">
                  <button
                    className={`button is-small mr-2 ${room === currentRoom ? 'is-link is-light' : 'is-light'}`}
                    onClick={() => {
                      setDeletedRoom(null);
                      setCurrentRoom(room)
                    }}
                  >
                    {room === currentRoom ? <strong>{room}</strong> : room}
                  </button>
                </div>
                <div className="level-right">
                  <button className="button is-small is-info mr-2" onClick={() => renameRoom(room)}>Rename</button>
                  <button className="button is-small is-danger" onClick={() => deleteRoom(room)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="field has-addons mt-4">
          <div className="control is-expanded">
            <input
              className="input"
              type="text"
              placeholder="New room name"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
            />
          </div>
          <div className="control">
            <button className="button is-primary" onClick={createRoom}>
              Create Room
            </button>
          </div>
        </div>

        {deletedRoom && (
          <div className="notification is-danger is-light mt-4">
            Oops! The room <strong>{deletedRoom}</strong> is gone. Pick another one or make a new room.
          </div>
        )}

        {currentRoom && (
          <>
            <h1 className="title mt-6">Chat application</h1>

            <MessageForm room={currentRoom} onSend={sendMessage} />
            <MessageList messages={messages} />
          </>
        )}
      </div>
    </section>
  );
}
