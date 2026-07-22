import { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

const WS_URL = 'ws://localhost:3000';
const API_URL = 'http://localhost:3000';

// ── Custom hook: WebSocket connection ───────────────────────────
function useChat(username) {
  const [messages, setMessages] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);

  // Fetch rooms list from REST API
  const fetchRooms = useCallback(async () => {
    const res = await fetch(`${API_URL}/rooms`);
    const data = await res.json();
    setRooms(data);
    return data;
  }, []);

  // Connect WebSocket and set up handlers
  useEffect(() => {
    if (!username) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = async () => {
      setConnected(true);
      const roomList = await fetchRooms();
      const firstRoom = roomList[0]?.id || 'general';

      ws.send(JSON.stringify({
        type: 'user:join',
        username,
        roomId: firstRoom,
      }));

      setCurrentRoom(firstRoom);
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      handleServerMessage(msg);
    };

    ws.onclose = () => setConnected(false);

    return () => ws.close();
  }, [username]);

  function handleServerMessage(msg) {
    switch (msg.type) {
      case 'room:history':
        setMessages(msg.messages);
        break;

      case 'message:new':
        setMessages(prev => [...prev, msg.message]);
        break;

      case 'room:created':
        setRooms(prev => [...prev, msg.room]);
        break;

      case 'room:renamed':
        setRooms(prev =>
          prev.map(r => r.id === msg.roomId ? { ...r, name: msg.name } : r)
        );
        break;

      case 'room:deleted':
        setRooms(prev => prev.filter(r => r.id !== msg.roomId));
        // If we were in the deleted room, go to general
        setCurrentRoom(prev => {
          if (prev === msg.roomId) {
            joinRoom('general');
            return 'general';
          }
          return prev;
        });
        break;
    }
  }

  function sendMessage(text) {
    if (!wsRef.current || !text.trim()) return;
    wsRef.current.send(JSON.stringify({ type: 'message:send', text }));
  }

  function joinRoom(roomId) {
    if (!wsRef.current || roomId === currentRoom) return;
    wsRef.current.send(JSON.stringify({ type: 'room:join', roomId }));
    setCurrentRoom(roomId);
    setMessages([]);
  }

  async function createRoom(name) {
    const res = await fetch(`${API_URL}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    return res.json();
  }

  async function renameRoom(id, name) {
    await fetch(`${API_URL}/rooms/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
  }

  async function deleteRoom(id) {
    await fetch(`${API_URL}/rooms/${id}`, { method: 'DELETE' });
  }

  return { messages, rooms, currentRoom, connected, sendMessage, joinRoom, createRoom, renameRoom, deleteRoom };
}

// ── UsernameScreen ──────────────────────────────────────────────
function UsernameScreen({ onSubmit }) {
  const [value, setValue] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (value.trim()) onSubmit(value.trim());
  }

  return (
    <div className="username-screen">
      <div className="username-card">
        <div className="username-icon">💬</div>
        <h1>Welcome to Chat</h1>
        <p>Enter your username to start chatting</p>
        <form onSubmit={handleSubmit}>
          <input
            autoFocus
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="Your username..."
            maxLength={30}
          />
          <button type="submit" disabled={!value.trim()}>
            Join Chat →
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Sidebar: room list ──────────────────────────────────────────
function Sidebar({ rooms, currentRoom, username, onJoin, onCreate, onRename, onDelete }) {
  const [newRoomName, setNewRoomName] = useState('');
  const [renaming, setRenaming] = useState(null); // roomId being renamed
  const [renameValue, setRenameValue] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  function handleCreate(e) {
    e.preventDefault();
    if (newRoomName.trim()) {
      onCreate(newRoomName.trim());
      setNewRoomName('');
      setShowCreate(false);
    }
  }

  function handleRename(e, id) {
    e.preventDefault();
    if (renameValue.trim()) {
      onRename(id, renameValue.trim());
      setRenaming(null);
    }
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-username">@{username}</span>
      </div>

      <div className="sidebar-rooms">
        <div className="sidebar-label">
          Rooms
          <button className="icon-btn" onClick={() => setShowCreate(v => !v)} title="Create room">+</button>
        </div>

        {showCreate && (
          <form className="room-create-form" onSubmit={handleCreate}>
            <input
              autoFocus
              value={newRoomName}
              onChange={e => setNewRoomName(e.target.value)}
              placeholder="Room name..."
              maxLength={40}
            />
            <button type="submit">Create</button>
          </form>
        )}

        {rooms.map(room => (
          <div key={room.id} className={`room-item ${room.id === currentRoom ? 'active' : ''}`}>
            {renaming === room.id ? (
              <form className="room-rename-form" onSubmit={e => handleRename(e, room.id)}>
                <input
                  autoFocus
                  value={renameValue}
                  onChange={e => setRenameValue(e.target.value)}
                  maxLength={40}
                />
                <button type="submit">✓</button>
                <button type="button" onClick={() => setRenaming(null)}>✕</button>
              </form>
            ) : (
              <>
                <button className="room-name" onClick={() => onJoin(room.id)}>
                  # {room.name}
                </button>
                <div className="room-actions">
                  <button
                    className="icon-btn small"
                    title="Rename"
                    onClick={() => { setRenaming(room.id); setRenameValue(room.name); }}
                  >✏️</button>
                  {room.id !== 'general' && (
                    <button
                      className="icon-btn small"
                      title="Delete"
                      onClick={() => onDelete(room.id)}
                    >🗑️</button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}

// ── Message list ────────────────────────────────────────────────
function MessageList({ messages, username }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="messages-empty">
        <span>No messages yet. Say hello! 👋</span>
      </div>
    );
  }

  return (
    <div className="messages">
      {messages.map(msg => {
        const isOwn = msg.author === username;
        return (
          <div key={msg.id} className={`message ${isOwn ? 'own' : 'other'}`}>
            {!isOwn && <div className="message-author">{msg.author}</div>}
            <div className="message-bubble">{msg.text}</div>
            <div className="message-time">
              {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}

// ── Message input ───────────────────────────────────────────────
function MessageInput({ onSend }) {
  const [text, setText] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (text.trim()) {
      onSend(text.trim());
      setText('');
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <form className="message-input" onSubmit={handleSubmit}>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message... (Enter to send)"
        rows={1}
        maxLength={1000}
      />
      <button type="submit" disabled={!text.trim()}>Send</button>
    </form>
  );
}

// ── App ─────────────────────────────────────────────────────────
export default function App() {
  const [username, setUsername] = useState(() => localStorage.getItem('chat_username') || '');

  function handleSetUsername(name) {
    localStorage.setItem('chat_username', name);
    setUsername(name);
  }

  const { messages, rooms, currentRoom, connected, sendMessage, joinRoom, createRoom, renameRoom, deleteRoom } =
    useChat(username);

  if (!username) {
    return <UsernameScreen onSubmit={handleSetUsername} />;
  }

  const currentRoomData = rooms.find(r => r.id === currentRoom);

  return (
    <div className="app">
      <Sidebar
        rooms={rooms}
        currentRoom={currentRoom}
        username={username}
        onJoin={joinRoom}
        onCreate={createRoom}
        onRename={renameRoom}
        onDelete={deleteRoom}
      />
      <main className="chat">
        <header className="chat-header">
          <h2>{currentRoomData ? `# ${currentRoomData.name}` : 'Loading...'}</h2>
          <span className={`status ${connected ? 'online' : 'offline'}`}>
            {connected ? '● Connected' : '○ Disconnected'}
          </span>
        </header>

        <MessageList messages={messages} username={username} />
        <MessageInput onSend={sendMessage} />
      </main>
    </div>
  );
}
