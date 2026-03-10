/* eslint-disable function-paren-newline */
import { useEffect, useState } from 'react';
import './App.css';
import { MessageForm } from './MessageForm.jsx';
import { MessageList } from './MessageList.jsx';
import { RoomList } from './RoomList.jsx';

const WS_URL = 'ws://localhost:5000';

export function App() {
  const [ws, setWs] = useState(null);
  const [username, setUsername] = useState('');
  const [inputName, setInputName] = useState('');
  const [rooms, setRooms] = useState([]);
  const [currentRoomId, setCurrentRoomId] = useState('general');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const socket = new WebSocket(WS_URL);

    socket.addEventListener('message', (evt) => {
      const data = JSON.parse(evt.data);

      handleServerMessage(data);
    });

    setWs(socket);

    return () => socket.close();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('username');

    if (saved) {
      setUsername(saved);
    }
  }, []);

  useEffect(() => {
    if (!ws || !username) {
      return;
    }

    function sendInitial() {
      ws.send(JSON.stringify({ type: 'set_username', username }));
      ws.send(JSON.stringify({ type: 'join_room', roomId: 'general' }));
    }

    if (ws.readyState === 1) {
      sendInitial();
    } else {
      ws.addEventListener('open', sendInitial);

      return () => {
        ws.removeEventListener('open', sendInitial);
      };
    }
  }, [ws, username]);

  function handleServerMessage(data) {
    switch (data.type) {
      case 'room_list':
        setRooms(data.rooms);
        break;
      case 'room_history':
        setMessages(data.messages);
        break;
      case 'new_message':
        setMessages((prev) => [...prev, data.message]);
        break;
      case 'room_created':
        setRooms((prev) => [...prev, data.room]);
        break;
      case 'room_renamed':
        setRooms((prev) =>
          prev.map((r) =>
            r.id === data.roomId ? { ...r, name: data.name } : r,
          ),
        );
        break;
      case 'room_deleted':
        setRooms((prev) => prev.filter((r) => r.id !== data.roomId));

        setCurrentRoomId((prev) => {
          if (prev === data.roomId) {
            joinRoom('general');
          }

          return prev === data.roomId ? 'general' : prev;
        });
        break;
    }
  }

  function handleSetUsername(e) {
    e.preventDefault();

    if (!inputName.trim()) {
      return;
    }
    localStorage.setItem('username', inputName.trim());
    setUsername(inputName.trim());
  }

  function joinRoom(roomId) {
    if (!ws || ws.readyState !== 1) {
      return;
    }
    setCurrentRoomId(roomId);
    setMessages([]);
    ws.send(JSON.stringify({ type: 'join_room', roomId }));
  }

  function createRoom(roomName) {
    if (!ws || ws.readyState !== 1) {
      return;
    }

    ws.send(JSON.stringify({ type: 'create_room', name: roomName }));
  }

  function renameRoom(roomId, roomName) {
    if (!ws || ws.readyState !== 1) {
      return;
    }

    ws.send(JSON.stringify({ type: 'rename_room', roomId, name: roomName }));
  }

  function deleteRoom(roomId) {
    if (!ws || ws.readyState !== 1) {
      return;
    }
    ws.send(JSON.stringify({ type: 'delete_room', roomId }));
  }

  if (!username) {
    return (
      <div className="login-wrapper">
        <div className="login-card">
          <h1>ChatApp</h1>
          <h2>Created by Andriy Veretelnyk</h2>
          <p>Enter your name to get started</p>
          <form onSubmit={handleSetUsername} className="field">
            <input
              className="input"
              type="text"
              placeholder="Your username..."
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
            />
            <button className="button">Join →</button>
          </form>
        </div>
      </div>
    );
  }

  const currentRoom = rooms.find((r) => r.id === currentRoomId);

  return (
    <div className="chat-layout">
      <RoomList
        rooms={rooms}
        currentRoomId={currentRoomId}
        onJoin={joinRoom}
        onCreate={createRoom}
        onRename={renameRoom}
        onDelete={deleteRoom}
      />
      <div className="chat-main">
        <div className="chat-header">
          <h2>{currentRoom?.name || 'Chat'}</h2>
          <span className="user-badge">👤 {username}</span>
        </div>
        <div className="messages-wrap">
          <MessageList messages={messages} />
        </div>
        <div className="input-area">
          <MessageForm ws={ws} roomId={currentRoomId} />
        </div>
      </div>
    </div>
  );
}
