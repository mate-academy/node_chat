import { useEffect, useState } from 'react';

import {
  getRooms,
  createRoom,
  renameRoom,
  joinRoom,
  leaveRoom,
  deleteRoom,
} from '../services/chatService';

const ChatPage = ({ user, onLogout }) => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);

  const [editingRoom, setEditingRoom] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const data = await getRooms(user.id);

        setRooms(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, []);

  const handleCreateClick = () => {
    setEditingRoom(null);
    setModalOpen(true);
  };

  const handleRenameClick = (room) => {
    setEditingRoom(room);
    setModalOpen(true);
  };

  const handleModalSubmit = async (roomName) => {
    try {
      if (editingRoom) {
        const updatedRoom = await renameRoom(editingRoom.id, roomName);

        setRooms((prev) => {
          return prev.map((room) => {
            return room.id === updatedRoom.id ? updatedRoom : room;
          });
        });

        if (selectedRoom?.id === updatedRoom.id) {
          setSelectedRoom(updatedRoom);
        }
      } else {
        const newRoom = await createRoom(roomName, user.id);

        setRooms((prev) => [...prev, newRoom]);
      }

      setModalOpen(false);
      setEditingRoom(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSelectRoom = async (room) => {
    try {
      setError('');

      await joinRoom(room.id, user.username);

      setSelectedRoom(room);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddParticipant = async (room) => {
    const promptMessage = `Enter the username to add to "${room.name}":`;

    const username = window.prompt(promptMessage);

    if (!username?.trim()) {
      return;
    }

    try {
      setError('');
      await joinRoom(room.id, username.trim());
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLeaveRoom = async (room) => {
    try {
      await leaveRoom(room.id, user.username);

      setSelectedRoom(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteRoom = async (room) => {
    const confirmed = window.confirm(`Delete "${room.name}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await deleteRoom(room.id);

      setRooms((prev) => prev.filter((item) => item.id !== room.id));

      if (selectedRoom?.id === room.id) {
        setSelectedRoom(null);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="container has-text-centered p-6">
        <button className="button is-loading is-white">Loading</button>
      </div>
    );
  }

  return (
    <div>
      <nav className="navbar is-light">
        <div className="navbar-brand">
          <div className="navbar-item">
            <strong>💬 Chat</strong>
          </div>
        </div>

        <div className="navbar-end">
          <div className="navbar-item">{user.username}</div>

          <div className="navbar-item">
            <button className="button is-light" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      {error && (
        <div className="notification is-danger is-light m-3">
          <button className="delete" onClick={() => setError('')} />

          {error}
        </div>
      )}

      <div className="columns m-0">
        <aside
          className="column is-3 p-4"
          style={{
            minHeight: 'calc(100vh - 52px)',
            borderRight: '1px solid #dbdbdb',
          }}
        >
          <RoomList
            rooms={rooms}
            selectedRoom={selectedRoom}
            onSelect={handleSelectRoom}
            onCreate={handleCreateClick}
            onRename={handleRenameClick}
            onDelete={handleDeleteRoom}
            onAddParticipant={handleAddParticipant}
          />
        </aside>

        <main className="column p-0">
          {selectedRoom ? (
            <Chat room={selectedRoom} user={user} onLeave={handleLeaveRoom} />
          ) : (
            <div className="has-text-centered p-6">
              <h1 className="title is-4">Select a room</h1>

              <p className="has-text-grey">
                Choose a room from the list or create a new one.
              </p>
            </div>
          )}
        </main>
      </div>

      <CreateRoomModal
        isOpen={modalOpen}
        room={editingRoom}
        onClose={() => {
          setModalOpen(false);
          setEditingRoom(null);
        }}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
};

export default ChatPage;
