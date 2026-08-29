import { useCallback, useEffect, useRef, useState } from 'react';
import * as api from './api';
import { useChatSocket } from './useChatSocket';
import { UsernameGate } from './components/UsernameGate';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { XIcon } from 'lucide-react';

export default function App() {
  const [username, setUsername] = useState(() => localStorage.getItem('username') || '');

  const [rooms, setRooms] = useState([]);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');

  const activeRoomIdRef = useRef(activeRoomId);
  useEffect(() => {
    activeRoomIdRef.current = activeRoomId;
  }, [activeRoomId]);

  function saveUsername(name) {
    localStorage.setItem('username', name);
    setUsername(name);
  }

  function logout() {
    localStorage.removeItem('username');
    setUsername('');
  }

  const upsertRoom = useCallback((room) => {
    if (!room) return;
    setRooms((prev) =>
      prev.some((r) => r.id === room.id)
        ? prev.map((r) => (r.id === room.id ? room : r)) // rename
        : [...prev, room], // new room
    );
  }, []);

  const removeRoom = useCallback((id) => {
    setRooms((prev) => prev.filter((r) => r.id !== id));
    setActiveRoomId((prev) => (prev === id ? null : prev));
  }, []);

  const addMessage = useCallback((message) => {
    if (!message) return;
    if (message.roomId !== activeRoomIdRef.current) return;
    setMessages((prev) =>
      prev.some((m) => m.id === message.id) ? prev : [...prev, message],
    );
  }, []);

  const handleSocketEvent = useCallback(
    (type, payload) => {
      if (type === 'room:created' || type === 'room:updated') upsertRoom(payload);
      else if (type === 'room:deleted') removeRoom(payload.id);
      else if (type === 'message:created') addMessage(payload);
    },
    [upsertRoom, removeRoom, addMessage],
  );

  useChatSocket(handleSocketEvent);

  useEffect(() => {
    if (!username) return;
    api
      .getRooms()
      .then((data) => setRooms(data ?? []))
      .catch(() => setError('Could not load rooms'));
  }, [username]);

  useEffect(() => {
    if (!activeRoomId) {
      setMessages([]);
      return;
    }
    api
      .getMessages(activeRoomId)
      .then((data) => setMessages(data ?? []))
      .catch(() => setError('Could not load messages'));
  }, [activeRoomId]);

  async function handleCreateRoom(name) {
    try {
      const room = await api.createRoom(name);
      upsertRoom(room);
      if (room) setActiveRoomId(room.id);
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not create room');
    }
  }

  async function handleRenameRoom(id, name) {
    try {
      upsertRoom(await api.renameRoom(id, name));
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not rename room');
    }
  }

  async function handleDeleteRoom(id) {
    try {
      await api.deleteRoom(id);
      removeRoom(id);
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not delete room');
    }
  }

  async function handleSendMessage(text) {
    try {
      addMessage(await api.sendMessage(activeRoomId, username, text));
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not send message');
    }
  }

  // Render

  if (!username) {
    return <UsernameGate onSubmit={saveUsername} />;
  }

  const activeRoom = rooms.find((r) => r.id === activeRoomId) || null;

  return (
    <div className="flex h-screen bg-slate-100 text-slate-800">
      <Sidebar
        username={username}
        rooms={rooms}
        activeRoomId={activeRoomId}
        onSelectRoom={setActiveRoomId}
        onCreateRoom={handleCreateRoom}
        onRenameRoom={handleRenameRoom}
        onDeleteRoom={handleDeleteRoom}
        onLogout={logout}
      />

      <ChatWindow
        room={activeRoom}
        messages={messages}
        username={username}
        onSendMessage={handleSendMessage}
      />

      {error && (
        <div
          className="fixed bottom-4 left-1/2 -translate-x-1/2 flex justify-center rounded-full bg-rose-500 px-4 py-2 text-sm text-white shadow-lg"
          onAnimationEnd={() => setError('')}
        >
          {error}
          <button className="ml-3 font-bold" onClick={() => setError('')}>
            <XIcon size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
