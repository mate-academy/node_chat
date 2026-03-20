import { useEffect, useState } from 'react';

const ws = new WebSocket('ws://localhost:3000');

type Message = {
  author: string;
  text: string;
  time: string;
};

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
      const data = JSON.parse(event.data);

      if (data.type === 'message') {
        setMessages((prev) => [...prev, data.message]);
      }

      if (data.type === 'history') {
        setMessages(data.messages);
      }
    };
  }, []);

  const saveUsername = () => {
    localStorage.setItem('username', inputName);
    setUsername(inputName);

    ws.send(
      JSON.stringify({
        type: 'join',
        username: inputName,
        room,
      }),
    );
  };

  const sendMessage = () => {
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

    ws.send(
      JSON.stringify({
        type: 'join',
        username,
        room: roomName,
      }),
    );
  };

  const createRoom = () => {
    const name = prompt('Room name');
    if (!name) return;

    setRooms((prev) => [...prev, name]);

    ws.send(
      JSON.stringify({
        type: 'create_room',
        name,
      }),
    );
  };

  const deleteRoom = (roomName: string) => {
    setRooms((prev) => prev.filter((r) => r !== roomName));

    ws.send(
      JSON.stringify({
        type: 'delete_room',
        name: roomName,
      }),
    );
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: 200, borderRight: '1px solid gray' }}>
        <h3>Rooms</h3>

        {rooms.map((r) => (
          <div key={r}>
            <button onClick={() => joinRoom(r)}>{r}</button>
            <button onClick={() => deleteRoom(r)}>x</button>
          </div>
        ))}

        <button onClick={createRoom}>+ room</button>
      </div>

      <div style={{ flex: 1, padding: 10 }}>
        {!username ? (
          <>
            <input
              placeholder="Enter username"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
            />
            <button onClick={saveUsername}>Save</button>
          </>
        ) : (
          <>
            <h3>Room: {room}</h3>

            <div style={{ height: 400, overflowY: 'auto' }}>
              {messages.map((msg, i) => (
                <div key={i}>
                  <b>{msg.author}</b>: {msg.text}
                  <div style={{ fontSize: 10 }}>
                    {new Date(msg.time).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>

            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>
          </>
        )}
      </div>
    </div>
  );
}
