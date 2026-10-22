import { MessageForm } from './MessageForm';
import { MessageList } from './MessageList';

export function Conversation({ room, messages, disabled, onSendMessage }) {
  if (!room) {
    return (
      <section className="conversation">
        <div className="empty-conversation">
          <div className="empty-icon">#</div>
          <h2>Pick a room to start chatting</h2>
          <p className="muted">Join a room from the list or create a new one.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="conversation">
      <div className="conversation-header">
        <div>
          <p className="eyebrow">CURRENT ROOM</p>
          <h2><span className="hash">#</span>{room.name}</h2>
        </div>
        <span className="muted small">
          {messages.length} {messages.length === 1 ? 'message' : 'messages'}
        </span>
      </div>
      <MessageList messages={messages} />
      <MessageForm onSend={onSendMessage} disabled={disabled} />
    </section>
  );
}
