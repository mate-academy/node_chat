import React, { useEffect, useState } from 'react';

type Message = {
  author: string;
  text: string;
  time: string;
};

export function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [rooms, setRooms] = useState<string[]>([]);
  const [currentRoom, setCurrentRoom] = useState('general');
  const [newRoom, setNewRoom] = useState('');
  const [socket, setSocket] = useState<WebSocket | null>(null);

  // Load available rooms
  useEffect(() => {
    fetch('http://localhost:3000/rooms')
      .then((res) => res.json())
      .then((data) => setRooms(data));
  }, []);

  // Connect WebSocket whenever room changes
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000');
    setSocket(ws);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'join', room: currentRoom }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'init') {
        setMessages(data.messages);
      }

      if (data.type === 'message') {
        setMessages((prev) => [...prev, data.message]);
      }
    };

    return () => ws.close();
  }, [currentRoom]);

  // Ensure username exists
  useEffect(() => {
    let saved = localStorage.getItem('username');
    if (!saved) {
      saved = prompt('Enter a username') || 'Anonymous';
      localStorage.setItem('username', saved);
    }
  }, []);

  function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!socket) return;

    const username = localStorage.getItem('username') || 'Anonymous';
    socket.send(JSON.stringify({ type: 'message', author: username, text }));
    setText('');
  }

  async function createRoom(e: React.FormEvent) {
    e.preventDefault();
    if (!newRoom.trim()) return;

    const res = await fetch('http://localhost:3000/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newRoom }),
    });

    if (res.ok) {
      const updatedRooms = await fetch('http://localhost:3000/rooms').then(
        (res) => res.json(),
      );
      setRooms(updatedRooms);
      setCurrentRoom(newRoom);
      setNewRoom('');
    }
  }

  return (
    <section>
      <h1>Chat Application (WebSocket)</h1>
      <p>Logged in as: {localStorage.getItem('username')}</p>

      <label>
        Room:
        <select
          value={currentRoom}
          onChange={(e) => setCurrentRoom(e.target.value)}
        >
          {rooms.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>

      <div>
        <button
          onClick={async () => {
            const newName = prompt('Enter new room name:');
            if (!newName || newName.trim() === '') return;

            const res = await fetch(
              `http://localhost:3000/rooms/${currentRoom}`,
              {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newName: newName.trim() }),
              },
            );

            if (res.ok) {
              const updatedRooms = await fetch(
                'http://localhost:3000/rooms',
              ).then((res) => res.json());
              setRooms(updatedRooms);
              setCurrentRoom(newName.trim());
            } else {
              const error = await res.json();
              alert(error.error || 'Failed to rename room');
            }
          }}
        >
          Rename Room
        </button>

        <button
          onClick={async () => {
            if (currentRoom === 'general') {
              alert('You cannot delete the default room');
              return;
            }

            const res = await fetch(
              `http://localhost:3000/rooms/${currentRoom}`,
              { method: 'DELETE' },
            );

            if (res.ok) {
              const updatedRooms = await fetch(
                'http://localhost:3000/rooms',
              ).then((res) => res.json());
              setRooms(updatedRooms);
              setCurrentRoom('general');
            }
          }}
        >
          Delete Room
        </button>
      </div>

      <form onSubmit={createRoom}>
        <input
          value={newRoom}
          onChange={(e) => setNewRoom(e.target.value)}
          placeholder="New room name"
        />
        <button type="submit">Create Room</button>
      </form>

      <form onSubmit={sendMessage}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>

      <ul className="messages">
        {messages.map((m, i) => (
          <li key={i}>
            <strong>{m.author}:</strong> {m.text}{' '}
            <em>{new Date(m.time).toLocaleTimeString()}</em>
          </li>
        ))}
      </ul>
    </section>
  );
}
