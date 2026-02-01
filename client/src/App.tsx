import { useEffect, useMemo, useState } from 'react';
import { socket } from './socket';
import type { Message } from './types/message';
import { MessageList } from './components/MessageList';
import { MessageForm } from './components/MessageForm';
import './App.css';

type Room = {
  id: string;
  name: string;
};

const LS_USERNAME_KEY = 'chat:username';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomId, setRoomId] = useState('general');
  const [roomName, setRoomName] = useState('General');

  const [username, setUsername] = useState(() => localStorage.getItem(LS_USERNAME_KEY) || '');
  const [pendingUsername, setPendingUsername] = useState(() => localStorage.getItem(LS_USERNAME_KEY) || '');

  const [newRoom, setNewRoom] = useState('');
  const [renameRoom, setRenameRoom] = useState('');

  const canManageRoom = roomId !== 'general';

  const activeRoomLabel = useMemo(() => {
    const found = rooms.find((r) => r.id === roomId);
    return found?.name || roomName;
  }, [rooms, roomId, roomName]);

  useEffect(() => {
    const onHistory = (history: Message[]) => setMessages(history);
    const onNew = (m: Message) => setMessages((prev) => [...prev, m]);

    const onRooms = (list: Room[]) => setRooms(list);
    const onJoined = (payload: { roomId: string; roomName: string }) => {
      setRoomId(payload.roomId);
      setRoomName(payload.roomName);
      setRenameRoom(payload.roomName);
      setMessages([]);
    };
    const onUserAck = (name: string) => {
      setUsername(name);
      setPendingUsername(name);
      localStorage.setItem(LS_USERNAME_KEY, name);
    };

    socket.on('room:history', onHistory);
    socket.on('message:new', onNew);
    socket.on('room:list', onRooms);
    socket.on('room:joined', onJoined);
    socket.on('user:ack', onUserAck);

    const saved = localStorage.getItem(LS_USERNAME_KEY);
    if (saved) {
      socket.emit('user:set', saved);
    }

    return () => {
      socket.off('room:history', onHistory);
      socket.off('message:new', onNew);
      socket.off('room:list', onRooms);
      socket.off('room:joined', onJoined);
      socket.off('user:ack', onUserAck);
    };
  }, []);

  const saveUsername = () => {
    const value = pendingUsername.trim();
    if (!value) return;
    socket.emit('user:set', value);
  };

  const joinRoom = (id: string) => {
    if (!id || id === roomId) return;
    socket.emit('room:join', id);
  };

  const createRoom = () => {
    const value = newRoom.trim();
    if (!value) return;
    socket.emit('room:create', value);
    setNewRoom('');
  };

  const renameActiveRoom = () => {
    const value = renameRoom.trim();
    if (!canManageRoom || !value) return;
    socket.emit('room:rename', { roomId, roomName: value });
  };

  const deleteActiveRoom = () => {
    if (!canManageRoom) return;
    socket.emit('room:delete', roomId);
  };

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="box">

          <div className="block">
            <div className="field has-addons">
              <div className="control is-expanded">
                <input
                  className="input"
                  value={pendingUsername}
                  onChange={(e) => setPendingUsername(e.target.value)}
                  placeholder="Your name (saved in localStorage)"
                />
              </div>
              <div className="control">
                <button className="button is-info" type="button" onClick={saveUsername}>
                  Save
                </button>
              </div>
            </div>

            {username && (
              <p className="has-text-grey is-size-7">
                You are: <strong>{username}</strong>
              </p>
            )}
          </div>

          <div className="block">
            <p className="has-text-grey is-size-7" style={{ marginBottom: '0.5rem' }}>
              Room: <strong>{activeRoomLabel}</strong>
            </p>

            <div className="tabs is-toggle is-small">
              <ul>
                {rooms.map((r) => (
                  <li key={r.id} className={r.id === roomId ? 'is-active' : ''}>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        joinRoom(r.id);
                      }}
                    >
                      {r.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="field has-addons">
              <div className="control is-expanded">
                <input
                  className="input"
                  value={newRoom}
                  onChange={(e) => setNewRoom(e.target.value)}
                  placeholder="Create new room..."
                />
              </div>
              <div className="control">
                <button className="button is-link" type="button" onClick={createRoom}>
                  Create
                </button>
              </div>
            </div>

            <div className="field has-addons">
              <div className="control is-expanded">
                <input
                  className="input"
                  value={renameRoom}
                  onChange={(e) => setRenameRoom(e.target.value)}
                  placeholder="Rename active room..."
                  disabled={!canManageRoom}
                />
              </div>
              <div className="control">
                <button
                  className="button is-warning"
                  type="button"
                  onClick={renameActiveRoom}
                  disabled={!canManageRoom}
                >
                  Rename
                </button>
              </div>
              <div className="control">
                <button
                  className="button is-danger"
                  type="button"
                  onClick={deleteActiveRoom}
                  disabled={!canManageRoom}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

          <div className="block">
            <MessageForm onSend={(text) => socket.emit('message:send', text)} />
          </div>

          <MessageList messages={messages} />
        </div>
      </div>
    </section>
  );
}
