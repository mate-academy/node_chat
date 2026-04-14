import { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3005');
const USERNAME_KEY = 'node_chat_username';

export default function App() {
  const [username, setUsername] = useState(
    localStorage.getItem(USERNAME_KEY) || '',
  );
  const [draftUsername, setDraftUsername] = useState(username);
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [renameValue, setRenameValue] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const messageEndRef = useRef(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  useEffect(() => {
    socket.on('roomList', setRooms);
    socket.on('roomJoined', (room) => {
      setCurrentRoom({ id: room.id, name: room.name });
      setMessages(room.messages || []);
      setRenameValue(room.name);
    });
    socket.on('roomCreated', (roomId) => {
      showToast('Room created', 'success');
      joinRoom(roomId);
    });
    socket.on('newMessage', (message) => {
      setMessages((prev) => [...prev, message]);
    });
    socket.on('systemMessage', (message) => {
      setMessages((prev) => [...prev, message]);
    });
    socket.on('roomRenamed', (room) => {
      setCurrentRoom((prev) => (prev && prev.id === room.id ? room : prev));
      setRenameValue(room.name);
      showToast('Room renamed', 'info');
    });
    socket.on('roomDeleted', (roomId) => {
      setRooms((prev) => prev.filter((room) => room.id !== roomId));
      setCurrentRoom((prev) => (prev?.id === roomId ? null : prev));
      setMessages((prev) =>
        prev.concat({
          author: 'System',
          text: 'Current room was deleted',
          time: new Date().toISOString(),
        }),
      );
      showToast('Room deleted', 'warning');
    });
    socket.on('error', (message) => {
      setError(message);
      showToast(message, 'error');
    });

    return () => {
      socket.off('roomList');
      socket.off('roomJoined');
      socket.off('roomCreated');
      socket.off('newMessage');
      socket.off('systemMessage');
      socket.off('roomRenamed');
      socket.off('roomDeleted');
      socket.off('error');
    };
  }, []);

  useEffect(() => {
    if (username) {
      socket.emit('setUsername', username);
    }
  }, [username]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const id = setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => clearTimeout(id);
  }, [toast]);

  const roomName = useMemo(() => {
    if (!currentRoom) {
      return 'No room selected';
    }

    return currentRoom.name;
  }, [currentRoom]);

  const saveUsername = (event) => {
    event.preventDefault();

    const cleaned = draftUsername.trim();

    if (!cleaned) {
      setError('Username is required');

      return;
    }

    setError('');
    localStorage.setItem(USERNAME_KEY, cleaned);
    setUsername(cleaned);
  };

  const joinRoom = (roomId) => {
    setError('');
    socket.emit('joinRoom', roomId);
  };

  const sendMessage = (event) => {
    event.preventDefault();

    const cleaned = messageText.trim();

    if (!cleaned || !currentRoom) {
      return;
    }

    socket.emit('sendMessage', cleaned);
    setMessageText('');
  };

  const createRoom = (event) => {
    event.preventDefault();
    const cleaned = newRoomName.trim();

    if (!cleaned) {
      return;
    }

    if (rooms.some((r) => r.name === cleaned)) {
      showToast('Room already exists', 'warning');
      return;
    }

    socket.emit('createRoom', cleaned);

    setNewRoomName('');
  };

  const renameRoom = (event) => {
    event.preventDefault();

    if (!currentRoom) {
      return;
    }

    const cleaned = renameValue.trim();

    if (!cleaned) {
      return;
    }

    if (rooms.some((r) => r.name === cleaned)) {
      showToast('Room already exists', 'warning');
      return;
    }

    socket.emit('renameRoom', { roomId: currentRoom.id, newName: cleaned });
  };

  const deleteRoom = () => {
    if (!currentRoom) {
      return;
    }

    socket.emit('deleteRoom', currentRoom.id);
  };

  const resetUsername = () => {
    localStorage.removeItem(USERNAME_KEY);
    setUsername('');
    setDraftUsername('');
    setCurrentRoom(null);
    setMessages([]);
    setError('');
  };

  if (!username) {
    return (
      <main className="auth-screen">
        <form onSubmit={saveUsername} className="auth-card">
          <h1>Welcome to Node Chat</h1>
          <p>Create your username to continue</p>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            value={draftUsername}
            onChange={(e) => setDraftUsername(e.target.value)}
            placeholder="Enter username"
            autoFocus
          />
          <button type="submit">Continue</button>
          {error && <div className="error">{error}</div>}
        </form>
      </main>
    );
  }

  return (
    <>
      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}
      <div className="layout">
        <aside className="sidebar">
          <h2>Rooms</h2>

          <div className="panel">
            <strong>{username}</strong>
            <button type="button" onClick={resetUsername}>
              Change user
            </button>
          </div>

          <form onSubmit={createRoom} className="panel">
            <label htmlFor="new-room">Create Room</label>
            <input
              id="new-room"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Room name"
            />
            <button type="submit">Create</button>
          </form>

          <div className="rooms-list">
            {rooms.map((room) => (
              <button
                key={room.id}
                type="button"
                className={`room-button ${currentRoom?.id === room.id ? 'active' : ''}`}
                onClick={() => joinRoom(room.id)}
              >
                {room.name}
              </button>
            ))}
          </div>
        </aside>

        <main className="chat">
          <header className="chat-header">
            <div>
              <h1>{roomName}</h1>
              <p>
                {username
                  ? `Signed in as ${username}`
                  : 'Set username to start'}
              </p>
            </div>

            {currentRoom && (
              <div className="room-actions">
                <form onSubmit={renameRoom}>
                  <input
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    placeholder="New room name"
                  />
                  <button type="submit">Rename</button>
                </form>
                <button type="button" className="danger" onClick={deleteRoom}>
                  Delete
                </button>
              </div>
            )}
          </header>

          {error && <p className="error">{error}</p>}

          <section className="messages">
            {messages.map((message, index) => (
              <article key={`${message.time}-${index}`} className="message">
                <div className="meta">
                  <strong>{message.author}</strong>
                  <time>{new Date(message.time).toLocaleTimeString()}</time>
                </div>
                <p>{message.text}</p>
              </article>
            ))}
            <div ref={messageEndRef} />
          </section>

          <form onSubmit={sendMessage} className="send-form">
            <input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={
                currentRoom ? 'Write a message' : 'Join a room first'
              }
              disabled={!currentRoom || !username}
            />
            <button type="submit" disabled={!currentRoom || !username}>
              Send
            </button>
          </form>
        </main>
      </div>
    </>
  );
}
