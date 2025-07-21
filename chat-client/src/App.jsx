import React, { useEffect, useRef, useState } from 'react';
import { Login } from './components/Login';
import { RoomList } from './components/RoomList';
import { Room } from './components/Room';

const socket = new WebSocket('ws://localhost:3005');

function App() {
  const savedUsername = localStorage.getItem('username') || '';
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState(savedUsername);
  const [editOpportunity, setEditOpportunity] = useState(false);
  const [room, setRoom] = useState('');
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    socket.onmessage = (event) => {
      const { type, payload } = JSON.parse(event.data);

      switch (type) {
        case 'history':
          setMessages(payload);
          break;

        case 'room-list':
          setRooms(payload);
          break;

        case 'user-rights':
          setEditOpportunity(payload);
          break;

        case 'new-message':
          setMessages((prev) => [...prev, payload]);
          break;

        default:
          console.warn(`Unknown message type: ${type}`);
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

  const setSelectedRoom = (roomName) => {
    setRoom(roomName);
  };

  return (
    <>
      {!savedUsername ? (
        <Login setUsername={setUsername} />
      ) : (
        <div className="p-4 max-w-5xl mx-auto flex gap-4">
          <RoomList
            rooms={rooms}
            selectedRoom={room}
            setSelectedRoom={setSelectedRoom}
            createRoomRequest={createRoomRequest}
          />
          {room ? (
            <Room
              room={room}
              editOpportunity={editOpportunity}
              messages={messages}
              socket={socket}
              setSelectedRoom={setSelectedRoom}
            />
          ) : (
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-4">Select the room</h1>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default App;
