import { useEffect, useMemo, useRef, useState } from 'react';

const API_URL = 'http://localhost:3005';
const WS_URL = 'ws://localhost:3005';

function App() {
  const [rooms, setRooms] = useState([]);
  const [roomName, setRoomName] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('userName') || 'Guest';
  });
  const wsRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('userName', userName);
  }, [userName]);

  useEffect(() => {
    fetch(`${API_URL}/rooms`)
      .then((res) => res.json())
      .then(setRooms)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedRoom) return;

    setMessages([]);
  }, [selectedRoom]);

  useEffect(() => {
    if (!selectedRoom) return;

    if (wsRef.current) {
      wsRef.current.close();
    }

    const socket = new WebSocket(WS_URL);
    wsRef.current = socket;

    socket.addEventListener('open', () => {
      socket.send(JSON.stringify({ roomId: selectedRoom.id }));
    });

    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.close();
    };
  }, [selectedRoom]);

  const selectedRoomName = useMemo(
    () => selectedRoom?.name || 'No room selected',
    [selectedRoom],
  );

  const handleCreateRoom = async () => {
    if (!roomName.trim()) return;

    const response = await fetch(`${API_URL}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: roomName.trim() }),
    });

    if (!response.ok) {
      alert('Failed to create room');
      return;
    }

    const newRoom = await response.json();
    setRooms((prev) => [...prev, newRoom]);
    setRoomName('');
  };

  const handleSendMessage = async () => {
    if (!selectedRoom || !messageText.trim()) return;

    const response = await fetch(
      `${API_URL}/rooms/${selectedRoom.id}/messages`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: userName || 'Guest',
          text: messageText.trim(),
        }),
      },
    );

    if (!response.ok) {
      alert('Failed to send message');
      return;
    }

    setMessageText('');
  };

  const handleDeleteRoom = async (roomId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this room?')) return;

    const response = await fetch(`${API_URL}/rooms/${roomId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      alert('Failed to delete room');
      return;
    }

    setRooms((prev) => prev.filter((r) => r.id !== roomId));
    if (selectedRoom?.id === roomId) {
      setSelectedRoom(null);
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <section>
          <h2>Rooms</h2>
          <ul className="room-list">
            {rooms.map((room) => (
              <li key={room.id}>
                <div className="room-item">
                  <button
                    type="button"
                    className={room.id === selectedRoom?.id ? 'active' : ''}
                    onClick={() => setSelectedRoom(room)}
                  >
                    {room.name}
                  </button>
                  <button
                    type="button"
                    className="delete-btn"
                    onClick={(e) => handleDeleteRoom(room.id, e)}
                    title="Delete room"
                  >
                    x
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="room-form">
          <h3>New room</h3>
          <input
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Room name"
          />
          <button type="button" onClick={handleCreateRoom}>
            Create
          </button>
        </section>
      </aside>

      <main className="chat-panel">
        <header>
          <h1>Chat: {selectedRoomName}</h1>
          <label>
            Name:
            <input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </label>
        </header>

        <section className="message-list">
          {messages.length === 0 ? (
            <div className="empty-state">
              Select a room or wait for messages.
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id || `${message.roomId}-${message.createdAt}`}
                className="message-item"
              >
                <strong>{message.author}</strong>
                <span>{new Date(message.createdAt).toLocaleTimeString()}</span>
                <p>{message.text}</p>
              </div>
            ))
          )}
        </section>

        <footer className="message-form">
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Write a message..."
          />
          <button type="button" onClick={handleSendMessage}>
            Send
          </button>
        </footer>
      </main>
    </div>
  );
}

export default App;
