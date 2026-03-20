import { useEffect, useState } from 'react';

const ws = new WebSocket('ws://localhost:3000');

type Message = {
  author: string;
  text: string;
  time: string;
};

type WSMessage =
  | { type: 'message'; message: Message }
  | { type: 'history'; messages: Message[] }
  | { type: 'rooms'; rooms: string[] };

export default function App() {
  const [username, setUsername] = useState(
    localStorage.getItem('username') || '',
  );
  const [inputName, setInputName] = useState('');

  const [room, setRoom] = useState('general');
  const [rooms, setRooms] = useState<string[]>(['general']);

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    ws.onmessage = (event) => {
      const data: WSMessage = JSON.parse(event.data);

      if (data.type === 'message') {
        setMessages((prev) => [...prev, data.message]);
      }

      if (data.type === 'history') {
        setMessages(data.messages);
      }

      if (data.type === 'rooms') {
        setRooms(data.rooms);
      }
    };
  }, []);

  useEffect(() => {
    if (username) {
      ws.send(
        JSON.stringify({
          type: 'join',
          username,
          room,
        }),
      );
    }
  }, [username, room]);

  const saveUsername = () => {
    if (!inputName) return;

    localStorage.setItem('username', inputName);
    setUsername(inputName);
  };

  const sendMessage = () => {
    if (!message || !username) return;

    ws.send(
      JSON.stringify({
        type: 'message',
        text: message,
      }),
    );

    setMessage('');
  };

  const joinRoom = (roomName: string) => {
    setRoom(roomName);
    setMessages([]);
  };

  const createRoom = () => {
    const name = prompt('Room name');
    if (!name) return;

    ws.send(
      JSON.stringify({
        type: 'create_room',
        name,
      }),
    );
  };

  const deleteRoom = (roomName: string) => {
    ws.send(
      JSON.stringify({
        type: 'delete_room',
        name: roomName,
      }),
    );

    if (room === roomName) {
      setRoom('general');
    }
  };

  const renameRoom = (oldName: string) => {
    const newName = prompt('New room name');
    if (!newName) return;

    ws.send(
      JSON.stringify({
        type: 'rename_room',
        oldName,
        newName,
      }),
    );

    if (room === oldName) {
      setRoom(newName);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: 220, borderRight: '1px solid gray', padding: 10 }}>
        <h3>Rooms</h3>

        {rooms.map((r) => (
          <div key={r} style={{ marginBottom: 5 }}>
            <button onClick={() => joinRoom(r)}>{r}</button>
            <button onClick={() => renameRoom(r)}>✏️</button>
            <button onClick={() => deleteRoom(r)}>❌</button>
          </div>
        ))}

        <button onClick={createRoom}>+ room</button>
      </div>

      <div style={{ flex: 1, padding: 10 }}>
        {!username ? (
          <>
            <h3>Enter username</h3>
            <input
              placeholder="Username"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
            />
            <button onClick={saveUsername}>Save</button>
          </>
        ) : (
          <>
            <h3>Room: {room}</h3>

            <div
              style={{
                height: 400,
                overflowY: 'auto',
                border: '1px solid #ccc',
                padding: 10,
                marginBottom: 10,
              }}
            >
              {messages.map((msg, i) => (
                <div key={i} style={{ marginBottom: 5 }}>
                  <b>{msg.author}</b>: {msg.text}
                  <div style={{ fontSize: 10, color: 'gray' }}>
                    {new Date(msg.time).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>

            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type message..."
            />
            <button onClick={sendMessage}>Send</button>
          </>
        )}
      </div>
    </div>
  );
}
