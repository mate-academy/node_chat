import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RoomPopUp } from './CreateRoomPopUp';
import './ChatList.css';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const ChatList = ({ userName }) => {
  const [chatList, setChatList] = useState([]);
  const [showPopUp, setShowPopUp] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(apiUrl);
        setChatList(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const startEdit = (room) => {
    setEditingRoomId(room.id);
    setEditingName(room.name);
  };

  const cancelEdit = () => {
    setEditingRoomId(null);
    setEditingName('');
  };

  const saveRoomName = async (chatRoom) => {
    if (editingName.trim() === chatRoom.name.trim()) {
      cancelEdit();
      return;
    }

    try {
      const res = await axios.patch(`${apiUrl}/room/${chatRoom.id}`, {
        name: editingName,
        userName,
      });

      if (res.status === 200) {
        setChatList((prev) => prev.map((room) => (room.id === chatRoom.id ? { ...room, name: editingName } : room)));
      }
    } catch (err) {
      console.error(err);
    } finally {
      cancelEdit();
    }
  };

  const createNewRoom = async (name) => {
    try {
      const res = await axios.post(`${apiUrl}/room`, {
        name,
        userName,
      });

      setChatList((prev) => [res.data, ...prev]);
    } catch (error) {
      console.error(error);
    }
  };

  const deleteRoom = async (chatRoom) => {
    try {
      await axios.delete(`${apiUrl}/room/${chatRoom.id}`, {
        data: { userName },
      });

      setChatList((prev) => prev.filter((room) => room.id !== chatRoom.id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <section className="chat-list">
      <header className="chat-list__header">
        <h2 className="chat-list__title">Active Chat Rooms: {chatList.length}</h2>

        <button
          className="app-button app-button--primary"
          onClick={() => setShowPopUp(true)}
        >
          Create room
        </button>
      </header>

      <ul className="chat-list__rooms">
        {chatList.map((chatRoom) => {
          const isEditing = chatRoom.id === editingRoomId;

          return (
            <li
              className="chat-list__room"
              key={chatRoom.id}
            >
              <div className="chat-list__room-name">
                <span>-</span>

                <input
                  className={`chat-list__room-input ${
                    isEditing ? 'chat-list__room-input--editing' : ''
                  }`}
                  value={isEditing ? editingName : chatRoom.name}
                  readOnly={!isEditing}
                  autoFocus={isEditing}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={() => saveRoomName(chatRoom)}
                />
              </div>

              <div className="chat-list__actions">
                {!isEditing && chatRoom.userName === userName && (
                  <button className="app-button" onClick={() => startEdit(chatRoom)}>
                    Edit
                  </button>
                )}
                {isEditing && (
                  <button className="app-button" onClick={cancelEdit}>
                    Cancel
                  </button>
                )}

                {chatRoom.userName === userName && (
                  <button
                    className="app-button app-button--danger"
                    onClick={() => deleteRoom(chatRoom)}
                  >
                    Delete
                  </button>
                )}

                <Link
                  className="app-button app-button--primary"
                  to={`${chatRoom.id}`}
                >
                  Join
                </Link>
              </div>
            </li>
          );
        })}
      </ul>

      {showPopUp && <RoomPopUp onClose={() => setShowPopUp(false)} onCreateRoom={createNewRoom} />}
    </section>
  );
};
