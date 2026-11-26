import { useChat } from './useChat.js';
import { WebSocketLoader } from './WebSocket.jsx';
// import { ServerSentEventsLoader } from './ServerSentEvents.jsx';
import { MessageForm } from './MessageForm.jsx';
import { MessageList } from './MessageList.jsx';
import { RoomList } from './RoomList.jsx';

const Loader = WebSocketLoader;

export function Chat({ username, onLogout }) {
  const chat = useChat();

  return (
    <>
      <Loader
        username={username}
        onData={chat.onData}
        onSender={chat.onSender}
      />

      <p>
        You are <b>{username}</b>{' '}
        <button type="button" className="button is-small" onClick={onLogout}>
          Change
        </button>
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