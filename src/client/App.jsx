import React, { useEffect, useRef, useState } from 'react';
import './App.css';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [input, setInput] = useState('');
  const [username, setUsername] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const socketRef = useRef(null);

  // Функція для запиту імені користувача
  const promptUsername = () => {
    const name = window.prompt('Enter your name:');
    if (name) {
      localStorage.setItem('username', name);
      setUsername(name);
      return true;
    }
    return false;
  };

  useEffect(() => {
    let ws;

    if (typeof window !== 'undefined' && 'WebSocket' in window) {
      const wsPort =
        window.location.port === '3001' ? '3000' : window.location.port;
      ws = new window.WebSocket(`ws://localhost:${wsPort}`);
      socketRef.current = ws;
    } else {
      console.error('WebSocket is not available in this environment.');
      return;
    }

    ws.onopen = () => {
      const savedUsername = localStorage.getItem('username');
      if (savedUsername) {
        setUsername(savedUsername);
      } else {
        promptUsername();
      }
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received message:', data);

      switch (data.type) {
        case 'rooms':
          setRooms(data.rooms);
          break;
        case 'roomCreated':
          setRooms((prev) => [...prev, data.room]);
          break;
        case 'roomRenamed':
          setRooms((prev) =>
            prev.map((room) => (room.id === data.room.id ? data.room : room)),
          );
          break;
        case 'roomDeleted':
          setRooms((prev) => prev.filter((room) => room.id !== data.roomId));
          if (currentRoom?.id === data.roomId) {
            setCurrentRoom(null);
            setMessages([]);
          }
          break;
        case 'roomHistory':
          setMessages(data.messages);
          break;
        case 'message':
          if (currentRoom?.id === data.roomId) {
            setMessages((prev) => [...prev, data.message]);
          }
          break;
        case 'error':
          console.error('Server error:', data.message);
          break;
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from server');
    };

    return () => {
      ws.close();
    };
  }, [currentRoom]);

  const handleSend = () => {
    if (!username) {
      if (!promptUsername()) {
        return; // Не відправляємо повідомлення, якщо користувач не ввів ім'я
      }
    }

    if (
      input.trim() !== '' &&
      socketRef.current?.readyState === WebSocket.OPEN &&
      currentRoom
    ) {
      console.log('Sending message:', {
        type: 'message',
        roomId: currentRoom.id,
        author: username,
        text: input,
      });

      socketRef.current.send(
        JSON.stringify({
          type: 'message',
          roomId: currentRoom.id,
          author: username,
          text: input,
        }),
      );
      setInput('');
    }
  };

  const handleCreateRoom = () => {
    if (!username) {
      if (!promptUsername()) {
        return;
      }
    }

    if (
      newRoomName.trim() !== '' &&
      socketRef.current?.readyState === WebSocket.OPEN
    ) {
      socketRef.current.send(
        JSON.stringify({ type: 'createRoom', name: newRoomName }),
      );
      setNewRoomName('');
    }
  };

  const handleJoinRoom = (room) => {
    if (!username) {
      if (!promptUsername()) {
        return;
      }
    }

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({ type: 'joinRoom', roomId: room.id }),
      );
      setCurrentRoom(room);
    }
  };

  const handleRenameRoom = (room) => {
    if (!username) {
      if (!promptUsername()) {
        return;
      }
    }

    const newName = window.prompt('Enter new room name:', room.name);
    if (
      newName &&
      newName !== room.name &&
      socketRef.current?.readyState === WebSocket.OPEN
    ) {
      socketRef.current.send(
        JSON.stringify({
          type: 'renameRoom',
          roomId: room.id,
          newName,
        }),
      );
    }
  };

  const handleDeleteRoom = (room) => {
    if (!username) {
      if (!promptUsername()) {
        return;
      }
    }

    if (
      window.confirm(`Are you sure you want to delete room "${room.name}"?`)
    ) {
      socketRef.current?.send(
        JSON.stringify({ type: 'deleteRoom', roomId: room.id }),
      );
    }
  };

  return (
    <div className="chat-container">
      <div className="sidebar">
        <h2>Chat Rooms</h2>
        <div className="room-creation">
          <input
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            placeholder="New room name..."
          />
          <button onClick={handleCreateRoom}>Create Room</button>
        </div>
        <ul className="room-list">
          {rooms.map((room) => (
            <li
              key={room.id}
              className={currentRoom?.id === room.id ? 'active' : ''}
            >
              <span onClick={() => handleJoinRoom(room)}>{room.name}</span>
              <div className="room-actions">
                <button onClick={() => handleRenameRoom(room)}>Rename</button>
                <button onClick={() => handleDeleteRoom(room)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="chat-main">
        <h1>{currentRoom ? currentRoom.name : 'Select a room'}</h1>
        <div className="messages">
          {messages.map((msg) => (
            <div key={msg.id} className="message">
              <span className="message-author">{msg.author}</span>
              <span className="message-time">
                {new Date(msg.time).toLocaleTimeString()}
              </span>
              <p className="message-text">{msg.text}</p>
            </div>
          ))}
        </div>
        {currentRoom && (
          <div className="message-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend}>Send</button>
          </div>
        )}
      </div>
    </div>
  );
}
