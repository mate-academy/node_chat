import { useCallback, useEffect, useState } from 'react';
import { chatApi } from './api/chat';
import { RoomsSidebar } from './components/RoomsSidebar';
import { ChatRoom } from './components/ChatRoom';
import './App.css';

export const App = () => {
  const [userName, setUserName] = useState(
    () => localStorage.getItem('userName') || '',
  );
  const [nameInput, setNameInput] = useState('');
  const [rooms, setRooms] = useState([]);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const loadRooms = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await chatApi.getRooms();

      setRooms(data);
      setActiveRoomId((current) =>
        data.some((room) => room.id === current)
          ? current
          : data[0]?.id || null,
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userName) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadRooms();
    }
  }, [userName, loadRooms]);

  const runAction = async (action) => {
    setBusy(true);
    setError('');

    try {
      await action();

      return true;
    } catch (err) {
      setError(err.message);

      return false;
    } finally {
      setBusy(false);
    }
  };

  const createRoom = (name) =>
    runAction(async () => {
      const room = await chatApi.createRoom(name);

      setRooms((current) => [...current, room]);
      setActiveRoomId(room.id);
    });

  const renameRoom = (id, name) =>
    runAction(async () => {
      const updated = await chatApi.renameRoom(id, name);

      setRooms((current) =>
        current.map((room) => (room.id === id ? updated : room)),
      );
    });

  const deleteRoom = (id) =>
    runAction(async () => {
      await chatApi.deleteRoom(id);

      setRooms((current) => current.filter((room) => room.id !== id));

      setActiveRoomId((current) => (current === id ? null : current));
    });

  const handleLogin = (event) => {
    event.preventDefault();

    const name = nameInput.trim();

    if (!name) {
      return;
    }

    localStorage.setItem('userName', name);
    setUserName(name);
  };

  const handleChangeUser = () => {
    localStorage.removeItem('userName');
    setUserName('');
    setNameInput('');
    setRooms([]);
    setActiveRoomId(null);
  };

  if (!userName) {
    return (
      <main className="login">
        <form className="login-card" onSubmit={handleLogin}>
          <h1>Welcome to Chat</h1>

          <label htmlFor="username">What is your name?</label>

          <input
            id="username"
            value={nameInput}
            onChange={(event) => setNameInput(event.target.value)}
            maxLength={255}
            autoComplete="nickname"
            required
          />

          <button disabled={!nameInput.trim()}>Join chat</button>
        </form>
      </main>
    );
  }

  const activeRoom = rooms.find((room) => room.id === activeRoomId);

  return (
    <main className="app">
      <header className="app-header">
        <h1>Chat</h1>
        <span>{userName}</span>

        <button onClick={handleChangeUser}>Change name</button>
      </header>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <div className="chat-layout">
        <RoomsSidebar
          rooms={rooms}
          activeRoomId={activeRoomId}
          loading={loading}
          busy={busy}
          onSelect={setActiveRoomId}
          onCreate={createRoom}
          onRename={renameRoom}
          onDelete={deleteRoom}
          onRefresh={loadRooms}
        />

        {activeRoom ? (
          <ChatRoom
            key={`${userName}:${activeRoom.id}`}
            room={activeRoom}
            userName={userName}
          />
        ) : (
          <section className="empty-state">
            Select a room or create a new one
          </section>
        )}
      </div>
    </main>
  );
};