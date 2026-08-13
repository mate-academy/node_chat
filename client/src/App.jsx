import { useEffect, useState } from 'react';

export function App() {
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState(localStorage.getItem('username') || '');

  const [rooms, setRooms] = useState([]);
  const [currentRoomId, setCurrentRoomId] = useState('general');
  const [messages, setMessages] = useState([]);

  const [text, setText] = useState('');
  const [roomName, setRoomName] = useState('');

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3005');

    ws.onmessage = (event) => {
      const { type, payload } = JSON.parse(event.data);

      if (type === 'ROOMS_LIST') setRooms(payload);
      if (type === 'ROOM_HISTORY') setMessages(payload);
      if (type === 'NEW_MESSAGE') {
        setMessages((prev) => [payload, ...prev]);
      }
    };

    setSocket(ws);
    return () => ws.close();
  }, []);

  const joinRoom = (id) => {
    setCurrentRoomId(id);
    setMessages([]);
    socket.send(JSON.stringify({ type: 'JOIN_ROOM', payload: { roomId: id } }));
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    socket.send(JSON.stringify({
      type: 'SEND_MESSAGE',
      payload: { roomId: currentRoomId, username, text }
    }));
    setText('');
  };

  const createRoom = (e) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    socket.send(JSON.stringify({ type: 'CREATE_ROOM', payload: { name: roomName } }));
    setRoomName('');
  };

  const deleteRoom = (id) => {
    socket.send(JSON.stringify({ type: 'DELETE_ROOM', payload: { roomId: id } }));

    if (id === currentRoomId) {
      joinRoom('general');
    }
  };

  if (!username) {
    return (
      <form onSubmit={(e) => {
        e.preventDefault();
        const name = e.target.username.value.trim();
        if (name) {
          localStorage.setItem('username', name);
          setUsername(name);
        }
      }}>
        <h2>Введіть імя:</h2>
        <input name="username" placeholder="Username..." />
        <button>Увійти</button>
      </form>
    );
  }

  const currentMessages = messages.filter((m) => m.roomId === currentRoomId);

  return (
    <div>
      <h1>Чат ({username})</h1>

      <form onSubmit={createRoom}>
        <input value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="Нова кімната..." />
        <button>Створити кімнату</button>
      </form>

      <hr />

      <h3>Список кімнат:</h3>
      <ul>
        {rooms.map((r) => (
          <li key={r.id}>
            <button onClick={() => joinRoom(r.id)}>
              {r.id === currentRoomId ? `-> ${r.name}` : r.name}
            </button>
            {r.id !== 'general' && (
              <button onClick={() => deleteRoom(r.id)}>Видалити</button>
            )}
          </li>
        ))}
      </ul>

      <hr />

      <form onSubmit={sendMessage}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Текст повідомлення..." />
        <button>Надіслати</button>
      </form>

      <ul>
        {currentMessages.map((m, i) => (
          <li key={i}>
            <b>{m.author}</b> ({m.time}): {m.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
