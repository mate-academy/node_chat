import Chat from "./components/Chat.jsx";
import RoomList from "./components/RoomList.jsx";
import UsernameForm from "./components/UsernameForm.jsx";
import './App.css';

import { useState, useEffect } from 'react';

const socket = new WebSocket('ws://localhost:5000');

function App() {
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('username') || '';
  });
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);

  console.log('App rendered');

  useEffect(() => {
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'rooms_list':
          setRooms(data.rooms);
          break;

        case 'room_history':
          setMessages(data.messages);
          break;

        case 'new_message':
          setMessages((prev) => [...prev, data.message]);
          break;
      }
    };
  }, []);

  useEffect(() => {
  socket.onopen = () => {
    if (username) {
      socket.send(JSON.stringify({ type: 'set_username', username }));
    }
  };
}, [username]);

  const handleSetUserName = (name) => {
    setUsername(name);
    localStorage.setItem('username', name);
  };

  const handleCreateRoom = (roomName) => {
    socket.send(JSON.stringify({ type: 'create_room', room: roomName }))
  };

  const handleJoinRoom = (roomName) => {
    setCurrentRoom(roomName);
    socket.send(JSON.stringify({ type: 'join_room', room: roomName }));
  };

  const handleSendMessage = (text) => {
    socket.send(JSON.stringify({ type: 'send_message', text }));
  };

  const handleDeleteRoom = (roomName) => {
    socket.send(JSON.stringify({ type: 'delete_room', room: roomName }));

    if (roomName === currentRoom) {
      setCurrentRoom(null);
      setMessages([]);
    }
  };

  const handleRenameRoom = (oldRoom, newRoom) => {
    socket.send(JSON.stringify({ type: 'rename_room', oldRoom, newRoom }));

    if (oldRoom === currentRoom) {
      setCurrentRoom(newRoom);
    }
  };

  return (
    <div className="app">
      {!username ? (
        <UsernameForm onSubmit={handleSetUserName} />
      ) : (
        <>
        <RoomList
          rooms={rooms}
          onCreate={handleCreateRoom}
          onJoin={handleJoinRoom}
          onDelete={handleDeleteRoom}
          onRename={handleRenameRoom}
          currentRoom={currentRoom}
        />
        {currentRoom && (
          <Chat
            username={username}
            messages={messages}
            onSend={handleSendMessage}
          />
        )}
       </>
      )}
    </div>
  );
}

export default App;
