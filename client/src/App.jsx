import { useState } from 'react';
import './App.css';
import { useChat } from './useChat.js';
import { UsernameForm } from './UsernameForm.jsx';
import { RoomList } from './RoomList.jsx';
import { MessageList } from './MessageList.jsx';
import { MessageForm } from './MessageForm.jsx';

const USERNAME_KEY = 'username';

export function App() {
  const [username, setUsername] = useState(
    () => localStorage.getItem(USERNAME_KEY) || '',
  );

  // The hook sends the username to the server right after it is submitted
  const chat = useChat(username);

  if (!username) {
    return (
      <section className="section">
        <UsernameForm
          onSubmit={(name) => {
            localStorage.setItem(USERNAME_KEY, name);
            setUsername(name);
          }}
        />
      </section>
    );
  }

  const currentRoom = chat.rooms.find(room => room.id === chat.currentRoomId);

  return (
    <section className="section">
      <header className="chat-header">
        <h1 className="title">Chat application</h1>

        <div className="user">
          <span
            className={chat.isConnected ? 'dot is-online' : 'dot'}
            title={chat.isConnected ? 'Connected' : 'Reconnecting...'}
          />
          <strong>{username}</strong>
          <button
            type="button"
            className="button is-small"
            onClick={() => {
              localStorage.removeItem(USERNAME_KEY);
              setUsername('');
            }}
          >
            Change name
          </button>
        </div>
      </header>

      {chat.error && (
        <div className="notification is-danger is-light">
          <button
            type="button"
            className="delete"
            onClick={chat.clearError}
          />
          {chat.error}
        </div>
      )}

      <div className="chat-layout">
        <RoomList
          rooms={chat.rooms}
          currentRoomId={chat.currentRoomId}
          onJoin={chat.join}
          onCreate={chat.createRoom}
          onRename={chat.renameRoom}
          onDelete={chat.deleteRoom}
        />

        <main className="box chat">
          {currentRoom ? (
            <>
              <h2 className="title is-5"># {currentRoom.name}</h2>

              <MessageList messages={chat.messages} username={username} />

              <MessageForm
                disabled={!chat.isConnected}
                onSend={chat.sendMessage}
              />
            </>
          ) : (
            <p className="has-text-grey">
              {chat.notice || 'Choose or create a room to start chatting'}
            </p>
          )}
        </main>
      </div>
    </section>
  );
}
