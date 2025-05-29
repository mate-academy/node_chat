import React, { useEffect, useRef, useState } from 'react';
import { Login } from './components/Login';
import { RoomList } from './components/RoomList';

const socket = new WebSocket('ws://localhost:3005');

function App() {
  const savedUsername = localStorage.getItem('username') || '';
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [username, setUsername] = useState(savedUsername);
  const [editOpportunity, setEditOpportunity] = useState(false);
  const [room, setRoom] = useState('');
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');

  const inputRef = useRef();

  useEffect(() => {
    socket.onmessage = (event) => {
      const { type, payload } = JSON.parse(event.data);

      if (type === 'history') {
        setMessages(payload);
      }

      if (type === 'room-list') {
        setRooms(payload);
      }

      if (type === 'user-rights') {
        setEditOpportunity(payload);
      }

      if (type === 'new-message') {
        setMessages((prev) => [...prev, payload]);
      }
    };
  }, []);

  useEffect(() => {
    socket.send(JSON.stringify({ type: 'room-list' }));
    if (room) {
      socket.send(
        JSON.stringify({
          type: 'join-room',
          payload: { room, username },
        }),
      );
      socket.send(
        JSON.stringify({
          type: 'check-user-rights',
          payload: { room, username },
        }),
      );
    }
  }, [username, room]);

  const handleMessageSend = () => {
    if (!text.trim()) return;

    socket.send(
      JSON.stringify({
        type: 'new-message',
        payload: { text },
      }),
    );
    setText('');
    inputRef.current.focus();
  };

  const handleDeleteRoom = (roomName) => {
    socket.send(
      JSON.stringify({
        type: 'delete-room',
        payload: { name: roomName },
      }),
    );

    setRoom('');
  };

  const createRoomRequest = (name) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: 'create-room',
          payload: { name, username },
        }),
      );
    }
  };

  const handleRenameRoom = (newName) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === room) return;

    socket.send(
      JSON.stringify({
        type: 'rename-room',
        payload: { oldName: room, newName: trimmed },
      }),
    );

    setRoom(newName);
    setNewRoomName('');
  };

  return (
    <div>
      {!savedUsername ? (
        <Login setUsername={setUsername} />
      ) : (
        <div className="p-4 max-w-5xl mx-auto flex gap-4">
          <RoomList
            rooms={rooms}
            selectedRoom={room}
            setSelectedRoom={setRoom}
            createRoomRequest={createRoomRequest}
          />
          {room ? (
            <div className="flex-1">
              <h1 className="text-2xl font-bold">
                Room: <span className="text-blue-500">{room}</span>
              </h1>
              {editOpportunity && (
                <div className="flex justify-between mb-4">
                  <div>
                    <input
                      value={newRoomName}
                      onChange={(e) => {
                        setNewRoomName(e.target.value);
                      }}
                      className="border p-2 w-100 rounded mr-2"
                      placeholder="New room name"
                    />
                    <button
                      className="text-lg text-yellow-600 hover:underline"
                      onClick={() => handleRenameRoom(newRoomName)}
                    >
                      Rename the room
                    </button>
                  </div>
                  <button
                    className="text-lg text-red-600 hover:underline"
                    onClick={() => handleDeleteRoom(room)}
                  >
                    Delete the room
                  </button>
                </div>
              )}
              <div className="border rounded p-4 h-96 overflow-y-scroll bg-white">
                {messages.map((msg, i) => (
                  <div key={i} className="mb-2">
                    <div className="text-sm text-gray-600">
                      {msg.author} • {new Date(msg.time).toLocaleTimeString()}
                    </div>
                    <div>{msg.text}</div>
                  </div>
                ))}
              </div>
              <form
                action="#"
                className="mt-4 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleMessageSend();
                }}
              >
                <input
                  ref={inputRef}
                  className="border p-2 rounded flex-1"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Write a message"
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Send
                </button>
              </form>
            </div>
          ) : (
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-4">Select the room</h1>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
