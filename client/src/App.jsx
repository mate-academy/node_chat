import { useState, useEffect } from 'react';
import { socket } from './socket';
import ChatRoom from './components/ChatRoom/ChatRoom.jsx';
import RoomList from './components/RoomList/RoomList.jsx';

function App() {
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('username') || '';
  });
  const [inputValue, setInputValue] = useState('');
  const [currentRoomId, setCurrentRoomId] = useState(null);

  useEffect(() => {
    if (username) {
      socket.emit('set username', username);
    }
  }, [username]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmed = inputValue.trim();

    if (!trimmed) {
      return;
    }

    localStorage.setItem('username', trimmed);
    setUsername(trimmed);
  };

  const handleJoinRoom = (roomId) => {
    socket.emit('join room', roomId);
    setCurrentRoomId(roomId);
  };

  const handleLeaveRoom = () => {
    socket.emit('leave room');
    setCurrentRoomId(null);
  };

  if (!username) {
    return (
      <div className="browser-window">
        <div className="browser-toolbar">
          <div className="browser-dots">
            <span className="dot dot-red" />
            <span className="dot dot-yellow" />
            <span className="dot dot-green" />
          </div>
          <div className="browser-address">localhost:5174</div>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <h1>Ласкаво просимо до чату</h1>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Введіть ваше ім'я"
          />
          <button type="submit">Увійти</button>
        </form>
      </div>
    );
  }

  return (
    <div className="browser-window">
      <div className="browser-toolbar">
        <div className="browser-dots">
          <span className="dot dot-red" />
          <span className="dot dot-yellow" />
          <span className="dot dot-green" />
        </div>
        <div className="browser-address">
          localhost:5174/{currentRoomId ? 'room' : 'rooms'}
        </div>
      </div>
      <div className="app-header">
        <h2>Вітаю, {username}!</h2>
      </div>
      <div className="app-body">
        {currentRoomId ? (
          <ChatRoom onLeaveRoom={handleLeaveRoom} />
        ) : (
          <RoomList onJoinRoom={handleJoinRoom} />
        )}
      </div>
    </div>
  );
}
export default App;