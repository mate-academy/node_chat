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

  useEffect(() => {
    fetch('http://localhost:3000/rooms')
      .then((res) => res.json())
      .then((data) => setRooms(data));
  }, []);

  useEffect(() => {
    setMessages([]);

    const fetchMessages = () => {
      fetch(`http://localhost:3000/rooms/${currentRoom}/messages`)
        .then((res) => res.json())
        .then((data) => setMessages(data));
    };

    fetchMessages();
    const timer = setInterval(fetchMessages, 1000);

    return () => clearInterval(timer);
  }, [currentRoom]);

  useEffect(() => {
    let saved = localStorage.getItem('username');
    if (!saved) {
      saved = prompt('Enter a username') || 'Anonymous';
      localStorage.setItem('username', saved);
    }
  }, []);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const username = localStorage.getItem('username') || 'Anonymous';

    if (!text.trim()) return;

    await fetch(`http://localhost:3000/rooms/${currentRoom}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author: username, text }),
    });

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
        (r) => r.json(),
      );
      setRooms(updatedRooms);

      setCurrentRoom(newRoom);
      setNewRoom('');
    }
  }

  return (
    <section className="chat-app">
      <h1>Chat Application</h1>
      <p>Logged in as: {localStorage.getItem('username')}</p>

      <div className="room-select">
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
      </div>

      <div className="room-actions">
        <button
          onClick={async () => {
            const newName = prompt('Enter new room name:');
            if (!newName || !newName.trim()) return;

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
              ).then((r) => r.json());
              setRooms(updatedRooms);
              setCurrentRoom(newName.trim());
            } else {
              alert('Failed to rename room');
            }
          }}
          className="btn btn-rename"
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
              ).then((r) => r.json());
              setRooms(updatedRooms);
              setCurrentRoom('general');
            } else {
              alert('Failed to delete room');
            }
          }}
          className="btn btn-delete"
        >
          Delete Room
        </button>
      </div>

      <form onSubmit={createRoom} className="create-room">
        <input
          value={newRoom}
          onChange={(e) => setNewRoom(e.target.value)}
          placeholder="New room name"
        />
        <button type="submit" className="btn btn-create">
          Create Room
        </button>
      </form>

      <form onSubmit={sendMessage} className="send-message">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit" className="btn btn-send">
          Send
        </button>
      </form>

      <ul className="messages">
        {messages.map((m, i) => (
          <li key={i} className="message">
            <strong>{m.author}:</strong> {m.text}{' '}
            <em>{new Date(m.time).toLocaleTimeString()}</em>
          </li>
        ))}
      </ul>
    </section>
  );
}
