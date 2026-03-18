const { useState, useEffect, useRef, useCallback } = React;

const socket = io();

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso) {
  const d = new Date(iso);

  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function slugify(str) {
  return (
    str
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .slice(0, 32) || 'room'
  );
}

function Modal({
  title,
  initialValue = '',
  onConfirm,
  onCancel,
  placeholder,
  requireInput = false,
}) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef(null);
  const confirmDisabled = requireInput && !value.trim();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !confirmDisabled) onConfirm(value.trim());
    if (e.key === 'Escape') onCancel();
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
        />
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={() => onConfirm(value.trim())}
            disabled={confirmDisabled}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const [name, setName] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onLogin(trimmed);
  }

  return (
    <div className="login-screen">
      <h1>💬 Node Chat</h1>
      <p>Enter your name to start chatting</p>
      <form onSubmit={handleSubmit}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name..."
          maxLength={32}
          autoFocus
        />
        <button type="submit" disabled={!name.trim()}>
          Join Chat
        </button>
      </form>
    </div>
  );
}

// ── Room Item ─────────────────────────────────────────────────────────────────

function RoomItem({ room, active, onJoin, onRename, onDelete }) {
  return (
    <div
      className={`room-item ${active ? 'active' : ''}`}
      onClick={() => onJoin(room.id)}
    >
      <span className="room-name"># {room.name}</span>
      <div className="room-actions" onClick={(e) => e.stopPropagation()}>
        <button
          className="icon-btn"
          title="Rename"
          onClick={() => onRename(room)}
        >
          ✏️
        </button>
        <button
          className="icon-btn danger"
          title="Delete"
          onClick={() => onDelete(room)}
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────

function App() {
  const [username, setUsername] = useState(
    () => localStorage.getItem('chat_username') || '',
  );
  const [rooms, setRooms] = useState([]);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  // messages: { [roomId]: Message[] }
  const [messages, setMessages] = useState({});
  const [inputText, setInputText] = useState('');
  const [modal, setModal] = useState(null); // null | { type, room? }
  const messagesEndRef = useRef(null);

  // ── Actions ──

  const joinRoom = useCallback((roomId) => {
    setCurrentRoomId(roomId);
    socket.emit('room:join', roomId);
  }, []);

  // ── Socket events ──

  useEffect(() => {
    socket.on('rooms:list', (list) => {
      setRooms(list);
    });

    socket.on('room:history', ({ roomId, messages: msgs }) => {
      setMessages((prev) => ({ ...prev, [roomId]: msgs }));
    });

    socket.on('message:new', ({ roomId, message }) => {
      setMessages((prev) => ({
        ...prev,
        [roomId]: [...(prev[roomId] || []), message],
      }));
    });

    socket.on('room:deleted', (roomId) => {
      setCurrentRoomId((prev) => (prev === roomId ? null : prev));
      setMessages((prev) => {
        const copy = { ...prev };
        delete copy[roomId];
        return copy;
      });
    });

    socket.on('room:created', ({ id }) => {
      joinRoom(id);
    });

    return () => {
      socket.off('rooms:list');
      socket.off('room:history');
      socket.off('message:new');
      socket.off('room:deleted');
      socket.off('room:created');
    };
  }, [joinRoom]);

  // Sync username to server on login and after page reload
  useEffect(() => {
    if (!username) return;

    socket.emit('user:set', username);
    joinRoom('general');
  }, [username, joinRoom]);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentRoomId]);

  function handleLogin(newUsername) {
    localStorage.setItem('chat_username', newUsername);
    setUsername(newUsername);
  }

  function sendMessage(e) {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || !currentRoomId) return;
    socket.emit('message:send', { roomId: currentRoomId, text });
    setInputText('');
  }

  function handleCreateRoom(name) {
    if (!name) return;
    const id = slugify(name) + '-' + Date.now().toString(36);
    socket.emit('room:create', { id, name });
    setModal(null);
  }

  function handleRenameRoom(name) {
    if (!name || !modal?.room) return;
    socket.emit('room:rename', { id: modal.room.id, name });
    setModal(null);
  }

  function handleDeleteRoom(room) {
    socket.emit('room:delete', room.id);
    setModal(null);
  }

  // ── Render ──

  if (!username) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const currentMessages = messages[currentRoomId] || [];
  const currentRoom = rooms.find((r) => r.id === currentRoomId);

  return (
    <div className="chat-layout">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>💬 Node Chat</h2>
          <div className="user-info">
            Logged in as <span>{username}</span>
          </div>
        </div>

        <div className="rooms-list">
          {rooms.map((room) => (
            <RoomItem
              key={room.id}
              room={room}
              active={room.id === currentRoomId}
              onJoin={joinRoom}
              onRename={(r) => setModal({ type: 'rename', room: r })}
              onDelete={(r) => setModal({ type: 'delete', room: r })}
            />
          ))}
        </div>

        <div className="sidebar-footer">
          <button
            className="new-room-btn"
            onClick={() => setModal({ type: 'create' })}
          >
            + New Room
          </button>
        </div>
      </div>

      {/* Chat main */}
      <div className="chat-main">
        <div className="chat-header">
          {currentRoom ? `# ${currentRoom.name}` : 'Select a room'}
        </div>

        {currentRoomId ? (
          <>
            <div className="messages-area">
              {currentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message ${msg.author === username ? 'own' : ''}`}
                >
                  <div className="message-meta">
                    <span className="author">{msg.author}</span>
                    <span>{formatTime(msg.time)}</span>
                  </div>
                  <div className="message-bubble">{msg.text}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form className="message-input-area" onSubmit={sendMessage}>
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a message..."
                autoFocus
              />
              <button type="submit" disabled={!inputText.trim()}>
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="no-room">
            Pick a room from the sidebar to start chatting
          </div>
        )}
      </div>

      {/* Modals */}
      {modal?.type === 'create' && (
        <Modal
          title="Create new room"
          placeholder="Room name..."
          onConfirm={handleCreateRoom}
          onCancel={() => setModal(null)}
        />
      )}

      {modal?.type === 'rename' && (
        <Modal
          title={`Rename "${modal.room.name}"`}
          initialValue={modal.room.name}
          placeholder="New name..."
          onConfirm={handleRenameRoom}
          onCancel={() => setModal(null)}
        />
      )}

      {modal?.type === 'delete' && (
        <Modal
          title={`Delete "${modal.room.name}"?`}
          placeholder="Type anything to confirm..."
          onConfirm={() => handleDeleteRoom(modal.room)}
          onCancel={() => setModal(null)}
          requireInput
        />
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
