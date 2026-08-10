import { useEffect, useState } from 'react';
import './App.css';
import { MessageForm } from './MessageForm.jsx';
import { MessageList } from './MessageList.jsx';
import { RoomList } from './RoomList.jsx';
import { UsernameForm } from './UsernameForm.jsx';
import { TypingIndicator } from './TypingIndicator.jsx';
import { ConnectionBanner } from './ConnectionBanner.jsx';
import { useWebSocket } from './WebSocket.jsx';

export function App() {
  const [username, setUsername] = useState(
    () => localStorage.getItem('username') || '',
  );

  const {
    isConnected,
    error,
    rooms,
    activeRoomId,
    messages,
    typingUsers,
    join,
    switchRoom,
    sendMessage,
    sendTyping,
    createRoom,
    renameRoom,
    deleteRoom,
  } = useWebSocket();

  useEffect(() => {
    if (isConnected && username) {
      join(username, null);
    }
  }, [isConnected, username, join]);

  if (!username) {
  return (
    <section className="section content">
      <h1 className="title">RoomTalk</h1>
      <UsernameForm onSubmit={setUsername} />
    </section>
  );
}

  return (
    <section className="section content">
      <ConnectionBanner isConnected={isConnected} />

      <div className="header-row">
        <h1 className="title">RoomTalk</h1>
         <span className="username-badge">{username}</span>
      </div>

      {error && <p className="error-text">{error}</p>}

      <RoomList
        rooms={rooms}
        activeRoomId={activeRoomId}
        onJoin={switchRoom}
        onCreate={createRoom}
        onRename={renameRoom}
        onDelete={deleteRoom}
      />

      <MessageList messages={messages} />
      <TypingIndicator users={typingUsers} />
      <MessageForm onSend={sendMessage} onTyping={sendTyping} />
    </section>
  );
}