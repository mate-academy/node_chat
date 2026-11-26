import { useState } from 'react';
import './App.css';
import { useChat } from './useChat.js';
import { MessageForm } from './MessageForm.jsx';
import { MessageList } from './MessageList.jsx';
import { RoomList } from './RoomList.jsx';

function UsernameForm({ onSubmit }) {
  const [value, setValue] = useState('');

  return (
    <form
      className="field is-horizontal"
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) onSubmit(value.trim());
      }}
    >
      <input
        className="input"
        placeholder="Enter your username"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button className="button">Join</button>
    </form>
  );
}

function Chat({ username, onLogout }) {
  const chat = useChat(username);

  return (
    <>
      <p>
        You are <b>{username}</b>{' '}
        <button className="button is-small" onClick={onLogout}>Change</button>
      </p>

      <div className="columns">
        <div className="column is-3">
          <RoomList
            rooms={chat.rooms}
            activeId={chat.roomId}
            onJoin={chat.joinRoom}
            onCreate={chat.createRoom}
            onRename={chat.renameRoom}
            onDelete={chat.deleteRoom}
          />
        </div>
        <div className="column">
          <MessageList messages={chat.messages} currentUser={username} />
          <MessageForm onSend={chat.sendMessage} />
        </div>
      </div>
    </>
  );
}

export function App() {
  const [username, setUsername] = useState(
    () => localStorage.getItem('username') || ''
  );

  function saveUsername(name) {
    localStorage.setItem('username', name);
    setUsername(name);
  }

  function logout() {
    localStorage.removeItem('username');
    setUsername('');
  }

  return (
    <section className="section content">
      <h1 className="title">Chat application</h1>
      {username ? (
        <Chat username={username} onLogout={logout} />
      ) : (
        <UsernameForm onSubmit={saveUsername} />
      )}
    </section>
  );
}