import { useEffect, useRef, useState } from 'react';
import { chatApi } from '../api/chat';
import { useRoomMessages } from '../hooks/useRoomMessages';
import { MessageItem } from './MessageItem';

const STATUS_LABELS = {
  connecting: 'Connecting and loading history…',
  connected: 'Online',
  offline: 'Connection lost',
  error: 'Connection error',
};

export const ChatRoom = ({ room, userName }) => {
  const {
    messages,
    status,
    error,
    addMessage,
    updateMessage,
    removeMessage,
    reconnect,
  } = useRoomMessages(room.id);

  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const endRef = useRef(null);

  const lastMessageId = messages[messages.length - 1]?.id;

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [lastMessageId]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const value = text.trim();

    if (!value || sending || status !== 'connected') {
      return;
    }

    setSending(true);
    setSendError('');

    try {
      const message = await chatApi.sendMessage(room.id, userName, value);

      addMessage(message);
      setText('');
    } catch (err) {
      setSendError(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleUpdateMessage = async (messageId, newText) => {
    const message = await chatApi.updateMessage(room.id, messageId, newText);

    updateMessage(message);
  };

  const handleDeleteMessage = async (messageId) => {
    await chatApi.deleteMessage(room.id, messageId);

    removeMessage(messageId);
  };

  return (
    <section className="chat">
      <header className="chat-header">
        <h2># {room.name}</h2>

        <span className="muted" role="status">
          {STATUS_LABELS[status]}
        </span>

        {(status === 'offline' || status === 'error') && (
          <button type="button" onClick={reconnect}>
            Reconnect
          </button>
        )}
      </header>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <div className="messages" role="log" aria-label="Messages">
        {status === 'connected' && messages.length === 0 && (
          <p className="muted">No messages yet. Start the conversation!</p>
        )}

        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            isOwn={message.author === userName}
            disabled={status !== 'connected'}
            onUpdate={handleUpdateMessage}
            onDelete={handleDeleteMessage}
          />
        ))}

        <div ref={endRef} />
      </div>

      {sendError && (
        <p className="error" role="alert">
          {sendError}
        </p>
      )}

      <form className="message-form" onSubmit={handleSubmit}>
        <input
          aria-label="Message text"
          placeholder="Write a message…"
          value={text}
          onChange={(event) => setText(event.target.value)}
          maxLength={255}
          disabled={sending || status !== 'connected'}
        />

        <button
          type="submit"
          disabled={sending || status !== 'connected' || !text.trim()}
        >
          {sending ? 'Sending…' : 'Send'}
        </button>
      </form>
    </section>
  );
};