import { useEffect, useRef } from 'react';

function ChatWindow({
  currentRoom,
  messages,
  onSendMessage,
  newMessage,
  onNewMessageChange,
}) {
  const messagesEndRef = useRef(null);

  const filteredMessages = messages.filter(
    (message) => message.room === currentRoom,
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredMessages.length]);

  return (
    <main className="chat-area">
      <header className="chat-header">
        <span className="chat-header-hash">#</span>
        <span className="chat-header-name">{currentRoom}</span>
      </header>

      <div className="chat-messages">
        {filteredMessages.map((message) => (
          <div key={message.id} className="message-group">
            <div className="message-header">
              <span className="message-author">{message.author}</span>
              <span className="message-time">{message.time}</span>
            </div>
            <div className="message-text">{message.text}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <form className="chat-input-form" onSubmit={onSendMessage}>
          <input
            type="text"
            className="chat-input"
            placeholder={`Message #${currentRoom}...`}
            value={newMessage}
            onChange={(changeEvent) =>
              onNewMessageChange(changeEvent.target.value)
            }
          />

          <button type="submit" className="btn-send">
            Send
          </button>
        </form>
      </div>
    </main>
  );
}

export default ChatWindow;
