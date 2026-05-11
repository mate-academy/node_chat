import './ChatWindow.scss';
import { type ChatWindowProps } from '../../types/ChatWindowProps';

export const ChatWindow = ({
  setActiveRoom,
  setNewMessageText,
  handleSendMessage,
  activeRoom,
  messages,
  newMessageText,
  username,
}: ChatWindowProps & { username: string }) => {
  return (
    <div className="chat">
      <header className="chat__header">
        <div className="chat__header-info">
          <h2 className="chat__header-title">{activeRoom?.name}</h2>
          <p className="chat__header-status">online</p>
        </div>
        <button className="chat__header-button" onClick={() => setActiveRoom(null)}>
          Leave room
        </button>
      </header>

      <div className="chat__messages">
        {messages.map((mes) => {
          const isOwn = mes.author === username;
          return (
            <div
              key={mes.id}
              className={`chat__message ${isOwn ? 'chat__message--own' : ''}`}
            >
              <div className="chat__message-content">
                {!isOwn && <span className="chat__message-author">{mes.author}</span>}
                <p className="chat__message-text">{mes.text}</p>
                <span className="chat__message-time">
                  {new Date(mes.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <footer className="chat__input-area">
        <input
          className="chat__input"
          type="text"
          value={newMessageText}
          onChange={(e) => setNewMessageText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(newMessageText)}
          placeholder="Write a message..."
        />
        <button
          className="chat__button"
          onClick={() => handleSendMessage(newMessageText)}
        >
          Send
        </button>
      </footer>
    </div>
  );
};
